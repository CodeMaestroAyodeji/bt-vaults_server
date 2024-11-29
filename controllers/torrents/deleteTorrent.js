const Torrent = require('../../models/Torrent');
const fs = require('fs');
const path = require('path');

const deleteTorrent = async (req, res) => {
    const { infoHash } = req.params;

    try {
        const torrent = await Torrent.findOne({ infoHash });

        if (!torrent) {
            return res.status(404).json({ message: 'Torrent not found' });
        }

        // Delete the torrent file from disk (if applicable)
        const filePath = torrent.filePath;
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove the torrent from the database
        await Torrent.deleteOne({ infoHash });

        res.status(200).json({ message: 'Torrent deleted successfully' });
    } catch (error) {
        console.error('Error deleting torrent:', error.message);
        res.status(500).json({ message: 'Server error while deleting torrent' });
    }
};

module.exports = { deleteTorrent };
