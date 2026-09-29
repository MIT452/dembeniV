const asyncHandler = require('express-async-handler');
const ContentSection = require('../models/ContentSection');

// @desc    Get all content sections
// @route   GET /api/content-sections
// @access  Public
const getContentSections = asyncHandler(async (req, res) => {
    let sections = await ContentSection.find({}).sort({ order: 1 });
    
    // Seed default sections if none exist in the database
    if (sections.length === 0) {
        await seedDefaultContentSections();
        sections = await ContentSection.find({}).sort({ order: 1 });
    }
    
    res.status(200).json({
        success: true,
        count: sections.length,
        data: sections
    });
});

// @desc    Get single content section by key
// @route   GET /api/content-sections/:key
// @access  Public
const getContentSectionByKey = asyncHandler(async (req, res) => {
    let section = await ContentSection.findOne({ key: req.params.key });
    
    if (!section) {
        // If not found, let's see if we need to seed
        const count = await ContentSection.countDocuments();
        if (count === 0) {
            await seedDefaultContentSections();
            section = await ContentSection.findOne({ key: req.params.key });
        }
    }
    
    if (!section) {
        return res.status(404).json({
            success: false,
            message: `Section de contenu avec la clé '${req.params.key}' introuvable`
        });
    }
    
    res.status(200).json({
        success: true,
        data: section
    });
});

// @desc    Create content section
// @route   POST /api/content-sections
// @access  Private/Admin
const createContentSection = asyncHandler(async (req, res) => {
    const { key } = req.body;
    
    const exists = await ContentSection.findOne({ key });
    if (exists) {
        res.status(400);
        throw new Error(`Une section avec la clé '${key}' existe déjà`);
    }
    
    const section = await ContentSection.create(req.body);
    
    res.status(201).json({
        success: true,
        data: section
    });
});

// @desc    Update content section by key
// @route   PUT /api/content-sections/:key
// @access  Private/Admin
const updateContentSection = asyncHandler(async (req, res) => {
    let section = await ContentSection.findOne({ key: req.params.key });
    
    if (!section) {
        res.status(404);
        throw new Error(`Section de contenu introuvable`);
    }
    
    section = await ContentSection.findOneAndUpdate(
        { key: req.params.key },
        req.body,
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        data: section
    });
});

// @desc    Delete content section by key
// @route   DELETE /api/content-sections/:key
// @access  Private/Admin
const deleteContentSection = asyncHandler(async (req, res) => {
    const section = await ContentSection.findOne({ key: req.params.key });
    
    if (!section) {
        res.status(404);
        throw new Error(`Section de contenu introuvable`);
    }
    
    await ContentSection.findOneAndDelete({ key: req.params.key });
    
    res.status(200).json({
        success: true,
        message: `Section de contenu '${req.params.key}' supprimée avec succès`
    });
});

// Helper Function: Seeds the initial content sections of the Dembéni portal
const seedDefaultContentSections = async () => {
    console.log('🌱 Seeding initial dynamic content sections...');
    
    const defaultSections = [
        {
            key: 'home_hero',
            title: 'Bienvenue sur le site officiel de la commune de DEMBENI',
            subtitle: '',
            description: "À travers cette plateforme numérique, la municipalité souhaite renforcer la proximité avec ses administrés, améliorer l'accès à l'information publique et faciliter les démarches administratives.",
            bgImage: '/dembeni_lagoon_4k.png',
            bgColor: '#0f3c28',
            textColor: '#ffffff',
            primaryColor: '#10b981',
            order: 10,
            published: true,
            buttons: [
                { text: 'Actualité', link: '/actualites', style: 'primary' },
                { text: 'Autres', link: '/contact', style: 'secondary' }
            ],
            cards: [
                {
                    title: 'ADMINISTRATION',
                    description: "Dembéni est une commune dynamique, riche de son histoire, engagée dans la transition et tournée vers l'avenir.",
                    image: '/mairie.jpg',
                    link: '/demarches'
                },
                {
                    title: 'VIE CITOYENNE',
                    description: "Découvrez nos associations dynamiques, nos initiatives locales et participez activement à la vie citoyenne.",
                    image: '/groupe.jpg',
                    link: '/services'
                }
            ]
        },
        {
            key: 'home_services',
            title: 'Vos démarches administratives',
            subtitle: 'simplifiées :',
            description: "Accédez en quelques clics à l'ensemble de nos guichets numériques et suivez l'avancement de vos dossiers en temps réel.",
            bgColor: '#ffffff',
            textColor: '#0f3c28',
            primaryColor: '#16a34a',
            order: 20,
            published: true,
            cards: [
                { title: 'Identité civile & ANTS', description: 'Suivez vos demandes et renouvellements de Passeport ou CNI en ligne.', icon: 'CreditCard', link: '/demarches' },
                { title: 'Gestion environnementale', description: "Planifiez la collecte d'encombrants et signalez une anomalie sur la voie publique.", icon: 'Trash2', link: '/demarches' },
                { title: 'Paiement cantine', description: 'Consultez les menus et réglez les factures de restauration scolaire en ligne.', icon: 'Utensils', link: '/demarches' },
                { title: 'Petite Enfance & Crèche', description: "Déposez votre dossier d'inscription en crèche et suivez les affectations.", icon: 'Baby', link: '/demarches' },
                { title: 'Agenda territorial', description: 'Consultez les actions de prévention et inscrivez-vous aux ateliers.', icon: 'Palette', link: '/demarches' },
                { title: 'Démarches administratives', description: 'Accédez instantanément au guichet virtuel pour vos requêtes civiles.', icon: 'ClipboardList', link: '/demarches' }
            ]
        },
        {
            key: 'home_commune_info',
            title: 'Dembéni, territoire de',
            subtitle: "vie et d'avenir au cœur de Mayotte",
            description: "Découvrez l'histoire, le patrimoine et la population de notre collectivité. La municipalité s'engage au quotidien pour offrir un cadre de vie durable, dynamique et proche de chacun de ses citoyens.",
            bgImage: '',
            bgColor: '#f8fafc',
            textColor: '#1e293b',
            primaryColor: '#10b981',
            order: 30,
            published: true,
            items: [
                {
                    indicators: [
                        { val: '17 000+', label: 'Habitants', icon: 'Users' },
                        { val: '30+', label: 'Associations', icon: 'Award' },
                        { val: '1', label: 'Université', icon: 'GraduationCap' }
                    ],
                    tabs: [
                        { key: 'mairie', title: 'Hôtel de Ville', image: '/mairie.jpg', badge: 'ADMINISTRATION', desc: "L'Hôtel de Ville de Dembéni est le pôle de centralité des services communaux, engagé dans la proximité." },
                        { key: 'jeunesse', title: 'Jeunesse & Éducation', image: '/news_workshop.png', badge: 'ÉDUCATION & JEUNESSE', desc: 'Nous accompagnons nos jeunes et nos établissements scolaires pour bâtir le socle d\'avenir de la commune.' },
                        { key: 'lagon', title: 'Lagon & Nature', image: '/beach_dembeni.png', badge: 'PATRIMOINE NATUREL', desc: 'Le lagon et le littoral de Dembéni forment une réserve écologique précieuse et un joyau de biodiversité locale.' },
                        { key: 'projets', title: 'Projets Urbains', image: '/market_dembeni.png', badge: 'DÉVELOPPEMENT URBAIN', desc: 'Les aménagements communaux modernes guident la structuration urbaine et dynamisent l\'économie locale.' }
                    ]
                }
            ]
        },
        {
            key: 'sante_page',
            title: 'Solidarité & Santé',
            subtitle: 'À vos côtés à chaque étape de votre vie',
            description: 'Le Centre Communal d\'Action Sociale (CCAS) et les services médicaux de Dembéni se mobilisent au quotidien pour accompagner les familles, protéger les aînés et garantir un accès aux soins de qualité pour tous.',
            bgImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
            bgColor: '#ffffff',
            textColor: '#0f3c28',
            primaryColor: '#10b981',
            order: 40,
            published: true,
            cards: [
                { title: 'Centre de PMI & Vaccinations', description: 'Consultations infantiles gratuites, suivi pédiatrique et campagnes de vaccination publique.', icon: 'Heart', badge: 'PRÉVENTION' },
                { title: 'Aide Sociale & CCAS', description: 'Accompagnement administratif, aides exceptionnelles et soutien d\'urgence aux ménages en difficulté.', icon: 'Users', badge: 'ACCOMPAGNEMENT' },
                { title: 'Animations Séniors', description: 'Ateliers créatifs, sorties de groupe et activités physiques adaptées pour rompre l\'isolement.', icon: 'Smile', badge: 'LIEN SOCIAL' }
            ]
        },
        {
            key: 'culture_page',
            title: 'Culture & Patrimoine',
            subtitle: 'Une terre d\'histoire et de traditions vivantes',
            description: 'De l\'ancienne usine sucrière aux danses folkloriques sacrées comme le Deba, Dembéni célèbre fièrement son identité mahoraise. Découvrez notre programmation culturelle et notre richesse historique.',
            bgImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1200',
            bgColor: '#ffffff',
            textColor: '#0d4a3e',
            primaryColor: '#10b981',
            order: 50,
            published: true,
            cards: [
                { title: 'Usine de Tsararano', description: 'Vestiges de l\'industrie sucrière du XIXe siècle, symbole de la mémoire agricole de Mayotte.', icon: 'Landmark', link: '/culture' },
                { title: 'Chants & Danses Sacrées', description: 'Le Deba traditionnel et le Chigoma animent les fêtes populaires de nos villages.', icon: 'Music', link: '/culture' },
                { title: 'Médiathèque Municipale', description: 'Accès libre à la lecture, ateliers informatiques pour les jeunes et expositions d\'artistes.', icon: 'BookOpen', link: '/culture' }
            ]
        },
        {
            key: 'footer',
            title: 'MAIRIE DE DEMBENI',
            subtitle: 'Territoire d\'avenir au cœur de Mayotte',
            description: 'Retrouvez l\'ensemble de l\'actualité, de vos services en ligne et des informations institutionnelles sur notre site officiel.',
            bgImage: '',
            bgColor: '#0f3c28',
            textColor: '#cbd5e1',
            primaryColor: '#10b981',
            order: 60,
            published: true,
            items: [
                {
                    contact: {
                        phone: '02 69 61 11 05',
                        email: 'contact@dembeni.fr',
                        address: '1 Rue de la Mairie, 97615 Dembéni, Mayotte',
                        hours: 'Lundi au Jeudi : 7h30 - 16h00 | Vendredi : 7h30 - 11h30'
                    },
                    links: [
                        { text: 'Accueil', link: '/' },
                        { text: 'Actualités', link: '/actualites' },
                        { text: 'Démarches', link: '/demarches' },
                        { text: 'Services publics', link: '/services' },
                        { text: 'Culture & Patrimoine', link: '/culture' },
                        { text: 'Solidarité & Santé', link: '/solidarite' },
                        { text: 'Contact', link: '/contact' }
                    ]
                }
            ]
        },
        {
            key: 'contact_page',
            title: 'Contactez nos services municipaux',
            subtitle: 'Une question ? Une démarche ? Nos agents vous répondent.',
            description: 'Remplissez le formulaire ci-dessous ou contactez nos équipes par téléphone ou par courrier. Nos services s\'efforcent de vous apporter une réponse personnalisée sous 48 heures ouvrées.',
            bgImage: '',
            bgColor: '#ffffff',
            textColor: '#0f3c28',
            primaryColor: '#10b981',
            order: 70,
            published: true,
            items: [
                {
                    departments: [
                        { name: 'Guichet Unique & État Civil', email: 'etatcivil@dembeni.fr', phone: '02 69 61 11 05 (Poste 101)' },
                        { name: 'Pôle Technique & Urbanisme', email: 'urbanisme@dembeni.fr', phone: '02 69 61 11 05 (Poste 102)' },
                        { name: 'CCAS & Action Sociale', email: 'ccas@dembeni.fr', phone: '02 69 61 11 05 (Poste 103)' },
                        { name: 'Services Scolaires & Restauration', email: 'scolaire@dembeni.fr', phone: '02 69 61 11 05 (Poste 104)' }
                    ]
                }
            ]
        }
    ];
    
    await ContentSection.deleteMany({});
    await ContentSection.insertMany(defaultSections);
    console.log('✅ Initial dynamic content sections seeded successfully.');
};

module.exports = {
    getContentSections,
    getContentSectionByKey,
    createContentSection,
    updateContentSection,
    deleteContentSection,
    seedDefaultContentSections
};
