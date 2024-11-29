const Torrent = require('../../models/Torrent');

const getAllTorrents = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        // Paginate the results: Skipping the previous pages based on the page and limit
        const torrents = await Torrent.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ uploadDate: -1 }); // Sort by most recent

        const totalTorrents = await Torrent.countDocuments(); // Get the total number of torrents for pagination info

        res.status(200).json({
            total: totalTorrents,
            page: parseInt(page),
            limit: parseInt(limit),
            torrents,
        });
    } catch (error) {
        console.error('Error retrieving torrents:', error.message);
        res.status(500).json({ message: 'Server error while retrieving torrents' });
    }
};

module.exports = { getAllTorrents };
