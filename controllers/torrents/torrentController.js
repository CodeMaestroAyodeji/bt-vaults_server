const fs = require('fs');
const crypto = require('crypto');
const Torrent = require('../../models/Torrent');  // Keep the require for your model

let WebTorrent;  // To store the WebTorrent module

// Dynamically import WebTorrent
(async () => {
    WebTorrent = (await import('webtorrent')).default;  // Accessing the default export
})();

// Function to calculate the infoHash from the torrent file
const calculateInfoHash = (filePath) => {
    return new Promise((resolve, reject) => {
        if (!WebTorrent) {
            return reject('WebTorrent not loaded yet');
        }
        const client = new WebTorrent();  // Correct instantiation of WebTorrent client
        client.add(filePath, (torrent) => {
            resolve(torrent.infoHash);  // Get the infoHash directly from WebTorrent
        });
    });
};

// Function to upload a torrent
const uploadTorrent = async (req, res) => {
    try {
        const { seeders, leechers } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const infoHash = await calculateInfoHash(req.file.path);
        console.log('Calculated InfoHash:', infoHash);

        const torrent = new Torrent({
            name: req.file.originalname,
            filePath: req.file.path,
            size: `${(req.file.size / 1024).toFixed(2)} KB`,
            seeders: seeders || 0,
            leechers: leechers || 0,
            infoHash,  // Store the infoHash in the database
        });

        await torrent.save();

        res.status(201).json({
            message: 'Torrent uploaded successfully',
            torrent,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Function to get all torrents
const getTorrents = async (req, res) => {
    try {
        const torrents = await Torrent.find().sort({ uploadDate: -1 });
        res.status(200).json({ torrents });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Function to get a single torrent by ID
const getTorrentById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the torrent by ID
        const torrent = await Torrent.findById(id);

        if (!torrent) {
            return res.status(404).json({ message: 'Torrent not found' });
        }

        res.status(200).json({ torrent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { uploadTorrent, getTorrents, getTorrentById };
