import React, { useState, useEffect } from 'react';
import { Info, ArrowRight, Calendar, MapPin, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const SubPage = ({ title, subtitle, items = [], category }) => {
  const [dynPublications, setDynPublications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category) return;
    const fetchCategoryPubs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/publications?category=${encodeURIComponent(category)}&status=published`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.success && Array.isArray(data.data)) {
            setDynPublications(data.data);
          }
        }
      } catch (err) {
        console.error("Erreur de chargement des publications par catégorie:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryPubs();
  }, [category]);

  return (
    <div className="sub-page">
      {/* Hero */}
      <section className="hero-section" style={{ height: '400px' }}>
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title" style={{ fontSize: '3rem' }}>{title}</h1>
          <p className="hero-desc">{subtitle}</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-container">
        {items.length > 0 ? (
          <div className="cards-grid">
            {items.map((item, i) => (
              <div key={i} className="feature-card">
                <div className="card-icon">{item.icon}</div>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-desc">{item.description}</p>
                <div className="card-arrow"><ArrowRight size={16} /></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <Info size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
            <p>Le contenu informatif de cette section est en cours de mise à jour par les services municipaux.</p>
          </div>
        )}
      </section>

      {/* Dynamic Publications Section if Category is defined */}
      {category && (
        <section className="section-container" style={{ paddingTop: '0', marginTop: '-40px', paddingBottom: '80px', textAlign: 'left' }}>
          <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', marginBottom: '60px' }} />
          
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '6px 14px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={12} /> Espace d'information officiel
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f3c28', marginTop: '12px' }}>
              Publications & Communiqués <span>{category}</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '8px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              Découvrez en temps réel toutes les annonces, actualités et projets officiels publiés par la Mairie de Dembéni.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #10b981', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
              <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.88rem' }}>Chargement en direct...</p>
            </div>
          ) : dynPublications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
              <Info size={40} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
              <p style={{ color: '#64748b', fontWeight: 700, margin: 0 }}>Aucun communiqué officiel n'a été publié récemment sous la rubrique "{category}".</p>
            </div>
          ) : (
            <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {dynPublications.map((pub) => (
                <div key={pub._id} className="feature-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', transition: 'all 0.3s ease' }}>
                  <div style={{ height: '180px', position: 'relative', width: '100%' }}>
                    <img 
                      src={pub.image || 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&w=800&q=80'} 
                      alt={pub.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    {pub.isUrgent && (
                      <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>🚨 ALERTE</span>
                    )}
                  </div>
                  
                  <div style={{ padding: '24px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {pub.type || 'COMMUNICATION'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                          📅 {pub.createdAt ? new Date(pub.createdAt).toLocaleDateString('fr-FR') : ''}
                        </span>
                      </div>
                      
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0f3c28', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                        {pub.title}
                      </h3>
                      
                      <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', margin: '0' }}>
                        {pub.content}
                      </p>
                    </div>

                    {pub.type === 'evenement' && pub.eventDate && (
                      <div style={{ fontSize: '0.78rem', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginTop: '16px', border: '1px solid #e2e8f0', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} style={{ color: '#10b981' }} />
                          <span>Date : <strong>{new Date(pub.eventDate).toLocaleDateString('fr-FR')}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <MapPin size={13} style={{ color: '#10b981' }} />
                          <span>Lieu : <strong>{pub.eventLocation || 'Non spécifié'}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default SubPage;
