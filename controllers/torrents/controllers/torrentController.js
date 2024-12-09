const path = require('path');
const { getIo } = require('../../../socket');
const {
    externalSearch,
    uploadTorrentFile,
    handleMagnetLink,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    updateDownloadStatus
} = require('../../../services/services/torrentService');

// Search for torrents using an external API
const searchTorrents = (req, res) => {
    const { url, page = 1, limit = 10 } = req.query;

    externalSearch(url)
        .then(data => {
            if (!Array.isArray(data)) {
                return res.status(400).json({ error: 'Invalid response format from external API' });
            }

            const totalItems = data.length;
            const totalPages = Math.ceil(totalItems / limit);
            const currentPage = parseInt(page, 10);
            const startIndex = (currentPage - 1) * limit;
            const endIndex = startIndex + parseInt(limit, 10);

            const paginatedResults = data.slice(startIndex, endIndex);

            res.json({
                results: paginatedResults,
                currentPage,
                totalPages,
                totalItems,
            });
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

// Upload a torrent file  
const uploadTorrent = (req, res) => {  
    if (!req.file) {  
        const errorMsg = 'No file uploaded';  
        console.error(errorMsg);  
        return res.status(400).json({ error: errorMsg });  
    }  

    // Process the uploaded file  
    getIo().emit('newTorrent', { message: 'New torrent uploaded!' });
    uploadTorrentFile(req.file.path)  
        .then(() => res.status(200).json({ message: 'File uploaded successfully!' }))  
        .catch(err => {  
            const errorMsg = `File upload error: ${err.message}`;  
            console.error(errorMsg);  
            res.status(500).json({ error: errorMsg });  
        });  
}; 


// Process a magnet link to start handling the torrent
const processMagnetLink = (req, res) => {
    const { magnetLink } = req.body;
    if (!magnetLink) {
        return res.status(400).json({ error: 'Magnet link is required' });
    }

    getIo().emit('newTorrent', { message: 'New torrent uploaded!' });
    handleMagnetLink(magnetLink)
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ error: err.message }));
};

// Handler to start a download
const startDownloadHandler = (req, res, io) => {
    const { fileId } = req.body;

    if (!fileId) {
        return res.status(400).json({ error: "File ID is required" });
    }

    startDownload(fileId, io)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
};

// Handler to pause a download
const pauseDownloadHandler = async (req, res) => {
    const { fileId } = req.body;
    if (!fileId) {
        return res.status(400).json({ error: 'File ID is required' });
    }
    try {
        const message = await pauseDownload(fileId);
        res.status(200).json({ message });
    } catch (err) {
        console.error('Pause download error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Handler to resume a download
const resumeDownloadHandler = (req, res) => {
    const { fileId } = req.body;
    if (!fileId) {
        return res.status(400).json({ error: 'File ID is required' });
    }

    resumeDownload(fileId)
        .then(message => res.status(200).json({ message }))
        .catch(err => {
            console.error('Resume download error:', err.message);
            res.status(500).json({ error: err.message });
        });
};

// Handler to cancel a download
const cancelDownloadHandler = async (req, res) => {
    try {
        const { fileId } = req.body; // Parse fileId from the request body
        if (!fileId) {
            return res.status(400).json({ error: 'File ID is required' });
        }

        console.log('Current active torrents before cancel request:', Array.from(activeTorrents.entries()));
        await cancelDownload(fileId);
        res.status(200).json({ message: "Download canceled successfully" });
    } catch (err) {
        console.error('Cancel download error:', err.message);
        res.status(500).json({ error: err.message });
    }
};



// Export the handlers for use in routes
module.exports = {
    searchTorrents,
    uploadTorrent,
    processMagnetLink,
    startDownloadHandler,
    pauseDownloadHandler,
    resumeDownloadHandler,
    cancelDownloadHandler,
};
