const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    forgotPassword,
    verifyOtp,
    resetPassword,
    cleanupExpiredCodes
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
    forgotPasswordLimiter,
    resetPasswordLimiter,
    loginLimiter
} = require('../middleware/rateLimitMiddleware');
const uploadProfile = require('../middleware/uploadProfileMiddleware');
const { validate, authValidators } = require('../middleware/validateMiddleware');

// Public routes
router.post('/register', uploadProfile.single('profileImage'), validate(authValidators.register), registerUser);
router.post('/login', loginLimiter, validate(authValidators.login), loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Password reset flow (rate limited)
router.post('/forgot-password', forgotPasswordLimiter, validate(authValidators.forgotPassword), forgotPassword);
router.post('/verify-otp',      resetPasswordLimiter,  validate(authValidators.verifyOtp),  verifyOtp);
router.post('/reset-password',  resetPasswordLimiter,  validate(authValidators.resetPassword),  resetPassword);

// Admin/Cron utility
router.delete('/cleanup-expired', protect, cleanupExpiredCodes);

module.exports = router;
