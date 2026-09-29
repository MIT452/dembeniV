const { validationResult, body, param, query } = require('express-validator');

// Reusable validation handler
const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        // Return a professional formatted JSON error response
        return res.status(400).json({
            message: 'Erreur de validation des données fournies.',
            errors: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                location: err.location
            }))
        });
    };
};

const isValidMayottePhone = (value) => {
    if (!value) return true;

    // 1. Refuser toute lettre et caractères spéciaux non autorisés.
    const allowedCharsRegex = /^[+]?[0-9\s.\-()]+$/;
    if (!allowedCharsRegex.test(value)) {
        throw new Error("Le numéro contient des lettres ou des caractères spéciaux non autorisés. Seuls les chiffres, espaces, '.', '-', '(' et ')' sont acceptés.");
    }

    // 2. Nettoyer le numéro
    const clean = value.replace(/[\s.\-()]/g, '');

    // 3. Détecter l'indicatif international
    if (clean.startsWith('+')) {
        if (!clean.startsWith('+262')) {
            throw new Error("Les numéros d'autres pays ne sont pas autorisés. Veuillez utiliser l'indicatif de Mayotte (+262).");
        }
        const remaining = clean.slice(4);
        if (!/^(269|639)\d{6}$/.test(remaining)) {
            throw new Error("Le numéro de Mayotte après l'indicatif +262 doit commencer par 269 ou 639 et comporter 9 chiffres.");
        }
        return true;
    }

    if (clean.startsWith('00')) {
        if (!clean.startsWith('00262')) {
            throw new Error("Les numéros d'autres pays ne sont pas autorisés. Veuillez utiliser l'indicatif de Mayotte (00262 ou +262).");
        }
        const remaining = clean.slice(5);
        if (!/^(269|639)\d{6}$/.test(remaining)) {
            throw new Error("Le numéro de Mayotte après l'indicatif 00262 doit commencer par 269 ou 639 et comporter 9 chiffres.");
        }
        return true;
    }

    // Format local
    if (!clean.startsWith('0')) {
        throw new Error("Un numéro local doit commencer par 0 (ex: 06 39 XX XX XX).");
    }

    if (!clean.startsWith('0269') && !clean.startsWith('0639')) {
        throw new Error("Seuls les numéros de Mayotte (commençant par 0269 ou 0639) sont autorisés.");
    }

    if (clean.length !== 10) {
        throw new Error(`Le numéro de téléphone local doit comporter exactement 10 chiffres (actuellement ${clean.length}).`);
    }

    return true;
};

// Common validation schemas
const authValidators = {
    register: [
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
        body('firstname').trim().notEmpty().withMessage('Le prénom est requis.'),
        body('lastname').trim().notEmpty().withMessage('Le nom de famille est requis.'),
        body('address').optional().trim(),
        body('phone').optional({ checkFalsy: true }).trim().custom(isValidMayottePhone),
    ],
    login: [
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('password').notEmpty().withMessage('Le mot de passe est requis.')
    ],
    forgotPassword: [
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail()
    ],
    verifyOtp: [
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('code').isLength({ min: 6, max: 6 }).withMessage('Le code OTP doit être composé de 6 chiffres.')
    ],
    resetPassword: [
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('code').isLength({ min: 6, max: 6 }).withMessage('Le code OTP doit être composé de 6 chiffres.'),
        body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.')
    ]
};

const demandeValidators = {
    create: [
        body('type').trim().notEmpty().withMessage('Le type de demande est requis.'),
        body('description').trim().notEmpty().withMessage('La description est requise.')
    ]
};

const contactValidators = {
    send: [
        body('name').trim().notEmpty().withMessage('Le nom est requis.'),
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('message').trim().notEmpty().withMessage('Le message est requis.'),
        body('phone').optional({ checkFalsy: true }).trim().custom(isValidMayottePhone)
    ]
};

const isNotPastDateTime = (value, { req }) => {
    const date = value;           // format YYYY-MM-DD
    const time = req.body.time;   // format HH:MM

    if (!date) throw new Error('La date du rendez-vous est obligatoire.');

    // Date de Mayotte (UTC+3) — on travaille en heure locale du serveur
    const todayStr = new Date().toLocaleDateString('fr-CA', { timeZone: 'Indian/Mayotte' }); // YYYY-MM-DD
    if (date < todayStr) {
        throw new Error('Impossible de prendre un rendez-vous à une date déjà passée.');
    }

    if (date === todayStr && time) {
        const nowInMayotte = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Indian/Mayotte', hour: '2-digit', minute: '2-digit', hour12: false });
        if (time <= nowInMayotte) {
            throw new Error(`L'heure sélectionnée (${time}) est déjà passée. Veuillez choisir un créneau ultérieur.`);
        }
    }

    return true;
};

const rendezvousValidators = {
    create: [
        body('service').trim().notEmpty().withMessage('Le type de rendez-vous / service est obligatoire.'),
        body('date').trim().notEmpty().withMessage('La date du rendez-vous est obligatoire.').custom(isNotPastDateTime),
        body('time').trim().notEmpty().withMessage('L\'heure du rendez-vous est obligatoire.'),
        body('phone').trim().notEmpty().withMessage('Le numéro de téléphone est obligatoire.').custom(isValidMayottePhone),
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('reason').trim().notEmpty().withMessage('Le motif du rendez-vous est obligatoire.'),
        body('responsable').trim().notEmpty().withMessage('La fonction de l\'interlocuteur est obligatoire.')
    ]
};

module.exports = {
    validate,
    authValidators,
    demandeValidators,
    contactValidators,
    rendezvousValidators,
    body,
    param,
    query
};
