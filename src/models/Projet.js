const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre du projet est obligatoire']
    },
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    description: {
        type: String,
        required: [true, 'La description courte est obligatoire']
    },
    fullDescription: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['Urbanisme', 'Éducation', 'Santé', 'Environnement', 'Numérique', 'Culture', 'Jeunesse', 'Routes & Infrastructures', 'Autre'],
        default: 'Autre'
    },
    status: {
        type: String,
        enum: ['En cours', 'Terminé', 'Futur', 'En pause'],
        default: 'En cours'
    },
    image: {
        type: String,
        default: ''
    },
    gallery: {
        type: [String],
        default: []
    },
    budget: {
        type: String,
        default: ''
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    objectives: {
        type: [String],
        default: []
    },
    timeline: {
        type: [{ label: String, date: String, done: Boolean }],
        default: []
    },
    documents: {
        type: [{ name: String, url: String }],
        default: []
    },
    videos: {
        type: [String],
        default: []
    },
    location: {
        type: String,
        default: 'Dembéni, Mayotte'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Auto-generate slug from title before saving
projetSchema.pre('save', function(next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() + '-' + Date.now();
    }
    next();
});

module.exports = mongoose.model('Projet', projetSchema);
