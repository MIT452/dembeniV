const Evenement = require('../models/Evenement');
const asyncHandler = require('express-async-handler');

// @desc    Get all events
// @route   GET /api/evenements
// @access  Public
const getEvenements = asyncHandler(async (req, res) => {
    const evenements = await Evenement.find().sort({ date: 1 });
    res.status(200).json({ success: true, data: evenements });
});

// @desc    Create event
// @route   POST /api/evenements
// @access  Private/Admin
const createEvenement = asyncHandler(async (req, res) => {
    const { title, description, category, date, location, image } = req.body;

    if (!title || !description || !date || !location) {
        res.status(400);
        throw new Error('Veuillez remplir tous les champs requis');
    }

    const event = await Evenement.create({
        title,
        description,
        category: category || 'SANTÉ',
        date,
        location,
        image
    });

    res.status(201).json({ success: true, data: event });
});

// @desc    Update event
// @route   PUT /api/evenements/:id
// @access  Private/Admin
const updateEvenement = asyncHandler(async (req, res) => {
    const event = await Evenement.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Événement non trouvé');
    }

    const updated = await Evenement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
});

// @desc    Delete event
// @route   DELETE /api/evenements/:id
// @access  Private/Admin
const deleteEvenement = asyncHandler(async (req, res) => {
    const event = await Evenement.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Événement non trouvé');
    }

    await event.deleteOne();
    res.status(200).json({ success: true, message: 'Événement supprimé' });
});

module.exports = {
    getEvenements,
    createEvenement,
    updateEvenement,
    deleteEvenement
};
