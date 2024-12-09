const Torrent = require('../../models/Torrent');

exports.getDownloadingStatus = async (req, res) => {
    try {
        const downloadingTorrents = await Torrent.aggregate([
            { $match: { status: 'downloading' } },
            { $group: { 
                _id: null,
                totalCount: { $sum: 1 },
                totalSize: { $sum: '$size' }
            } }
        ]);

        if (downloadingTorrents.length === 0) {
            return res.status(404).json({ message: "No torrents found with the 'downloading' status" });
        }

        res.json({
            status: 'success',
            data: downloadingTorrents[0],
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

