const mongoose = require('mongoose');

const signalementSchema = new mongoose.Schema({
    citizenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'La catégorie est obligatoire'],
        enum: ['Voirie', 'Éclairage', 'Déchets', 'Espaces verts']
    },
    location: {
        type: String,
        required: [true, 'La localisation est obligatoire']
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire']
    },
    imageUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['En attente', 'Pris en charge', 'En cours', 'Résolu'],
        default: 'En attente'
    },
    comments: [{
        author: String,
        message: String,
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Signalement', signalementSchema);
