// routes/torrentRoutes.js  
const express = require('express');  
const { addTorrentFromMagnet } = require('../controllers/torrents/addTorrentFromMagnet');  
const { searchTorrents } = require('../controllers/torrents/searchTorrents');  
const { uploadTorrent } = require('../controllers/torrents/uploadTorrent');
const { getSingleTorrent } = require('../controllers/torrents/getSingleTorrent');  
const { getAllTorrents } = require('../controllers/torrents/getAllTorrents');
const { downloadTorrent } = require('../controllers/torrents/downloadTorrent');
const { pauseTorrent } = require('../controllers/torrents/pauseTorrent');  
const { stopTorrent } = require('../controllers/torrents/stopTorrent');  
const { deleteTorrent } = require('../controllers/torrents/deleteTorrent');
const { zipTorrentFiles } = require('../controllers/torrents/zipTorrentFiles');
const { uploadService } = require('../services/uploadService');  
const { validateSearchQuery, checkValidationResult } = require('../utils/validateSearchQuery');  

const router = express.Router();  

// Route to add torrent via magnet link  
router.post('/magnet', addTorrentFromMagnet);  
router.post('/upload', uploadService.single('torrentFile'), uploadTorrent);  
router.get('/search', validateSearchQuery, checkValidationResult, searchTorrents);
router.get('/', getAllTorrents);
router.get('/:infoHash', getSingleTorrent);
router.post('/:infoHash/download', downloadTorrent);
router.delete('/:infoHash', deleteTorrent);
router.post('/:infoHash/stop', stopTorrent);
router.post('/:infoHash/pause', pauseTorrent);
router.post('/zip', zipTorrentFiles);

module.exports = router;