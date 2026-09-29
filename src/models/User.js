const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Le prénom est obligatoire'],
        trim: true
    },
    lastname: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true
    },
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire']
    },
    role: {
        type: String,
        enum: ['visitor', 'citoyen', 'admin'],
        default: 'visitor'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    address: { type: String },
    quartier: { type: String },
    profileImage: { type: String, default: '' },

    // ── Password reset fields ─────────────────────────────────────
    // Stores SHA-256 hash of the OTP (never plain text)
    resetPasswordCode: { type: String, select: false },
    // Expiration timestamp (10 minutes after generation)
    resetPasswordExpires: { type: Date, select: false },
    // Failed verification attempts counter (max 5 before invalidation)
    resetPasswordAttempts: { type: Number, default: 0, select: false }

}, { timestamps: true });

// ── Hash password before saving ──────────────────────────────────
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance method: compare password ────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ── Index: auto-expire documents in TTL collection (optional, for cleanup) ──
// This index helps MongoDB auto-clean reset tokens if you prefer
userSchema.index({ resetPasswordExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('User', userSchema);
