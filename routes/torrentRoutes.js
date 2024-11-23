const express = require('express');
const upload = require('../middleware/fileUploadMiddleware');
const validateMagnetLink = require('../utils/magnetLinkValidator');
const { parseMagnet, searchTorrents } = require('../controllers/torrents/torrentController');
const router = express.Router();


router.post('/upload', upload.single('torrent'), (req, res) => {
    console.log(req.file); // Debugging: Log file info
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({
        message: 'File uploaded successfully',
        filePath: `/uploads/${req.file.filename}`,
    });
});

// POST /api/torrent/parse - Parse magnet link
router.post('/parse', (req, res) => {
    const { magnetLink } = req.body;

    if (!magnetLink) {
        return res.status(400).json({ message: 'Magnet link is required' });
    }

    const result = validateMagnetLink(magnetLink);
    if (result.isValid) {
        res.status(200).json({ message: 'Magnet link parsed successfully', data: result.parsed });
    } else {
        res.status(400).json({ message: 'Invalid magnet link', error: result.error });
    }
});

router.post('/magnet', parseMagnet);
router.get('/search', searchTorrents);


module.exports = router;
