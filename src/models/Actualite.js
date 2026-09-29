const mongoose = require('mongoose');

const actualiteSchema = mongoose.Schema({
    titre: { type: String, required: [true, 'Veuillez ajouter un titre'] },
    contenu: { type: String, required: [true, 'Veuillez ajouter un contenu'] },
    categorie: { type: String, default: 'INFO' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&w=800&q=80' },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Actualite', actualiteSchema);
