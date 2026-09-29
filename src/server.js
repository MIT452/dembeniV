require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const path = require('path');
const fs = require('fs');

// ── Connexion DB ──────────────────────────────────────────────────────────────
connectDB();

// ── Créer les dossiers d'upload au démarrage ──────────────────────────────────
const uploadDirs = [
    path.join(__dirname, '..', 'public', 'uploads', 'actualites'),
    path.join(__dirname, '..', 'public', 'uploads', 'profiles'),
    path.join(__dirname, '..', 'public', 'uploads', 'projets'),
    path.join(__dirname, '..', 'public', 'uploads', 'services'),
];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`[Upload] Dossier créé : ${dir}`);
    }
});

// ── Démarrage serveur ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur actif en mode ${process.env.NODE_ENV} sur le PORT ${PORT}`);
    console.log(`📁 Dossier uploads : ${path.join(__dirname, '..', 'public', 'uploads')}`);
});

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
