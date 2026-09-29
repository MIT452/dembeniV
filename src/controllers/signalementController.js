const Signalement = require('../models/Signalement');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');

// Helper to delete local uploaded images
const deleteSignalementImage = (imagePath) => {
    if (imagePath && imagePath.startsWith('/public/uploads/actualites/')) {
        const fullPath = path.join(__dirname, '../..', imagePath);
        fs.unlink(fullPath, (err) => {
            if (err) {
                console.error("Erreur lors de la suppression de l'image du signalement:", err);
            } else {
                console.log("Image du signalement supprimée avec succès:", fullPath);
            }
        });
    }
};

// ── CITIZEN CONTROLLERS ────────────────────────────────────────────────────────

// @desc    Get user's own signalements
// @route   GET /api/signalements
// @access  Private
const getMySignalements = asyncHandler(async (req, res) => {
    const signalements = await Signalement.find({ citizenId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: signalements });
});

// @desc    Create new signalement
// @route   POST /api/signalements
// @access  Private
const createSignalement = asyncHandler(async (req, res) => {
    const { category, location, description } = req.body;

    if (!category || !location || !description) {
        res.status(400);
        throw new Error('Veuillez remplir tous les champs obligatoires');
    }

    const imageUrl = req.file ? req.file.path : '';

    const signalement = await Signalement.create({
        citizenId: req.user._id,
        category,
        location,
        description,
        imageUrl,
        status: 'En attente'
    });

    res.status(201).json({ success: true, data: signalement });
});

// ── ADMIN CONTROLLERS ──────────────────────────────────────────────────────────

// @desc    Get all signalements (Admin)
// @route   GET /api/admin/signalements
// @access  Private/Admin
const getAllSignalements = asyncHandler(async (req, res) => {
    const signalements = await Signalement.find()
        .populate('citizenId', 'firstname lastname email phone')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: signalements.length, data: signalements });
});

// @desc    Update signalement status and/or add comment (Admin)
// @route   PUT /api/admin/signalements/:id
// @access  Private/Admin
const updateSignalement = asyncHandler(async (req, res) => {
    const { status, comment } = req.body;
    const signalement = await Signalement.findById(req.params.id);

    if (!signalement) {
        res.status(404);
        throw new Error('Signalement non trouvé');
    }

    let statusChanged = false;
    if (status && signalement.status !== status) {
        signalement.status = status;
        statusChanged = true;
    }

    if (comment && comment.trim() !== '') {
        signalement.comments.push({
            author: 'Administration de Dembéni',
            message: comment,
            date: new Date()
        });
    }

    await signalement.save();

    // Notify citizen if status updated or comment added
    let message = '';
    if (statusChanged && comment) {
        message = `Votre signalement [${signalement.category}] a été mis à jour: Statut "${status}" avec commentaire administratif.`;
    } else if (statusChanged) {
        message = `Votre signalement [${signalement.category}] est passé au statut : "${status}".`;
    } else if (comment) {
        message = `L'administration a ajouté un commentaire sur votre signalement [${signalement.category}].`;
    }

    if (message) {
        await Notification.create({
            userId: signalement.citizenId,
            message
        });
    }

    res.status(200).json({ success: true, message: 'Signalement mis à jour avec succès', data: signalement });
});

// @desc    Delete signalement (Admin)
// @route   DELETE /api/admin/signalements/:id
// @access  Private/Admin
const deleteSignalement = asyncHandler(async (req, res) => {
    const signalement = await Signalement.findById(req.params.id);

    if (!signalement) {
        res.status(404);
        throw new Error('Signalement non trouvé');
    }

    // Delete image if exists
    if (signalement.imageUrl) {
        deleteSignalementImage(signalement.imageUrl);
    }

    await signalement.deleteOne();
    res.status(200).json({ success: true, message: 'Signalement supprimé avec succès' });
});

module.exports = {
    getMySignalements,
    createSignalement,
    getAllSignalements,
    updateSignalement,
    deleteSignalement
};
