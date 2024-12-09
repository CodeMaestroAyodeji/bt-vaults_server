const TorrentModel = require('../../models/Torrent'); // Correct import

// Function to update download speed
const updateDownloadSpeed = async (torrentId, newSpeed) => {
    try {
        await TorrentModel.updateOne({ _id: torrentId }, { download_speed: newSpeed });
    } catch (error) {
        console.error('Error updating download speed:', error);
    }
};

// Function to get torrent statistics
const getTorrentStatistics = async (req, res) => {
    try {
        const totalFiles = await TorrentModel.countDocuments();
        const totalDownloads = await TorrentModel.countDocuments({ download_status: 'completed' });

        const totalStorageUsed = await TorrentModel.aggregate([
            { $group: { _id: null, totalSize: { $sum: '$size' } } }
        ]);

        const avgDownloadSpeed = await TorrentModel.aggregate([
            { $group: { _id: null, avgSpeed: { $avg: '$download_speed' } } }
        ]);

        const uploadSize = totalStorageUsed[0]?.totalSize || 0; // Assuming upload size is the same as total size
        const uploadDownloadRatio = uploadSize / (totalDownloads || 1); // Avoid division by zero

        res.status(200).json({
            totalFiles,
            totalDownloads,
            totalStorageUsed: totalStorageUsed[0]?.totalSize || 0,
            avgDownloadSpeed: avgDownloadSpeed[0]?.avgSpeed || 0,
            uploadSize: uploadSize,
            uploadDownloadRatio: uploadDownloadRatio,
        });
    } catch (error) {
        console.error('Error fetching torrent statistics:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getTorrentStatistics, updateDownloadSpeed };
