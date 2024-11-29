const Torrent = require('../../models/Torrent');

const stopTorrent = async (req, res) => {
    const { infoHash } = req.params;

    try {
        const torrent = await Torrent.findOne({ infoHash });

        if (!torrent) {
            return res.status(404).json({ message: 'Torrent not found' });
        }

        // Update the torrent status to 'stopped'
        torrent.status = 'stopped';
        await torrent.save();

        res.status(200).json({ message: 'Torrent download stopped', torrent });
    } catch (error) {
        console.error('Error stopping torrent:', error.message);
        res.status(500).json({ message: 'Server error while stopping torrent' });
    }
};

module.exports = { stopTorrent };
