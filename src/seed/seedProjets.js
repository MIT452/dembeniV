require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Projet = require('../models/Projet');

const defaultProjets = [
  {
    title: "Eco-quartier Dembeni Nord",
    description: "Developpement d'un nouveau quartier residentiel durable avec espaces verts, pistes cyclables et batiments basse consommation.",
    fullDescription: "Le projet Eco-quartier Dembeni Nord represente l'ambition de la commune de proposer un habitat moderne, ecologique et accessible a tous. Ce programme prevoit la construction de 120 logements sociaux et intermediaires, organises autour d'un parc central, avec des panneaux solaires, une gestion des eaux pluviales integree et des circulations douces prioritaires.\n\nLe quartier sera desservi par une ligne de transport collectif renforcee et disposera d'une ecole maternelle, d'une creche et d'un espace multi-services de proximite.",
    category: "Urbanisme",
    status: "En cours",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800"
    ],
    budget: "12.5 M\u20ac",
    progress: 45,
    startDate: new Date("2025-01-15"),
    endDate: new Date("2027-12-31"),
    objectives: [
      "Construire 120 logements durables",
      "Creer un parc central de 2 hectares",
      "Installer 500 kWc de panneaux solaires",
      "Amenager 4 km de pistes cyclables",
      "Reduire les emissions carbone de 40%"
    ],
    timeline: [
      { label: "Lancement du projet", date: "Janvier 2025", done: true },
      { label: "Etudes et permis de construire", date: "Mars 2025", done: true },
      { label: "Debut des travaux de voirie", date: "Septembre 2025", done: true },
      { label: "Construction des premiers logements", date: "Janvier 2026", done: false },
      { label: "Inauguration du parc central", date: "Juin 2027", done: false },
      { label: "Livraison complete du quartier", date: "Decembre 2027", done: false }
    ],
    location: "Quartier Nord, Dembeni, Mayotte",
    isFeatured: true,
    isPublished: true,
    order: 1
  },
  {
    title: "Renovation du groupe scolaire Bamana",
    description: "Modernisation complete de l'ecole primaire Bamana avec nouvelles salles de classe, equipements numeriques et cantine renovee.",
    fullDescription: "Le groupe scolaire Bamana accueille plus de 400 eleves dans des batiments vieillissants. Ce projet de renovation totale vise a offrir des conditions d'apprentissage dignes du XXIe siecle : salles climatisees, tableaux numeriques interactifs, salle informatique, bibliotheque modernisee et plateau sportif.",
    category: "\u00c9ducation",
    status: "Termin\u00e9",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
    ],
    budget: "3.2 M\u20ac",
    progress: 100,
    startDate: new Date("2024-02-01"),
    endDate: new Date("2025-07-30"),
    objectives: [
      "Renover 18 salles de classe",
      "Installer 400 equipements numeriques",
      "Moderniser la cantine scolaire (400 couverts)",
      "Creer un plateau sportif couvert",
      "Mettre aux normes d'accessibilite PMR"
    ],
    timeline: [
      { label: "Etudes prealables", date: "Fevrier 2024", done: true },
      { label: "Demarrage chantier phase 1", date: "Juin 2024", done: true },
      { label: "Renovation batiment principal", date: "Octobre 2024", done: true },
      { label: "Installation equipements numeriques", date: "Fevrier 2025", done: true },
      { label: "Inauguration officielle", date: "Juillet 2025", done: true }
    ],
    location: "Bamana, Dembeni, Mayotte",
    isFeatured: false,
    isPublished: true,
    order: 2
  },
  {
    title: "Reseau haut debit fibre optique communal",
    description: "Deploiement de la fibre optique dans toute la commune pour connecter foyers, entreprises et equipements publics.",
    fullDescription: "Dans le cadre du plan France Tres Haut Debit, la commune de Dembeni s'engage a deployer la fibre optique sur l'ensemble de son territoire d'ici 2026. Ce projet permettra de raccorder 3 200 prises et d'offrir une connexion symetrique a 1 Gbit/s a tous les habitants.",
    category: "Num\u00e9rique",
    status: "En cours",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200",
    gallery: [],
    budget: "5.8 M\u20ac",
    progress: 62,
    startDate: new Date("2024-09-01"),
    endDate: new Date("2026-06-30"),
    objectives: [
      "Raccorder 3 200 prises fibre optique",
      "Connecter tous les equipements publics",
      "Creer 4 points d'acces Wi-Fi gratuit en centre-bourg",
      "Deployer un reseau IoT municipal"
    ],
    timeline: [
      { label: "Audit reseau existant", date: "Septembre 2024", done: true },
      { label: "Pose des fourreaux", date: "Janvier 2025", done: true },
      { label: "Deploiement zone nord", date: "Avril 2025", done: true },
      { label: "Deploiement zone sud", date: "Octobre 2025", done: false },
      { label: "Raccordements finaux", date: "Mars 2026", done: false },
      { label: "Ouverture commerciale complete", date: "Juin 2026", done: false }
    ],
    location: "Commune entiere de Dembeni",
    isFeatured: false,
    isPublished: true,
    order: 3
  },
  {
    title: "Centre de sante polyvalent",
    description: "Construction d'un nouveau centre de sante avec cabinets medicaux, pharmacie, PMI et espace bien-etre.",
    fullDescription: "Face au desert medical qui touche Mayotte, la commune de Dembeni prend les devants avec la construction d'un centre de sante de 1 800 m\u00b2 regroupant 8 cabinets medicaux, une PMI, une salle de soins infirmiers, un cabinet dentaire et une pharmacie.",
    category: "Sant\u00e9",
    status: "Futur",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200",
    gallery: [],
    budget: "8.4 M\u20ac",
    progress: 15,
    startDate: new Date("2026-06-01"),
    endDate: new Date("2028-12-31"),
    objectives: [
      "Construire un batiment de 1 800 m\u00b2",
      "Creer 8 cabinets medicaux",
      "Ouvrir une PMI de proximite",
      "Installer un cabinet dentaire",
      "Amenager un espace pharmacie"
    ],
    timeline: [
      { label: "Etude de faisabilite", date: "Decembre 2025", done: true },
      { label: "Depot permis de construire", date: "Mars 2026", done: false },
      { label: "Demarrage travaux", date: "Juin 2026", done: false },
      { label: "Livraison gros oeuvre", date: "Juin 2027", done: false },
      { label: "Ouverture du centre", date: "Janvier 2028", done: false }
    ],
    location: "Centre-bourg de Dembeni",
    isFeatured: false,
    isPublished: true,
    order: 4
  },
  {
    title: "Requalification du littoral",
    description: "Amenagement d'un sentier cotier de 6 km avec espaces de repos, signaletique patrimoniale et protection du trait de cote.",
    fullDescription: "Le littoral de Dembeni, riche d'une biodiversite exceptionnelle, merite d'etre valorise et protege. Ce projet cree un sentier cotier de 6 km reliant les plages, avec des belvederes, des panneaux interpretatifs sur la faune et la flore marines, et des amenagements limitant l'erosion cotiere.",
    category: "Environnement",
    status: "En cours",
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"
    ],
    budget: "2.1 M\u20ac",
    progress: 70,
    startDate: new Date("2024-11-01"),
    endDate: new Date("2026-03-31"),
    objectives: [
      "Amenager 6 km de sentier cotier",
      "Installer 12 belvederes panoramiques",
      "Poser 40 panneaux interpretatifs",
      "Proteger 2 km de trait de cote",
      "Creer 3 plages accessibles PMR"
    ],
    timeline: [
      { label: "Etudes environnementales", date: "Novembre 2024", done: true },
      { label: "Travaux section nord (2 km)", date: "Mars 2025", done: true },
      { label: "Travaux section centrale (2 km)", date: "Juillet 2025", done: true },
      { label: "Travaux section sud (2 km)", date: "Novembre 2025", done: false },
      { label: "Pose signaletique complete", date: "Fevrier 2026", done: false },
      { label: "Inauguration", date: "Mars 2026", done: false }
    ],
    location: "Cote est de Dembeni",
    isFeatured: false,
    isPublished: true,
    order: 5
  },
  {
    title: "Mediatheque et espace culturel municipal",
    description: "Construction d'une mediatheque moderne avec bibliotheque numerique, salle de spectacle de 200 places et espaces d'exposition.",
    fullDescription: "La commune de Dembeni se dote d'un equipement culturel de premier rang. Cette mediatheque de 2 400 m\u00b2 comprendra : une bibliotheque physique et numerique, une salle multimedia, une salle de spectacle de 200 places et deux salles d'exposition permanente et temporaire.",
    category: "Culture",
    status: "Futur",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200",
    gallery: [],
    budget: "6.7 M\u20ac",
    progress: 5,
    startDate: new Date("2027-01-01"),
    endDate: new Date("2029-06-30"),
    objectives: [
      "Construire 2 400 m\u00b2 d'espace culturel",
      "Creer une mediatheque de 40 000 ouvrages",
      "Installer une salle de spectacle de 200 places",
      "Ouvrir 2 salles d'exposition",
      "Proposer 15 postes informatiques publics"
    ],
    timeline: [
      { label: "Concours d'architecture", date: "Janvier 2027", done: false },
      { label: "Choix du maitre d'oeuvre", date: "Juin 2027", done: false },
      { label: "Depot permis de construire", date: "Decembre 2027", done: false },
      { label: "Demarrage travaux", date: "Juin 2028", done: false },
      { label: "Ouverture au public", date: "Juin 2029", done: false }
    ],
    location: "Place de la Mairie, Dembeni",
    isFeatured: false,
    isPublished: true,
    order: 6
  }
];

const seedProjets = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI manquante");
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔄 Nettoyage et initialisation des projets...');
    await Projet.deleteMany({});
    const created = await Projet.insertMany(defaultProjets);
    console.log(`✅ ${created.length} projets municipaux créés avec succès.`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Erreur seeder projets : ${err.message}`);
    process.exit(1);
  }
};

seedProjets();
