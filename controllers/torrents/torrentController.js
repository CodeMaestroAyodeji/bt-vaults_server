const parseMagnetLink = require('../../utils/magnetParser'); // Ensure this path is correct


/**
 * Handles magnet link parsing.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const parseMagnet = async (req, res) => {
    const { magnet } = req.body;

    if (!magnet) {
        return res.status(400).json({ message: "Magnet link is required" });
    }

    try {
        const parsedDetails = parseMagnetLink(magnet);
        res.status(200).json({
            message: "Magnet link parsed successfully",
            data: parsedDetails,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Mock torrent data for demonstration purposes.
 */
const mockTorrents = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Torrent File ${i + 1}`,
    size: `${(Math.random() * 10 + 1).toFixed(2)} GB`,
    seeders: Math.floor(Math.random() * 1000),
    leechers: Math.floor(Math.random() * 500),
}));

/**
 * Handles torrent search with pagination.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const searchTorrents = (req, res) => {
    const { query = '', page = 1, limit = 10 } = req.query;

    // Filter torrents by name
    const filteredTorrents = mockTorrents.filter((torrent) =>
        torrent.name.toLowerCase().includes(query.toLowerCase())
    );

    // Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTorrents = filteredTorrents.slice(startIndex, endIndex);

    res.status(200).json({
        message: "Search results fetched successfully",
        data: paginatedTorrents,
        totalResults: filteredTorrents.length,
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredTorrents.length / limit),
    });
};

// Export the functions as part of the module
module.exports = {
    parseMagnet,
    searchTorrents,
};

