require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Service = require('../models/Service');

const defaultServices = [
  {
    title: "Acte de naissance",
    desc: "Obtenir une copie intégrale ou un extrait d'acte de naissance.",
    fullDesc: "Cette démarche permet d'obtenir une copie intégrale ou un extrait (avec ou sans filiation) d'un acte de naissance. Le document vous est délivré gratuitement par le service d'état civil de la mairie de Dembéni pour les personnes nées dans la commune. Les délais d'obtention varient selon le mode de demande (en ligne ou sur place).",
    icon: "FileText",
    img: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800",
    category: "État civil",
    location: "Mairie centrale de Dembéni - Service État-Civil",
    hours: "Lun - Jeu : 7h30-12h00 / 13h30-16h00 | Ven : 7h30-11h30",
    phone: "02 69 62 15 15",
    email: "etatcivil@dembeni.fr",
    delay: "24h à 48h",
    onlineStatus: "Disponible en ligne",
    badge: "Rapide",
    documents: [
      "Pièce d'identité officielle du demandeur (carte d'identité, passeport)",
      "Livret de famille si la filiation est requise",
      "Justificatif prouvant le lien de parenté direct (si demande pour un tiers)"
    ],
    steps: [
      "Remplir la demande en ligne ou vous présenter au guichet de l'état civil",
      "Fournir les pièces justificatives requises pour vérifier votre identité",
      "Traitement de la demande par les officiers d'état civil sous 24h",
      "Retrait du document sur place ou réception par courrier postal sécurisé"
    ],
    faq: [
      {
        question: "Qui peut demander un acte de naissance ?",
        answer: "Vous-même s'il s'agit de votre acte de naissance (à condition d'être majeur), votre époux/épouse, vos ascendants (parents, grands-parents) ou vos descendants (enfants, petits-enfants)."
      },
      {
        question: "Quel est le coût de cette démarche ?",
        answer: "La délivrance d'un acte de naissance est entièrement gratuite en mairie de Dembéni."
      }
    ],
    formulaireUrls: [
      { name: "Formulaire Cerfa 11414*02 - Demande d'acte de naissance", url: "https://www.service-public.fr/particuliers/vosdroits/R1406" }
    ],
    associatedDemarches: [
      { title: "Livret de famille", url: "/services" },
      { title: "Mariage & Pacs", url: "/services" }
    ],
    order: 1,
    isVisible: true
  },
  {
    title: "Carte Nationale d'Identité (CNI)",
    desc: "Première demande ou renouvellement de la carte d'identité sécurisée.",
    fullDesc: "La carte nationale d'identité (CNI) permet à tout citoyen de prouver son identité et sa nationalité française. Elle est gratuite pour une première demande ou un renouvellement, sauf en cas de perte ou de vol (25€ en timbre fiscal). La présence du demandeur est obligatoire lors du dépôt du dossier pour la prise d'empreintes biométriques.",
    icon: "Shield",
    img: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=800",
    category: "Passeport & Identité",
    location: "Guichet unique - Annexe Administrative de Dembéni",
    hours: "Du lundi au vendredi sur rendez-vous uniquement (8h00 - 15h00)",
    phone: "02 69 62 15 16",
    email: "cni-passeport@dembeni.fr",
    delay: "3 à 4 semaines",
    onlineStatus: "Pré-demande en ligne",
    badge: "Important",
    documents: [
      "2 photos d'identité récentes aux normes réglementaires (non découpées)",
      "Justificatif de domicile de moins de 3 mois (facture électricité, eau, téléphone)",
      "Ancienne carte d'identité (en cas de renouvellement)",
      "Déclaration de perte ou vol et un timbre fiscal de 25€ (uniquement si perte/vol)",
      "Numéro de pré-demande ANTS si effectuée en ligne"
    ],
    steps: [
      "Effectuer la pré-demande en ligne sur le site officiel de l'ANTS",
      "Prendre rendez-vous au guichet unique de la Mairie de Dembéni",
      "Déposer votre dossier complet et procéder à la prise d'empreintes",
      "Suivre l'état de production sur le site de l'ANTS",
      "Retirer votre nouvelle carte d'identité en mairie sur présentation du récépissé"
    ],
    faq: [
      {
        question: "Quelle est la durée de validité d'une CNI ?",
        answer: "La carte d'identité est valable 15 ans pour les personnes majeures et 10 ans pour les mineurs."
      },
      {
        question: "Dois-je obligatoirement faire une pré-demande en ligne ?",
        answer: "Non, ce n'est pas obligatoire mais cela accélère grandement le traitement de votre dossier au guichet."
      }
    ],
    formulaireUrls: [
      { name: "Accéder au portail ANTS de pré-demande CNI", url: "https://passeport.ants.gouv.fr/" }
    ],
    associatedDemarches: [
      { title: "Passeport biométrique", url: "/services" },
      { title: "Recensement citoyen", url: "/services" }
    ],
    order: 2,
    isVisible: true
  },
  {
    title: "Passeport Biométrique",
    desc: "Création ou renouvellement de votre passeport de voyage sécurisé.",
    fullDesc: "Le passeport biométrique est un titre de voyage individuel sécurisé permettant de voyager dans le monde entier. Il est payant sous forme de timbre fiscal électronique (86€ pour un adulte, 42€ pour un mineur de 15 à 17 ans, 17€ pour un mineur de moins de 15 ans). Le dépôt de dossier se fait exclusivement sur rendez-vous en mairie de Dembéni.",
    icon: "Shield",
    img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
    category: "Passeport & Identité",
    location: "Service des Titres Sécurisés - Mairie de Dembéni",
    hours: "Uniquement sur RDV : Lun-Jeu (8h00 - 15h30) | Ven (8h00 - 11h30)",
    phone: "02 69 62 15 16",
    email: "cni-passeport@dembeni.fr",
    delay: "3 semaines",
    onlineStatus: "Pré-demande en ligne",
    badge: "Populaire",
    documents: [
      "Timbre fiscal électronique correspondant à l'âge du demandeur",
      "2 photos d'identité réglementaires récentes et conformes",
      "Justificatif de domicile récent aux nom et prénom du demandeur",
      "Ancien passeport ou carte nationale d'identité en cours de validité",
      "Acte de naissance de moins de 3 mois (si l'ancien titre est expiré depuis plus de 2 ans ou s'il s'agit d'un premier titre)"
    ],
    steps: [
      "Acheter le timbre fiscal en ligne et faire la pré-demande ANTS",
      "Prendre rendez-vous au service des titres sécurisés de Dembéni",
      "Se présenter au rendez-vous avec toutes les pièces originales et les photos",
      "Réception d'un SMS dès que le passeport est disponible en mairie",
      "Retrait du passeport en personne sous 3 mois maximum"
    ],
    faq: [
      {
        question: "Où acheter le timbre fiscal pour mon passeport ?",
        answer: "Le timbre fiscal peut être acheté en ligne sur le site timbres.impots.gouv.fr ou chez un buraliste équipé."
      },
      {
        question: "Les enfants doivent-ils être présents au rendez-vous ?",
        answer: "Oui, la présence du mineur, quel que soit son âge, est obligatoire au moment du dépôt de la demande, accompagné de son représentant légal."
      }
    ],
    formulaireUrls: [
      { name: "Achat de timbres fiscaux électroniques", url: "https://timbres.impots.gouv.fr/" }
    ],
    associatedDemarches: [
      { title: "Carte d'identité (CNI)", url: "/services" }
    ],
    order: 3,
    isVisible: true
  },
  {
    title: "Permis de construire",
    desc: "Autorisation obligatoire pour les constructions neuves et agrandissements importants.",
    fullDesc: "Le permis de construire est un acte administratif qui permet aux services municipaux de vérifier que votre projet de construction respecte les règles d'urbanisme en vigueur (PLU communal). Il est obligatoire pour toute construction neuve ou travaux sur construction existante créant plus de 20 m² de surface de plancher (ou 40 m² en zone urbaine).",
    icon: "MapPin",
    img: "https://images.unsplash.com/photo-1503387762-592dec5832f2?auto=format&fit=crop&q=80&w=800",
    category: "Urbanisme",
    location: "Direction de l'Aménagement et de l'Urbanisme de Dembéni",
    hours: "Lun - Jeu : 8h00 - 12h00 (Dépôt et accueil physique)",
    phone: "02 69 62 15 22",
    email: "urbanisme@dembeni.fr",
    delay: "2 à 3 mois",
    onlineStatus: "Guichet ou Envoi Postal",
    badge: "Nouveau",
    documents: [
      "Formulaire Cerfa n°13406*11 (maison individuelle) ou n°13409*11 (autres constructions) rempli",
      "PCMI1 : Plan de situation du terrain dans la commune",
      "PCMI2 : Plan de masse des constructions à édifier ou modifier",
      "PCMI3 : Plan en coupe du terrain et de la construction",
      "PCMI4 : Notice descriptive du projet, des matériaux et des impacts environnementaux",
      "PCMI5 : Plan des façades et des toitures"
    ],
    steps: [
      "Télécharger et remplir le formulaire Cerfa d'urbanisme adéquat",
      "Réaliser l'ensemble des plans requis (de préférence par un architecte ou dessinateur)",
      "Déposer le dossier complet en 4 exemplaires au service Urbanisme de la mairie",
      "Instruction du dossier par les services municipaux et départementaux sous 2 à 3 mois",
      "Notification de la décision de la mairie (accord, refus ou demande de pièces complémentaires)",
      "Affichage obligatoire du permis sur le terrain dès réception de l'accord"
    ],
    faq: [
      {
        question: "Quelle est la durée de validité d'un permis de construire ?",
        answer: "Le permis de construire est valable pendant 3 ans. Il peut être prorogé deux fois pour une durée d'un an, si la demande est faite 2 mois avant l'expiration."
      },
      {
        question: "Puis-je déposer mon dossier par voie numérique ?",
        answer: "Oui, le guichet numérique des autorisations d'urbanisme de Dembéni permet de déposer son dossier en ligne."
      }
    ],
    formulaireUrls: [
      { name: "Télécharger le Cerfa Permis de construire de Maison Individuelle", url: "https://www.service-public.fr/particuliers/vosdroits/R11637" }
    ],
    associatedDemarches: [
      { title: "Déclaration préalable de travaux", url: "/services" },
      { title: "Certificat d'urbanisme", url: "/services" }
    ],
    order: 4,
    isVisible: true
  },
  {
    title: "Inscription sur les listes électorales",
    desc: "Voter aux scrutins locaux et nationaux depuis la commune de Dembéni.",
    fullDesc: "Pour pouvoir voter à Dembéni, il est obligatoire d'être inscrit sur les listes électorales de la commune. L'inscription est automatique pour les jeunes citoyens français atteignant 18 ans ayant effectué leur recensement. Pour les nouveaux résidents de la commune, il est nécessaire de faire une démarche d'inscription volontaire.",
    icon: "Globe",
    img: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800",
    category: "Élections",
    location: "Service des Élections - Hôtel de Ville de Dembéni",
    hours: "Lun - Ven : 8h00 - 15h00",
    phone: "02 69 62 15 15",
    email: "elections@dembeni.fr",
    delay: "Immédiat",
    onlineStatus: "Disponible en ligne",
    badge: "Important",
    documents: [
      "Formulaire de demande d'inscription (Cerfa n°12669*02)",
      "Justificatif d'identité en cours de validité (CNI ou passeport)",
      "Justificatif de domicile dans la commune de moins de 3 mois (facture d'eau, d'électricité ou avis d'imposition)"
    ],
    steps: [
      "Accéder au télé-service d'inscription sur les listes électorales sur Service-Public.fr",
      "Remplir le formulaire en ligne et téléverser vos justificatifs numérisés",
      "Ou se présenter à l'accueil de la Mairie muni des pièces physiques justificatives",
      "Vérification et validation de l'inscription par la commission électorale communale",
      "Réception de votre nouvelle carte électorale à domicile par voie postale"
    ],
    faq: [
      {
        question: "Jusqu'à quand puis-je m'inscrire pour voter à un scrutin ?",
        answer: "Vous devez vous inscrire au plus tard le 6ème vendredi précédant le scrutin pour pouvoir y participer."
      },
      {
        question: "Comment vérifier si je suis déjà inscrit à Dembéni ?",
        answer: "Vous pouvez utiliser le service en ligne 'Interroger sa situation électorale' disponible sur Service-Public.fr pour savoir dans quel bureau vous votez."
      }
    ],
    formulaireUrls: [
      { name: "Demande d'inscription électorale en ligne", url: "https://www.service-public.fr/particuliers/vosdroits/R16396" }
    ],
    associatedDemarches: [
      { title: "Vote par procuration", url: "/services" }
    ],
    order: 5,
    isVisible: true
  },
  {
    title: "Inscription Scolaire & Cantine",
    desc: "Inscrire vos enfants dans les écoles maternelles et primaires de Dembéni.",
    fullDesc: "Cette démarche s'adresse aux parents d'élèves souhaitant scolariser leur enfant dans une école publique maternelle ou élémentaire de la commune de Dembéni pour la prochaine rentrée scolaire. Elle permet également de réserver les services périscolaires comme la restauration scolaire et les garderies.",
    icon: "FileText",
    img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
    category: "Éducation",
    location: "Service de la Vie Scolaire - Annexe Administrative",
    hours: "Lun - Jeu : 8h00 - 15h30 | Ven : 8h00 - 12h00",
    phone: "02 69 62 15 40",
    email: "viescolaire@dembeni.fr",
    delay: "5 jours ouvrés",
    onlineStatus: "Dossier physique en mairie",
    badge: "Nouveau",
    documents: [
      "Livret de famille ou extrait d'acte de naissance de l'enfant avec filiation",
      "Pièce d'identité des parents ou représentants légaux",
      "Justificatif de domicile de moins de 3 mois dans la commune",
      "Carnet de santé de l'enfant attestant des vaccinations obligatoires à jour",
      "Certificat de radiation (si l'enfant était scolarisé dans une autre commune)"
    ],
    steps: [
      "Retirer le dossier d'inscription au bureau de la vie scolaire ou le télécharger en ligne",
      "Remplir l'ensemble des fiches de renseignements et de restauration",
      "Déposer le dossier complet avec toutes les pièces justificatives requises",
      "Délivrance par la mairie du certificat d'inscription scolaire",
      "Présenter le certificat d'inscription au directeur d'école affecté pour finaliser l'admission"
    ],
    faq: [
      {
        question: "À quel âge inscrire mon enfant en maternelle ?",
        answer: "L'instruction étant obligatoire dès 3 ans, vous devez inscrire votre enfant l'année de ses 3 ans. Certaines écoles accueillent également les enfants dès 2 ans dans la limite des places disponibles."
      },
      {
        question: "Comment est définie l'école de mon enfant ?",
        answer: "La commune de Dembéni applique une sectorisation scolaire : votre enfant est affecté à l'école la plus proche de votre domicile."
      }
    ],
    formulaireUrls: [
      { name: "Télécharger la fiche d'inscription scolaire Dembéni", url: "/public/downloads/fiche_inscription_scolaire.pdf" }
    ],
    associatedDemarches: [
      { title: "Transport scolaire", url: "/services" },
      { title: "Demande de dérogation scolaire", url: "/services" }
    ],
    order: 6,
    isVisible: true
  },
  {
    title: "Collecte des encombrants",
    desc: "Planifier et organiser l'enlèvement gratuit de vos objets volumineux.",
    fullDesc: "Pour préserver l'environnement communal et lutter contre les dépôts sauvages, la Mairie de Dembéni propose un service gratuit d'enlèvement des déchets encombrants à domicile (meubles usagés, matelas, gros électroménager). Ce service s'adresse uniquement aux particuliers et requiert une prise de rendez-vous préalable.",
    icon: "Globe",
    img: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800",
    category: "Environnement",
    location: "Services Techniques municipaux - Division Propreté Urbaine",
    hours: "Du lundi au vendredi sur rendez-vous téléphonique",
    phone: "02 69 62 15 50",
    email: "proprete@dembeni.fr",
    delay: "Sous 7 jours",
    onlineStatus: "Demande en ligne ou Téléphone",
    badge: "Rapide",
    documents: [
      "Liste détaillée des objets volumineux à enlever (maximum 3 objets par collecte)",
      "Justificatif de domicile à Dembéni",
      "Adresse précise et description d'accessibilité du point de collecte"
    ],
    steps: [
      "Prendre rendez-vous via le formulaire en ligne ou par appel téléphonique",
      "Recevoir confirmation du jour et du créneau horaire de passage",
      "Déposer les encombrants sur le trottoir la veille au soir ou le matin même avant 6h00",
      "Passage des agents des services techniques municipaux pour l'enlèvement"
    ],
    faq: [
      {
        question: "Quels objets sont refusés lors de la collecte ?",
        answer: "Sont exclus : les gravats de chantier, les pneus de véhicules, les batteries, les peintures et solvants, l'amiante et tous les déchets toxiques qui doivent être apportés directement en déchèterie."
      },
      {
        question: "Ce service est-il payant ?",
        answer: "Non, ce service public communal de proximité est entièrement gratuit pour les administrés de Dembéni."
      }
    ],
    formulaireUrls: [
      { name: "Charte de collecte des encombrants et déchets", url: "/public/downloads/charte_dechets_dembeni.pdf" }
    ],
    associatedDemarches: [
      { title: "Demande de bac poubelle", url: "/services" },
      { title: "Signaler un dépôt sauvage", url: "/services" }
    ],
    order: 7,
    isVisible: true
  },
  {
    title: "Aide Sociale Communale (CCAS)",
    desc: "Bénéficier d'un accompagnement social et d'aides financières d'urgence.",
    fullDesc: "Le Centre Communal d'Action Sociale (CCAS) de Dembéni est au cœur de l'action de solidarité municipale. Il apporte aide et soutien aux personnes âgées, aux personnes handicapées, aux familles en difficulté financière ou sociale, à travers des aides exceptionnelles et des orientations vers les partenaires sociaux.",
    icon: "Heart",
    img: "https://images.unsplash.com/photo-1469571486040-afbef0cd3ab8?auto=format&fit=crop&q=80&w=800",
    category: "Santé",
    location: "Pôle Solidarité et Action Sociale (CCAS) - Dembéni",
    hours: "Accueil social sans RDV : Mardi et Jeudi (8h30 - 12h00) / Sur RDV les autres jours",
    phone: "02 69 62 15 35",
    email: "ccas@dembeni.fr",
    delay: "1 à 2 semaines",
    onlineStatus: "Rendez-vous social physique",
    badge: "Important",
    documents: [
      "Pièce d'identité en cours de validité du demandeur",
      "Livret de famille ou justificatifs de la composition du foyer",
      "Dernier avis d'imposition ou de non-imposition",
      "Justificatifs de l'ensemble des ressources (CAF, salaires, retraites, allocations)",
      "Justificatifs des charges fixes (loyer, électricité, eau, prêts)",
      "Justificatif de domicile de moins de 3 mois sur la commune"
    ],
    steps: [
      "Se présenter au CCAS pour une première évaluation ou téléphoner pour un RDV",
      "Renseigner le dossier de demande d'aide sociale avec l'aide d'un travailleur social",
      "Fournir l'intégralité des pièces justificatives financières et administratives",
      "Instruction du dossier par l'équipe administrative du CCAS",
      "Présentation du dossier de manière anonyme devant le conseil d'administration du CCAS",
      "Notification écrite de la décision d'attribution ou de rejet et versement de l'aide le cas échéant"
    ],
    faq: [
      {
        question: "Quels types d'aides propose le CCAS ?",
        answer: "Le CCAS peut attribuer des aides d'urgence sous forme de colis alimentaires, de chèques d'accompagnement personnalisé pour régler des factures d'eau/électricité, ou d'aides exceptionnelles au transport ou aux obsèques."
      },
      {
        question: "Les aides sont-elles systématiques ?",
        answer: "Non, les aides sont soumises à un barème de ressources strict et à l'examen de la situation de précarité globale du demandeur."
      }
    ],
    formulaireUrls: [
      { name: "Fiche de premier contact d'aide sociale", url: "/public/downloads/fiche_ccas_contact.pdf" }
    ],
    associatedDemarches: [
      { title: "Demande de logement social", url: "/services" },
      { title: "Aide personnalisée à l'autonomie (APA)", url: "/services" }
    ],
    order: 8,
    isVisible: true
  }
];

const connectDB = require('../config/db');

const seedServices = async () => {
  try {
    await connectDB();
    console.log('🔄 Nettoyage et initialisation des services avec les champs premium...');
    
    // Clean old services
    await Service.deleteMany({});
    
    // Insert defaults
    const created = await Service.insertMany(defaultServices);
    console.log(`✅ ${created.length} services de démarches administratives premium créés avec succès.`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Erreur seeder services : ${error.message}`);
    process.exit(1);
  }
};

seedServices();
