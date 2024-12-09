const Torrent = require('../../models/Torrent');

exports.getNotDownloadingStatus = async (req, res) => {
    try {
        const notDownloadingTorrents = await Torrent.aggregate([
            { $match: { status: { $ne: 'downloading' } } },
            { $group: { 
                _id: null,
                totalCount: { $sum: 1 },
                totalSize: { $sum: '$size' }
            } }
        ]);

        res.json({
            status: 'success',
            data: notDownloadingTorrents[0] || { totalCount: 0, totalSize: 0 },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
