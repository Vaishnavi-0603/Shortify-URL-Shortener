const router = require('express').Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/:urlId', protect, getAnalytics);

module.exports = router;
