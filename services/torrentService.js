// services/torrentService.js

const fs = require('fs');
const path = require('path');
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const axios = require('axios');
const Torrent = require('../models/Torrent');
const { processTorrentFile } = require('../utils/fileUtils');

async function getWebTorrentClient() {  
    try {  
      const { default: WebTorrent } = await import('webtorrent');  
      return new WebTorrent();  
    } catch (error) {  
      console.error('Failed to load WebTorrent:', error.message);  
      throw new Error('WebTorrent client could not be loaded');  
    }  
  }
  
  const activeTorrents = new Map(); // Keep track of the active torrents
  
  function externalSearch(url) {
    const cachedData = myCache.get(url);
    if (cachedData) {
        return Promise.resolve(cachedData);
    }
  
    return axios.get(url)
        .then(response => {
            myCache.set(url, response.data, 3600);
            return response.data;
        });
  }
  
  async function handleMagnetLink(magnetLink) {  
    console.log('Processing magnet link:', magnetLink);
  
    return new Promise(async (resolve, reject) => {  
        try {  
            const urlParams = new URLSearchParams(new URL(magnetLink).search);  
            const torrentName = urlParams.get('dn') || 'Unnamed Torrent';  
            const infoHash = magnetLink.split('btih:')[1].split('&')[0];
  
            const client = await getWebTorrentClient();  
            const torrent = client.add(magnetLink);  
  
            torrent.on('ready', async () => {  
                const seeds = torrent.numSeeds || 0;  
                const peers = torrent.numPeers || 0;  
                const leechers = peers - seeds;  
                const size = torrent.length; 
                const magnetURI = torrent.magnetURI; 
  
                const responseData = {  
                    name: torrentName,  
                    magnet_link: magnetURI,  
                    infoHash: infoHash,  
                    size: size,  
                    seeds: seeds,  
                    leechers: leechers  
                };
  
                try {
                    const savedTorrent = await Torrent.create(responseData); // Save to DB using Mongoose
                    console.log('Torrent file processed and saved successfully:', savedTorrent);  
                    resolve(savedTorrent); // Return the saved torrent data
                } catch (dbErr) {
                    console.error('Database error:', dbErr.message);
                    reject(dbErr);
                }
            });
  
            torrent.on('error', (err) => {
                console.error('Error adding torrent:', err.message);
                reject(err);
            });  
        } catch (error) {
            console.error('Error processing magnet link:', error.message);
            reject(new Error('Error processing magnet link: ' + error.message));
        }  
    });  
  }
  
  async function uploadTorrentFile(filePath) {  
    return new Promise(async (resolve, reject) => {  
        try {
            const client = await getWebTorrentClient();  
            const torrent = client.add(filePath);
            
            torrent.on('ready', async () => {  
                const torrentName = torrent.name || path.basename(filePath);  
                const infoHash = torrent.infoHash;  
                const size = torrent.pieces.length * torrent.length; 
                const seeds = torrent.numSeeds || 0;  
                const peers = torrent.numPeers || 0;  
                const leechers = peers - seeds;  
                const magnetLink = torrent.magnetURI; 
  
                const responseData = {  
                    name: torrentName,  
                    magnet_link: magnetLink,  
                    infoHash: infoHash,  
                    size: size,  
                    seeds: seeds,  
                    leechers: leechers  
                };
  
                try {
                    const savedTorrent = await Torrent.create(responseData); 
                    console.log('Torrent file processed and saved successfully:', savedTorrent);  
                    resolve(savedTorrent); // Return saved torrent data
                } catch (dbErr) {
                    console.error('Database insertion error:', dbErr.message);  
                    reject(dbErr);  
                }
            });
  
            torrent.on('error', (err) => {  
                console.error('Error processing torrent file:', err.message);  
                reject(err);  
            });  
        } catch (error) {  
            console.error('Upload Torrent File Error:', error.message);  
            reject(error);  
        }  
    });  
  }


async function startDownload(fileId, io) {
  const client = await getWebTorrentClient();

  if (activeTorrents.has(fileId)) {
      console.log(`A download is already in progress for fileId: ${fileId}`);
      return Promise.reject(new Error(`Download is already in progress for fileId: ${fileId}`));
  }

  await updateDownloadStatus(fileId, 'in progress');

  return new Promise((resolve, reject) => {
      Torrent.findById(fileId).then(result => {
          if (!result) {
              const errorMessage = `Torrent with fileId ${fileId} not found.`;
              console.error(errorMessage);
              return reject(new Error(errorMessage));
          }

          const { infoHash } = result;
          const torrent = client.add(infoHash);
          activeTorrents.set(fileId, torrent);

          // Add socket event listeners here
          torrent.on("download", (bytes) => {  
              const progress = (torrent.progress * 100).toFixed(2);
              io.emit('downloading', { fileId, progress }); // Emit progress
          });

          torrent.on("done", async () => {
              console.log(`Download complete for file with ID: ${fileId}`);
              activeTorrents.delete(fileId);
              await updateDownloadStatus(fileId, 'completed');
              io.emit('downloadComplete', { fileId });
              resolve({ message: `Download completed for file with ID: ${fileId}` });
          });

          torrent.on("error", async (err) => {
              console.error(`Error with torrent ${fileId}:`, err.message);
              activeTorrents.delete(fileId);
              await updateDownloadStatus(fileId, 'failed');
              reject(err);
          });

          torrent.on("removed", () => {
              activeTorrents.delete(fileId);
          });
      }).catch(err => {
          console.error('Database query error:', err.message);
          reject(err);
      });
  });
}

// Function to update download status in the database
async function updateDownloadStatus(fileId, status) {
  try {
    await Torrent.findByIdAndUpdate(fileId, { download_status: status });
  } catch (err) {
    console.error('Error updating download status:', err.message);
    throw err;
  }
}


async function pauseDownload(fileId) {
  return new Promise(async (resolve, reject) => {
      console.log(`Attempting to pause download with fileId: ${fileId}`);
      console.log('Current active torrents:', Array.from(activeTorrents.keys())); // Log current torrents
      const torrent = activeTorrents.get(fileId);

      if (torrent) {
          torrent.pause();
          console.log(`Download paused for fileId: ${fileId}`);
          await updateDownloadStatus(fileId, 'paused');
          resolve({ message: `Download paused for fileId ${fileId}` });
      } else {
          const errorMessage = `Torrent with fileId ${fileId} not found`;
          console.error(errorMessage);
          reject(new Error(errorMessage));
      }
  });
}

async function resumeDownload(fileId) {
  return new Promise(async (resolve, reject) => {
      console.log(`Attempting to resume download with fileId: ${fileId}`);
      console.log('Current active torrents:', Array.from(activeTorrents.keys())); // Log current torrents
      const torrent = activeTorrents.get(fileId);

      if (torrent) {
          torrent.resume();
          console.log(`Download resumed for fileId: ${fileId}`);
          await updateDownloadStatus(fileId, 'downloading');
          resolve({ message: `Download resumed for fileId ${fileId}` });
      } else {
          const errorMessage = `Torrent with fileId ${fileId} not found`;
          console.error(errorMessage);
          reject(new Error(errorMessage));
      }
  });
}

// Cancel download function
// Cancel download function
async function cancelDownload(req, res) {
    const { fileId } = req.params; // Assuming fileId is passed in the request parameters

    try {
        // Find the torrent entry in the database
        const torrentEntry = await Torrent.findOne({ fileId });

        if (!torrentEntry) {
            return res.status(404).json({ message: 'Torrent not found' });
        }

        // Check if the torrent is already canceled or completed
        if (['canceled', 'completed'].includes(torrentEntry.status)) {
            return res.status(400).json({ message: 'Torrent already canceled or completed' });
        }

        // Remove the torrent from the WebTorrent client
        const torrent = client.torrents.find(t => t.magnetURI === torrentEntry.magnetUri);
        if (torrent) {
            torrent.destroy(); // This stops the download
            await Torrent.updateOne({ fileId }, { status: 'canceled' }); // Update the database
        }

        return res.status(200).json({ message: 'Download canceled', fileId });
    } catch (error) {
        console.error('Error canceling download:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
  




module.exports = {
  externalSearch,
  uploadTorrentFile,
  handleMagnetLink,
  startDownload,
  pauseDownload,
  resumeDownload,
  cancelDownload,
  updateDownloadStatus,
};

