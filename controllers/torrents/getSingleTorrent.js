const Torrent = require('../../models/Torrent');

const getSingleTorrent = async (req, res) => {
    const { infoHash } = req.params;

    try {
        // Find a single torrent by infoHash
        const torrent = await Torrent.findOne({ infoHash });

        if (!torrent) {
            return res.status(404).json({ message: 'Torrent not found' });
        }

        res.status(200).json({ torrent });
    } catch (error) {
        console.error('Error retrieving torrent:', error.message);
        res.status(500).json({ message: 'Server error while retrieving torrent' });
    }
};

module.exports = { getSingleTorrent };
