const User = require('../models/User');
const Demande = require('../models/Demande');
const Actualite = require('../models/Actualite');
const Evenement = require('../models/Evenement');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Get all citizens
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'citoyen' }).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

/**
 * @desc    Approve/Validate a user account
 * @route   PUT /api/admin/users/:id/validate
 * @access  Private/Admin
 */
const validateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }

    user.status = 'approved';
    await user.save();

    // Create confirmation notification
    await Notification.create({
        userId: user._id,
        message: 'Félicitations ! Votre compte citoyen a été approuvé par l\'administration de Dembéni. Vous pouvez désormais effectuer vos démarches en ligne.'
    });

    res.status(200).json({
        success: true,
        message: 'Utilisateur validé avec succès',
        data: user
    });
});

/**
 * @desc    Reject a user account
 * @route   PUT /api/admin/users/:id/reject
 * @access  Private/Admin
 */
const rejectUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }

    user.status = 'rejected';
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Utilisateur rejeté avec succès',
        data: user
    });
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }

    await user.deleteOne();
    res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
    });
});

/**
 * @desc    Get all demands from all citizens
 * @route   GET /api/admin/demandes
 * @access  Private/Admin
 */
const getDemandes = asyncHandler(async (req, res) => {
    const demandes = await Demande.find().populate('citizenId', 'firstname lastname email phone').sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        count: demandes.length,
        data: demandes
    });
});

/**
 * @desc    Respond to a demand
 * @route   POST /api/admin/demandes/:id/respond
 * @access  Private/Admin
 */
const respondToDemande = asyncHandler(async (req, res) => {
    const { message, status } = req.body;
    const demande = await Demande.findById(req.params.id);

    if (!demande) {
        res.status(404);
        throw new Error('Demande non trouvée');
    }

    if (message) {
        demande.responses.push({
            author: 'Administration de Dembéni',
            message,
            date: new Date()
        });
    }

    if (status) {
        demande.status = status;
    }

    await demande.save();

    // Create notification for citizen
    await Notification.create({
        userId: demande.citizenId,
        message: `Votre demande "${demande.title}" a reçu une mise à jour. Statut actuel : ${demande.status === 'approved' ? 'Approuvée' : demande.status === 'rejected' ? 'Rejetée' : 'En cours'}.`
    });

    res.status(200).json({
        success: true,
        message: 'Réponse enregistrée avec succès',
        data: demande
    });
});

/**
 * @desc    Get Admin Dashboard Stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = asyncHandler(async (req, res) => {
    const usersCount = await User.countDocuments({ role: 'citoyen' });
    const pendingUsers = await User.countDocuments({ role: 'citoyen', status: 'pending' });
    const approvedUsers = await User.countDocuments({ role: 'citoyen', status: 'approved' });
    
    const demandsCount = await Demande.countDocuments();
    const pendingDemands = await Demande.countDocuments({ status: 'pending' });
    
    const actualitesCount = await Actualite.countDocuments();
    const evenementsCount = await Evenement.countDocuments();
    const servicesCount = await Service.countDocuments();

    res.status(200).json({
        success: true,
        data: {
            users: {
                total: usersCount,
                pending: pendingUsers,
                approved: approvedUsers
            },
            demands: {
                total: demandsCount,
                pending: pendingDemands
            },
            content: {
                actualites: actualitesCount,
                evenements: evenementsCount,
                services: servicesCount
            }
        }
    });
});

module.exports = {
    getUsers,
    validateUser,
    rejectUser,
    deleteUser,
    getDemandes,
    respondToDemande,
    getStats
};
