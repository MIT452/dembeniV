const Actualite = require('../models/Actualite');
const asyncHandler = require('express-async-handler');

// @desc    Get all actualites
// @route   GET /api/actualites
// @access  Public
const getActualites = asyncHandler(async (req, res) => {
    const actualites = await Actualite.find().sort({ date: -1 });
    res.json({ success: true, data: actualites });
});

// @desc    Create new actualite
// @route   POST /api/actualites
// @access  Public/Admin
const createActualite = asyncHandler(async (req, res) => {
    const { titre, contenu, categorie, image } = req.body;
    
    if (!titre || !contenu) {
        res.status(400);
        throw new Error('Veuillez remplir les champs titre et contenu');
    }

    const actualite = await Actualite.create({
        titre,
        contenu,
        categorie: categorie || 'INFO',
        image: image || undefined
    });

    res.status(201).json({ success: true, data: actualite });
});

// @desc    Update actualite
// @route   PUT /api/actualites/:id
// @access  Public/Admin
const updateActualite = asyncHandler(async (req, res) => {
    const actualite = await Actualite.findById(req.params.id);

    if (!actualite) {
        res.status(404);
        throw new Error('Actualité non trouvée');
    }

    const updated = await Actualite.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    res.json({ success: true, data: updated });
});

// @desc    Delete actualite
// @route   DELETE /api/actualites/:id
// @access  Public/Admin
const deleteActualite = asyncHandler(async (req, res) => {
    const actualite = await Actualite.findById(req.params.id);

    if (!actualite) {
        res.status(404);
        throw new Error('Actualité non trouvée');
    }

    await actualite.deleteOne();
    
    res.json({ success: true, message: 'Actualité supprimée' });
});

module.exports = {
    getActualites,
    createActualite,
    updateActualite,
    deleteActualite
};
