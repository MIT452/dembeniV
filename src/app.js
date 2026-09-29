const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const os = require('os');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const connectDB = require('./config/db');

const app = express();

// ==============================
// SECURITY & CORS
// ==============================

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: false,
    })
);

const clientUrl = process.env.CLIENT_URL?.trim();
const additionalClientUrls = process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',').map((url) => url.trim()).filter(Boolean)
    : [];
const allowedOrigins = new Set([
    clientUrl,
    ...additionalClientUrls,
].filter(Boolean));

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.add('http://localhost:5173');
    allowedOrigins.add('http://localhost:3000');
    allowedOrigins.add('http://localhost:4000');
}

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // Allow common render/app hostnames (in case env wasn't configured)
        try {
            const lower = origin.toLowerCase();
            if (lower.includes('onrender.com') || lower.includes('render.com') || lower.includes('dembeni')) {
                return callback(null, true);
            }
        } catch (e) {}

        callback(new Error('Non autorisé par CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));

// ==============================
// STATIC FILES
// ==============================

const isVercel =
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true';

app.use('/public', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});

app.use(
    '/public',
    express.static(path.join(__dirname, '..', 'public'), {
        maxAge: '1d',
        etag: true,
        setHeaders: (res, filePath) => {
            // Ensure static file responses include cross-origin headers so
            // images can be loaded from other origins (frontend hosted elsewhere)
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        }
    })
);

// Note: do not call app.options with '*' here — some serverless routers
// (path-to-regexp versions used by Vercel) fail to parse '*' and crash.
// The global CORS middleware `app.use(cors(corsOptions))` above already
// handles preflight requests. Avoid adding app.options('*', ...) to keep
// compatibility with serverless environments.

if (isVercel) {
    app.use(
        '/public/uploads',
        express.static(path.join(os.tmpdir(), 'public', 'uploads'))
    );
}

// ==============================
// DATABASE
// ==============================

app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

// ==============================
// PARSERS & SANITIZATION
// ==============================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: { ...req.query },
        writable: true,
        configurable: true,
        enumerable: true,
    });
    next();
});

app.use(mongoSanitize());
app.use(hpp());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ==============================
// RATE LIMIT
// ==============================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        message:
            'Trop de requêtes effectuées depuis cette IP, veuillez réessayer plus tard.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', apiLimiter);

// ==============================
// HOME ROUTE
// ==============================

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        application: 'Backend API Dembeni',
        version: '1.0.0',
        status: 'Running',
        api: '/api',
        health: '/api/health',
    });
});

// ==============================
// API ROUTES
// ==============================

app.use('/api', routes);

// ==============================
// 404
// ==============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route introuvable : ${req.method} ${req.originalUrl}`,
    });
});

// ==============================
// GLOBAL ERROR HANDLER
// ==============================

app.use((err, req, res, next) => {
    console.error(err);

    const statusCode =
        err.statusCode ||
        err.status ||
        (res.statusCode >= 400 ? res.statusCode : 500);

    res.status(statusCode).json({
        success: false,
        message:
            err.message ||
            'Une erreur serveur est survenue.',
        stack:
            process.env.NODE_ENV === 'production'
                ? undefined
                : err.stack,
    });
});

module.exports = app;
