const Torrent = require('../../models/Torrent'); // Adjust the path as necessary

// Controller to list files with pagination and total size
const unDownloadedFiles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Query to find torrents with status other than 'completed'
    const query = { status: { $ne: 'completed' } };

    // Fetch torrents with pagination
    const torrents = await Torrent.find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Calculate total files and total size
    const totalFiles = await Torrent.countDocuments(query);
    const totalSize = await Torrent.aggregate([
      { $match: query },
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);

    res.json({
      torrents,
      totalFiles,
      totalSize: totalSize[0] ? totalSize[0].totalSize : 0
    });
  } catch (error) {
    console.error('Error fetching torrents:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { unDownloadedFiles };