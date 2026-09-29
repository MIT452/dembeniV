const mongoose = require('mongoose');

const evenementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre de l\'événement est obligatoire']
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire']
    },
    category: {
        type: String,
        default: 'SANTÉ'
    },
    date: {
        type: Date,
        required: [true, 'La date de l\'événement est obligatoire']
    },
    location: {
        type: String,
        required: [true, 'La localisation est obligatoire']
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Evenement', evenementSchema);
