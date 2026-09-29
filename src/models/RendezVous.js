const mongoose = require('mongoose');

const rendezVousSchema = new mongoose.Schema({
    citizenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: String,
        required: [true, 'Le type de rendez-vous / service est obligatoire']
    },
    date: {
        type: String,
        required: [true, 'La date du rendez-vous est obligatoire']
    },
    time: {
        type: String,
        required: [true, 'L\'heure du rendez-vous est obligatoire']
    },
    phone: {
        type: String,
        required: [true, 'Le numéro de téléphone est obligatoire']
    },
    email: {
        type: String,
        required: [true, 'L\'adresse email est obligatoire']
    },
    reason: {
        type: String,
        required: [true, 'Le motif du rendez-vous est obligatoire']
    },
    responsable: {
        type: String,
        required: [true, 'La fonction de l\'interlocuteur est obligatoire']
    },
    status: {
        type: String,
        enum: ['En attente', 'Confirmé', 'Refusé', 'Terminé'],
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

module.exports = mongoose.model('RendezVous', rendezVousSchema);
