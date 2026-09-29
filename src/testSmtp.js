/**
 * ═══════════════════════════════════════════════════════════════
 *  SCRIPT DE DIAGNOSTIC SMTP — Mairie de Dembéni
 *  Usage : node src/testSmtp.js
 * ═══════════════════════════════════════════════════════════════
 *  Ce script vérifie :
 *    1. La présence des variables d'environnement SMTP
 *    2. La connexion au serveur Gmail SMTP
 *    3. L'envoi d'un e-mail de test
 * ═══════════════════════════════════════════════════════════════
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const SEP = '═'.repeat(70);
const sep = '─'.repeat(70);

console.log('\n' + SEP);
console.log('  DIAGNOSTIC SMTP — Portail Citoyen Dembéni');
console.log(SEP + '\n');

// ── 1. Vérification des variables d'environnement ────────────────────────────
console.log('📋 Étape 1 : Vérification des variables d\'environnement...');
console.log(sep);

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER) {
    console.error('❌ SMTP_USER est manquant dans le fichier .env');
    process.exit(1);
}
if (!SMTP_PASS) {
    console.error('❌ SMTP_PASS est manquant dans le fichier .env');
    process.exit(1);
}
if (SMTP_PASS.includes('votre_mot_de_passe')) {
    console.error('❌ SMTP_PASS contient encore une valeur placeholder !');
    console.error('   Vous devez remplacer "votre_mot_de_passe_d_application_gmail"');
    console.error('   par un vrai Mot de Passe d\'Application Gmail (16 caractères).');
    console.error('\n   ➤ Guide : https://myaccount.google.com/apppasswords');
    process.exit(1);
}

console.log(`✅ SMTP_USER  : ${SMTP_USER}`);
console.log(`✅ SMTP_PASS  : ${'*'.repeat(SMTP_PASS.length)} (longueur: ${SMTP_PASS.length} caractères)`);

if (SMTP_PASS.replace(/\s/g, '').length !== 16) {
    console.warn(`⚠️  AVERTISSEMENT : Le mot de passe d'application Gmail doit faire exactement 16 caractères.`);
    console.warn(`   Actuel (sans espaces) : ${SMTP_PASS.replace(/\s/g, '').length} caractères.`);
}

// ── 2. Création du transporteur ───────────────────────────────────────────────
console.log('\n📋 Étape 2 : Création du transporteur Nodemailer...');
console.log(sep);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    },
    tls: {
        rejectUnauthorized: true
    }
});

console.log('✅ Transporteur créé (Gmail SMTP, port 465, SSL/TLS)');

// ── 3. Vérification de la connexion SMTP ─────────────────────────────────────
console.log('\n📋 Étape 3 : Vérification de la connexion Gmail SMTP...');
console.log(sep);
console.log('   ⏳ Connexion en cours...');

transporter.verify((error, success) => {
    if (error) {
        console.error('\n❌ ÉCHEC DE LA CONNEXION SMTP\n');
        console.error('   Erreur    :', error.message);
        console.error('   Code      :', error.code || 'N/A');
        console.error('   Réponse   :', error.response || 'N/A');
        console.error('\n' + sep);
        console.error('   🔧 Solutions possibles :');
        console.error('   ─────────────────────────────────────────────────────────────────');
        
        if (error.code === 'EAUTH' || error.message?.includes('Invalid login') || error.message?.includes('Username and Password not accepted')) {
            console.error('   ➤ Cause : Identifiants Gmail incorrects.');
            console.error('   ➤ Solution : Assurez-vous que SMTP_PASS est un Mot de Passe');
            console.error('     d\'Application Google (PAS votre mot de passe de compte Gmail).');
            console.error('   ➤ Génération : https://myaccount.google.com/apppasswords');
            console.error('   ➤ Prérequis : La validation en 2 étapes doit être activée');
            console.error('     sur le compte Google : https://myaccount.google.com/security');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            console.error('   ➤ Cause : Impossible de rejoindre smtp.gmail.com:587');
            console.error('   ➤ Solution : Vérifiez votre connexion Internet ou pare-feu.');
        } else {
            console.error('   ➤ Cause inconnue. Consultez le message d\'erreur ci-dessus.');
        }
        
        console.error(SEP + '\n');
        process.exit(1);
    }

    console.log('✅ Connexion Gmail SMTP réussie !');

    // ── 4. Envoi d'un e-mail de test ─────────────────────────────────────────
    console.log('\n📋 Étape 4 : Envoi d\'un e-mail de test...');
    console.log(sep);
    console.log(`   Destinataire : ${SMTP_USER} (e-mail de test envoyé à l'expéditeur lui-même)`);
    console.log('   ⏳ Envoi en cours...');

    const testMailOptions = {
        from: `"Portail Dembéni [TEST]" <${SMTP_USER}>`,
        to: 'judih@cael.com',
        subject: '✅ Test SMTP — Configuration Mairie de Dembéni',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:2px solid #059669;border-radius:12px;">
                <h2 style="color:#064e3b;text-align:center;">✅ Configuration SMTP Validée</h2>
                <p style="color:#374151;">Ce message confirme que le serveur de messagerie du Portail Citoyen de la <strong>Commune de Dembéni</strong> est correctement configuré.</p>
                <p style="color:#374151;">Les e-mails de réinitialisation de mot de passe seront correctement envoyés aux citoyens.</p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-top:20px;text-align:center;">
                    <p style="margin:0;color:#15803d;font-weight:bold;">Heure du test : ${new Date().toLocaleString('fr-FR')}</p>
                </div>
                <p style="color:#6b7280;font-size:12px;margin-top:20px;text-align:center;">
                    Mairie de Dembéni — Portail Citoyen Numérique
                </p>
            </div>
        `
    };

    transporter.sendMail(testMailOptions, (err, info) => {
        if (err) {
            console.error('\n❌ ÉCHEC DE L\'ENVOI DE L\'E-MAIL DE TEST\n');
            console.error('   Erreur :', err.message);
            console.error(SEP + '\n');
            process.exit(1);
        }

        console.log('\n' + SEP);
        console.log('  ✅ E-MAIL DE TEST ENVOYÉ AVEC SUCCÈS !');
        console.log(SEP);
        console.log(`  📬 Destinataire : ${SMTP_USER}`);
        console.log(`  🆔 Message ID   : ${info.messageId}`);
        console.log(`  📊 Réponse SMTP : ${info.response}`);
        console.log(SEP);
        console.log('\n  ✅ RÉSULTAT FINAL : La configuration SMTP est 100% opérationnelle.');
        console.log('     Les e-mails de réinitialisation de mot de passe seront');
        console.log('     correctement envoyés aux citoyens de Dembéni.\n');
        console.log(SEP + '\n');
        process.exit(0);
    });
});
