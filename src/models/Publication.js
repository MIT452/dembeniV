const mongoose = require('mongoose');

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const publicationSchema = mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Veuillez ajouter un titre'] 
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    description: {
        type: String,
        default: ''
    },
    content: { 
        type: String, 
        required: [true, 'Veuillez ajouter un contenu'] 
    },
    type: {
        type: String,
        required: true,
        enum: ['actualite', 'evenement', 'projet', 'annonce', 'information'],
        default: 'actualite'
    },
    category: { 
        type: String, 
        required: true,
        enum: [
            'Santé & Solidarité', 'Environnement', 'Jeunesse', 'Culture', 
            'Sécurité', 'Services publics', 'Vie citoyenne', 'Urbanisme', 
            'Éducation', 'Développement local', 'Général',
            'Vie municipale', 'Travaux', 'Événements'
        ],
        default: 'Général'
    },
    image: { 
        type: String, 
        default: 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&w=800&q=80' 
    },
    gallery: [{
        type: String
    }],
    documents: [{
        name: { type: String, default: '' },
        url: { type: String, default: '' }
    }],
    readingTime: {
        type: Number,
        default: 3
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    showOnHomepage: {
        type: Boolean,
        default: false
    },
    secondaryCategories: [{
        type: String,
        enum: [
            'Santé & Solidarité', 'Environnement', 'Jeunesse', 'Culture', 
            'Sécurité', 'Services publics', 'Vie citoyenne', 'Urbanisme', 
            'Éducation', 'Développement local', 'Général',
            'Vie municipale', 'Travaux', 'Événements'
        ]
    }],
    tags: [{
        type: String
    }],
    eventDate: {
        type: Date
    },
    eventLocation: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Auto-generate slug on save
publicationSchema.pre('save', async function () {
    if (this.isModified('title') || !this.slug) {
        let baseSlug = slugify(this.title);
        let uniqueSlug = baseSlug;
        let counter = 1;
        
        const PublicationModel = mongoose.model('Publication');
        while (await PublicationModel.findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }
        this.slug = uniqueSlug;
    }
});

module.exports = mongoose.model('Publication', publicationSchema);
