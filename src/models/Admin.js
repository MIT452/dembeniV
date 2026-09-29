const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mot_de_passe: {
        type: String,
        required: true
    },
    telephone: {
        type: String
    },
    adresse: {
        type: String
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },
    date_creation: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving - Async style without next callback
adminSchema.pre('save', async function() {
    if (!this.isModified('mot_de_passe')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
});

// Match password method
adminSchema.methods.matchPassword = async function(enteredPassword) {
    // Fallback if the password was manually inserted without hashing
    if (this.mot_de_passe === enteredPassword) {
        return true;
    }
    return await bcrypt.compare(enteredPassword, this.mot_de_passe);
};

module.exports = mongoose.model('Admin', adminSchema, 'admin');
