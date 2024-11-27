const express = require('express');
const multer = require('multer');
const { uploadTorrent, getTorrents, getTorrentById } = require('../controllers/torrents/torrentController.js');

const router = express.Router();

// Set up multer for file uploads
const upload = multer({
    dest: 'uploads/', // Directory to store uploaded files
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/x-bittorrent') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .torrent files are allowed.'));
        }
    },
});

router.post('/upload', upload.single('torrentFile'), uploadTorrent);
router.get('/', getTorrents);
router.get('/:id', getTorrentById);  // Route to get a torrent by its ID

module.exports = router;  // CommonJS export
