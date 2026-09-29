const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for forgot-password endpoint
 * Max 5 requests per 15 minutes per IP
 */
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Trop de tentatives. Veuillez patienter 15 minutes avant de réessayer.'
    },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});

/**
 * Rate limiter for reset-password endpoint
 * Max 10 requests per 15 minutes per IP
 */
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Trop de tentatives de validation. Veuillez patienter 15 minutes.'
    },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});

/**
 * General auth rate limiter (login)
 * Max 10 requests per 15 minutes per IP
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Trop de tentatives de connexion. Veuillez patienter 15 minutes avant de réessayer.'
    },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});

module.exports = { forgotPasswordLimiter, resetPasswordLimiter, loginLimiter };
