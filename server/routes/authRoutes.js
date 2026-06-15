const router = require('express').Router();
const { register, login, getMe } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.get('/me', protect, getMe);

module.exports = router;
