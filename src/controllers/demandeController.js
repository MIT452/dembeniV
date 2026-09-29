const Demande = require('../models/Demande');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Get user's own demands
// @route   GET /api/demandes
// @access  Private
const getMyDemandes = asyncHandler(async (req, res) => {
    const demandes = await Demande.find({ citizenId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: demandes });
});

// @desc    Create new demand
// @route   POST /api/demandes
// @access  Private
const createDemande = asyncHandler(async (req, res) => {
    const { title, description, type, attachmentUrl } = req.body;

    if (!title || !description || !type) {
        res.status(400);
        throw new Error('Veuillez remplir tous les champs obligatoires');
    }

    const demande = await Demande.create({
        citizenId: req.user._id,
        title,
        description,
        type,
        attachmentUrl: attachmentUrl || '',
        status: 'pending'
    });

    res.status(201).json({ success: true, data: demande });
});

// @desc    Get notifications for user
// @route   GET /api/demandes/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
});

// @desc    Mark notifications as read
// @route   PUT /api/demandes/notifications/read
// @access  Private
const markNotificationsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'Notifications marquées comme lues' });
});

module.exports = {
    getMyDemandes,
    createDemande,
    getNotifications,
    markNotificationsRead
};
