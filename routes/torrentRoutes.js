const express = require('express');
const {
    searchTorrents,
    uploadTorrent,
    processMagnetLink,
    startDownloadHandler,
    pauseDownloadHandler,
    resumeDownloadHandler,
    cancelDownloadHandler,
} = require('../controllers/torrents/torrentController');
const { fetchFiles, deleteFile, downloadFile, zipFiles } = require('../controllers/torrents/fileController');
const upload = require('../middleware/uploadMiddleware');
const { getTorrentStatistics } = require('../controllers/statistics/torrentsStats');
const { getIo } = require('../socket'); // Import the getIo method

const router = express.Router();

// External search
router.get('/search', searchTorrents);

// Upload torrent file
router.post('/upload', upload.single('torrentFile'), uploadTorrent);

// Magnet link processing
router.post('/process-magnet', processMagnetLink);

// Start download with io retrieved from the singleton
router.post('/start-download', (req, res) => {
    const io = getIo(); // Get the io instance
    startDownloadHandler(req, res, io);
});
router.post('/pause-download', pauseDownloadHandler);
router.post('/resume-download', resumeDownloadHandler);
router.delete('/cancel-download', (req, res) => {
    console.log('Received DELETE request:', req.body);
});

// File management
router.get('/files', fetchFiles); // Fetch uploaded files
router.delete('/files/:id', deleteFile); // Delete a file by ID
router.get('/files/download/:id', downloadFile); // Download a file by ID
router.post('/files/zip', zipFiles); // Zip and download multiple files


router.get('/statistics', getTorrentStatistics);

module.exports = router;
