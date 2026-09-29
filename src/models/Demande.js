const mongoose = require('mongoose');

const demandeSchema = new mongoose.Schema({
    citizenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Le titre de la demande est obligatoire']
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire']
    },
    type: {
        type: String,
        required: [true, 'Le type de demande est obligatoire']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    attachmentUrl: {
        type: String,
        default: ''
    },
    responses: [{
        author: String,
        message: String,
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Demande', demandeSchema);
