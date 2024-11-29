// routes/torrentRoutes.js  
const express = require('express');  
const { addTorrentFromMagnet } = require('../controllers/torrents/addTorrentFromMagnet');  
const { searchTorrents } = require('../controllers/torrents/searchTorrents');  
const { uploadTorrent } = require('../controllers/torrents/uploadTorrent');  
const { uploadService } = require('../services/uploadService');  
const { validateSearchQuery, checkValidationResult } = require('../utils/validateSearchQuery');  

const router = express.Router();  

// Route to add torrent via magnet link  
router.post('/magnet', addTorrentFromMagnet);  
router.post('/upload', uploadService.single('torrentFile'), uploadTorrent);  
router.get('/search', validateSearchQuery, checkValidationResult, searchTorrents);  

module.exports = router;