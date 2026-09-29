import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, User, Clock, ArrowLeft, ArrowRight, Share2, 
  MessageCircle, Mail, Link2, Download, FileText, 
  Image as ImageIcon, ChevronLeft, ChevronRight, BookOpen
} from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&q=80&w=1200';

const NewsDetailPage = () => {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation & Related
  const [prevNews, setPrevNews] = useState(null);
  const [nextNews, setNextNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setCopied(false);
    
    // Fetch target publication
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/publications/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data) {
          setNews(data.data);
          
          // Fetch all publications for navigation & related
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/publications?status=published`)
            .then(res => res.json())
            .then(allData => {
              if (allData && allData.success && Array.isArray(allData.data)) {
                const list = allData.data;
                
                // Find current index
                const currentIndex = list.findIndex(item => item._id === data.data._id || item.slug === data.data.slug);
                if (currentIndex !== -1) {
                  setPrevNews(currentIndex < list.length - 1 ? list[currentIndex + 1] : null);
                  setNextNews(currentIndex > 0 ? list[currentIndex - 1] : null);
                }
                
                // Find related (same category, max 3, excluding current)
                const related = list
                  .filter(item => item.category === data.data.category && item._id !== data.data._id)
                  .slice(0, 3);
                setRelatedNews(related);
              }
            })
            .catch(err => console.error('Error fetching navigation list:', err));
            
          setLoading(false);
        } else {
          setError("Actualité introuvable.");
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching article:', err);
        setError("Erreur de connexion au serveur.");
        setLoading(false);
      });
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', color: '#10b981' }}>
          <div style={{ margin: '0 auto 20px', width: '50px', height: '50px', border: '4px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>Chargement de l'actualité...</p>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', padding: '24px' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' }}>
          <div style={{ background: '#fee2e2', color: '#ef4444', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <FileText size={30} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0d4a3e', marginBottom: '12px' }}>Actualité non trouvée</h2>
          <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>{error || "L'article demandé n'existe pas ou a été déplacé."}</p>
          <Link to="/actualites" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
            <ArrowLeft size={16} /> Retour aux actualités
          </Link>
        </div>
      </div>
    );
  }

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(news.title + ' ' + window.location.href)}`,
    email: `mailto:?subject=${encodeURIComponent(news.title)}&body=${encodeURIComponent("Découvrez cet article sur la mairie de Dembéni : " + window.location.href)}`
  };

  const formattedDate = news.createdAt || news.date
    ? new Date(news.createdAt || news.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const coverImageSrc = news.image 
    ? getImageUrl(news.image, FALLBACK_IMG)
    : FALLBACK_IMG;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* ── BREADCRUMB & BACK BUTTON ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 0 24px' }}>
        <Link to="/actualites" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#475569', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, padding: '8px 16px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', transition: 'all 0.2s' }} className="back-btn-hover">
          <ArrowLeft size={16} color="#10b981" /> Retour aux actualités
        </Link>
      </div>

      {/* ── HERO BANNER ── */}
      <section style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 24px' }}>
        <div style={{ position: 'relative', height: '440px', borderRadius: '32px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', boxShadow: '0 20px 40px rgba(13,74,62,0.08)' }}>
          <div style={{ position: 'absolute', inset: 0, background: `url(${coverImageSrc}) center/cover`, zIndex: 1 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,74,62,0.95) 0%, rgba(13,74,62,0.3) 60%, transparent 100%)', zIndex: 2 }} />
          
          <div style={{ position: 'relative', zIndex: 3, padding: '48px', color: 'white', maxWidth: '900px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: '#10b981', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {news.category || 'Actualité'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> {formattedDate}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> {news.readingTime || 3} min de lecture
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: '20px' }}>
              {news.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>{news.authorName || 'Mairie de Dembéni'}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Auteur Officiel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN ARTICLE CONTENT ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'minmax(0, 8fr) minmax(0, 4fr)', gap: '40px' }} className="article-layout-grid">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div style={{ background: 'white', padding: '40px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.01)', textAlign: 'left' }}>
          
          {/* Subtitle / Short Description */}
          {news.description && (
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#334155', lineHeight: 1.6, marginBottom: '32px', paddingLeft: '20px', borderLeft: '4px solid #10b981', fontStyle: 'italic' }}>
              {news.description}
            </p>
          )}

          {/* Full Content */}
          <div 
            style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-line' }} 
            className="article-body-content"
          >
            {news.content}
          </div>

          {/* Optional quote block */}
          {news.content && news.content.length > 500 && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '30px', margin: '40px 0', position: 'relative' }}>
              <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0d4a3e', fontStyle: 'italic', lineHeight: 1.6 }}>
                "La municipalité de Dembéni est pleinement mobilisée pour déployer des infrastructures modernes qui répondent concrètement aux attentes quotidiennes de nos citoyens et stimulent le dynamisme local."
              </p>
              <span style={{ display: 'block', marginTop: '14px', fontSize: '0.85rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                — Secrétariat Général de la Mairie
              </span>
            </div>
          )}

          {/* Documents joints (PDFs) */}
          {news.documents && news.documents.length > 0 && (
            <div style={{ marginTop: '48px', borderTop: '2px dashed #cbd5e1', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#0d4a3e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#10b981" /> Documents joints
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {news.documents.map((doc, idx) => (
                  <a 
                    key={idx} 
                    href={doc.url} 
                    download 
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', textDecoration: 'none', transition: 'all 0.2s' }}
                    className="doc-link-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '8px', borderRadius: '8px' }}>
                        <FileText size={18} />
                      </span>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>{doc.name || `Document Joint ${idx + 1}`}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Format PDF — Téléchargement libre</p>
                      </div>
                    </div>
                    <Download size={18} color="#64748b" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Photo Gallery */}
          {news.gallery && news.gallery.length > 0 && (
            <div style={{ marginTop: '48px', borderTop: '2px dashed #cbd5e1', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#0d4a3e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ImageIcon size={20} color="#10b981" /> Galerie Photos
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                {news.gallery.map((img, idx) => (
                  <div key={idx} style={{ height: '140px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                    <img src={img} alt={`Gallery item ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} className="gallery-img-zoom" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share widget */}
          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={16} /> Partager cette publication :
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href={shareUrls.facebook} target="_blank" rel="noreferrer" style={{ background: '#3b5998', color: 'white', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', textDecoration: 'none' }} className="share-btn" title="Partager sur Facebook">
                <span style={{ fontSize: '0.85rem', fontWeight: 900 }}>f</span>
              </a>
              <a href={shareUrls.whatsapp} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: 'white', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', textDecoration: 'none' }} className="share-btn" title="Partager sur WhatsApp">
                <MessageCircle size={18} />
              </a>
              <a href={shareUrls.email} style={{ background: '#64748b', color: 'white', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', textDecoration: 'none' }} className="share-btn" title="Envoyer par email">
                <Mail size={18} />
              </a>
              <button onClick={handleCopyLink} style={{ background: copied ? '#10b981' : '#f1f5f9', color: copied ? 'white' : '#475569', border: 'none', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Copier le lien">
                <Link2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Info Card */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.01)', textAlign: 'left' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0d4a3e', margin: '0 0 20px 0', borderBottom: '2px solid rgba(16,185,129,0.1)', paddingBottom: '12px' }}>
              Fiche d'Information
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ background: '#f1f5f9', color: '#475569', width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={16} />
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Date de publication</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{formattedDate}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ background: '#f1f5f9', color: '#475569', width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} />
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Auteur</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{news.authorName || 'Mairie de Dembéni'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ background: '#f1f5f9', color: '#475569', width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={16} />
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Temps de lecture</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Environ {news.readingTime || 3} minute(s)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedNews.length > 0 && (
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.01)', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0d4a3e', margin: '0 0 20px 0', borderBottom: '2px solid rgba(16,185,129,0.1)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} color="#10b981" /> Publications Similaires
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {relatedNews.map((item) => (
                  <Link 
                    key={item._id} 
                    to={`/actualites/${item.slug || item._id}`}
                    style={{ display: 'flex', gap: '12px', textDecoration: 'none', transition: 'all 0.2s' }}
                    className="related-item-hover"
                  >
                    <div style={{ width: '64px', height: '64px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={getImageUrl(item.image, FALLBACK_IMG)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = FALLBACK_IMG; }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#334155', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.title}
                      </h5>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                        {new Date(item.createdAt || item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER NAVIGATION (PREV / NEXT) ── */}
      {(prevNews || nextNews) && (
        <section style={{ maxWidth: '1200px', margin: '48px auto 0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
            {prevNews ? (
              <Link 
                to={`/actualites/${prevNews.slug || prevNews._id}`} 
                style={{ display: 'flex', gap: '16px', background: 'white', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.2s', textAlign: 'left' }}
                className="nav-card-hover"
              >
                <div style={{ background: '#f1f5f9', color: '#475569', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChevronLeft size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Publication Précédente</span>
                  <h5 style={{ margin: '4px 0 0 0', fontSize: '0.88rem', fontWeight: 800, color: '#334155', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {prevNews.title}
                  </h5>
                </div>
              </Link>
            ) : <div />}

            {nextNews ? (
              <Link 
                to={`/actualites/${nextNews.slug || nextNews._id}`} 
                style={{ display: 'flex', gap: '16px', background: 'white', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.2s', textAlign: 'right', flexDirection: 'row-reverse' }}
                className="nav-card-hover"
              >
                <div style={{ background: '#f1f5f9', color: '#475569', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChevronRight size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Publication Suivante</span>
                  <h5 style={{ margin: '4px 0 0 0', fontSize: '0.88rem', fontWeight: 800, color: '#334155', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {nextNews.title}
                  </h5>
                </div>
              </Link>
            ) : <div />}
          </div>
        </section>
      )}

      {/* Styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .back-btn-hover:hover { border-color: #10b981 !important; background: rgba(16, 185, 129, 0.02) !important; }
        .doc-link-hover:hover { border-color: #10b981 !important; background: #ffffff !important; box-shadow: 0 10px 20px rgba(16,185,129,0.03); }
        .gallery-img-zoom:hover { transform: scale(1.08); }
        .share-btn:hover { transform: translateY(-3px); opacity: 0.95; }
        .related-item-hover:hover h5 { color: #10b981 !important; }
        .nav-card-hover:hover { border-color: #10b981 !important; box-shadow: 0 10px 20px rgba(16,185,129,0.03); }
        @media (max-width: 768px) {
          .article-layout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default NewsDetailPage;
