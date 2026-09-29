const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isCloudinaryConfigured =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
        return cb(null, true);
    }
    cb(new Error("Format non supporté. Extensions autorisées : jpg, jpeg, png, webp"));
};

const single = (fieldName) => async (req, res, next) => {
    if (isCloudinaryConfigured) {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key:    process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const memUpload = multer({
            storage: multer.memoryStorage(),
            fileFilter,
            limits: { fileSize: 10 * 1024 * 1024 },
        }).single(fieldName);

        memUpload(req, res, async (err) => {
            if (err) return next(err);
            if (!req.file) return next();
            try {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'dembeni/projets', resource_type: 'auto' },
                        (error, res) => error ? reject(error) : resolve(res)
                    );
                    stream.end(req.file.buffer);
                });
                req.file.path     = result.secure_url;
                req.file.filename = result.public_id;
                next();
            } catch (uploadErr) {
                next(uploadErr);
            }
        });
    } else {
        const isVercel  = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
        const uploadDir = isVercel
            ? path.join(os.tmpdir(), 'public', 'uploads', 'projets')
            : path.join(__dirname, '..', '..', 'public', 'uploads', 'projets');

        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const diskUpload = multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => cb(null, uploadDir),
                filename: (req, file, cb) => {
                    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, 'projet-' + unique + path.extname(file.originalname).toLowerCase());
                }
            }),
            fileFilter,
            limits: { fileSize: 10 * 1024 * 1024 },
        }).single(fieldName);

        diskUpload(req, res, (err) => {
            if (err) return next(err);
            if (req.file) req.file.path = `/public/uploads/projets/${req.file.filename}`;
            next();
        });
    }
};

module.exports = { single };
