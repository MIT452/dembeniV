import React, { useState, useEffect } from 'react';
import { 
  Heart, Shield, Activity, Phone, Calendar, Users, 
  Award, Info, MapPin, Clock, ArrowRight, BookOpen, 
  Sparkles, HeartHandshake, Smile, CheckCircle, X, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SantePage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [santeSection, setSanteSection] = useState(null);
  const [isLoadingSection, setIsLoadingSection] = useState(true);

  useEffect(() => {
    const fetchSanteNews = async () => {
      try {
        setIsLoadingNews(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/publications?category=Santé %26 Solidarité&status=published`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.success && Array.isArray(data.data)) {
            setNewsList(data.data);
          }
        }
      } catch (err) {
        console.error("Erreur chargement actus santé:", err);
      } finally {
        setIsLoadingNews(false);
      }
    };

    const fetchSanteSection = async () => {
      try {
        setIsLoadingSection(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/content-sections/sante_page`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.data) {
            setSanteSection(data.data);
          }
        }
      } catch (err) {
        console.error("Erreur de chargement CMS Santé", err);
      } finally {
        setIsLoadingSection(false);
      }
    };

    fetchSanteNews();
    fetchSanteSection();
  }, []);

  const getSanteValue = (field, fallback) => {
    if (santeSection && santeSection[field] !== undefined && santeSection[field] !== null && santeSection[field] !== '') {
      return santeSection[field];
    }
    return fallback;
  };

  const getIconComponent = (iconName) => {
    const iconsMap = {
      Activity: <Activity size={24} />,
      Users: <Users size={24} />,
      Shield: <Shield size={24} />,
      CheckCircle: <CheckCircle size={24} />,
      BookOpen: <BookOpen size={24} />,
      Heart: <Heart size={24} />,
      HeartHandshake: <HeartHandshake size={24} />,
      Smile: <Smile size={24} />,
      Sparkles: <Sparkles size={24} />,
      Clock: <Clock size={24} />,
      MapPin: <MapPin size={24} />,
      Phone: <Phone size={24} />,
      Calendar: <Calendar size={24} />
    };
    return iconsMap[iconName] || <Activity size={24} />;
  };

  const medicalServices = [
    {
      title: "Centre de PMI & Vaccinations",
      desc: "Consultations préventives, suivi vaccinal des enfants et accompagnement des jeunes familles par nos infirmières puéricultrices.",
      fullDesc: "Le Centre de Protection Maternelle et Infantile (PMI) de Dembéni assure un suivi préventif et personnalisé de la santé des enfants de 0 à 6 ans ainsi que des femmes enceintes. Nos professionnels de santé organisent des séances de vaccination conformes au calendrier national, des consultations de suivi de croissance et des bilans développementaux réguliers.",
      icon: <Heart size={24} />,
      img: "/sante-pmi-vaccination.png",
      category: "Prévention",
      location: "Centre PMI d'Iloni, Dembéni",
      hours: "Lundi au Vendredi : 8h00 - 16h00 | Permanences vaccins : Mercredi 8h30 - 16h00",
      phone: "02 69 63 22 18",
      email: "pmi.vaccinations@dembeni.fr",
      benefits: [
        "Vaccinations gratuites conformes au calendrier national",
        "Suivi personnalisé de la croissance et du développement de l'enfant",
        "Accompagnement et conseils parentaux par des sages-femmes diplômées"
      ]
    },
    {
      title: "Aide Sociale & CCAS",
      desc: "Nos agents du CCAS vous accueillent et vous accompagnent dans toutes vos démarches administratives et sociales.",
      fullDesc: "Le Centre Communal d'Action Sociale (CCAS) de Dembéni intervient quotidiennement en faveur des habitants en situation de vulnérabilité. Qu'il s'agisse d'une aide alimentaire d'urgence, d'un accompagnement dans la constitution de dossiers (CMU, AME, CAF), ou d'un suivi social durable, nos agents vous accueillent avec bienveillance, dans le respect de votre dignité et de votre confidentialité.",
      icon: <Users size={24} />,
      img: "/sante-ccas-aide-sociale.png",
      category: "Social",
      location: "Pôle Social & CCAS, Mairie de Dembéni",
      hours: "Lundi au Jeudi : 8h00 - 15h30 | Vendredi : 8h00 - 11h30",
      phone: "02 69 63 11 12",
      email: "ccas@dembeni.fr",
      benefits: [
        "Aide alimentaire d'urgence pour les foyers modestes",
        "Accompagnement gratuit pour les dossiers CMU, AME, CAF, retraite",
        "Suivi social personnalisé et orientation vers les partenaires"
      ]
    },
    {
      title: "Animations Séniors",
      desc: "Des activités collectives, ateliers conviviaux et sorties culturelles organisés chaque mois pour les personnes âgées de Dembéni.",
      fullDesc: "Lutter contre l'isolement et préserver la vitalité de nos aînés est une mission cardinale de la commune. Le pôle Séniors organise chaque mois des ateliers créatifs, des sorties culturelles, des conférences de santé et des rencontres intergénérationnelles. Ces événements favorisent le lien social, stimulent l'éveil et garantissent à chaque aîné un accompagnement digne et chaleureux.",
      icon: <Smile size={24} />,
      img: "/sante-animations-seniors.png",
      category: "Aînés",
      location: "Salle des Associations de Dembéni et villages annexes",
      hours: "Activités les Mardis et Jeudis : 9h00 - 12h00",
      phone: "02 69 63 11 12",
      email: "animations.seniors@dembeni.fr",
      benefits: [
        "Ateliers artistiques, mémoire et culture gratuits",
        "Sorties et événements collectifs mensuels",
        "Portage de repas et visites à domicile disponibles"
      ]
    },
    {
      title: "Centre de santé communal",
      desc: "Notre établissement principal de soins de proximité pour tous les administrés de Dembéni.",
      fullDesc: "Le Centre de Santé Communal de Dembéni est le pilier de l'accès aux soins de premier recours sur notre territoire. Conçu pour répondre aux besoins quotidiens des familles, il rassemble des praticiens de confiance et propose des consultations généralistes ainsi que des soins infirmiers programmés ou urgents.",
      icon: <Activity size={24} />,
      img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
      category: "Soins",
      location: "Rue de la Mairie, Tsararano, Dembéni",
      hours: "Lundi au Vendredi : 7h30 - 16h30 | Samedi : 8h00 - 12h00",
      phone: "02 69 63 01 15",
      email: "centre.sante@dembeni.fr",
      benefits: [
        "Consultations conventionnées secteur 1 sans dépassement",
        "Tiers-payant intégral sur présentation de la carte vitale",
        "Équipe pluridisciplinaire qualifiée de proximité"
      ]
    },
    {
      title: "Consultations médicales",
      desc: "Des consultations de médecine générale accessibles sur rendez-vous ou permanences.",
      fullDesc: "Afin de garantir un suivi médical continu pour chaque habitant, nous organisons des permanences de médecine générale quotidiennes. Nos médecins partenaires vous accueillent pour les pathologies aiguës, le suivi des maladies chroniques, et la délivrance de certificats d'aptitude.",
      icon: <Users size={24} />,
      img: "https://images.unsplash.com/photo-1584515901387-a7a1a63376b6?auto=format&fit=crop&q=80&w=800",
      category: "Soins",
      location: "Dispensaire d'Iloni, Dembéni",
      hours: "Lundi, Mardi et Jeudi : 8h00 - 17h00 | Mercredi et Vendredi : 8h00 - 13h00",
      phone: "02 69 63 99 22",
      email: "consultations@dembeni.fr",
      benefits: [
        "Consultations avec ou sans rendez-vous en matinée",
        "Médecins généralistes permanents et spécialistes vacataires",
        "Proximité immédiate avec les réseaux de transport en commun"
      ]
    },
    {
      title: "Assistance médicale & CMU",
      desc: "Aide à la constitution des dossiers administratifs d'accès aux soins de santé publique.",
      fullDesc: "L'accès aux droits est indispensable pour se soigner correctement. Nos conseillers du Centre Communal d'Action Sociale (CCAS) vous guident pas à pas dans l'ouverture de votre Complémentaire Santé Solidaire (ex-CMU) et de l'Aide Médicale de l'État (AME), afin de lever toute barrière financière aux soins.",
      icon: <Shield size={24} />,
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
      category: "Social",
      location: "Pôle Social & CCAS, Mairie de Dembéni",
      hours: "Lundi au Jeudi : 8h00 - 15h30 | Vendredi : 8h00 - 11h30",
      phone: "02 69 63 11 12",
      email: "ccas.droits@dembeni.fr",
      benefits: [
        "Aide gratuite à la rédaction et numérisation des dossiers",
        "Liaison directe et simplifiée avec la CSSM (Sécurité Sociale)",
        "Traduction et médiation culturelle disponibles sur place"
      ]
    },
    {
      title: "Campagnes de vaccination",
      desc: "Organisation de séances de vaccination régulières pour les enfants, adultes et voyageurs.",
      fullDesc: "La couverture vaccinale est essentielle pour immuniser durablement notre communauté face aux maladies infectieuses. La commune organise de fréquentes journées de vaccination gratuites, en conformité avec le calendrier vaccinal national, ouvertes à tous sans rendez-vous préalable.",
      icon: <CheckCircle size={24} />,
      img: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800",
      category: "Prévention",
      location: "Dispensaire Central et Écoles Primaires de Dembéni",
      hours: "Permanences tous les Mercredis : 8h30 - 16h00",
      phone: "02 69 63 01 15",
      email: "prevention.sante@dembeni.fr",
      benefits: [
        "Vaccins obligatoires fournis et administrés gratuitement",
        "Suivi et mise à jour personnalisée du carnet de santé",
        "Sensibilisation et réponses claires aux questions des parents"
      ]
    },
    {
      title: "Sensibilisation sanitaire",
      desc: "Ateliers et stands d'information sur la nutrition, l'hygiène de vie et l'activité sportive.",
      fullDesc: "Parce que préserver sa santé commence par l'adoption de bons comportements, nos éducateurs de santé organisent régulièrement des ateliers interactifs. Au programme : nutrition saine à base de fruits et légumes locaux, prévention du diabète et encouragement de l'activité physique.",
      icon: <BookOpen size={24} />,
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
      category: "Prévention",
      location: "MJC d'Ongojou, Dembéni",
      hours: "Ateliers thématiques les Samedis : 9h00 - 12h00",
      phone: "02 69 63 44 10",
      email: "ateliers.sante@dembeni.fr",
      benefits: [
        "Ateliers interactifs, dégustations et bilans corporels gratuits",
        "Événements ouverts à tous les âges (enfants, adultes, aînés)",
        "Documentation pratique et kits d'accompagnement offerts"
      ]
    },
    {
      title: "Santé maternelle et infantile",
      desc: "Suivi personnalisé pré et post-natal par des infirmiers diplômés et des sages-femmes dédiées.",
      fullDesc: "Le service PMI (Protection Maternelle et Infantile) de Dembéni propose un accompagnement chaleureux et hautement professionnel pour les femmes enceintes et les jeunes parents. De la grossesse aux six ans de l'enfant, nos infirmières puéricultrices et sages-femmes veillent à la santé physique et affective de votre foyer.",
      icon: <Heart size={24} />,
      img: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800",
      category: "Famille",
      location: "Centre PMI d'Iloni, Dembéni",
      hours: "Lundi au Vendredi : 8h00 - 16h00",
      phone: "02 69 63 22 18",
      email: "pmi.iloni@dembeni.fr",
      benefits: [
        "Consultations médicales de suivi de grossesse gratuites",
        "Pesée des nourrissons, conseils d'allaitement et de sevrage",
        "Ateliers d'éveil précoce et de soutien à la parentalité"
      ]
    },
    {
      title: "Accompagnement des aînés",
      desc: "Visites à domicile régulières, portage de repas et soutien à la mobilité pour les personnes âgées.",
      fullDesc: "Garantir le maintien à domicile et lutter contre l'isolement de nos aînés est une priorité humaine fondamentale. Le CCAS déploie quotidiennement des auxiliaires de vie pour la livraison de repas équilibrés, l'aide aux courses et les visites de courtoisie régulières.",
      icon: <HeartHandshake size={24} />,
      img: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800",
      category: "Aînés",
      location: "Déplacements à domicile dans toute la commune (Dembéni, Tsararano, Iloni, Ongojou)",
      hours: "Interventions 7j/7 : 7h30 - 19h00",
      phone: "02 69 63 11 12",
      email: "solidarite.aines@dembeni.fr",
      benefits: [
        "Portage de repas sains adaptés aux régimes médicaux",
        "Aide personnalisée aux gestes de la vie quotidienne",
        "Activités culturelles et sorties collectives mensuelles"
      ]
    },
    {
      title: "Assistance psychologique",
      desc: "Écoute bienveillante et soutien psychologique individuel sur rendez-vous avec nos professionnels.",
      fullDesc: "Parce que la santé mentale est tout aussi importante que la santé physique, la commune met à votre disposition un service d'écoute et de soutien psychologique gratuit. Dans un cadre strictement confidentiel, nos psychologues cliniciens vous épaulent face aux épreuves de la vie.",
      icon: <Smile size={24} />,
      img: "https://images.unsplash.com/photo-1527137341206-1a2ab8144b56?auto=format&fit=crop&q=80&w=800",
      category: "Social",
      location: "Espace Solidarité, Tsararano",
      hours: "Mardi et Jeudi : 9h00 - 17h00 | Sur rendez-vous uniquement",
      phone: "02 69 63 11 15",
      email: "soutien.psy@dembeni.fr",
      benefits: [
        "Cadre d'écoute neutre, bienveillant et 100% confidentiel",
        "Prise en charge individuelle ou entretiens familiaux",
        "Accès gratuit sans conditions de ressources"
      ]
    },
    {
      title: "Hygiène & Salubrité publique",
      desc: "Actions de désinsectisation contre la dengue et contrôle de la qualité sanitaire de l'eau.",
      fullDesc: "La protection contre les épidémies passe par un environnement propre et sécurisé. Nos équipes d'intervention luttent activement contre la dengue et le paludisme en éliminant les gîtes larvaires et en effectuant des pulvérisations ciblées, tout en veillant à la salubrité du réseau d'eau potable.",
      icon: <Sparkles size={24} />,
      img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
      category: "Environnement",
      location: "Services Techniques Municipaux, Dembéni",
      hours: "Lundi au Vendredi : 7h00 - 15h00 | Astreintes d'urgence le week-end",
      phone: "02 69 63 05 50",
      email: "salubrite@dembeni.fr",
      benefits: [
        "Traitement et élimination gratuite des gîtes dans les cours privées",
        "Distribution de kits anti-moustiques aux personnes sensibles",
        "Analyses et contrôle quotidien du réseau de distribution d'eau"
      ]
    }
  ];

  const solidarityAids = [
    {
      title: "Aide alimentaire d'urgence",
      desc: "Distribution de colis alimentaires pour les foyers les plus modestes de Dembéni.",
      icon: <HeartHandshake size={20} />
    },
    {
      title: "Soutien scolaire solidaire",
      desc: "Dispositif d'aide aux devoirs gratuit pour favoriser la réussite éducative de tous nos jeunes.",
      icon: <BookOpen size={20} />
    },
    {
      title: "Accompagnement administratif",
      desc: "Assistance pour les démarches CAF, sécurité sociale et retraite.",
      icon: <Shield size={20} />
    },
    {
      title: "Aide au logement social",
      desc: "Orientation et appui dans l'attribution de logements adaptés.",
      icon: <MapPin size={20} />
    }
  ];

  const preventionCampaigns = [
    {
      date: "25 Mai 2026",
      title: "Journée de Dépistage du Diabète",
      loc: "📍 MJC de Tsararano",
      desc: "Tests de glycémie gratuits et conseils personnalisés par des nutritionnistes qualifiés.",
      type: "Diabète"
    },
    {
      date: "08 Juin 2026",
      title: "Opération Stop Dengue",
      loc: "📍 Quartiers de Dembéni et Iloni",
      desc: "Distribution de répulsifs, destruction de gîtes larvaires et ateliers de sensibilisation.",
      type: "Dengue"
    },
    {
      date: "15 Juin 2026",
      title: "Vaccination Infantile",
      loc: "📍 Dispensaire Central de Dembéni",
      desc: "Mise à jour gratuite des vaccins obligatoires pour les enfants de 0 à 6 ans.",
      type: "Vaccination"
    }
  ];

  const emergencyContacts = [
    { name: "SAMU / Urgence Médicale", number: "15", desc: "Pour toute détresse vitale urgente.", color: "#ef4444" },
    { name: "Sapeurs-Pompiers", number: "18", desc: "Incendies, accidents de la route et secours.", color: "#f97316" },
    { name: "Gendarmerie Nationale", number: "17", desc: "Sécurité publique et urgences policières.", color: "#3b82f6" },
    { name: "Maison Médicale de Dembéni", number: "02 69 63 12 34", desc: "Consultations et soins généraux.", color: "#10b981" }
  ];

  const communityEvents = [
    {
      title: "Atelier Nutrition & Cuisine Locale",
      desc: "Apprenez à cuisiner les produits maraîchers de Mayotte de façon saine et équilibrée.",
      date: "Chaque samedi matin",
      loc: "Maison des Associations",
      img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Randonnée Santé & Bien-être",
      desc: "Une marche collective douce à travers les sentiers forestiers pour stimuler l'activité physique.",
      date: "Prochain départ le 30 mai",
      loc: "Départ Mairie",
      img: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1579684389782-64d84b5e902a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800"
  ];

  return (
    <div className="sante-page-wrapper">
      
      {/* 1. HERO SECTION */}
      <section className="sante-hero" style={
        getSanteValue('bgImage', '') 
          ? { backgroundImage: `url(${getSanteValue('bgImage', '')})` }
          : {}
      }>
        <div className="sante-hero-bg" />
        <div className="sante-hero-overlay" />
        <div className="sante-hero-content">
          <span className="sante-badge"><Heart size={14} /> Solidarité & Santé</span>
          <h1 className="sante-hero-title">
            {getSanteValue('title', "Une commune engagée pour le bien-être de tous")}
          </h1>
          <p className="sante-hero-subtitle">
            {getSanteValue('subtitle', "Dembéni met en place des services sociaux, d'accompagnement solidaire et de soins de santé de proximité pour accompagner chaque habitant à chaque étape de la vie.")}
          </p>
          <div className="sante-hero-btns">
            {getSanteValue('buttons', [
              { text: "Urgences & Contacts", link: "#urgences", style: "primary" },
              { text: "Nos services sociaux", link: "#services", style: "secondary" }
            ]).map((btn, idx) => (
              <a 
                key={idx} 
                href={btn.link} 
                className={btn.style === 'primary' ? 'btn-sante-primary' : 'btn-sante-secondary'}
                style={btn.style === 'primary' && getSanteValue('primaryColor', '') ? { background: getSanteValue('primaryColor', '') } : {}}
              >
                {btn.text}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STATS & INTRO SUMMARY */}
      <section className="sante-intro-stats">
        <div className="h-container">
          <div className="sante-intro-grid">
            <div className="sante-intro-text">
              <span className="section-tag-simple"><HeartHandshake size={14} /> Dembéni Solidaire</span>
              <h2>L'humain au cœur de nos priorités municipales</h2>
              <p>
                Parce que le progrès de notre territoire repose sur la santé et l'inclusion de tous ses citoyens, nos services administratifs et nos équipes médico-sociales collaborent quotidiennement pour répondre avec agilité aux besoins des familles, des jeunes et de nos aînés.
              </p>
              <blockquote className="sante-quote">
                "La solidarité est le cœur battant de notre commune. À Dembéni, aucun citoyen n'est laissé pour compte."
                <span>— L'équipe municipale de Dembéni</span>
              </blockquote>
            </div>

            <div className="sante-stats-grid">
              <div className="sante-stat-card">
                <h3>1500+</h3>
                <p>Familles accompagnées</p>
              </div>
              <div className="sante-stat-card">
                <h3>12</h3>
                <p>Campagnes de santé par an</p>
              </div>
              <div className="sante-stat-card">
                <h3>8</h3>
                <p>Ateliers de prévention mensuels</p>
              </div>
              <div className="sante-stat-card">
                <h3>100%</h3>
                <p>Écoute active et soutien social</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HEALTH SERVICES SECTION */}
      <section id="services" className="sante-services-section">
        <div className="h-container">
          <div className="section-header">
            <span className="section-tag"><Activity size={14} /> Services médico-sociaux</span>
            <h2 className="section-title-modern">Des soins de <span>santé de proximité</span></h2>
            <p className="section-subtitle-modern">{getSanteValue('description', "Explorez l'éventail de prestations médicales et d'assistances mises en place par la commune de Dembéni.")}</p>
          </div>

          <div className="sante-services-grid">
            {getSanteValue('cards', medicalServices).map((service, index) => {
              const icon = typeof service.icon === 'string' ? getIconComponent(service.icon) : service.icon;
              // CMS cards use 'image', local cards use 'img' — resolve whichever is available
              const imgSrc = service.img || service.image || null;
              const fallbackImg = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800';
              return (
                <div key={index} className="sante-service-card">
                  <div className="sante-card-img-wrap">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={service.title}
                        className="sante-card-img"
                        onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
                      />
                    ) : (
                      <img
                        src={fallbackImg}
                        alt={service.title}
                        className="sante-card-img"
                      />
                    )}
                    <span className="sante-card-category-badge">{service.category}</span>
                  </div>
                  <div className="sante-card-content">
                    <div className="sante-card-icon-title">
                      <span className="sante-card-icon">{icon}</span>
                      <h3>{service.title}</h3>
                    </div>
                    <p>{service.desc || service.description}</p>
                    <button 
                      className="sante-card-btn-more"
                      onClick={() => setSelectedService({ ...service, img: imgSrc || fallbackImg })}
                    >
                      En savoir plus <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SOLIDARITY SECTION */}
      <section className="sante-solidarity-section">
        <div className="h-container">
          <div className="sante-solidarity-layout">
            <div className="sante-solidarity-left">
              <span className="section-tag-simple"><HeartHandshake size={14} /> Action Sociale CCAS</span>
              <h2>Soutenir chacun d'entre vous dans les moments clés</h2>
              <p>
                Le Centre Communal d'Action Sociale (CCAS) de Dembéni intervient en faveur des habitants en situation de vulnérabilité. Qu'il s'agisse d'une aide ponctuelle ou d'un suivi social durable, nos agents vous accueillent avec bienveillance pour vous conseiller et vous guider.
              </p>
              <div className="sante-solidarity-bullets">
                {solidarityAids.map((aid, idx) => (
                  <div key={idx} className="sante-bullet-item">
                    <span className="bullet-icon-wrap">{aid.icon}</span>
                    <div>
                      <h4>{aid.title}</h4>
                      <p>{aid.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sante-solidarity-right">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800" 
                alt="Solidarité humaine" 
                className="solidarity-large-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. CAMPAIGNS & PREVENTION */}
      <section className="sante-prevention-section">
        <div className="h-container">
          <div className="section-header">
            <span className="section-tag"><Calendar size={14} /> Agenda Prévention</span>
            <h2 className="section-title-modern">Campagnes de <span>prévention en cours</span></h2>
            <p className="section-subtitle-modern">Restez informés sur les grandes dates de dépistage, de sensibilisation et de vaccination de la commune.</p>
          </div>

          <div className="sante-prevention-grid">
            {preventionCampaigns.map((camp, idx) => (
              <div key={idx} className="sante-prevention-card">
                <div className="prev-date-badge">
                  <Clock size={16} />
                  <span>{camp.date}</span>
                </div>
                <h3>{camp.title}</h3>
                <span className="prev-location">{camp.loc}</span>
                <p>{camp.desc}</p>
                <div className="prev-footer">
                  <span className="prev-tag">{camp.type}</span>
                  <button 
                    className="btn-prev-participate"
                    onClick={() => setSelectedService({
                      title: camp.title,
                      category: camp.type,
                      desc: camp.desc,
                      fullDesc: `Cette session publique gratuite est organisée par le pôle santé de Dembéni dans le cadre de nos initiatives territoriales de prévention. Venez rencontrer nos professionnels et obtenir des bilans de santé instantanés et fiables.`,
                      img: "https://images.unsplash.com/photo-1579684389782-64d84b5e902a?auto=format&fit=crop&q=80&w=800",
                      location: camp.loc.replace('📍 ', ''),
                      hours: `Le ${camp.date} toute la journée`,
                      phone: "02 69 63 01 15",
                      email: "prevention@dembeni.fr",
                      benefits: [
                        "Dépistage rapide, indolore et 100% gratuit",
                        "Conseils personnalisés par des nutritionnistes diplômés",
                        "Prise en charge et orientation si nécessaire"
                      ]
                    })}
                  >
                    S'inscrire à l'atelier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC PUBLICATIONS SECTION FOR HEALTH & SOLIDARITY */}
      <section className="sante-dynamic-publications" style={{ background: '#f8fafc', padding: '60px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
        <div className="h-container">
          <div className="section-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <span className="section-tag" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} /> Flash Infos & Actualités
            </span>
            <h2 className="section-title-modern" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f3c28', marginTop: '12px' }}>
              Actualités <span>Santé & Solidarité</span>
            </h2>
            <p className="section-subtitle-modern" style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              Toutes les informations officielles de la commune concernant la santé, l'accès aux droits et l'action sociale.
            </p>
          </div>

          {isLoadingNews ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #10b981', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
              <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.88rem' }}>Chargement des actualités en direct...</p>
            </div>
          ) : newsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b', margin: 0, fontWeight: 600 }}>Aucune actualité récente dans cette catégorie pour le moment.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {newsList.map((pub) => (
                <div key={pub._id} className="sante-service-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div className="sante-card-img-wrap" style={{ height: '200px', position: 'relative' }}>
                    <img src={pub.image ? (pub.image.startsWith('/public/') ? `${import.meta.env.VITE_API_URL || ''}${pub.image}` : pub.image) : 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'} alt={pub.title} className="sante-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {pub.isUrgent && (
                      <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>🚨 ALERTE</span>
                    )}
                  </div>
                  <div className="sante-card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {pub.type}
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b' }}>
                          📅 {pub.createdAt ? new Date(pub.createdAt).toLocaleDateString('fr-FR') : ''}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#0f3c28', margin: '0 0 10px 0', lineHeight: 1.3 }}>{pub.title}</h3>
                      <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{pub.content}</p>
                    </div>
                    
                    {pub.type === 'evenement' && pub.eventDate && (
                      <div style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px', margin: '14px 0 0 0', border: '1px solid #e2e8f0', color: '#334155' }}>
                        <div>📅 Date : <strong>{new Date(pub.eventDate).toLocaleDateString('fr-FR')}</strong></div>
                        <div style={{ marginTop: '2px' }}>📍 Lieu : <strong>{pub.eventLocation || 'Dembéni'}</strong></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. URGENCES & CONTACTS */}
      <section id="urgences" className="sante-emergencies-section">
        <div className="h-container">
          <div className="sante-emergencies-banner">
            <div className="emergencies-header">
              <span className="emergencies-badge"><Phone size={14} /> Assistance 24/7</span>
              <h2>Numéros d'urgence et de secours médicaux</h2>
              <p>En cas de situation critique ou de besoin immédiat d'assistance de santé à Mayotte, contactez les services ci-dessous.</p>
            </div>
            
            <div className="emergencies-contacts-grid">
              {emergencyContacts.map((contact, idx) => (
                <div key={idx} className="emergency-contact-card">
                  <div className="emergency-card-top">
                    <h4>{contact.name}</h4>
                    <span className="emergency-phone-number" style={{ color: contact.color }}>
                      📞 {contact.number}
                    </span>
                  </div>
                  <p>{contact.desc}</p>
                  <a href={`tel:${contact.number}`} className="btn-call-emergency" style={{ background: contact.color }}>
                    Appeler immédiatement
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMMUNITY ACTIVITIES */}
      <section className="sante-community-activities">
        <div className="h-container">
          <div className="section-header">
            <span className="section-tag"><Users size={14} /> Vie citoyenne & Ateliers</span>
            <h2 className="section-title-modern">Ateliers collectifs <span>& Bien-être</span></h2>
            <p className="section-subtitle-modern">Participez à nos événements sportifs et culinaires gratuits organisés dans vos localités de Dembéni.</p>
          </div>

          <div className="sante-activities-grid">
            {communityEvents.map((event, idx) => (
              <div key={idx} className="sante-activity-card">
                <div className="sante-act-img-wrap">
                  <img src={event.img} alt={event.title} className="sante-act-img" />
                </div>
                <div className="sante-act-content">
                  <h3>{event.title}</h3>
                  <p>{event.desc}</p>
                  <div className="sante-act-meta">
                    <span>📅 {event.date}</span>
                    <span>📍 {event.loc}</span>
                  </div>
                  <button 
                    className="sante-act-btn"
                    onClick={() => setSelectedService({
                      title: event.title,
                      category: "Vie citoyenne",
                      desc: event.desc,
                      fullDesc: `Ces ateliers conviviaux encouragent la citoyenneté active, le lien social et l'hygiène de vie. Rejoignez un groupe bienveillant pour apprendre, échanger et prendre soin de vous.`,
                      img: event.img,
                      location: event.loc,
                      hours: event.date,
                      phone: "02 69 63 44 10",
                      email: "ccas@dembeni.fr",
                      benefits: [
                        "Animation conviviale et professionnelle en groupe",
                        "Gratuit et accessible à tous les administrés",
                        "Kits d'apprentissage et fiches pratiques offertes"
                      ]
                    })}
                  >
                    Rejoindre le groupe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. MODERN GALLERY */}
      <section className="sante-gallery-section">
        <div className="h-container">
          <div className="section-header">
            <span className="section-tag"><Sparkles size={14} /> Galerie municipale</span>
            <h2 className="section-title-modern">Nos actions en <span>images</span></h2>
            <p className="section-subtitle-modern">Retour en photos sur les interventions et les actions médico-sociales engagées par nos agents communaux.</p>
          </div>

          <div className="sante-gallery-grid">
            {galleryImages.map((imgUrl, idx) => (
              <div key={idx} className="sante-gallery-card">
                <img src={imgUrl} alt={`Solidarite Dembeni ${idx + 1}`} className="sante-gallery-img" />
                <div className="sante-gallery-hover-overlay">
                  <Sparkles size={24} color="white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PREMIUM MODAL POPUP */}
      {selectedService && (
        <div className="sante-modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="sante-modal-card animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <button className="sante-modal-close" onClick={() => setSelectedService(null)}>
              <X size={20} />
            </button>
            
            <div className="sante-modal-hero">
              <img src={selectedService.img} alt={selectedService.title} className="sante-modal-hero-img" />
              <div className="sante-modal-hero-overlay-grad" />
              <div className="sante-modal-hero-content">
                <span className="sante-modal-category">{selectedService.category}</span>
                <h2>{selectedService.title}</h2>
              </div>
            </div>
            
            <div className="sante-modal-body">
              <div className="sante-modal-main">
                <h3><Info size={18} /> Présentation du service</h3>
                <p className="sante-modal-fulldesc">{selectedService.fullDesc}</p>
                
                <h3><Award size={18} /> Vos avantages & Points clés</h3>
                <ul className="sante-modal-benefits">
                  {(selectedService.benefits && (
                    Array.isArray(selectedService.benefits) 
                      ? selectedService.benefits 
                      : typeof selectedService.benefits === 'string' 
                        ? selectedService.benefits.split(',').map(s => s.trim()) 
                        : []
                  )).map((benefit, i) => (
                    <li key={i}>
                      <CheckCircle size={16} className="benefit-check-icon" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="sante-modal-aside">
                <div className="sante-modal-info-tile">
                  <div className="tile-icon-wrap"><MapPin size={18} /></div>
                  <div>
                    <h4>Localisation</h4>
                    <p>{selectedService.location}</p>
                  </div>
                </div>
                
                <div className="sante-modal-info-tile">
                  <div className="tile-icon-wrap"><Clock size={18} /></div>
                  <div>
                    <h4>Horaires</h4>
                    <p>{selectedService.hours}</p>
                  </div>
                </div>
                
                <div className="sante-modal-info-tile">
                  <div className="tile-icon-wrap"><Phone size={18} /></div>
                  <div>
                    <h4>Téléphone</h4>
                    <p>{selectedService.phone}</p>
                  </div>
                </div>
                
                <div className="sante-modal-info-tile">
                  <div className="tile-icon-wrap"><Mail size={18} /></div>
                  <div>
                    <h4>E-mail direct</h4>
                    <p>{selectedService.email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sante-modal-footer">
              <button className="btn-modal-close-action" onClick={() => setSelectedService(null)}>
                Fermer la fenêtre
              </button>
              <a href={`tel:${selectedService.phone}`} className="btn-modal-call-action">
                Contacter le pôle
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SantePage;
