const RendezVous = require('../models/RendezVous');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// ── CITIZEN CONTROLLERS ────────────────────────────────────────────────────────

// @desc    Get user's own appointments
// @route   GET /api/rendezvous
// @access  Private
const getMyRendezVous = asyncHandler(async (req, res) => {
    const appointments = await RendezVous.find({ citizenId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: appointments });
});

// @desc    Create/Request new appointment
// @route   POST /api/rendezvous
// @access  Private
const createRendezVous = asyncHandler(async (req, res) => {
    const { service, date, time, phone, email, reason, responsable } = req.body;

    if (!service || !date || !time || !phone || !email || !reason || !responsable) {
        res.status(400);
        throw new Error('Veuillez remplir tous les champs obligatoires');
    }

    // ── Validation date/heure : refuser le passé ─────────────────────────
    const todayStr = new Date().toLocaleDateString('fr-CA', { timeZone: 'Indian/Mayotte' }); // YYYY-MM-DD
    if (date < todayStr) {
        res.status(400);
        throw new Error('Impossible de prendre un rendez-vous à une date déjà passée.');
    }
    if (date === todayStr) {
        const nowInMayotte = new Date().toLocaleTimeString('fr-FR', {
            timeZone: 'Indian/Mayotte',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        if (time <= nowInMayotte) {
            res.status(400);
            throw new Error(`L'heure sélectionnée (${time}) est déjà passée. Veuillez choisir un créneau ultérieur.`);
        }
    }
    // ─────────────────────────────────────────────────────────────────────

    const appointment = await RendezVous.create({
        citizenId: req.user._id,
        service,
        date,
        time,
        phone,
        email,
        reason,
        responsable,
        status: 'En attente'
    });

    res.status(201).json({ success: true, data: appointment });
});

// ── ADMIN CONTROLLERS ──────────────────────────────────────────────────────────

// @desc    Get all appointments (Admin)
// @route   GET /api/admin/rendezvous
// @access  Private/Admin
const getAllRendezVous = asyncHandler(async (req, res) => {
    const appointments = await RendezVous.find()
        .populate('citizenId', 'firstname lastname email phone')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
});

// @desc    Update appointment details/status/comment (Admin)
// @route   PUT /api/admin/rendezvous/:id
// @access  Private/Admin
const updateRendezVous = asyncHandler(async (req, res) => {
    const { status, date, time, reason, comment } = req.body;
    const appointment = await RendezVous.findById(req.params.id);

    if (!appointment) {
        res.status(404);
        throw new Error('Rendez-vous non trouvé');
    }

    let statusChanged = false;
    let detailsChanged = false;

    if (status && appointment.status !== status) {
        appointment.status = status;
        statusChanged = true;
    }

    if (date && appointment.date !== date) {
        appointment.date = date;
        detailsChanged = true;
    }

    if (time && appointment.time !== time) {
        appointment.time = time;
        detailsChanged = true;
    }

    if (reason && appointment.reason !== reason) {
        appointment.reason = reason;
    }

    if (comment && comment.trim() !== '') {
        appointment.comments.push({
            author: 'Administration de Dembéni',
            message: comment,
            date: new Date()
        });
    }

    await appointment.save();

    // Create notifications based on changes
    let message = '';
    if (statusChanged && detailsChanged) {
        message = `Votre rendez-vous [${appointment.service}] a été reporté au ${appointment.date} à ${appointment.time}. Statut: ${appointment.status}.`;
    } else if (statusChanged) {
        message = `Votre rendez-vous [${appointment.service}] du ${appointment.date} est passé au statut : "${appointment.status}".`;
    } else if (detailsChanged) {
        message = `Votre rendez-vous [${appointment.service}] a été replanifié au ${appointment.date} à ${appointment.time}.`;
    } else if (comment) {
        message = `L'administration a ajouté un commentaire sur votre rendez-vous [${appointment.service}] du ${appointment.date}.`;
    }

    if (message) {
        await Notification.create({
            userId: appointment.citizenId,
            message
        });
    }

    res.status(200).json({ success: true, message: 'Rendez-vous mis à jour avec succès', data: appointment });
});

// @desc    Delete appointment (Admin)
// @route   DELETE /api/admin/rendezvous/:id
// @access  Private/Admin
const deleteRendezVous = asyncHandler(async (req, res) => {
    const appointment = await RendezVous.findById(req.params.id);

    if (!appointment) {
        res.status(404);
        throw new Error('Rendez-vous non trouvé');
    }

    await appointment.deleteOne();
    res.status(200).json({ success: true, message: 'Rendez-vous supprimé avec succès' });
});

module.exports = {
    getMyRendezVous,
    createRendezVous,
    getAllRendezVous,
    updateRendezVous,
    deleteRendezVous
};
