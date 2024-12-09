const { User } = require('../../models/userModel');

const getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ is_verified: true });
    
    res.status(200).json({
      totalUsers,
      verifiedUsers
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getUserStatistics,
};
