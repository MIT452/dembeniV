import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Info, ArrowRight, Play, CheckCircle2, FileText, Trash2, Heart, Music, Users, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Newspaper, Image, Calendar, 
  Truck, Globe, CreditCard, Utensils, Baby, Palette, ClipboardList, ShieldAlert, Award,
  Landmark, MoreHorizontal, GraduationCap, Hammer, MapPin, Shield, Clock, Phone, Activity, BookOpen, Sparkles, Leaf
} from 'lucide-react';

import { Link } from 'react-router-dom';

// 1. ERROR BOUNDARY - Empêche le crash global si une section échoue
class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error(`[Error Boundary] Crash intercepté dans la section ${this.props.sectionName || 'Inconnue'} :`, error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', margin: '20px auto', maxWidth: '800px', textAlign: 'center', background: '#fee2e2', color: '#991b1b', borderRadius: '16px', border: '1px solid #fca5a5' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 16px auto', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 700 }}>Section momentanément indisponible</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Une erreur de rendu a été interceptée. Le reste du site continue de fonctionner normalement.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// 1b. ANIMATED COUNTER COMPONENT
const AnimatedCounter = ({ value, duration = 1500, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) {
      setCount(value);
      return;
    }
    
    const totalFrames = 60;
    const increment = end / totalFrames;
    const frameDuration = duration / totalFrames;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      start += increment;
      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}{suffix}</span>;
};

const Home = () => {

  const [activeCategory, setActiveCategory] = useState('Tous');
  const [eventIndex, setEventIndex] = useState(0);
  const [activeRuinsTab, setActiveRuinsTab] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [activeCommuneTab, setActiveCommuneTab] = useState('mairie');
  const [showCommuneDetails, setShowCommuneDetails] = useState(false);
  const [activeModalTopic, setActiveModalTopic] = useState(null);

  const [allNewsItems, setAllNewsItems] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isLoadingCMS, setIsLoadingCMS] = useState(true);
  const [cmsError, setCmsError] = useState(null);

  const [cmsSections, setCmsSections] = useState({});
  const [isLoadingSections, setIsLoadingSections] = useState(true);

  useEffect(() => {
    const fetchContentSections = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/content-sections`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.data)) {
            const indexed = {};
            data.data.forEach(sec => {
              if (sec.published) {
                indexed[sec.key] = sec;
              }
            });
            setCmsSections(indexed);
          }
        }
      } catch (err) {
        console.error("Erreur de chargement des sections CMS", err);
      } finally {
        setIsLoadingSections(false);
      }
    };
    fetchContentSections();
  }, []);

  const getCmsValue = (key, field, fallback) => {
    const sec = cmsSections[key];
    if (sec && sec[field] !== undefined && sec[field] !== null && sec[field] !== '') {
      return sec[field];
    }
    return fallback;
  };

  const renderHighlightText = (text, highlight = "DEMBENI") => {
    if (!text) return '';
    const upperText = text.toUpperCase();
    const upperHighlight = highlight.toUpperCase();
    
    if (upperText.includes(upperHighlight)) {
      const idx = upperText.indexOf(upperHighlight);
      const before = text.substring(0, idx);
      const actualHighlight = text.substring(idx, idx + highlight.length);
      const after = text.substring(idx + highlight.length);
      return (
        <>
          {before}<span className="highlight-text">{actualHighlight}</span>{after}
        </>
      );
    }
    return text;
  };

  const getIconComponent = (iconName) => {
    const iconsMap = {
      CreditCard: <CreditCard size={20} />,
      Trash2: <Trash2 size={20} />,
      Utensils: <Utensils size={20} />,
      Baby: <Baby size={20} />,
      Palette: <Palette size={20} />,
      ClipboardList: <ClipboardList size={20} />,
      Activity: <Activity size={20} />,
      Shield: <Shield size={20} />,
      Landmark: <Landmark size={20} />,
      Heart: <Heart size={20} />,
      Info: <Info size={20} />,
      Users: <Users size={20} />,
      Award: <Award size={20} />,
      GraduationCap: <GraduationCap size={20} />
    };
    return iconsMap[iconName] || <ClipboardList size={20} />;
  };

  const nextEvent = () => {
    if (eventIndex < allEvents.length - 3) {
      setEventIndex(eventIndex + 1);
    }
  };

  const prevEvent = () => {
    if (eventIndex > 0) {
      setEventIndex(eventIndex - 1);
    }
  };

  const visibleEvents = allEvents.slice(eventIndex, eventIndex + 3);

  useEffect(() => {
    // Fetch publications for the dynamic CMS avec gestion sécurisée
    const fetchPublications = async () => {
      try {
        setIsLoadingCMS(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/publications?status=published`);
        
        if (!response.ok) {
          throw new Error(`API a répondu avec le statut ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.success && Array.isArray(data.data)) {
          // Séparer les événements des actualités pour l'affichage intelligent de l'agenda
          const events = data.data.filter(pub => pub.type === 'evenement' || pub.category === 'Événements');
          
          // L'actualité principale affichera TOUTES les publications récentes publiées
          const news = data.data;
          
          setAllEvents(events);
          setAllNewsItems(news);
        } else {
          // Fallback silencieux si la donnée est mal formée
          setAllEvents([]);
          setAllNewsItems([]);
        }
      } catch (error) {
        console.error("Erreur critique lors de la récupération des publications CMS:", error);
        setCmsError(error.message);
      } finally {
        setIsLoadingCMS(false);
      }
    };
    
    fetchPublications();
  }, []);

  // ── DONNÉES DE DÉMONSTRATION (affichées si la BD est vide) ──
  const DEMO_NEWS = [
    {
      _id: 'demo-1', isFeatured: true, category: 'Vie municipale',
      title: 'Conseil municipal : décisions importantes pour Dembéni',
      content: 'Le conseil municipal s\'est réuni pour statuer sur plusieurs projets structurants : extension du réseau d\'eau potable, budget pour la rénovation de l\'école primaire, et création d\'un nouveau parc de jeux. Ces décisions reflètent l\'engagement de la municipalité pour améliorer la qualité de vie de tous les habitants.',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=1200',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      _id: 'demo-2', category: 'Santé & Solidarité',
      title: 'Campagne de vaccination : nouvelles dates disponibles',
      content: 'La commune organise une nouvelle campagne de vaccination pour tous les habitants au centre de santé municipal, du lundi au vendredi. Aucun rendez-vous nécessaire pour les moins de 12 ans. Venez muni de votre carnet de santé.',
      image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      _id: 'demo-3', category: 'Travaux',
      title: 'Réfection de la route principale : calendrier des travaux',
      content: 'Des travaux de réfection sont prévus sur la route principale. Ces travaux s\'étaleront sur 3 semaines avec mise en place d\'une déviation. Nous vous remercions de votre compréhension.',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      _id: 'demo-4', category: 'Culture',
      title: 'Festival culturel de Dembéni : programme dévoilé',
      content: 'La commune vous invite à son grand festival annuel : expositions, concerts traditionnels, spectacles de danse et ateliers pour enfants. Un événement festif et familial à ne pas manquer.',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      _id: 'demo-5', category: 'Environnement',
      title: 'Journée citoyenne de nettoyage : rejoignez-nous !',
      content: 'Grande journée de nettoyage et de sensibilisation environnementale organisée par la commune. Tous les habitants sont invités. Matériel fourni sur place. Ensemble, gardons Dembéni propre.',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ];

  // Safe mapping — utiliser les démos si la BD est vide et le chargement terminé
  const rawNewsItems = Array.isArray(allNewsItems) ? allNewsItems : [];
  const safeNewsItems = !isLoadingCMS && rawNewsItems.length === 0 && !cmsError
    ? DEMO_NEWS
    : rawNewsItems;

  const filteredNews = activeCategory === 'Tous'
    ? safeNewsItems
    : safeNewsItems.filter(item => item && item.category === activeCategory);

  // Sécurisation stricte
  const featuredItem = filteredNews && filteredNews.length > 0
    ? (filteredNews.find(item => item && item.isFeatured) || filteredNews[0])
    : null;

  const initialSidebarItems = featuredItem && Array.isArray(safeNewsItems)
    ? safeNewsItems.filter(item => item && item._id !== featuredItem._id && (item.isUrgent || item.isPinned || item.showOnHomepage)).slice(0, 4)
    : [];

  const extraSidebarItems = featuredItem && Array.isArray(safeNewsItems) && initialSidebarItems.length < 4
    ? safeNewsItems.filter(item => item && item._id !== featuredItem._id && !initialSidebarItems.some(s => s._id === item._id)).slice(0, 4 - initialSidebarItems.length)
    : [];

  const sidebarItems = [...initialSidebarItems, ...extraSidebarItems];

  const secondaryItems = featuredItem && Array.isArray(filteredNews)
    ? filteredNews.filter(item => item && item._id !== featuredItem._id && !sidebarItems.some(s => s._id === item._id)).slice(0, 4)
    : [];

  const services = [
    { title: "Identité civile & ANTS", desc: "Suivez vos demandes et renouvellements de Passeport ou CNI en ligne.", icon: <CreditCard size={20} /> },
    { title: "Gestion environnementale", desc: "Planifiez la collecte d'encombrants et signalez une anomalie sur la voie publique.", icon: <Trash2 size={20} /> },
    { title: "Paiement cantine", desc: "Consultez les menus et réglez les factures de restauration scolaire en ligne.", icon: <Utensils size={20} /> },
    { title: "Petite Enfance & Crèche", desc: "Déposez votre dossier d'inscription en crèche et suivez les affectations.", icon: <Baby size={20} /> },
    { title: "Agenda territorial", desc: "Consultez les actions de prévention et inscrivez-vous aux ateliers.", icon: <Palette size={20} /> },
    { title: "Démarches administratives", desc: "Accédez instantanément au guichet virtuel pour vos requêtes civiles.", icon: <ClipboardList size={20} /> },
  ];

  const accordionItems = [
    {
      q: "Comment programmer un enlèvement d'encombrants à domicile ?",
      a: "Vous pouvez en faire la demande gratuitement depuis votre Espace Citoyen dans l'onglet 'Démarches'. Remplissez le formulaire de planification, sélectionnez le type d'encombrant et une date d'enlèvement vous sera communiquée sous 48 heures."
    },
    {
      q: "Quels types de déchets sont acceptés par le service ?",
      a: "Sont acceptés les appareils électroménagers hors d'usage, le mobilier usagé, les matelas et les cartons volumineux. Les gravats, produits chimiques et déchets verts doivent être déposés directement à la déchèterie."
    },
    {
      q: "Quels sont les jours de collecte ordinaires dans les quartiers ?",
      a: "La collecte des ordures ménagères s'effectue trois fois par semaine (Lundi, Mercredi et Vendredi matin). Veillez à sortir vos bacs la veille au soir à partir de 20 heures."
    },
    {
      q: "Comment contacter directement le Pôle Technique environnemental ?",
      a: "Vous pouvez contacter le service technique environnemental par courriel à contact.technique@dembeni.fr, ou par téléphone au 02 69 61 11 05 du lundi au vendredi."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <div className="home-page">
      
      {/* 1. CINEMATIC & IMMERSIVE MUNICIPAL HERO */}
      <section className="immersive-hero" style={{
        backgroundColor: getCmsValue('home_hero', 'bgColor', 'transparent'),
        color: getCmsValue('home_hero', 'textColor', '#0d4a3e')
      }}>
        <div className="hero-bg" style={
          getCmsValue('home_hero', 'bgImage', '') 
            ? { backgroundImage: `url(${getCmsValue('home_hero', 'bgImage', '')})`, opacity: 0.95 }
            : {}
        } />
        <div className="hero-overlay-gradient" />
        
        <div className="hero-content-all">
          <div className="hero-text-block">
            <h1 className="hero-title-main" style={{ color: getCmsValue('home_hero', 'textColor', '#06211b') }}>
              {renderHighlightText(
                getCmsValue('home_hero', 'title', "Bienvenue sur le site officiel de la commune de DEMBENI")
              )}
            </h1>
            <p className="hero-desc-main" style={{ color: getCmsValue('home_hero', 'textColor', '#1e293b'), opacity: 0.95 }}>
              {getCmsValue('home_hero', 'description', "À travers cette plateforme numérique, la municipalité souhaite renforcer la proximité avec ses administrés, améliorer l'accès à l'information publique et faciliter les démarches administratives.")}
            </p>
            <div className="hero-btns-centered">
              {getCmsValue('home_hero', 'buttons', [
                { text: "Actualité", link: "/actualites", style: "primary" },
                { text: "Autres", link: "/contact", style: "secondary" }
              ]).map((btn, idx) => (
                <Link 
                  key={idx} 
                  to={btn.link} 
                  className={btn.style === 'primary' ? 'btn-hero-pill-primary' : 'btn-hero-pill-secondary'}
                  style={btn.style === 'primary' && getCmsValue('home_hero', 'primaryColor', '') ? { background: getCmsValue('home_hero', 'primaryColor', '') } : {}}
                >
                  {btn.text.toLowerCase().includes('actu') ? (
                    <Newspaper size={18} className="btn-left-icon" />
                  ) : (
                    <MoreHorizontal size={18} className="btn-left-icon" />
                  )}
                  <span>{btn.text}</span>
                  <ArrowRight size={16} className="btn-right-icon" />
                </Link>
              ))}
            </div>
          </div>
 
          {/* FLOATING GLASSMORPHIC INFO CARDS — CINEMATIC LAYOUT */}
          <div className="floating-cards-container">
            {getCmsValue('home_hero', 'cards', [
              { title: "Hôtel de Ville", desc: "Dembéni est une commune dynamique, riche de son histoire, engagée dans la transition et tournée vers l'avenir.", link: "/commune", badge: "ADMINISTRATION", img: "/mairie.jpg" },
              { title: "Vie Citoyenne", desc: "Découvrez nos associations dynamiques, nos initiatives locales et participez activement à la vie citoyenne.", link: "/citoyen", badge: "VIE CITOYENNE", img: "/groupe.jpg" }
            ]).map((card, idx) => (
              <div 
                key={idx} 
                className={`floating-card ${idx === 0 ? 'vertical-card' : 'wide-card'}`}
                onClick={() => { if (card.link) window.location.href = card.link; }}
                style={{ cursor: card.link ? 'pointer' : 'default' }}
              >
                <img src={card.img || (idx === 0 ? '/mairie.jpg' : '/groupe.jpg')} alt={card.title} className="card-full-image" />
                <div className="card-footer-glass">
                  <div className="card-footer-icon-circle">
                    {idx === 0 ? <Landmark size={18} /> : <Users size={18} />}
                  </div>
                  <div className="card-footer-text">
                    <span className="card-tag">{card.badge}</span>
                    <p className="card-footer-desc">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. REFINED SERVICES SECTION */}
      <section className="services-section" style={{ 
        paddingTop: '64px', 
        paddingBottom: '64px',
        backgroundColor: getCmsValue('home_services', 'bgColor', 'transparent'),
        color: getCmsValue('home_services', 'textColor', '#0f3c28')
      }}>
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <div className="section-tag" style={{ background: '#eafaf1', color: getCmsValue('home_services', 'primaryColor', '#16a34a'), fontSize: '0.72rem', padding: '4px 12px', borderRadius: '20px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
            <Info size={12} /> {getCmsValue('home_services', 'subtitle', 'Démarches en ligne')}
          </div>
          <h2 className="section-title-modern" style={{ fontSize: '1.8rem', fontWeight: 850, marginTop: '12px', color: getCmsValue('home_services', 'textColor', '#0f3c28') }}>
            {renderHighlightText(
              getCmsValue('home_services', 'title', "Vos démarches administratives simplifiées :"),
              "simplifiées"
            )}
          </h2>
          <p className="section-subtitle-modern" style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '6px' }}>
            {getCmsValue('home_services', 'description', "Accédez en quelques clics à l'ensemble de nos guichets numériques et suivez l'avancement de vos dossiers en temps réel.")}
          </p>
        </div>
        
        <div className="services-grid-modern" style={{ gap: '20px' }}>
          {getCmsValue('home_services', 'cards', services).map((s, i) => {
            const icon = typeof s.icon === 'string' ? getIconComponent(s.icon) : s.icon;
            return (
              <div key={i} className="service-card-modern" style={{ padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
                <div className="service-card-icon-wrap" style={{ width: '44px', height: '44px', borderRadius: '12px', color: getCmsValue('home_services', 'primaryColor', '#16a34a'), background: '#eafaf1', marginBottom: '16px' }}>
                  {icon}
                </div>
                <h3 className="service-card-title" style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f3c28', marginBottom: '8px' }}>{s.title}</h3>
                <p className="service-card-desc" style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>{s.desc}</p>
                <Link to={s.link || "/demarches"} className="service-card-btn" style={{ fontSize: '0.8rem', fontWeight: 700, color: getCmsValue('home_services', 'primaryColor', '#16a34a'), display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                  Accéder au service <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. MODERN IMMERSIVE INFO COMMUNE SECTION */}
      <section className="commune-info-section">
        <div className="commune-info-container">
          <div className="commune-info-grid">
            
            {/* LEFT AREA: Text & Details */}
            <div className="commune-info-left">
              <div className="commune-section-badge">
                <Landmark size={14} /> Institutionnel
              </div>
              <h2 className="commune-info-title">
                Dembéni, territoire de <span>vie et d'avenir au cœur de Mayotte</span>
              </h2>
              <p className="commune-info-text">
                Découvrez l'histoire, le patrimoine et la population de notre collectivité. La municipalité s'engage au quotidien pour offrir un cadre de vie durable, dynamique et proche de chacun de ses citoyens.
              </p>
              
              {/* Key Indicators Grid */}
              <div className="commune-indicators-grid">
                <div className="indicator-card">
                  <div className="indicator-header">
                    <Users size={18} className="indicator-icon" />
                    <span className="indicator-num">17 000+</span>
                  </div>
                  <span className="indicator-label">Habitants</span>
                </div>
                <div className="indicator-card">
                  <div className="indicator-header">
                    <Award size={18} className="indicator-icon" />
                    <span className="indicator-num">30+</span>
                  </div>
                  <span className="indicator-label">Associations</span>
                </div>
                <div className="indicator-card">
                  <div className="indicator-header">
                    <GraduationCap size={18} className="indicator-icon" />
                    <span className="indicator-num">1</span>
                  </div>
                  <span className="indicator-label">Université</span>
                </div>
              </div>
              
              {/* Toggle reveal button */}
              <button 
                onClick={() => setShowCommuneDetails(!showCommuneDetails)} 
                className={`commune-voir-plus-btn ${showCommuneDetails ? 'is-open' : ''}`}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                <span>{showCommuneDetails ? "Fermer les informations" : "Infos de la commune"}</span>
                <div className="btn-circle-arrow" style={{ transform: showCommuneDetails ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s ease' }}>
                  <ArrowRight size={16} />
                </div>
              </button>
            </div>

            {/* RIGHT AREA: Interactive Showcase Tabs & Image View */}
            <div className="commune-info-right">
              {/* Showcase Container */}
              <div className="showcase-card">
                {/* Main Selected Image */}
                <div className="showcase-image-wrapper">
                  {activeCommuneTab === 'mairie' && (
                    <img src="/mairie.jpg" alt="Hôtel de Ville" className="showcase-active-img" />
                  )}
                  {activeCommuneTab === 'jeunesse' && (
                    <img src="/news_workshop.png" alt="Jeunesse & Éducation" className="showcase-active-img" />
                  )}
                  {activeCommuneTab === 'lagon' && (
                    <img src="/beach_dembeni.png" alt="Littoral & Lagon" className="showcase-active-img" />
                  )}
                  {activeCommuneTab === 'projets' && (
                    <img src="/market_dembeni.png" alt="Projets & Développement" className="showcase-active-img" />
                  )}
                  
                  {/* Floating Glass Overlay Info */}
                  <div className="showcase-floating-overlay">
                    <div className="showcase-overlay-header">
                      {activeCommuneTab === 'mairie' && <span className="overlay-badge">ADMINISTRATION</span>}
                      {activeCommuneTab === 'jeunesse' && <span className="overlay-badge">ÉDUCATION & JEUNESSE</span>}
                      {activeCommuneTab === 'lagon' && <span className="overlay-badge">PATRIMOINE NATUREL</span>}
                      {activeCommuneTab === 'projets' && <span className="overlay-badge">DÉVELOPPEMENT URBAIN</span>}
                    </div>
                    <p className="showcase-overlay-desc">
                      {activeCommuneTab === 'mairie' && "L'Hôtel de Ville de Dembéni est le pôle de centralité des services communaux, engagé dans la proximité."}
                      {activeCommuneTab === 'jeunesse' && "Nous accompagnons nos jeunes et nos établissements scolaires pour bâtir le socle d'avenir de la commune."}
                      {activeCommuneTab === 'lagon' && "Le lagon et le littoral de Dembéni forment une réserve écologique précieuse et un joyau de biodiversité locale."}
                      {activeCommuneTab === 'projets' && "Les aménagements communaux modernes guident la structuration urbaine et dynamisent l'économie locale."}
                    </p>
                  </div>
                </div>

                {/* Tabs Selector List inside the showcase card */}
                <div className="showcase-tabs-bar">
                  <button 
                    className={`showcase-tab-btn ${activeCommuneTab === 'mairie' ? 'active' : ''}`}
                    onClick={() => setActiveCommuneTab('mairie')}
                  >
                    Hôtel de Ville
                  </button>
                  <button 
                    className={`showcase-tab-btn ${activeCommuneTab === 'jeunesse' ? 'active' : ''}`}
                    onClick={() => setActiveCommuneTab('jeunesse')}
                  >
                    Jeunesse & Éducation
                  </button>
                  <button 
                    className={`showcase-tab-btn ${activeCommuneTab === 'lagon' ? 'active' : ''}`}
                    onClick={() => setActiveCommuneTab('lagon')}
                  >
                    Lagon & Nature
                  </button>
                  <button 
                    className={`showcase-tab-btn ${activeCommuneTab === 'projets' ? 'active' : ''}`}
                    onClick={() => setActiveCommuneTab('projets')}
                  >
                    Projets Urbains
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC REVEAL COMMUNE DETAILS PANEL */}
          {showCommuneDetails && (
            <div className="commune-expanded-content">
              <div className="expanded-grid">
                {/* Box 1: Histoire & Patrimoine */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/beach_dembeni.png" alt="Histoire & Patrimoine" className="expanded-card-img" />
                    <div className="expanded-card-tag">HISTOIRE & PATRIMOINE</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Landmark size={18} className="card-icon-small" />
                      <h3>Richesse patrimoniale</h3>
                    </div>
                    <p>
                      Dembéni recèle d'incroyables richesses historiques, des vestiges médiévaux aux récits de l'océan Indien.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'patrimoine',
                        title: 'Histoire & Patrimoine de Dembéni',
                        subtitle: 'Un passé prestigieux gravé dans la pierre',
                        image: '/beach_dembeni.png',
                        icon: <Landmark size={24} />,
                        text: "La commune de Dembéni abrite un patrimoine historique et archéologique exceptionnel. Ses sites témoignent d'une occupation humaine très ancienne et d'échanges intenses au sein de l'océan Indien. L'ancienne usine sucrière et les vestiges de mosquées du lagon constituent des pièces maîtresses de notre histoire locale que nous veillons à restaurer et valoriser.",
                        stats: [
                          { val: "IXe s.", label: "Origines" },
                          { val: "15 km", label: "Littoral" },
                          { val: "3", label: "Sites classés" }
                        ],
                        listTitle: "Grands projets patrimoniaux :",
                        list: [
                          "Restauration des ruines de l'usine sucrière historique.",
                          "Aménagement de sentiers d'interprétation écologique.",
                          "Sensibilisation scolaire à la protection du lagon marin."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 2: Vie Associative & Citoyenne */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/groupe.jpg" alt="Vie Associative & Citoyenneté" className="expanded-card-img" />
                    <div className="expanded-card-tag">CITOYENNETÉ & ASSOCIATIONS</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Users size={18} className="card-icon-small" />
                      <h3>Cohésion citoyenne</h3>
                    </div>
                    <p>
                      Le réseau associatif dynamique anime les quartiers de Dembéni à travers le sport, la culture et l'aide intergénérationnelle.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'association',
                        title: 'Vie Citoyenne & Associations',
                        subtitle: 'Un tissu associatif engagé au quotidien',
                        image: '/groupe.jpg',
                        icon: <Users size={24} />,
                        text: "Avec plus de 30 associations actives enregistrées dans la commune, le tissu social de Dembéni est d'un dynamisme rare. La municipalité apporte un soutien logistique, matériel et financier annuel conséquent pour accompagner ces initiatives de proximité. Les actions menées touchent à la fois l'intégration des jeunes, le soutien aux personnes âgées, l'animation sportive locale (football, basket-ball) et la préservation culturelle.",
                        stats: [
                          { val: "30+", label: "Associations" },
                          { val: "2 MJC", label: "Infrastructures" },
                          { val: "150+", label: "Bénévoles" }
                        ],
                        listTitle: "Actions citoyennes clés :",
                        list: [
                          "Soutien direct aux clubs sportifs amateurs de la commune.",
                          "Organisation annuelle du Forum des Associations de Dembéni.",
                          "Mise en place d'ateliers de cohésion sociale inter-quartiers."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 3: Éducation & Jeunesse */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/news_workshop.png" alt="Éducation & Jeunesse" className="expanded-card-img" />
                    <div className="expanded-card-tag">JEUNESSE & ÉDUCATION</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <GraduationCap size={18} className="card-icon-small" />
                      <h3>Avenir académique</h3>
                    </div>
                    <p>
                      Dembéni est le pôle d'excellence d'enseignement supérieur de l'île en hébergeant le Centre Universitaire de Mayotte (CUFR).
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'jeunesse',
                        title: 'Jeunesse & Éducation',
                        subtitle: 'Investir dans le savoir de nos futurs talents',
                        image: '/news_workshop.png',
                        icon: <GraduationCap size={24} />,
                        text: "Dembéni is le poumon éducatif et universitaire de Mayotte. En abritant le CUFR, elle accueille des milliers d'étudiants poursuivant des diplômes supérieurs. Parallèlement, la commune gère et modernise en permanence ses 12 écoles primaires et maternelles. L'accent est mis sur le plan numérique dans les classes, la rénovation des toitures scolaires et un service de restauration scolaire de qualité.",
                        stats: [
                          { val: "4 200", label: "Élèves" },
                          { val: "1 CUFR", label: "Pôle supérieur" },
                          { val: "12", label: "Écoles modernes" }
                        ],
                        listTitle: "Priorités éducatives municipales :",
                        list: [
                          "Plan d'équipement numérique et interactif des classes.",
                          "Rénovation complète des infrastructures et isolation thermique.",
                          "Renforcement de l'aide aux devoirs péri-éducative."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 4: Développement Local */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/market_dembeni.png" alt="Infrastructures & Urbanisme" className="expanded-card-img" />
                    <div className="expanded-card-tag">DÉVELOPPEMENT LOCAL</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Hammer size={18} className="card-icon-small" />
                      <h3>Chantiers structurants</h3>
                    </div>
                    <p>
                      La restructuration urbaine, la sécurisation des voiries et l'éclairage vert transforment durablement la vie des quartiers.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'urbanisme',
                        title: 'Développement Local & Urbanisme',
                        subtitle: 'Une métamorphose urbaine et durable',
                        image: '/market_dembeni.png',
                        icon: <Hammer size={24} />,
                        text: "La modernisation de Dembéni passe par des investissements urbains structurants. La municipalité met en œuvre son Plan Local d'Urbanisme (PLU) visant à créer des espaces de vie plus qualitatifs, des voiries sécurisées et à déployer un réseau d'éclairage public photovoltaïque moderne et durable. Ces chantiers contribuent activement à l'insertion professionnelle locale.",
                        stats: [
                          { val: "8", label: "Chantiers majeurs" },
                          { val: "100%", label: "Éclairage LED/Solaire" },
                          { val: "PLU", label: "Planifié" }
                        ],
                        listTitle: "Grands axes d'aménagement :",
                        list: [
                          "Réfection et sécurisation des axes de voirie communaux.",
                          "Aménagement d'une zone artisanale et de marchés couverts.",
                          "Modernisation des réseaux de collecte d'eaux pluviales."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 5: Environnement & Biodiversité */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/dembeni_lagon_aerial.jpg" alt="Environnement & Biodiversité" className="expanded-card-img" />
                    <div className="expanded-card-tag">ENVIRONNEMENT</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Globe size={18} className="card-icon-small" />
                      <h3>Environnement préservé</h3>
                    </div>
                    <p>
                      Entre mangroves fertiles et récifs coralliens précieux, Dembéni protège activement sa biodiversité terrestre et marine.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'biodiversite',
                        title: 'Environnement & Biodiversité',
                        subtitle: 'Protéger nos écosystèmes exceptionnels',
                        image: '/dembeni_lagon_aerial.jpg',
                        icon: <Globe size={24} />,
                        text: "Dembéni dispose d'un patrimoine écologique rare, caractérisé par de vastes mangroves indispensables à la reproduction marine et par un lagon exceptionnel. Consciente de cette richesse, la collectivité mène des politiques actives de préservation : opérations régulières de nettoyage participatif des plages, plantation d'espèces végétales stabilisatrices et lutte contre l'érosion des sols agricoles.",
                        stats: [
                          { val: "3", label: "Zones protégées" },
                          { val: "0 plastique", label: "Objectif plage" },
                          { val: "4", label: "Opérations / an" }
                        ],
                        listTitle: "Programmes environnementaux :",
                        list: [
                          "Campagnes citoyennes de reboisement et de végétalisation.",
                          "Nettoyage des lits de rivières et des plages côtières.",
                          "Partenariats de protection avec le Parc Naturel Marin."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 6: Culture & Traditions */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/news_concert.png" alt="Culture & Traditions" className="expanded-card-img" />
                    <div className="expanded-card-tag">CULTURE & TRADITIONS</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Palette size={18} className="card-icon-small" />
                      <h3>Identité culturelle</h3>
                    </div>
                    <p>
                      Les danses folkloriques traditionnelles et l'artisanat local animent et façonnent l'identité forte de Mayotte.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'culture',
                        title: 'Culture, Traditions & Identité',
                        subtitle: 'Faire vivre la mémoire et l\'art de Mayotte',
                        image: '/news_concert.png',
                        icon: <Palette size={24} />,
                        text: "L'identité culturelle de Dembéni s'exprime à travers ses chants traditionnels (Deba, Chigoma), son artisanat délicat et ses célébrations festives qui rythment l'année. La commune s'engage à faire vivre ce patrimoine immatériel auprès de la jeunesse en soutenant des ateliers artistiques réguliers et en finançant la programmation de festivals culturels.",
                        stats: [
                          { val: "10+", label: "Groupes Deba" },
                          { val: "1", label: "Festival annuel" },
                          { val: "5", label: "Ateliers jeunesse" }
                        ],
                        listTitle: "Soutien à la création culturelle :",
                        list: [
                          "Subventions aux groupes folkloriques traditionnels locaux.",
                          "Organisation de la fête communale annuelle de la musique.",
                          "Transmission intergénérationnelle du tressage traditionnel."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 7: Villages & Quartiers */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/groupe.jpg" alt="Villages & Quartiers de Dembéni" className="expanded-card-img" />
                    <div className="expanded-card-tag">QUARTIERS & TERRITOIRES</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <MapPin size={18} className="card-icon-small" />
                      <h3>Cinq villages unis</h3>
                    </div>
                    <p>
                      Dembéni regroupe cinq grands villages dynamiques : Tsararano, Iloni, Ongojou, Nyambadao, et Dembéni chef-lieu.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'quartiers',
                        title: 'Villages & Territoires de Dembéni',
                        subtitle: 'Une union de terroirs et de cultures',
                        image: '/groupe.jpg',
                        icon: <MapPin size={24} />,
                        text: "La commune de Dembéni se caractérise par la richesse de ses cinq localités historiques. Du pôle urbain et universitaire en plein essor au calme verdoyant d'Ongojou ou d'Iloni, chaque village apporte sa contribution unique au dynamisme global de notre collectivité. La municipalité s'efforce de garantir un accès équitable aux services publics, équipements sportifs et infrastructures routières pour l'ensemble des habitants, sans distinction.",
                        stats: [
                          { val: "5", label: "Villages" },
                          { val: "Tsararano", label: "Pôle Scolaire" },
                          { val: "Iloni", label: "Faune & Flore" }
                        ],
                        listTitle: "Les cinq localités de la commune :",
                        list: [
                          "Dembéni Chef-lieu : Centre administratif et universitaire (CUFR).",
                          "Tsararano : Carrefour résidentiel et scolaire stratégique.",
                          "Iloni, Ongojou & Nyambadao : Havres côtiers et agricoles préservés."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 8: Chiffres Clés & Administration */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/mairie.jpg" alt="Chiffres Clés de Dembéni" className="expanded-card-img" />
                    <div className="expanded-card-tag">CHIFFRES CLÉS</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Info size={18} className="card-icon-small" />
                      <h3>Dembéni en chiffres</h3>
                    </div>
                    <p>
                      Découvrez les données démographiques et administratives clés qui illustrent le développement de notre collectivité.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'chiffres',
                        title: 'Chiffres Clés & Vitalité de Dembéni',
                        subtitle: 'Une collectivité d\'avenir en pleine croissance',
                        image: '/mairie.jpg',
                        icon: <Info size={24} />,
                        text: "Dembéni est l'une des communes les plus dynamiques et attractives de Mayotte. Grâce à son positionnement géographique central et à sa population jeune et active, elle attire chaque année de nouveaux résidents et entrepreneurs. Voici les données clés qui guident nos politiques de développement pour répondre aux attentes de nos concitoyens.",
                        stats: [
                          { val: "17 000+", label: "Habitants" },
                          { val: "12", label: "Écoles maternelles/primaires" },
                          { val: "15 km", label: "De façade maritime" }
                        ],
                        listTitle: "Indicateurs de développement :",
                        list: [
                          "Plus de 30 associations locales subventionnées par an.",
                          "1 centre universitaire de référence accueillant des milliers d'étudiants.",
                          "100% de l'éclairage public modernisé en technologies écologiques (LED & Solaires)."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* PORTAL MODAL DIALOG OVERLAY */}
        {activeModalTopic && (
          <div className="commune-portal-modal-backdrop" onClick={() => setActiveModalTopic(null)}>
            <div className="commune-portal-modal" onClick={(e) => e.stopPropagation()}>
              <button className="commune-modal-close-btn" onClick={() => setActiveModalTopic(null)}>
                &times;
              </button>
              <div className="commune-modal-grid">
                <div className="commune-modal-media">
                  <img src={activeModalTopic.image} alt={activeModalTopic.title} className="commune-modal-img" />
                  <div className="commune-modal-media-overlay">
                    <div className="commune-modal-icon-bubble">
                      {activeModalTopic.icon}
                    </div>
                    <span className="commune-modal-subtitle">{activeModalTopic.subtitle}</span>
                  </div>
                </div>
                <div className="commune-modal-info">
                  <h2>{activeModalTopic.title}</h2>
                  <p className="commune-modal-text">{activeModalTopic.text}</p>
                  
                  {/* Modal Sub-stats */}
                  <div className="commune-modal-stats">
                    {activeModalTopic.stats.map((s, idx) => (
                      <div key={idx} className="modal-stat-box">
                        <span className="modal-stat-val">{s.val}</span>
                        <span className="modal-stat-label">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="commune-modal-list-section">
                    <h3>{activeModalTopic.listTitle}</h3>
                    <ul>
                      {activeModalTopic.list.map((item, idx) => (
                        <li key={idx}>
                          <span className="bullet-green">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. ACTUALITÉS DE LA COMMUNE */}
      <section className="news-section-premium" style={{ padding: '48px 0 60px', background: '#F7F9FA', position: 'relative' }}>
        <div className="h-container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ background: 'rgba(14, 165, 114, 0.08)', color: '#0EA572', border: '1px solid rgba(14, 165, 114, 0.15)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Newspaper size={13} /> Publications Officielles
            </span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#066C5A', marginTop: '16px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Actualités de <span style={{ color: '#0EA572' }}>notre commune</span>
            </h2>
            <p style={{ color: '#1E293B', fontSize: '1rem', marginTop: '12px', maxWidth: '700px', lineHeight: 1.6, margin: '12px auto 0 auto' }}>
              Restez informé en temps réel des derniers événements, projets d'urbanisme et décisions de la municipalité de Dembéni.
            </p>
            
            {/* Filters */}
            <div className="news-filters-container">
              {['Tous', 'Santé & Solidarité', 'Vie municipale', 'Travaux', 'Événements', 'Culture', 'Environnement', 'Services publics', 'Jeunesse'].map((f, i) => (
                <button 
                  key={i} 
                  className={`news-filter-pill ${activeCategory === f ? 'active' : ''}`}
                  onClick={() => setActiveCategory(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <SectionErrorBoundary sectionName="Actualités">
            {isLoadingCMS ? (
              <div style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', color: '#0EA572' }}>
                  <div style={{ margin: '0 auto 16px', width: '40px', height: '40px', border: '4px solid rgba(14, 165, 114, 0.2)', borderTopColor: '#0EA572', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontWeight: 600 }}>Chargement des actualités...</p>
                </div>
              </div>
            ) : cmsError ? (
              <div style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fef2f2', borderRadius: '24px', border: '1px solid #fca5a5' }}>
                <p style={{ color: '#991b1b', fontWeight: 600 }}>Impossible de charger les actualités. Veuillez réessayer plus tard.</p>
              </div>
            ) : (
              <div className="news-layout-premium-grid">
                
                {/* COLONNE GAUCHE: HERO + GRILLE SECONDAIRE */}
                <div className="news-main-column">
                  
                  {/* 1. SECTION HERO ACTUALITÉS */}
                  {featuredItem ? (
                    <div className="news-hero-card">
                      <div className="news-hero-image" style={{ backgroundImage: `url(${featuredItem.image ? (featuredItem.image.startsWith('/public/') ? `${import.meta.env.VITE_API_URL || ''}` + featuredItem.image : featuredItem.image) : (featuredItem.coverImage || 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&q=80&w=1200')})` }} />
                      <div className="news-hero-overlay" />
                      
                      <div className="news-hero-content">
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="news-hero-badge">
                            {featuredItem.category || 'À la Une'}
                          </span>
                          <span className="news-hero-date">
                            <Calendar size={14} /> 
                            {featuredItem.date || (featuredItem.createdAt ? new Date(featuredItem.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '')}
                          </span>
                        </div>
                        
                        <h3 className="news-hero-title">
                          {featuredItem.title}
                        </h3>
                        
                        <p className="news-hero-desc">
                          {featuredItem.content ? featuredItem.content.replace(/<[^>]*>?/gm, '').substring(0, 140) + '...' : ''}
                        </p>

                        {/* Statistiques sous le titre */}
                        <div className="news-hero-stats">
                          <div className="news-hero-stat-item">
                            <span className="news-hero-stat-val">
                              <AnimatedCounter value={120} suffix="+" />
                            </span>
                            <span className="news-hero-stat-lbl">Services municipaux</span>
                          </div>
                          <div className="news-hero-stat-item">
                            <span className="news-hero-stat-val">
                              <AnimatedCounter value={15} />
                            </span>
                            <span className="news-hero-stat-lbl">Quartiers</span>
                          </div>
                          <div className="news-hero-stat-item">
                            <span className="news-hero-stat-val">
                              <AnimatedCounter value={5000} suffix="+" />
                            </span>
                            <span className="news-hero-stat-lbl">Citoyens</span>
                          </div>
                        </div>
                        
                        <div className="news-hero-actions">
                          <Link to={`/actualites/${featuredItem.slug || featuredItem._id}`} className="btn-hero-read-primary">
                            Lire l'actualité <ArrowRight size={15} />
                          </Link>
                          <Link to="/actualites" className="btn-hero-read-secondary">
                            Toutes les actualités <ArrowRight size={15} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '60px', textAlign: 'center', background: '#ffffff', borderRadius: '24px', color: '#64748b', border: '1px dashed #cbd5e1' }}>
                      Aucune actualité principale disponible pour cette catégorie.
                    </div>
                  )}
                  
                  {/* 2. CARTES ACTUALITÉS SECONDAIRES */}
                  {secondaryItems.length > 0 && (
                    <div className="news-grid-cards-container">
                      {secondaryItems.map((item) => (
                        <div key={item._id} className="news-card-premium">
                          <div className="news-card-image-wrap">
                            <img 
                              src={item.image ? (item.image.startsWith('/public/') ? `${import.meta.env.VITE_API_URL || ''}` + item.image : item.image) : (item.coverImage || 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&q=80&w=600')} 
                              alt={item.title} 
                              className="news-card-image"
                            />
                            <div className="news-card-image-overlay" />
                            <span className="news-card-badge-floating">
                              {item.category || 'Information'}
                            </span>
                          </div>
                          
                          <div className="news-card-body">
                            <span className="news-card-meta">
                              <Calendar size={12} /> 
                              {item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '')}
                            </span>
                            
                            <h4 className="news-card-title">
                              {item.title}
                            </h4>
                            
                            <p className="news-card-desc">
                              {item.content ? item.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : ''}
                            </p>
                            
                            <div className="news-card-footer">
                              <Link to={`/actualites/${item.slug || item._id}`} className="news-card-link">
                                Lire la suite <ArrowRight size={14} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* COLONNE DROITE: SIDEBAR "À NE PAS MANQUER" */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="news-sidebar-sticky">
                  <div className="news-sidebar-premium">
                    <h3 className="sidebar-title-premium">
                      <span style={{ color: '#0EA572', display: 'flex', alignItems: 'center' }}><Newspaper size={18} /></span>
                      À ne pas manquer
                    </h3>
                    
                    <div className="sidebar-items-list">
                      {sidebarItems.length > 0 ? sidebarItems.map((item) => (
                        <Link 
                          to={`/actualites/${item.slug || item._id}`} 
                          key={item._id} 
                          className="sidebar-horizontal-card"
                        >
                          <div className="sidebar-mini-img-wrap">
                            <img src={item.image ? (item.image.startsWith('/public/') ? `${import.meta.env.VITE_API_URL || ''}` + item.image : item.image) : (item.coverImage || 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&q=80&w=400')} className="sidebar-mini-img" alt={item.title} />
                          </div>
                          
                          <div className="sidebar-mini-content">
                            <span className="sidebar-mini-badge">
                              {item.category || 'Information'}
                            </span>
                            <h4 className="sidebar-mini-title">
                              {item.title}
                            </h4>
                            <span className="sidebar-mini-date">
                              <Calendar size={10} /> {item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '')}
                            </span>
                          </div>
                        </Link>
                      )) : (
                        <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>Aucune actualité en avant.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Guichet Citoyen CTA */}
                  <div className="news-sidebar-cta">
                    <div className="cta-shape-1" />
                    <div className="cta-shape-2" />
                    <div className="cta-illustration-wrap">
                      <div className="cta-illustration-circle">
                        <FileText size={24} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 850, marginBottom: '8px', position: 'relative', zIndex: 2 }}>Guichet Citoyen</h3>
                    <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '16px', lineHeight: 1.5, position: 'relative', zIndex: 2 }}>
                      Effectuez vos démarches administratives officielles en quelques minutes depuis notre espace en ligne sécurisé.
                    </p>
                    <div className="cta-demarche-list">
                      <div className="cta-demarche-item">
                        <div className="cta-demarche-dot" />
                        <span>Acte de naissance</span>
                      </div>
                      <div className="cta-demarche-item">
                        <div className="cta-demarche-dot" />
                        <span>État civil</span>
                      </div>
                      <div className="cta-demarche-item">
                        <div className="cta-demarche-dot" />
                        <span>Urbanisme</span>
                      </div>
                      <div className="cta-demarche-item">
                        <div className="cta-demarche-dot" />
                        <span>Signalement citoyen</span>
                      </div>
                    </div>
                    <Link to="/demarches" className="btn-cta-citoyen">
                      Accéder au guichet <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

              </div>
            )}
          </SectionErrorBoundary>

          <div className="news-footer-actions">
            <Link to="/actualites" className="btn-news-all">
              Voir toutes les actualités <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. DYNAMIC MUNICIPAL EVENTS */}
      <section className="events-video-section" style={{ padding: '64px 0', background: 'white' }}>
        <div className="h-container">
          <div className="events-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', textAlign: 'left' }}>
            <div className="events-header-left-wrap" style={{ maxWidth: '680px' }}>
              <div className="section-tag-simple" style={{ background: '#f5f5f7', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                <Calendar size={12} /> Agenda communal
              </div>
              <h2 className="events-title-modern" style={{ fontSize: '1.8rem', fontWeight: 850, marginTop: '12px', color: '#0f3c28' }}>Participez aux <span>événements</span> de Dembéni</h2>
              <p className="events-subtitle-modern" style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '6px', margin: 0 }}>
                Retrouvez l'agenda des rencontres citoyennes, culturelles, sportives et festives prévues dans vos quartiers.
              </p>
            </div>
            <div className="slider-arrows-premium" style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`slider-arrow-prem prev ${eventIndex === 0 ? 'inactive' : 'active'}`}
                onClick={prevEvent}
                disabled={eventIndex === 0}
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className={`slider-arrow-prem next ${eventIndex >= allEvents.length - 3 ? 'inactive' : 'active'}`}
                onClick={nextEvent}
                disabled={eventIndex >= allEvents.length - 3}
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <SectionErrorBoundary sectionName="Événements">
            <div className="events-grid-premium" style={{ gap: '20px' }}>
              {isLoadingCMS ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', color: '#64748b' }}>
                  Chargement de l'agenda...
                </div>
              ) : cmsError ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#fee2e2', borderRadius: '20px', color: '#991b1b' }}>
                  L'agenda est momentanément indisponible.
                </div>
              ) : visibleEvents.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', color: '#64748b' }}>
                  Aucun événement programmé pour le moment.
                </div>
              ) : (
                visibleEvents.map((item) => (
                  <div key={item._id || item.id || Math.random()} className="event-card-premium" style={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', background: '#f8fafc', textAlign: 'left' }}>
                    <div className="event-media-premium" style={{ height: '160px', position: 'relative' }}>
                      <img src={item.coverImage || item.image || '/placeholder.png'} alt={item.title} className="event-img-premium" />
                      <div className="play-btn-glass" style={{ width: '36px', height: '36px' }}><Play size={14} fill="currentColor" /></div>
                    </div>
                    <div className="event-body-premium" style={{ padding: '20px' }}>
                      <div className="event-meta-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`event-badge-prem ${item.badgeClass || 'badge-purple'}`} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px' }}>{item.category || 'Événement'}</span>
                        <span className="event-meta-date" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {item.date || (item.eventDate ? new Date(item.eventDate).toLocaleDateString('fr-FR') : '')}
                        </span>
                      </div>
                      <h3 className="event-title-prem" style={{ fontSize: '1rem', fontWeight: 800, color: '#0f3c28', margin: '12px 0 6px 0' }}>{item.title}</h3>
                      <div className="event-meta-venue" style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>📍 {item.venue || 'Dembéni'}</div>
                      <p className="event-desc-prem" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: '10px 0 16px 0' }}>
                        {item.desc || item.content?.substring(0, 80) || ''}
                      </p>
                      <Link to="/demarches" className="btn-learn-more-prem" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16a34a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        En savoir plus <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionErrorBoundary>
        </div>
      </section>

      {/* 6. WASTE & ENVIRONMENT SECTION — PREMIUM V2 */}
      <section className="waste-section-v2">
        <div className="h-container">
          <div className="waste-v2-header">
            <div className="waste-v2-badge">
              <Leaf size={13} /> Environnement
            </div>
            <h2 className="waste-v2-title">
              Gestion des déchets &amp; <span>cadre de vie</span>
            </h2>
            <p className="waste-v2-desc">
              Afin de preserver la beaute exceptionnelle de notre lagon et garantir la proprete de nos villages, la collectivite deploie des services de tri selectif et d'enlevement d'encombrants pour tous les citoyens.
            </p>
          </div>
          <div className="waste-v2-grid">
            <div>
              <div className="waste-v2-accordion-list">
                {accordionItems.map((item, i) => {
                  const icons = [<Truck size={16}/>, <Trash2 size={16}/>, <Calendar size={16}/>, <Phone size={16}/>];
                  return (
                    <div key={i} className={`waste-v2-accordion ${activeAccordion === i ? 'open' : ''}`}>
                      <div className="waste-v2-acc-header" onClick={() => toggleAccordion(i)}>
                        <div className="waste-v2-acc-title">
                          <div className="waste-v2-acc-icon-wrap">{icons[i]}</div>
                          <span>{item.q}</span>
                        </div>
                        <div className="waste-v2-acc-chevron">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                      {activeAccordion === i && (
                        <div className="waste-v2-acc-body">
                          <p className="waste-v2-acc-text">{item.a}</p>
                          {i === 0 && (
                            <div className="accordion-step-list" style={{marginTop:'12px'}}>
                              {[['1','Demande','Remplissez le formulaire en ligne depuis votre espace citoyen.'],['2','Validation','Notre pole environnement confirme un creneau sous 48 heures.'],['3','Passage','Deposez vos encombrants la veille au soir devant votre portail.']].map(([n,t,d])=>(
                                <div key={n} className="accordion-step-item">
                                  <span className="step-number">{n}</span>
                                  <span><strong>{t} :</strong> {d}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {i === 1 && (
                            <div className="accordion-grid-list">
                              <div className="accordion-sub-panel">
                                <span className="panel-title green">Acceptes</span>
                                <ul className="panel-items">
                                  <li><span className="bullet-icon green">+</span> Mobilier usage</li>
                                  <li><span className="bullet-icon green">+</span> Electromenager en panne</li>
                                  <li><span className="bullet-icon green">+</span> Cartons volumineux plies</li>
                                </ul>
                              </div>
                              <div className="accordion-sub-panel">
                                <span className="panel-title red">Refuses</span>
                                <ul className="panel-items">
                                  <li><span className="bullet-icon red">x</span> Gravats de chantier</li>
                                  <li><span className="bullet-icon red">x</span> Dechets vegetaux</li>
                                  <li><span className="bullet-icon red">x</span> Piles, batteries, huiles</li>
                                </ul>
                              </div>
                            </div>
                          )}
                          {i === 2 && (
                            <div className="accordion-schedule-row">
                              <div className="schedule-badge-row">
                                <span className="schedule-days">Lun, Mer, Ven matin</span>
                                <span className="schedule-sectors">Dembeni Chef-lieu, Tsararano, Iloni</span>
                              </div>
                              <div className="schedule-badge-row">
                                <span className="schedule-days">Mar, Jeu, Sam matin</span>
                                <span className="schedule-sectors">Ongojou, Nyambadao</span>
                              </div>
                            </div>
                          )}
                          {i === 3 && (
                            <div className="accordion-step-list" style={{marginTop:'8px'}}>
                              <div className="accordion-step-item"><span>Tel: 02 69 61 11 05</span></div>
                              <div className="accordion-step-item"><span>Email: environnement@dembeni.fr</span></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="waste-v2-actions">
                <Link to="/demarches" className="waste-v2-btn-primary">
                  <Truck size={17} /> Demander un enlevement
                </Link>
                <Link to="/contact" className="waste-v2-btn-secondary">
                  <Phone size={17} /> Contacter le service environnement
                </Link>
              </div>
            </div>
            <div style={{position:'sticky', top:'100px'}}>
              <div className="waste-v2-image-wrap">
                <img src="/waste_collection_premium.png" alt="Service de collecte a Dembeni" />
                <div className="waste-v2-img-overlay" />
                <div className="waste-v2-img-caption">
                  <div className="waste-v2-img-tag">Action Municipale</div>
                  <p className="waste-v2-img-heading">Service public de proximite quotidien</p>
                </div>
              </div>
              <div className="waste-v2-stats-grid">
                <div className="waste-v2-stat-card">
                  <div className="waste-v2-stat-icon"><Leaf size={18}/></div>
                  <span className="waste-v2-stat-num">450 T</span>
                  <span className="waste-v2-stat-lbl">Recyclees / an</span>
                </div>
                <div className="waste-v2-stat-card">
                  <div className="waste-v2-stat-icon"><CheckCircle2 size={18}/></div>
                  <span className="waste-v2-stat-num">98%</span>
                  <span className="waste-v2-stat-lbl">Taux de collecte</span>
                </div>
                <div className="waste-v2-stat-card">
                  <div className="waste-v2-stat-icon"><Clock size={18}/></div>
                  <span className="waste-v2-stat-num">48h</span>
                  <span className="waste-v2-stat-lbl">Delai d'intervention</span>
                </div>
              </div>
              <div className="waste-v2-process">
                <div className="waste-v2-process-title">Demande reservee aux citoyens connectes</div>
                <div className="waste-v2-process-steps">
                  <div className="waste-v2-process-step"><div className="waste-v2-step-dot">1</div><span>Citoyen</span></div>
                  <span className="waste-v2-step-arrow">to</span>
                  <div className="waste-v2-process-step"><div className="waste-v2-step-dot">2</div><span>Envoi</span></div>
                  <span className="waste-v2-step-arrow">to</span>
                  <div className="waste-v2-process-step"><div className="waste-v2-step-dot">3</div><span>Mairie</span></div>
                  <span className="waste-v2-step-arrow">to</span>
                  <div className="waste-v2-process-step"><div className="waste-v2-step-dot">4</div><span>Traitement</span></div>
                  <span className="waste-v2-step-arrow">to</span>
                  <div className="waste-v2-process-step"><div className="waste-v2-step-dot">5</div><span>Confirmation</span></div>
                </div>
                <div className="waste-v2-notice">
                  Les demandes de collecte sont reservees aux citoyens connectes. Une fois envoyee, votre demande est automatiquement transmise a l'administration municipale pour traitement et suivi.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. RECEPTION & PUBLIC SERVICE SECTION - CLAIR & PREMIUM */}
      <section className="public-service-overhaul" style={{ padding: '80px 0', background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)', color: '#1e293b', position: 'relative', overflow: 'hidden' }}>
        {/* Glow Effects (Soft Green) */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(16,185,129,0.03) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        <div className="h-container">
          {/* Header Row */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={13} /> Institutionnel & Administration
            </span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#0d4a3e', marginTop: '16px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Services Municipaux & <span style={{ color: '#10b981' }}>Administration</span>
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', marginTop: '12px', maxWidth: '700px', lineHeight: 1.6, margin: '12px auto 0 auto' }}>
              La Mairie de Dembéni s'engage dans la modernisation de son administration pour offrir un service public de proximité rapide, transparent et accessible à tous les citoyens.
            </p>
          </div>

          {/* Main Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'stretch', marginBottom: '50px' }}>
            {/* Left Column: Image Composition */}
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', minHeight: '380px', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'flex-end', padding: '40px', border: '1px solid rgba(16,185,129,0.15)', boxShadow: '0 20px 40px -15px rgba(13,74,62,0.1)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: "url('https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1200') center/cover", transition: 'transform 0.5s ease' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(13,74,62,0.95) 0%, rgba(13,74,62,0.4) 60%, rgba(0,0,0,0) 100%)' }} />
              
              {/* Badges on top of image */}
              <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', gap: '8px', zIndex: 3 }}>
                <span style={{ background: '#10b981', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 800 }}>✓ SERVICE RAPIDE</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 800 }}>🏠 ACCUEIL PHYSIQUE</span>
              </div>

              {/* Content on Image */}
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: 'white', marginBottom: '10px' }}>Guichet Unique & Accueil Citoyens</h3>
                <p style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  Nos agents vous reçoivent en mairie annexe ou principale pour faciliter toutes vos démarches civiles et d'urbanisme. Une administration à l'écoute de chaque projet familial ou entrepreneurial.
                </p>
                
                {/* Micro Stats inside image */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4ade80', display: 'block' }}>15 min</span>
                    <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>Attente Moyenne</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4ade80', display: 'block' }}>96%</span>
                    <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>Satisfaction</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4ade80', display: 'block' }}>12k +</span>
                    <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>Démarches / an</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Information Panel (Hours, Contacts, Utilities) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
              
              {/* Horaires et Informations Pratiques Card */}
              <div style={{ background: '#ffffff', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '24px', padding: '30px', textAlign: 'left', boxShadow: '0 10px 30px rgba(13,74,62,0.02)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0d4a3e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: '#10b981' }} /> Horaires d'ouverture de la Mairie
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16, 185, 129, 0.08)', paddingBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Lundi au Jeudi</span>
                    <span style={{ color: '#0d4a3e', fontWeight: 700 }}>7h30 - 15h30 (Continu)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16, 185, 129, 0.08)', paddingBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Vendredi</span>
                    <span style={{ color: '#0d4a3e', fontWeight: 700 }}>7h30 - 11h30 (Matinée uniquement)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Samedi & Dimanche</span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>Fermé</span>
                  </div>
                </div>
                
                {/* Note */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', padding: '12px', borderRadius: '12px', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                  <span style={{ color: '#10b981', fontSize: '1rem' }}>💡</span>
                  <span><strong>Démarches en ligne :</strong> Vos demandes d'actes d'état civil, CNI et Passeports restent accessibles 24h/24 via l'espace citoyen sécurisé.</span>
                </div>
              </div>

              {/* Contact direct et Numéros Utiles */}
              <div style={{ background: '#ffffff', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '24px', padding: '30px', textAlign: 'left', boxShadow: '0 10px 30px rgba(13,74,62,0.02)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0d4a3e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={18} style={{ color: '#10b981' }} /> Contacts & Numéros Utiles
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: 'rgba(16,185,129,0.02)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.08)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Standard Mairie</span>
                    <a href="tel:0269630115" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0d4a3e', textDecoration: 'none', display: 'block', marginBottom: '4px' }}>02 69 63 01 15</a>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Appel non surtaxé</span>
                  </div>
                  
                  <div style={{ background: 'rgba(16,185,129,0.02)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.08)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Courriel Officiel</span>
                    <a href="mailto:contact@dembeni.fr" style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10b981', textDecoration: 'none', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>contact@dembeni.fr</a>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Réponse sous 48h</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '12px', fontSize: '0.8rem' }}>
                  <span style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 900 }}>🚨</span>
                  <div style={{ color: '#991b1b' }}>
                    <strong>Alerte Sécurité Municipale :</strong> Pour toute urgence technique hors horaires, composez le <strong style={{ color: '#991b1b' }}>02 69 63 05 50</strong>.
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Service Cards Grid (6 cards) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '50px', textAlign: 'left' }}>
            {[
              {
                title: "État civil & ANTS",
                desc: "Actes de naissance, mariage, décès, demandes et suivi de cartes d'identité (CNI) et passeports.",
                icon: <FileText size={22} />,
                route: "/demarches",
                badge: "Service Principal"
              },
              {
                title: "Urbanisme & PLU",
                desc: "Permis de construire, déclarations préalables de travaux, cadastre et consultations du Plan Local d'Urbanisme.",
                icon: <Hammer size={22} />,
                route: "/projet",
                badge: "Aménagement"
              },
              {
                title: "CCAS & Action Sociale",
                desc: "Aide alimentaire d'urgence, soutien aux aînés, accompagnement administratif et dossiers de logement social.",
                icon: <Heart size={22} />,
                route: "/solidarite",
                badge: "Solidarité"
              },
              {
                title: "Inscriptions Scolaires",
                desc: "Inscriptions aux écoles maternelles et primaires de la commune, paiement de la cantine et activités périscolaires.",
                icon: <GraduationCap size={22} />,
                route: "/services",
                badge: "Jeunesse"
              },
              {
                title: "Services Techniques",
                desc: "Signalement d'anomalies de voirie, demande d'intervention d'éclairage public et entretien communal.",
                icon: <Activity size={22} />,
                route: "/services",
                badge: "Proximité"
              },
              {
                title: "Culture & Associations",
                desc: "Demande de subventions pour les associations locales, réservation de salles et billetterie des événements.",
                icon: <Palette size={22} />,
                route: "/culture",
                badge: "Vie Locale"
              }
            ].map((srv, idx) => (
              <div 
                key={idx} 
                className="service-premium-card" 
                style={{ 
                  background: '#ffffff', 
                  border: '1px solid rgba(16, 185, 129, 0.12)', 
                  borderRadius: '20px', 
                  padding: '28px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  height: '100%', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(13,74,62,0.01)'
                }}
              >
                {/* Card Glow Effect */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#10b981', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s ease' }} className="card-top-bar" />
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {srv.icon}
                    </div>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', color: '#16a34a', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      {srv.badge}
                    </span>
                  </div>
                  
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0d4a3e', marginBottom: '10px' }}>
                    {srv.title}
                  </h4>
                  
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {srv.desc}
                  </p>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <Link 
                    to={srv.route} 
                    style={{ 
                      fontSize: '0.82rem', 
                      fontWeight: 800, 
                      color: '#10b981', 
                      textDecoration: 'none', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      transition: 'gap 0.2s ease'
                    }}
                    className="card-action-link"
                  >
                    Accéder au service <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '30px' }}>
            <Link 
              to="/services" 
              style={{ 
                background: '#10b981', 
                color: 'white', 
                padding: '14px 28px', 
                borderRadius: '12px', 
                fontSize: '0.9rem', 
                fontWeight: 800, 
                textDecoration: 'none', 
                boxShadow: '0 8px 24px -6px rgba(16,185,129,0.3)', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              className="btn-action-primary-glow"
            >
              Découvrir les services <ArrowRight size={16} />
            </Link>
            
            <Link 
              to="/demarches" 
              style={{ 
                background: '#ffffff', 
                color: '#10b981', 
                border: '1px solid rgba(16,185,129,0.25)', 
                padding: '14px 28px', 
                borderRadius: '12px', 
                fontSize: '0.9rem', 
                fontWeight: 800, 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}
              className="btn-action-secondary-glow"
            >
              Effectuer une démarche
            </Link>

            <Link 
              to="/contact" 
              style={{ 
                background: 'transparent', 
                color: '#475569', 
                padding: '14px 28px', 
                borderRadius: '12px', 
                fontSize: '0.9rem', 
                fontWeight: 800, 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              className="btn-action-text"
            >
              Contacter la mairie
            </Link>
          </div>

        </div>
      </section>

      {/* 8. CULTURE & PATRIMOINE HISTORIQUE — VERSION PREMIUM */}
      <section style={{ padding: '96px 0 80px', background: 'linear-gradient(180deg, #f8fffe 0%, #f0fdf9 60%, #ffffff 100%)', isolation: 'isolate' }}>
        <style>{`
          .cult-tab-btn { padding: 11px 24px; border-radius: 40px; border: 2px solid #e2e8f0; background: white; color: #475569; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
          .cult-tab-btn:hover { border-color: #10b981; color: #065f46; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(16,185,129,0.15); }
          .cult-tab-btn.active { background: linear-gradient(135deg,#10b981,#059669); border-color: transparent; color: white; box-shadow: 0 6px 20px rgba(16,185,129,0.35); transform: translateY(-2px); }
          .cult-hero-wrap { position: relative; border-radius: 28px; overflow: hidden; height: 520px; box-shadow: 0 32px 80px rgba(13,74,62,0.18); }
          .cult-hero-img { width: 100%; height: 100%; object-fit: cover; object-position: center 40%; transition: transform 0.8s ease; filter: saturate(1.25) contrast(1.1) brightness(1.05) hue-rotate(-5deg); }
          .cult-hero-wrap:hover .cult-hero-img { transform: scale(1.05); }
          .cult-hero-overlay { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(4,60,45,0.15) 0%, rgba(6,78,59,0.55) 50%, rgba(4,50,36,0.88) 100%); }
          .cult-hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 48px 52px; z-index: 2; }
          .cult-hero-badge { display: inline-flex; align-items: center; gap: 7px; background: linear-gradient(135deg,rgba(16,185,129,0.92),rgba(5,150,105,0.92)); backdrop-filter: blur(10px); color: white; padding: 7px 18px; border-radius: 30px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.2); }
          .cult-hero-title { color: white; font-size: clamp(1.6rem,3.4vw,2.3rem); font-weight: 900; margin: 0 0 12px 0; letter-spacing: -0.025em; line-height: 1.15; text-shadow: 0 2px 20px rgba(0,0,0,0.3); }
          .cult-hero-desc { color: rgba(255,255,255,0.9); font-size: 1rem; margin: 0 0 26px 0; max-width: 600px; line-height: 1.7; text-shadow: 0 1px 8px rgba(0,0,0,0.2); }
          .cult-hero-btn { display: inline-flex; align-items: center; gap: 9px; background: linear-gradient(135deg,#10b981,#059669); color: white; padding: 14px 30px; border-radius: 40px; font-size: 0.9rem; font-weight: 800; text-decoration: none; box-shadow: 0 8px 28px rgba(16,185,129,0.45); transition: all 0.28s ease; border: none; cursor: pointer; }
          .cult-hero-btn:hover { background: linear-gradient(135deg,#059669,#047857); transform: translateY(-3px); box-shadow: 0 14px 36px rgba(16,185,129,0.55); }
          .cult-info-card { background: white; border-radius: 20px; padding: 28px 24px; border: 1px solid rgba(16,185,129,0.09); box-shadow: 0 4px 18px rgba(0,0,0,0.04); transition: all 0.3s ease; }
          .cult-info-card:hover { transform: translateY(-5px); box-shadow: 0 18px 45px rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.22); }
          .cult-info-icon { width: 50px; height: 50px; border-radius: 14px; background: rgba(16,185,129,0.09); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; transition: background 0.25s; }
          .cult-info-card:hover .cult-info-icon { background: rgba(16,185,129,0.18); }
          .cult-stat-card { background: white; border-radius: 18px; padding: 22px 18px; text-align: center; border: 1px solid rgba(16,185,129,0.1); box-shadow: 0 4px 14px rgba(0,0,0,0.04); transition: all 0.25s ease; }
          .cult-stat-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(16,185,129,0.13); border-color: rgba(16,185,129,0.28); }
          .cult-tab-panel { background: white; border-radius: 18px; padding: 26px 30px; border: 1px solid rgba(16,185,129,0.1); box-shadow: 0 4px 18px rgba(0,0,0,0.04); display: flex; gap: 18px; align-items: flex-start; }
          @media (max-width: 768px) {
            .cult-hero-content { padding: 28px 24px; }
            .cult-hero-title { font-size: 1.4rem; }
          }
        `}</style>

        <div className="h-container">

          {/* ── HEADER CENTRÉ ── */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', color: '#065f46', padding: '7px 20px', borderRadius: '30px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '20px' }}>
              <Landmark size={13} /> Culture &amp; Patrimoine
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.8vw,2.6rem)', fontWeight: 900, color: '#0d4a3e', margin: '0 0 18px 0', letterSpacing: '-0.025em', lineHeight: 1.18 }}>
              Dembéni, carrefour historique<br />et patrimoine vivant
            </h2>
            <p style={{ maxWidth: '660px', margin: '0 auto', fontSize: '1rem', color: '#64748b', lineHeight: 1.8 }}>
              Depuis des siècles, Dembéni constitue un point d'échange majeur entre l'Afrique orientale, les Comores et l'océan Indien. Son patrimoine historique et culturel témoigne d'une richesse exceptionnelle préservée par la commune.
            </p>
          </div>

          {/* ── ONGLETS MODERNES ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {[
              { label: 'Histoire de Dembéni', desc: "Dembéni est l'un des sites archéologiques les plus importants des Comores, avec des vestiges d'une cité fortifiée commerciale datant du IXe siècle. Ce berceau historique témoigne de l'importance stratégique de la commune dans les échanges régionaux." },
              { label: 'Patrimoine culturel', desc: "Des poteries de Chine et d'Iran retrouvées sur le site témoignent des échanges florissants dans l'océan Indien. La commune préserve activement ce patrimoine à travers des programmes culturels et éducatifs pour les générations futures." },
              { label: 'Fouilles & Conservation', desc: "Les fouilles archéologiques révèlent d'anciennes mosquées, fours de potiers et infrastructures médiévales remarquablement préservées. Un programme de conservation actif garantit la transmission de cet héritage aux générations futures." },
            ].map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveRuinsTab(idx)}
                className={`cult-tab-btn${activeRuinsTab === idx ? ' active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── GRAND HERO CULTUREL ── */}
          <div className="cult-hero-wrap">
            <img
              src="/dembeni-patrimoine.jpg"
              alt="Site patrimonial historique de Dembéni — Ruines, palmiers et anciennes machines"
              className="cult-hero-img"
            />
            <div className="cult-hero-overlay" />
            <div className="cult-hero-content">
              <div className="cult-hero-badge">
                <Landmark size={13} /> Site patrimonial historique
              </div>
              <h3 className="cult-hero-title">Un patrimoine historique unique</h3>
              <p className="cult-hero-desc">Les vestiges historiques de Dembéni témoignent de plusieurs siècles d'échanges culturels et commerciaux dans l'océan Indien.</p>
              <Link to="/culture" className="cult-hero-btn">
                Découvrir le patrimoine <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* ── DESCRIPTION ONGLET ACTIF ── */}
          <div className="cult-tab-panel" style={{ marginTop: '28px' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '12px', padding: '11px', flexShrink: 0 }}>
              <BookOpen size={22} color="#10b981" />
            </div>
            <p style={{ color: '#334155', fontSize: '0.96rem', lineHeight: 1.8, margin: 0 }}>
              {[
                "Dembéni est l'un des sites archéologiques les plus importants des Comores, avec des vestiges d'une cité fortifiée commerciale datant du IXe siècle. Ce berceau historique témoigne de l'importance stratégique de la commune dans les échanges régionaux.",
                "Des poteries de Chine et d'Iran retrouvées sur le site témoignent des échanges florissants dans l'océan Indien. La commune préserve activement ce patrimoine à travers des programmes culturels et éducatifs pour les générations futures.",
                "Les fouilles archéologiques révèlent d'anciennes mosquées, fours de potiers et infrastructures médiévales remarquablement préservées. Un programme de conservation actif garantit la transmission de cet héritage aux générations futures.",
              ][activeRuinsTab]}
            </p>
          </div>

          {/* ── 3 CARTES INFORMATIVES ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '22px', marginTop: '36px' }}>
            {[
              { icon: <Landmark size={24} color="#10b981" />, title: 'Patrimoine archéologique', desc: "Le site de Dembéni révèle une cité fortifiée du IXe siècle avec ruines, fours de potiers et machineries coloniales — carrefour historique de l'océan Indien." },
              { icon: <BookOpen size={24} color="#10b981" />, title: 'Mémoire historique', desc: "Des poteries de Chine, de Perse et d'Iran retrouvées sur le site témoignent des échanges florissants qui ont façonné l'identité culturelle unique de Dembéni." },
              { icon: <Shield size={24} color="#10b981" />, title: 'Conservation culturelle', desc: "La commune s'engage activement dans la préservation, la restauration et la valorisation de ses vestiges à travers des programmes culturels et éducatifs reconnus." },
            ].map((bloc, i) => (
              <div key={i} className="cult-info-card">
                <div className="cult-info-icon">{bloc.icon}</div>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0d4a3e', marginBottom: '10px' }}>{bloc.title}</h4>
                <p style={{ fontSize: '0.87rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{bloc.desc}</p>
              </div>
            ))}
          </div>

          {/* ── STATISTIQUES CULTURELLES ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '18px', marginTop: '28px' }}>
            {[
              { value: 'IXe siècle', label: 'Origines historiques', emoji: '🏛️' },
              { value: 'Patrimoine', label: 'Culture préservée', emoji: '🏺' },
              { value: 'Maritime', label: 'Influence régionale', emoji: '⚓' },
              { value: '30+ ans', label: 'Fouilles actives', emoji: '🔍' },
            ].map((stat, i) => (
              <div key={i} className="cult-stat-card">
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{stat.emoji}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0d4a3e', marginBottom: '5px' }}>{stat.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. HEALTH AND SOLIDARITY SECTION — OCTOBRE ROSE EDITION */}
      <section className="h-container" style={{ paddingTop: '80px', paddingBottom: '80px', isolation: 'isolate' }}>
        <style>{`
          .octobre-rose-card {
            border-radius: 32px;
            overflow: hidden;
            background: linear-gradient(135deg, #fff5f7 0%, #ffe4e6 50%, #fbcfe8 100%);
            border: 1px solid rgba(244, 63, 94, 0.15);
            box-shadow: 0 24px 50px rgba(244, 63, 94, 0.08);
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            transition: all 0.3s ease;
          }
          @media (max-width: 968px) {
            .octobre-rose-card {
              grid-template-columns: 1fr;
            }
          }
          .octobre-rose-content {
            padding: 56px;
            text-align: left;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          @media (max-width: 576px) {
            .octobre-rose-content {
              padding: 32px 24px;
            }
          }
          .rose-badge {
            background: #ffe4e6;
            color: #e11d48;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            display: inline-flex;
            gap: 6px;
            align-items: center;
            fontWeight: 800;
            width: fit-content;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            border: 1px solid rgba(225, 29, 72, 0.15);
          }
          .rose-title {
            font-size: clamp(1.8rem, 3.2vw, 2.5rem);
            font-weight: 900;
            margin-top: 20px;
            color: #1f2937;
            line-height: 1.25;
            letter-spacing: -0.02em;
          }
          .rose-title span {
            color: #ec4899;
            background: linear-gradient(to right, #ec4899, #db2777);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 900;
          }
          .rose-desc {
            font-size: 0.95rem;
            color: #4b5563;
            line-height: 1.7;
            margin-top: 16px;
            margin-bottom: 32px;
            max-width: 520px;
          }
          .btn-rose-primary {
            background: linear-gradient(135deg, #ec4899, #db2777);
            color: white;
            padding: 12px 28px;
            border-radius: 30px;
            font-size: 0.88rem;
            font-weight: 800;
            text-decoration: none;
            box-shadow: 0 8px 20px rgba(236, 72, 153, 0.35);
            transition: all 0.25s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .btn-rose-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 26px rgba(236, 72, 153, 0.45);
            background: linear-gradient(135deg, #db2777, #be185d);
          }
          .btn-rose-secondary {
            background: white;
            color: #db2777;
            border: 1px solid rgba(219, 39, 119, 0.3);
            padding: 12px 28px;
            border-radius: 30px;
            font-size: 0.88rem;
            font-weight: 800;
            text-decoration: none;
            transition: all 0.25s ease;
          }
          .btn-rose-secondary:hover {
            background: #fff1f2;
            border-color: #db2777;
            transform: translateY(-2px);
          }
          .octobre-rose-visual-wrap {
            position: relative;
            min-height: 380px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .octobre-rose-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
          }
          .octobre-rose-visual-wrap:hover .octobre-rose-img {
            transform: scale(1.03);
          }
          .rose-glow-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to left, rgba(251, 207, 232, 0.15) 0%, rgba(244, 63, 94, 0.25) 100%);
            mix-blend-mode: multiply;
          }
          .rose-info-cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 32px;
          }
          .rose-info-card {
            background: white;
            border-radius: 20px;
            padding: 24px;
            border: 1px solid rgba(244, 63, 94, 0.08);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
            transition: all 0.28s ease;
            text-align: left;
          }
          .rose-info-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(244, 63, 94, 0.1);
            border-color: rgba(244, 63, 94, 0.2);
          }
          .rose-card-icon-wrap {
            background: #ffe4e6;
            color: #e11d48;
            border-radius: 12px;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          .rose-card-title {
            font-size: 0.95rem;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .rose-card-desc {
            font-size: 0.85rem;
            color: #6b7280;
            line-height: 1.5;
            margin: 0;
          }
        `}</style>

        <div className="octobre-rose-card">
          <div className="octobre-rose-content">
            <div className="rose-badge">
              <Heart size={14} fill="#e11d48" /> Solidarité &amp; Santé
            </div>
            <h2 className="rose-title">
              Dembéni <span>s'engage pour Octobre Rose</span>
            </h2>
            <p className="rose-desc">
              La commune de Dembéni se mobilise pour la prévention, le dépistage et la sensibilisation au cancer du sein à travers des actions solidaires, des marches citoyennes et des ateliers interactifs.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/sante" className="btn-rose-primary">
                Découvrir la campagne <Sparkles size={14} />
              </Link>
              <Link to="/contact" className="btn-rose-secondary">
                Participer
              </Link>
            </div>
          </div>
          <div className="octobre-rose-visual-wrap">
            <img 
              src="/octobre-rose-doctor.png" 
              alt="Femme médecin souriante pour la campagne Octobre Rose à Dembéni — dépistage et prévention du cancer du sein" 
              className="octobre-rose-img"
              style={{ objectPosition: 'center top' }}
            />
            <div className="rose-glow-overlay" />
          </div>
        </div>

        {/* ── 3 CARTES MODERNES DE CAMPAGNE ── */}
        <div className="rose-info-cards-grid">
          <div className="rose-info-card">
            <div className="rose-card-icon-wrap">
              <Heart size={20} />
            </div>
            <h3 className="rose-card-title">Dépistages organisés</h3>
            <p className="rose-card-desc">
              Des journées spéciales d'accompagnement et d'accès simplifié au dépistage gratuit organisées en partenariat avec les services médico-sociaux.
            </p>
          </div>

          <div className="rose-info-card">
            <div className="rose-card-icon-wrap">
              <Users size={20} />
            </div>
            <h3 className="rose-card-title">Actions citoyennes</h3>
            <p className="rose-card-desc">
              Participez à la marche solidaire rose de Dembéni, aux rencontres d'échanges et aux collectes actives organisées par nos associations.
            </p>
          </div>

          <div className="rose-info-card">
            <div className="rose-card-icon-wrap">
              <Activity size={20} />
            </div>
            <h3 className="rose-card-title">Sensibilisation locale</h3>
            <p className="rose-card-desc">
              Distribution de kits d'information, conférences thématiques et interventions de professionnels de santé dans tous nos quartiers.
            </p>
          </div>
        </div>
      </section>

      {/* 10. SOCIAL & ASSOCIATIVE LIFE */}
      <section className="social-associative-section" style={{ padding: '64px 0', background: 'white' }}>
        <div className="h-container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="section-tag-simple" style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', display: 'inline-flex', gap: '6px', alignItems: 'center' }}><Users size={12} /> Vie sociale & associative</div>
            <h2 className="presentation-title" style={{ fontSize: '1.8rem', fontWeight: 850, marginTop: '12px', color: '#0f3c28' }}>
              Un tissu associatif actif et soudé
            </h2>
            <p className="presentation-text" style={{ maxWidth: '750px', margin: '8px auto 0 auto', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
              La commune de Dembéni soutient plus de 30 associations locales oeuvrant pour la cohésion sociale, l'encadrement des jeunes et l'éveil culturel.
            </p>
          </div>

          <div className="presentation-layout" style={{ marginTop: '32px', gap: '32px', gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
            <div className="presentation-images" style={{ height: '300px', borderRadius: '16px', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80" alt="Association" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="presentation-content" style={{ textAlign: 'left' }}>
              <div className="presentation-text">
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  Afin de soutenir ce dynamisme, la commune alloue des subventions d'équipement et met à disposition plusieurs salles communales et terrains sportifs. Ces actions permettent d'impliquer notre jeunesse dans des projets d'utilité publique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;
