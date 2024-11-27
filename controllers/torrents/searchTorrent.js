const Torrent = require('../../models/TorrentModel');

const searchTorrents = async (req, res) => {
    const { query = '', page = 1, limit = 10 } = req.query;

    try {
        const torrents = await Torrent.find({ name: { $regex: query, $options: 'i' } })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalResults = await Torrent.countDocuments({ name: { $regex: query, $options: 'i' } });

        res.status(200).json({
            message: 'Search results fetched successfully',
            data: torrents,
            totalResults,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalResults / limit),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching torrents', error: error.message });
    }
};

module.exports = { searchTorrents };
