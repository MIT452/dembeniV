const express = require('express');
const router = express.Router();

// ==============================
// IMPORT ROUTES
// ==============================

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const actualiteRoutes = require('./actualiteRoutes');
const evenementRoutes = require('./evenementRoutes');
const serviceRoutes = require('./serviceRoutes');
const demandeRoutes = require('./demandeRoutes');
const contactRoutes = require('./contactRoutes');
const publicationRoutes = require('./publicationRoutes');
const contentSectionRoutes = require('./contentSectionRoutes');
const projetRoutes = require('./projetRoutes');
const signalementRoutes = require('./signalementRoutes');
const rendezVousRoutes = require('./rendezVousRoutes');

// ==============================
// API HOME
// ==============================

router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        application: 'API Portail Citoyen Dembeni',
        version: '1.0.0',
        status: 'Running',
        documentation: 'API opérationnelle',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            admin: '/api/admin',
            actualites: '/api/actualites',
            evenements: '/api/evenements',
            services: '/api/services',
            demandes: '/api/demandes',
            contact: '/api/contact',
            publications: '/api/publications',
            contentSections: '/api/content-sections',
            projets: '/api/projets',
            signalements: '/api/signalements',
            rendezvous: '/api/rendezvous'
        }
    });
});

// ==============================
// HEALTH CHECK
// ==============================

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// ==============================
// API ROUTES
// ==============================

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/actualites', actualiteRoutes);
router.use('/evenements', evenementRoutes);
router.use('/services', serviceRoutes);
router.use('/demandes', demandeRoutes);
router.use('/contact', contactRoutes);
router.use('/publications', publicationRoutes);
router.use('/content-sections', contentSectionRoutes);
router.use('/projets', projetRoutes);
router.use('/signalements', signalementRoutes);
router.use('/rendezvous', rendezVousRoutes);

// ==============================
// EXPORT
// ==============================

module.exports = router;
