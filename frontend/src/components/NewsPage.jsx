import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, ArrowRight, Newspaper, Tag, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const CATEGORIES = ['Tous', 'Santé & Solidarité', 'Vie municipale', 'Travaux', 'Événements', 'Culture', 'Environnement', 'Services publics', 'Jeunesse'];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&q=80&w=800';

const stripHtml = (html = '') => html.replace(/<[^>]*>?/gm, '');

const formatDate = (item) => {
  const raw = item.createdAt || item.date;
  if (!raw) return '';
  return new Date(raw).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateShort = (item) => {
  const raw = item.createdAt || item.date;
  if (!raw) return '';
  return new Date(raw).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ITEMS_PER_PAGE = 6;

// ── DONNÉES DE DÉMONSTRATION (affichées si la BD est vide) ──
const DEMO_NEWS = [
  {
    _id: 'demo-1', isFeatured: true, category: 'Vie municipale',
    title: 'Conseil municipal : décisions importantes pour Dembéni',
    content: 'Le conseil municipal s\'est réuni pour statuer sur plusieurs projets structurants : extension du réseau d\'eau potable, budget pour la rénovation de l\'école primaire, et création d\'un nouveau parc de jeux. Ces décisions reflètent l\'engagement de la municipalité pour améliorer la qualité de vie de tous les habitants de Dembéni.',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=1200',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'demo-2', category: 'Santé & Solidarité',
    title: 'Campagne de vaccination : nouvelles dates disponibles',
    content: 'La commune organise une nouvelle campagne de vaccination au centre de santé municipal, du lundi au vendredi. Aucun rendez-vous nécessaire pour les moins de 12 ans. Venez muni de votre carnet de santé et d\'une pièce d\'identité.',
    image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    _id: 'demo-3', category: 'Travaux',
    title: 'Réfection de la route principale : calendrier des travaux',
    content: 'Des travaux de réfection de la chaussée sont prévus sur la route principale de Dembéni. Ces travaux s\'étaleront sur 3 semaines. Une déviation sera mise en place. La commune s\'excuse pour la gêne occasionnée et vous remercie de votre compréhension.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    _id: 'demo-4', category: 'Culture',
    title: 'Festival culturel de Dembéni : programme complet dévoilé',
    content: 'La commune vous invite à son grand festival culturel annuel. Au programme : expositions d\'artistes locaux, concerts de musiques traditionnelles, spectacles de danse, ateliers pour enfants et stands de produits locaux. Un événement festif et familial à ne pas manquer.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    _id: 'demo-5', category: 'Environnement',
    title: 'Journée citoyenne de nettoyage : rejoignez-nous !',
    content: 'Grande journée de nettoyage et de sensibilisation environnementale organisée par la commune. Tous les habitants sont invités à participer. Du matériel sera fourni sur place. Ensemble, gardons Dembéni propre et agréable pour tous.',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    _id: 'demo-6', category: 'Jeunesse',
    title: 'Ateliers jeunesse de l\'été : inscriptions ouvertes !',
    content: 'La maison des jeunes de Dembéni ouvre les inscriptions pour ses ateliers estivaux. Sport, arts, musique, informatique et activités nature sont au programme pour les 10-18 ans. Les places sont limitées, inscrivez-vous rapidement.',
    image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    _id: 'demo-7', category: 'Services publics',
    title: 'Nouveau service en ligne : déclarations simplifiées',
    content: 'La mairie de Dembéni lance un nouveau portail de télé-services permettant de réaliser vos démarches administratives en ligne, 24h/24. Plus besoin de vous déplacer pour les demandes courantes d\'actes d\'état civil.',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

const NewsPage = () => {
  const [rawNews, setRawNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/publications?status=published`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data)) {
          setRawNews(data.data);
        } else {
          setRawNews([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur NewsPage:', err);
        setError('Impossible de charger les actualités.');
        setLoading(false);
      });
  }, []);

  // Utiliser les démos si la BD est vide
  const news = !loading && rawNews.length === 0 && !error ? DEMO_NEWS : rawNews;

  // Filter
  const filtered = news.filter(item => {
    const matchCat = activeCategory === 'Tous' || item.category === activeCategory;
    const matchSearch =
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(search.toLowerCase()) ||
      stripHtml(item.content || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [activeCategory, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const featuredItem = filtered[0] || null;
  const gridItems = paginatedItems.filter(item => item._id !== (featuredItem?._id));
  const sidebarItems = [...news].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)).slice(0, 5);

  const sCls = (isActive) => ({
    background: isActive ? '#10b981' : '#f1f5f9',
    color: isActive ? 'white' : '#475569',
    border: `1px solid ${isActive ? '#10b981' : '#e2e8f0'}`,
    padding: '7px 18px',
    borderRadius: '30px',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: isActive ? '0 4px 12px rgba(16,185,129,0.25)' : 'none',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', minHeight: '100vh' }}>

      {/* ── HERO BANNER ── */}
      <section style={{ position: 'relative', minHeight: '260px', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #066C5A 0%, #0EA572 100%)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', padding: '6px 16px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Newspaper size={13} /> Publications Officielles
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '12px' }}>
            Actualités de <span style={{ color: '#a7f3d0' }}>Dembéni</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: '600px', lineHeight: 1.5, marginBottom: '20px' }}>
            Suivez en temps réel l'ensemble des informations, projets et décisions de votre commune.
          </p>

          {/* Stats in Hero Banner */}
          <div style={{ display: 'flex', gap: '30px', marginTop: '16px', marginBottom: '24px', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '16px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>120+</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', fontWeight: 600 }}>Services municipaux</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>15</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', fontWeight: 600 }}>Quartiers</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>5000+</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', fontWeight: 600 }}>Citoyens</span>
            </div>
          </div>

          {/* Search Bar in Hero */}
          <div style={{ position: 'relative', maxWidth: '520px' }}>
            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Rechercher une actualité, une catégorie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '16px 20px 16px 50px', borderRadius: '16px', border: 'none', fontSize: '0.95rem', fontWeight: 500, background: 'white', color: '#1e293b', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', outline: 'none', boxSizing: 'border-box' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <div style={{ borderBottom: '1px solid #e2e8f0', background: '#fff', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: '10px', padding: '14px 0', overflowX: 'auto', scrollbarWidth: 'none' }} className="news-filters-container">
            {CATEGORIES.map((cat, i) => (
              <button key={i} className={`news-filter-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#0EA572' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid rgba(14,165,114,0.2)', borderTopColor: '#0EA572', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ fontWeight: 600 }}>Chargement des actualités...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fef2f2', borderRadius: '24px', color: '#991b1b' }}>
            <p style={{ fontWeight: 600 }}>{error}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>

            {/* LEFT: ARTICLES */}
            <div>

              {/* Results count */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                  {filtered.length === 0 ? 'Aucun résultat' : `${filtered.length} article${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`}
                  {activeCategory !== 'Tous' && <span style={{ color: '#0EA572' }}> — {activeCategory}</span>}
                </p>
                {search && (
                  <button onClick={() => setSearch('')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    <X size={12} /> Effacer "{search}"
                  </button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                  <Newspaper size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Aucune actualité trouvée</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Essayez une autre catégorie ou modifiez votre recherche.</p>
                </div>
              ) : (
                <>
                  {/* FEATURED ARTICLE (first item, full width) */}
                  {currentPage === 1 && featuredItem && (
                    <Link
                      to={`/actualites/${featuredItem.slug || featuredItem._id}`}
                      className="news-hero-card"
                      style={{ marginBottom: '40px' }}
                    >
                      <div className="news-hero-image" style={{ backgroundImage: `url(${getImageUrl(featuredItem.image, featuredItem.coverImage || FALLBACK_IMG)})` }} />
                      <div className="news-hero-overlay" />

                      <div className="news-hero-content">
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span className="news-hero-badge">
                            {featuredItem.category || 'À la Une'}
                          </span>
                          {featuredItem.isFeatured && (
                            <span className="news-hero-badge" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
                              ⭐ À la une
                            </span>
                          )}
                          <span className="news-hero-date">
                            <Clock size={13} /> {formatDate(featuredItem)}
                          </span>
                        </div>

                        <h2 className="news-hero-title">
                          {featuredItem.title}
                        </h2>

                        <p className="news-hero-desc">
                          {stripHtml(featuredItem.content || '').substring(0, 150)}...
                        </p>

                        <div className="news-hero-actions">
                          <span className="btn-hero-read-primary">
                            Lire l'article complet <ArrowRight size={15} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* GRID: secondary articles */}
                  <div className="news-grid-cards-container">
                    {gridItems.map((item) => (
                      <Link
                        key={item._id}
                        to={`/actualites/${item.slug || item._id}`}
                        className="news-card-premium"
                      >
                        <div className="news-card-image-wrap">
                          <img
                            src={getImageUrl(item.image, item.coverImage || FALLBACK_IMG)}
                            alt={item.title}
                            className="news-card-image"
                            onError={(e) => { e.target.src = FALLBACK_IMG; }}
                          />
                          <div className="news-card-image-overlay" />
                          <span className="news-card-badge-floating">
                            {item.category || 'Information'}
                          </span>
                        </div>

                        <div className="news-card-body">
                          <span className="news-card-meta">
                            <Calendar size={12} /> {formatDateShort(item)}
                          </span>

                          <h4 className="news-card-title">
                            {item.title}
                          </h4>

                          <p className="news-card-desc">
                            {stripHtml(item.content || '').substring(0, 120)}...
                          </p>

                          <div className="news-card-footer">
                            <span className="news-card-link">
                              Lire la suite <ArrowRight size={14} />
                            </span>
                            {item.isFeatured && <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>⭐ En avant</span>}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '48px' }}>
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentPage === 1 ? '#cbd5e1' : '#475569', transition: 'all 0.2s' }}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{ width: '40px', height: '40px', borderRadius: '12px', border: `1px solid ${currentPage === page ? '#0EA572' : '#e2e8f0'}`, background: currentPage === page ? '#0EA572' : 'white', color: currentPage === page ? 'white' : '#475569', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: currentPage === page ? '0 4px 12px rgba(14,165,114,0.3)' : 'none' }}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentPage === totalPages ? '#cbd5e1' : '#475569', transition: 'all 0.2s' }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>



      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .np-featured-card:hover .np-featured-img { transform: scale(1.04); }
        .np-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(13,74,62,0.1) !important; border-color: rgba(16,185,129,0.2) !important; }
        .np-card:hover .np-card-img { transform: scale(1.08); }
        ::-webkit-scrollbar { height: 4px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default NewsPage;
