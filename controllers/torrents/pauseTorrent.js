const Torrent = require('../../models/Torrent');

const pauseTorrent = async (req, res) => {
    const { infoHash } = req.params;

    try {
        const torrent = await Torrent.findOne({ infoHash });

        if (!torrent) {
            return res.status(404).json({ message: 'Torrent not found' });
        }

        // Update the torrent status to 'paused'
        torrent.status = 'paused';
        await torrent.save();

        res.status(200).json({ message: 'Torrent download paused', torrent });
    } catch (error) {
        console.error('Error pausing torrent:', error.message);
        res.status(500).json({ message: 'Server error while pausing torrent' });
    }
};

module.exports = { pauseTorrent };
