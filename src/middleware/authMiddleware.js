const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                res.status(401);
                throw new Error('Utilisateur non trouvé, accès interdit');
            }
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Non autorisé, jeton invalide');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Non autorisé, aucun jeton fourni');
    }
});

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Accès réservé aux administrateurs');
    }
};

module.exports = { protect, adminOnly };
