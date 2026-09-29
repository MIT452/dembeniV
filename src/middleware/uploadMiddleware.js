/**
 * uploadMiddleware.js — Gestion des uploads d'images pour les actualités
 *
 * MODE DÉVELOPPEMENT (local)  : diskStorage → fichiers écrits dans public/uploads/actualites/
 * MODE PRODUCTION (Vercel)    : Cloudinary  → images hébergées sur le cloud de manière permanente
 *
 * La détection est automatique via les variables d'environnement CLOUDINARY_*.
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ── Détection Cloudinary ───────────────────────────────────────────────────────
const isCloudinaryConfigured =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;

// ── Filtre de type de fichier ─────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk   = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk  = allowed.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error("Format non supporté. Extensions autorisées : jpg, jpeg, png, webp"));
};

// ── Middleware unique combinant multer + destination ──────────────────────────
const single = (fieldName) => async (req, res, next) => {

    if (isCloudinaryConfigured) {
        // ── MODE PRODUCTION : Cloudinary ──────────────────────────────────────
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key:    process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // Stockage en mémoire pour passer le buffer à Cloudinary
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
                        { folder: 'dembeni/actualites', resource_type: 'auto' },
                        (error, res) => error ? reject(error) : resolve(res)
                    );
                    stream.end(req.file.buffer);
                });
                // URL absolue Cloudinary → sera stockée directement en DB
                req.file.path     = result.secure_url;
                req.file.filename = result.public_id;
                console.log('[Upload/Cloudinary] Actualité uploadée :', req.file.path);
                next();
            } catch (uploadErr) {
                console.error('[Upload/Cloudinary] Erreur :', uploadErr.message);
                next(uploadErr);
            }
        });

    } else {
        // ── MODE DÉVELOPPEMENT : Disk Storage ─────────────────────────────────
        const isVercel  = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
        const uploadDir = isVercel
            ? path.join(os.tmpdir(), 'public', 'uploads', 'actualites')
            : path.join(__dirname, '..', '..', 'public', 'uploads', 'actualites');

        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const diskUpload = multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => cb(null, uploadDir),
                filename: (req, file, cb) => {
                    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, 'actualite-' + unique + path.extname(file.originalname).toLowerCase());
                }
            }),
            fileFilter,
            limits: { fileSize: 10 * 1024 * 1024 },
        }).single(fieldName);

        diskUpload(req, res, (err) => {
            if (err) return next(err);
            if (req.file) {
                // Chemin relatif → préfixé par VITE_API_URL dans le frontend
                req.file.path = `/public/uploads/actualites/${req.file.filename}`;
                console.log('[Upload/Disk] Actualité sauvegardée :', req.file.path);
            }
            next();
        });
    }
};

module.exports = { single };
