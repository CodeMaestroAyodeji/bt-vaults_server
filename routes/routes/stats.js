const express = require('express');
const { getUserStats, getUserActivities } = require('../controllers/statsController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', authMiddleware, getUserStats); // Endpoint: /api/user/stats
router.get('/activities', authMiddleware, getUserActivities); // Endpoint: /api/user/activities

module.exports = router;
