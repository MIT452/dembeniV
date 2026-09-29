/**
 * SCRIPT DE SEED — Publications communales de Dembéni
 * 
 * Exécution : node src/seed/seedPublications.js
 * 
 * Ce script insère des actualités réalistes directement dans MongoDB.
 * Elles sont ensuite gérables depuis le dashboard Admin (CRUD complet).
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_management';

// ── Schéma inline (évite les imports circulaires) ──
const publicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, default: 'actualite' },
  category: { type: String, required: true },
  image: { type: String },
  status: { type: String, default: 'published' },
  isFeatured: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  isUrgent: { type: Boolean, default: false },
  showOnHomepage: { type: Boolean, default: false },
  tags: [String],
}, { timestamps: true });

const Publication = mongoose.models.Publication || mongoose.model('Publication', publicationSchema);

// ── Données réalistes pour Dembéni ──
const publications = [
  {
    title: 'Conseil municipal : décisions importantes pour l\'avenir de Dembéni',
    content: `Le conseil municipal de Dembéni s'est réuni en session ordinaire pour statuer sur plusieurs projets structurants pour notre commune.

Parmi les décisions prises :
• Extension du réseau d'eau potable dans les quartiers nord de la commune
• Allocation budgétaire pour la rénovation complète de l'école primaire centrale
• Création d'un nouveau parc de jeux sécurisé pour les enfants
• Mise en place d'un système d'éclairage LED écoénergétique sur les voies principales

Ces décisions reflètent l'engagement fort de la municipalité pour améliorer durablement la qualité de vie de tous les habitants de Dembéni. Les travaux débuteront au prochain trimestre.

Pour toute question, contactez la mairie au 02 69 XX XX XX.`,
    type: 'actualite',
    category: 'Vie municipale',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=1200',
    status: 'published',
    isFeatured: true,
    showOnHomepage: true,
    isPinned: true,
    tags: ['conseil', 'municipal', 'décisions', 'projets'],
  },
  {
    title: 'Campagne de vaccination communale — Rejoignez le mouvement de prévention',
    content: `Dans le cadre de la politique de santé publique de la commune, une nouvelle campagne de vaccination est organisée pour tous les habitants de Dembéni.

📍 Lieu : Centre de Santé Municipal, rue principale, Dembéni
🗓️ Dates : Du lundi au vendredi, de 8h à 16h
💉 Vaccins disponibles : Grippe, Covid-19, Hépatite B, Rougeole

Aucun rendez-vous n'est nécessaire pour les moins de 12 ans. Pour les adultes, une pré-inscription en ligne ou par téléphone est recommandée pour éviter l'attente.

Documents à apporter :
• Carnet de santé ou carnet de vaccination
• Pièce d'identité
• Attestation de droits (carte vitale ou équivalent)

La vaccination est gratuite et ouverte à tous les résidents de la commune. Protégez-vous et protégez vos proches !`,
    type: 'actualite',
    category: 'Santé & Solidarité',
    image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    isFeatured: false,
    showOnHomepage: true,
    isUrgent: true,
    tags: ['vaccination', 'santé', 'prévention', 'gratuit'],
  },
  {
    title: 'Réhabilitation des routes : un programme ambitieux pour Dembéni',
    content: `La commune de Dembéni lance un programme ambitieux de réhabilitation de ses voies de circulation. Après plusieurs années de dégradation liée aux intempéries et au trafic intense, plusieurs axes routiers vont bénéficier d'une réfection complète.

Axes concernés par les travaux :
• Route principale de Dembéni (section nord) — début prévu le 5 juin
• Rue des Flamboyants — travaux du 15 au 30 juin
• Chemin des Écoles — réfection prévue en juillet

Des déviations seront mises en place et signalées à l'avance. La circulation sera maintenue sur les voies alternatives balisées.

Ces travaux, financés en partie par la collectivité territoriale, représentent un investissement de 800 000 euros pour améliorer la sécurité et le confort de déplacement des habitants.

Nous vous remercions de votre compréhension et de votre patience durant cette période de travaux.`,
    type: 'actualite',
    category: 'Travaux',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    showOnHomepage: true,
    tags: ['travaux', 'routes', 'réhabilitation', 'circulation'],
  },
  {
    title: 'Festival culturel de Dembéni 2025 : programme officiel dévoilé',
    content: `La commune de Dembéni est heureuse de vous dévoiler le programme complet du Festival Culturel 2025, un événement incontournable qui célèbre la richesse et la diversité culturelle de notre île.

🎭 Au programme cette année :
• Expositions d'artistes locaux et régionaux (salle des fêtes)
• Concerts de musiques traditionnelles mahoraises et africaines
• Spectacles de danse (balé traditionnel, hip-hop, contemporain)
• Ateliers créatifs pour enfants (peinture, poterie, conte)
• Stands de gastronomie locale et produits artisanaux
• Tournoi de sports traditionnels

📅 Dates : 14, 15 et 16 juillet 2025
📍 Lieu : Place centrale de Dembéni et alentours

L'entrée est libre et gratuite pour tous les habitants. Une navette gratuite sera mise en place depuis les quartiers éloignés.

Venez nombreux partager ce moment de convivialité et de partage culturel !`,
    type: 'evenement',
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    isFeatured: false,
    showOnHomepage: true,
    tags: ['festival', 'culture', 'événement', 'gratuit', 'famille'],
  },
  {
    title: 'Grande journée citoyenne de nettoyage — Tous ensemble pour Dembéni',
    content: `Dans le cadre de la politique environnementale de la commune, une grande journée citoyenne de nettoyage est organisée pour préserver la beauté et la propreté de notre territoire.

🗓️ Date : Samedi 7 juin 2025, de 8h à 12h
📍 Points de départ : Mairie de Dembéni, École primaire centrale, Stade municipal

Cette journée sera l'occasion de :
• Nettoyer les plages, les ravines et les espaces naturels
• Sensibiliser les habitants à la gestion des déchets
• Planter des arbres fruitiers dans les espaces publics
• Distribuer des kits de tri sélectif aux familles participantes

Tout le matériel nécessaire sera fourni sur place (gants, sacs, pinces). Un repas communautaire clôturera la matinée.

Inscription souhaitée mais non obligatoire en mairie ou par téléphone.

Chaque geste compte ! Ensemble, gardons Dembéni propre et agréable pour tous.`,
    type: 'actualite',
    category: 'Environnement',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    showOnHomepage: false,
    tags: ['environnement', 'nettoyage', 'citoyen', 'nature'],
  },
  {
    title: 'Ateliers jeunesse 2025 : inscriptions officiellement ouvertes',
    content: `La Maison des Jeunes et de la Culture (MJC) de Dembéni ouvre officiellement les inscriptions pour ses ateliers et activités estivales 2025.

🎯 Activités proposées (10-18 ans) :
• Sport multi-activités (football, basketball, natation, athlétisme)
• Arts plastiques et expression créative
• Musique et initiation aux instruments traditionnels
• Initiation à l'informatique et au codage
• Activités nature et randonnées encadrées
• Théâtre et expression corporelle
• Cuisine et gastronomie locale

📅 Période : Juillet et août 2025
📍 Lieu : MJC de Dembéni et espaces communaux

Les ateliers sont encadrés par des animateurs diplômés. Les places sont limitées à 20 participants par atelier. Une participation symbolique de 5€/semaine est demandée pour les fournitures.

Inscriptions jusqu'au 20 juin en mairie ou sur le portail citoyen en ligne.`,
    type: 'actualite',
    category: 'Jeunesse',
    image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    showOnHomepage: false,
    tags: ['jeunesse', 'ateliers', 'été', 'MJC', 'activités'],
  },
  {
    title: 'Modernisation de l\'administration : nouveau guichet numérique en ligne',
    content: `Dans le cadre de sa stratégie de modernisation des services publics, la mairie de Dembéni lance son nouveau portail de télé-services, accessible 24h/24 et 7j/7.

✅ Services disponibles dès maintenant :
• Demande d'actes d'état civil (naissance, mariage, décès)
• Déclaration de naissance et reconnaissance
• Inscription sur les listes électorales
• Demande de logement social
• Signalement d'anomalies sur la voie publique
• Prise de rendez-vous en mairie

📱 Le portail est accessible depuis votre ordinateur, tablette ou smartphone.
🔐 Connexion sécurisée avec FranceConnect ou identifiants mairie.

Ce nouveau service permettra de réduire considérablement les délais de traitement et les déplacements inutiles en mairie. Notre objectif : une administration plus proche, plus rapide et plus efficace pour tous.

Pour toute aide à l'utilisation, nos agents sont disponibles en mairie du lundi au vendredi.`,
    type: 'actualite',
    category: 'Services publics',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    showOnHomepage: false,
    tags: ['numérique', 'services', 'mairie', 'modernisation', 'en ligne'],
  },
  {
    title: 'Nouveaux équipements sportifs : le stade municipal rénové',
    content: `La commune de Dembéni est fière d'annoncer la fin des travaux de rénovation du stade municipal. Après 8 mois de chantier, les nouvelles infrastructures sportives sont désormais disponibles pour tous les habitants.

⚽ Nouveautés du stade :
• Terrain de football synthétique aux normes FIFA Quality
• Piste d'athlétisme rénovée (6 couloirs)
• Vestiaires modernisés avec douches et sanitaires
• Éclairage LED basse consommation pour les matchs en soirée
• Tribune couverte de 500 places assises
• Espace de musculation et fitness en accès libre

Le stade est ouvert aux associations sportives de la commune, aux écoles et aux particuliers selon un planning établi par les services municipaux.

Les associations souhaitant réserver des créneaux sont invitées à contacter le service des sports de la mairie.

🎉 Inauguration officielle le samedi 21 juin à 10h — Venez nombreux !`,
    type: 'actualite',
    category: 'Vie municipale',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    showOnHomepage: false,
    tags: ['sport', 'stade', 'rénovation', 'inauguration'],
  },
];

async function seed() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB :', MONGO_URI);

    // Compter les publications existantes
    const existing = await Publication.countDocuments();
    console.log(`📊 Publications existantes : ${existing}`);

    if (existing > 0) {
      console.log('\n⚠️  Des publications existent déjà en base de données.');
      console.log('   Voulez-vous les supprimer et insérer les nouvelles ? (modification du script)');
      console.log('   → Pour forcer le re-seeding, passez le paramètre --force\n');
      
      const force = process.argv.includes('--force');
      if (!force) {
        console.log('💡 Ajout des nouvelles publications SANS supprimer les existantes...\n');
      } else {
        console.log('🗑️  Suppression des publications existantes...');
        await Publication.deleteMany({});
        console.log('✅ Publications supprimées.\n');
      }
    }

    console.log('📝 Insertion des publications...');
    let inserted = 0;
    
    for (const pub of publications) {
      try {
        const newPub = new Publication(pub);
        await newPub.save();
        console.log(`  ✅ "${pub.title.substring(0, 55)}..."`);
        inserted++;
      } catch (err) {
        console.error(`  ❌ Erreur pour "${pub.title.substring(0, 40)}...": ${err.message}`);
      }
    }

    console.log(`\n🎉 Seed terminé ! ${inserted}/${publications.length} publications insérées.`);
    console.log('\n📌 Ces publications sont maintenant visibles sur le site et gérables depuis le dashboard Admin.');
    console.log('   URL Admin → http://localhost:5173/admin\n');

  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB :', err.message);
    console.error('\n💡 Vérifiez que MongoDB est bien démarré sur votre machine.');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion MongoDB.');
    process.exit(0);
  }
}

seed();
