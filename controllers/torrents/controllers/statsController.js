const User = require('../models/User');
const Activity = require('../models/Activity');
const File = require('../models/File');
const Bandwidth = require('../models/Bandwidth');

const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id; // Retrieved from auth middleware

    const user = await User.findById(userId);

    const fileStats = await File.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const bandwidth = await Bandwidth.find({ userId }).select('month uploadBytes downloadBytes');

    res.json({
      totalUploads: user.totalUploads || 0,
      totalDownloads: user.totalDownloads || 0,
      activeTorrents: user.activeTorrents || 0,
      fileStats, // Category-wise breakdown
      bandwidth, // Monthly bandwidth usage
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

const getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;

    const activities = await Activity.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
};

module.exports = { getUserStats, getUserActivities };
