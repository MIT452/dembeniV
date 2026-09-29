const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre du service est obligatoire']
    },
    desc: {
        type: String,
        required: [true, 'La description courte est obligatoire']
    },
    fullDesc: {
        type: String
    },
    icon: {
        type: String,
        default: 'FileText'
    },
    img: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'La catégorie est obligatoire']
    },
    location: {
        type: String,
        default: 'Hôtel de Ville de Dembéni'
    },
    hours: {
        type: String,
        default: 'Lundi au Vendredi : 8h00 - 12h00 / 13h30 - 16h00'
    },
    phone: {
        type: String,
        default: '0269 62 15 15'
    },
    email: {
        type: String,
        default: 'contact@dembeni.fr'
    },
    delay: {
        type: String,
        default: '3 à 5 jours ouvrés'
    },
    onlineStatus: {
        type: String,
        default: 'Disponible en ligne'
    },
    badge: {
        type: String,
        default: 'En ligne'
    },
    documents: {
        type: [String],
        default: []
    },
    steps: {
        type: [String],
        default: []
    },
    faq: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }],
    formulaireUrls: [{
        name: { type: String, required: true },
        url: { type: String, required: true }
    }],
    associatedDemarches: [{
        title: { type: String },
        url: { type: String }
    }],
    order: {
        type: Number,
        default: 0
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
