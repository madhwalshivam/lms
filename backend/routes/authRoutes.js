const express = require('express');
const router = express.Router();
const { registerUser, loginUser, registerPushToken, getExecutives, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/push-token', registerPushToken);
router.get('/executives', getExecutives);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
