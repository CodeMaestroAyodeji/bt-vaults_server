const Torrent = require('../../models/Torrent');

const downloadTorrent = async (req, res) => {
    const { infoHash } = req.params;

    try {
        const torrent = await Torrent.findOne({ infoHash });

        if (!torrent) {
            return res.status(404).json({ message: 'Torrent not found' });
        }

        // Update the torrent status to 'downloading'
        torrent.status = 'downloading';
        await torrent.save();

        res.status(200).json({ message: 'Torrent download started', torrent });
    } catch (error) {
        console.error('Error downloading torrent:', error.message);
        res.status(500).json({ message: 'Server error while starting torrent download' });
    }
};

module.exports = { downloadTorrent };
