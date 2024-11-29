// controllers/torrents/addTorrentFromMagnet.js

const Torrent = require('../../models/Torrent');
const { validateMagnetLink } = require('../../services/magnetService');

const addTorrentFromMagnet = async (req, res) => {
    const { magnetLink } = req.body;

    if (!magnetLink) {
        return res.status(400).json({ message: 'Magnet link is required' });
    }

    try {
        const { name, infoHash, trackers } = validateMagnetLink(magnetLink);

        const existingTorrent = await Torrent.findOne({ infoHash });
        if (existingTorrent) {
            return res.status(409).json({ message: 'Torrent already exists' });
        }

        const newTorrent = new Torrent({
            name,
            filePath: '', // No file path for magnet link
            size: 0, // Size is unknown for magnet link
            infoHash,
            seeders: 0,
            leechers: 0,
            status: 'queued',
        });

        await newTorrent.save();

        return res.status(201).json({ message: 'Torrent added successfully', torrent: newTorrent });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
    addTorrentFromMagnet,
};
