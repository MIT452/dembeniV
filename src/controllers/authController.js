const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// ─── Generate JWT ────────────────────────────────────────────────────────────
const generateToken = (id) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
        throw new Error('Configuration serveur incomplète: JWT_SECRET manquant');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const shouldAuthLog = () =>
    process.env.AUTH_DEBUG === 'true' || process.env.NODE_ENV === 'development';

const authLog = (...args) => {
    if (shouldAuthLog()) console.log(...args);
};

// ─── Nodemailer transporter factory (Gmail SMTP - Production Grade) ─────────
const createTransporter = () => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        throw new Error('[SMTP] SMTP_USER ou SMTP_PASS manquants dans le fichier .env');
    }
    if (pass.includes('votre_mot_de_passe')) {
        throw new Error('[SMTP] SMTP_PASS contient encore une valeur placeholder. Veuillez configurer un vrai mot de passe d\'application Gmail dans le fichier .env');
    }

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,           // true pour le port 465 (SSL/TLS)
        auth: {
            user: user,
            pass: pass          // Mot de passe d'application Gmail à 16 caractères
        },
        tls: {
            rejectUnauthorized: true
        },
        logger: process.env.NODE_ENV === 'development',   // logs nodemailer en dev
        debug:  process.env.NODE_ENV === 'development'    // debug SMTP en dev
    });
};

// ─── Professional email template ─────────────────────────────────────────────
const buildResetEmailHtml = (firstname, lastname, code) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe - Mairie de Dembéni</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -1px rgba(0,0,0,0.03);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#064e3b 0%,#047857 100%);padding:36px 32px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.12);border:2px solid rgba(255,255,255,0.25);border-radius:50%;line-height:52px;font-size:24px;color:#ffffff;margin-bottom:12px;font-weight:bold;text-align:center;box-sizing:border-box;">D</div>
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">Mairie de Dembéni</h1>
              <p style="margin:4px 0 0;color:#a7f3d0;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Mayotte • République Française</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;font-weight:600;">Bonjour ${firstname} ${lastname},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                Une demande de réinitialisation de mot de passe a été initiée pour votre espace citoyen sur le portail officiel de la Commune de Dembéni. 
              </p>

              <!-- OTP BOX -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:32px 24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.05em;">Votre code de sécurité à 6 chiffres</p>
                <div style="font-size:38px;font-weight:800;color:#064e3b;letter-spacing:0.2em;font-family:'Courier New',Courier,monospace;margin-bottom:12px;">${code}</div>
                <div style="display:inline-block;background:#059669;color:#ffffff;border-radius:30px;padding:6px 16px;font-size:12px;font-weight:600;letter-spacing:0.02em;">
                  ⏱ Valide pendant 10 minutes
                </div>
              </div>

              <!-- WARNING BOX -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-left:4px solid #d97706;border-radius:4px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;line-height:1.5;">
                      ⚠️ <strong>Avis de sécurité :</strong> Ne transmettez jamais ce code. Les services municipaux ne vous demanderont jamais votre code ou vos identifiants par téléphone ou e-mail. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.5;">
                Pour toute assistance, nos services restent à votre entière disposition.
              </p>
              
              <div style="border-top:1px solid #f1f5f9;margin-top:28px;padding-top:24px;">
                <p style="margin:0;font-size:14px;color:#1e293b;font-weight:700;">Le Service Relation Citoyen</p>
                <p style="margin:2px 0 0;font-size:13px;color:#64748b;">Commune de Dembéni</p>
                <p style="margin:2px 0 0;font-size:12px;color:#94a3b8;font-style:italic;">Département de Mayotte</p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;line-height:1.4;">
                Ceci est un message automatique de sécurité. Merci de ne pas y répondre.
              </p>
              <p style="margin:0;font-size:11px;color:#b2c1d4;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">
                © Mairie de Dembéni • Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const throwHttpError = (message, statusCode, res) => {
    if (res) res.status(statusCode);
    const err = new Error(message);
    err.statusCode = statusCode;
    err.status = statusCode;
    throw err;
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password, quartier } = req.body;

    // ── Required fields check ─────────────────────────────────────────────────
    if (!firstname?.trim() || !lastname?.trim() || !email?.trim() || !password) {
        throwHttpError('Veuillez remplir tous les champs obligatoires (prénom, nom, e-mail, mot de passe).', 400, res);
    }

    // ── Name validation (letters, spaces, hyphens, apostrophes only) ──────────
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'\-]+$/;
    if (!nameRegex.test(firstname.trim())) {
        throwHttpError('Le prénom ne doit contenir que des lettres et des espaces.', 400, res);
    }
    if (!nameRegex.test(lastname.trim())) {
        throwHttpError('Le nom ne doit contenir que des lettres et des espaces.', 400, res);
    }

    // ── Email format validation ───────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
        throwHttpError('Format d\'adresse e-mail invalide.', 400, res);
    }

    // ── Password strength validation ──────────────────────────────────────────
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,}$/;
    if (!pwdRegex.test(password)) {
        throwHttpError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&_-#).', 400, res);
    }

    // ── Email uniqueness check ────────────────────────────────────────────────
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
        // If a profile image was uploaded, delete it to avoid orphan files
        if (req.file) {
            const fs = require('fs');
            fs.unlink(req.file.path, () => {});
        }
        throwHttpError('Cette adresse e-mail est déjà associée à un compte existant.', 400, res);
    }

    // ── Profile image path (Multer) ───────────────────────────────────────────
    const profileImage = req.file
        ? req.file.path
        : '';

    // ── Create user ───────────────────────────────────────────────────────────
    const user = await User.create({
        firstname: firstname.trim(),
        lastname:  lastname.trim(),
        email:     email.toLowerCase().trim(),
        password,
        quartier:  quartier?.trim() || '',
        profileImage,
        role:   'citoyen',
        status: 'pending'
    });

    if (user) {
        res.status(201).json({
            success: true,
            message: "Votre inscription a bien été enregistrée. Votre compte est en attente de validation par l'administration de Dembéni.",
            data: {
                _id: user._id,
                firstname: user.firstname,
                lastname:  user.lastname,
                email:     user.email,
                role:      user.role,
                status:    user.status
            }
        });
    } else {
        throwHttpError("Données d'inscription invalides.", 400, res);
    }
});


// ─── LOGIN ────────────────────────────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const receivedEmail = typeof email === 'string' ? email : '';
    const normalizedEmail = receivedEmail.toLowerCase().trim();

    // Debug logs (enabled when AUTH_DEBUG=true or NODE_ENV=development)
    authLog('[AUTH][LOGIN] Email reçu:', receivedEmail);
    authLog('[AUTH][LOGIN] Email normalisé:', normalizedEmail);

    if (!normalizedEmail || typeof password !== 'string' || !password.trim()) {
        // Bad request: missing or invalid credentials
        throwHttpError('Veuillez fournir un e-mail et un mot de passe valides.', 400, res);
    }

    try {
        // Ensure password field is available for bcrypt comparison even if the schema later hides it by default
        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        authLog('[AUTH][LOGIN] Utilisateur trouvé:', user ? `${user._id} (${user.role})` : 'NON');

        // Default to false; only set to true when bcrypt comparison succeeds
        let passwordMatch = false;
        if (user) {
            try {
                // `matchPassword` uses bcrypt.compare under the hood; await its result
                passwordMatch = !!(await user.matchPassword(password));
            } catch (bcryptErr) {
                // Log bcrypt-specific errors but do not leak details to the client
                console.error('[AUTH][LOGIN] bcrypt error:', bcryptErr);
                passwordMatch = false;
            }
        }
        authLog('[AUTH][LOGIN] Mot de passe correspondant:', passwordMatch);

        // Authentication failed: preserve original HTTP 401 status
        if (!user || !passwordMatch) {
            throwHttpError('Identifiants de connexion invalides', 401, res);
        }

        // Authorization / status checks (keeps existing logic)
        if (user.role === 'citoyen' && user.status !== 'approved') {
            const msg = user.status === 'pending'
                ? "Votre compte est toujours en attente de validation par l'administration."
                : "Votre demande d'inscription a été refusée par l'administration.";
            throwHttpError(msg, 401, res);
        }

        // Generate JWT only after successful authentication
        let token;
        try {
            token = generateToken(user._id);
        } catch (e) {
            console.error('[AUTH][LOGIN] Erreur génération JWT :', e.message);
            // Real server configuration error -> respond 500
            res.status(500);
            throw new Error('Erreur de configuration du serveur (JWT non configuré). Veuillez contacter l\'administration.');
        }

        authLog('[AUTH][LOGIN] JWT généré pour userId:', String(user._id));

        // Build response payload explicitly (do not include password)
        const responseData = {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            status: user.status,
            phone: user.phone,
            address: user.address,
            quartier: user.quartier,
            profileImage: user.profileImage,
            token
        };

        return res.status(200).json({ success: true, message: 'Connexion réussie', data: responseData });

    } catch (err) {
        // Preserve known HTTP errors (thrown via throwHttpError) so client receives correct status code
        console.error('[AUTH][LOGIN] Erreur inattendue :', err);
        if (err && (err.statusCode || err.status)) {
            // If an HTTP error was intentionally thrown earlier, rethrow it so the global error handler returns it unchanged
            const statusCode = err.statusCode || err.status;
            if (statusCode && typeof statusCode === 'number') {
                res.status(statusCode);
                throw err; // express-async-handler will forward this
            }
        }

        // Otherwise, it's a genuine server error -> return 500
        res.status(500);
        throw new Error('Erreur serveur lors de la tentative de connexion.');
    }
});

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.status(200).json({
            success: true,
            data: {
                _id: user._id, firstname: user.firstname, lastname: user.lastname,
                email: user.email, phone: user.phone, role: user.role,
                status: user.status, address: user.address, quartier: user.quartier,
                profileImage: user.profileImage
            }
        });
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
/**
 * @desc    Generate a secure 6-digit OTP, save it hashed in DB, send by email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email || !email.trim()) {
        res.status(400);
        throw new Error('Veuillez fournir une adresse e-mail valide');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
        .select('+resetPasswordCode +resetPasswordExpires +resetPasswordAttempts');

    if (!user) {
        res.status(404);
        throw new Error("Aucun compte n'est associé à cette adresse e-mail.");
    }

    // Clean up expired codes from this user first
    if (user.resetPasswordExpires && user.resetPasswordExpires < Date.now()) {
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordAttempts = 0;
    }

    // Generate a cryptographically secure 6-digit OTP
    const otpBuffer = crypto.randomBytes(3); // 3 bytes = 24 bits
    const otp = (parseInt(otpBuffer.toString('hex'), 16) % 900000 + 100000).toString();

    // Hash the OTP before storing (security best practice)
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetPasswordCode = hashedOtp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.resetPasswordAttempts = 0;
    await user.save();

    // ── Envoi de l'e-mail via Gmail SMTP ────────────────────────────────────
    let transporter = null;

    try {
        transporter = createTransporter();
    } catch (configError) {
        console.error('\n' + '═'.repeat(70));
        console.error('[SMTP CONFIG ERROR] La création du transporteur a échoué.');
        console.error('[SMTP] Cause :', configError.message);
        console.error('[SMTP] Stack :', configError.stack);
        console.error('═'.repeat(70));

        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(500);
        throw new Error("La configuration du serveur de messagerie est incomplète. Veuillez contacter l'administration.");
    }

    try {
        console.log(`[SMTP] Tentative d'envoi du code OTP par e-mail à : ${user.email}`);
        const info = await transporter.sendMail({
            from: `"Mairie de Dembéni" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: '🔑 Réinitialisation de votre mot de passe - Mairie de Dembéni',
            html: buildResetEmailHtml(user.firstname, user.lastname, otp)
        });
        console.log(`[SMTP] ✅ E-mail envoyé avec succès à ${user.email}`);
        console.log(`[SMTP] Message ID : ${info.messageId}`);
    } catch (sendError) {
        console.error('\n' + '═'.repeat(70));
        console.error('[SMTP SEND ERROR] Échec de l\'envoi de l\'e-mail.');
        console.error('[SMTP] Destinataire :', user.email);
        console.error('[SMTP] Cause :', sendError.message);
        console.error('[SMTP] Code  :', sendError.code || 'N/A');
        console.error('[SMTP] Stack :', sendError.stack);
        console.error('═'.repeat(70));

        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(500);
        throw new Error("Échec de l'envoi de l'e-mail. Veuillez réessayer dans quelques instants.");
    }

    return res.status(200).json({
        success: true,
        message: "Un code de vérification a été envoyé à votre adresse e-mail."
    });
});


// ─── VERIFY OTP CODE ─────────────────────────────────────────────────────────
/**
 * @desc    Verify the OTP code (without resetting yet — optional pre-check step)
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        res.status(400);
        throw new Error('Email et code requis');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
        .select('+resetPasswordCode +resetPasswordExpires +resetPasswordAttempts');

    if (!user) {
        res.status(404);
        throw new Error("Aucun compte n'est associé à cette adresse e-mail.");
    }

    if (!user.resetPasswordCode) {
        res.status(400);
        throw new Error("Aucun code de réinitialisation n'a été demandé ou le code a déjà été utilisé.");
    }

    if (user.resetPasswordExpires < Date.now()) {
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordAttempts = 0;
        await user.save();
        res.status(400);
        throw new Error('Le code de vérification a expiré. Veuillez demander un nouveau code.');
    }

    const hashedCode = crypto.createHash('sha256').update(code.trim()).digest('hex');

    if (user.resetPasswordCode !== hashedCode) {
        user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
        if (user.resetPasswordAttempts >= 5) {
            user.resetPasswordCode = undefined;
            user.resetPasswordExpires = undefined;
            user.resetPasswordAttempts = 0;
            await user.save();
            res.status(400);
            throw new Error('Trop de tentatives invalides. Votre code a été invalidé par sécurité. Veuillez recommencer.');
        }
        await user.save();
        res.status(400);
        throw new Error(`Code de vérification incorrect. Tentative ${user.resetPasswordAttempts}/5.`);
    }

    res.status(200).json({
        success: true,
        message: 'Code validé avec succès.'
    });
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
/**
 * @desc    Reset password after OTP verification
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        res.status(400);
        throw new Error('Email, code et nouveau mot de passe sont requis');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
        .select('+resetPasswordCode +resetPasswordExpires +resetPasswordAttempts');

    if (!user) {
        res.status(404);
        throw new Error("Aucun compte n'est associé à cette adresse e-mail.");
    }

    if (!user.resetPasswordCode) {
        res.status(400);
        throw new Error("Aucune demande de réinitialisation en cours. Veuillez recommencer.");
    }

    if (user.resetPasswordExpires < Date.now()) {
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordAttempts = 0;
        await user.save();
        res.status(400);
        throw new Error('Le code de vérification a expiré. Veuillez recommencer depuis le début.');
    }

    const hashedCode = crypto.createHash('sha256').update(code.trim()).digest('hex');

    if (user.resetPasswordCode !== hashedCode) {
        user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
        if (user.resetPasswordAttempts >= 5) {
            user.resetPasswordCode = undefined;
            user.resetPasswordExpires = undefined;
            user.resetPasswordAttempts = 0;
            await user.save();
            res.status(400);
            throw new Error('Trop de tentatives invalides. Veuillez recommencer depuis le début.');
        }
        await user.save();
        res.status(400);
        throw new Error(`Code de vérification incorrect. Tentative ${user.resetPasswordAttempts}/5.`);
    }

    // Set new password — will be hashed by pre-save hook
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordAttempts = 0;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
    });
});

// ─── AUTO-CLEANUP EXPIRED CODES (can be called by a cron job) ─────────────────
const cleanupExpiredCodes = asyncHandler(async (req, res) => {
    const result = await User.updateMany(
        { resetPasswordExpires: { $lt: Date.now() } },
        { $unset: { resetPasswordCode: '', resetPasswordExpires: '', resetPasswordAttempts: '' } }
    );
    res.status(200).json({ success: true, cleaned: result.modifiedCount });
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    forgotPassword,
    verifyOtp,
    resetPassword,
    cleanupExpiredCodes
};
