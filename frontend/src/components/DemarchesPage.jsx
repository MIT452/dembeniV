import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Shield, MapPin, Phone, Mail, Clock, Plus, Trash2, Edit, X, 
  ArrowRight, Info, CheckCircle2, AlertCircle, FileText, Globe, Heart, 
  Calendar, Check, User, Upload, ArrowUpRight
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DemarchesPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = user && user.role === 'admin';

  // State lists
  const [services, setServices] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pubsLoading, setPubsLoading] = useState(true);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Content Customization (Hero & Stats)
  const [pageContent, setPageContent] = useState({
    title: "Vos démarches administratives simplifiées",
    subtitle: "Accédez facilement aux services municipaux en ligne et effectuez vos démarches administratives rapidement et efficacement.",
    stats: [
      { label: "Services disponibles", value: "+20" },
      { label: "Assistance citoyenne", value: "En ligne" },
      { label: "Accessibilité", value: "24h/24" },
      { label: "Réponses rapides", value: "Délais courts" }
    ],
    btn1Text: "Commencer une démarche",
    btn2Text: "Accéder à l'espace citoyen"
  });

  // Modals & Panels
  const [selectedService, setSelectedService] = useState(null);
  const [activeAdminModal, setActiveAdminModal] = useState(null); // 'add_service', 'edit_service', 'add_pub', 'edit_pub', 'edit_page'
  const [selectedItem, setSelectedItem] = useState(null); // Item to edit
  
  // File Upload inside inline admin panels
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);
  const triggerToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form states
  const [serviceForm, setServiceForm] = useState({
    title: '',
    desc: '',
    fullDesc: '',
    icon: 'FileText',
    img: '',
    category: 'État civil',
    location: 'Mairie de Dembéni',
    hours: 'Lun - Ven : 8h00 - 12h00 / 13h30 - 16h30',
    phone: '02 69 62 15 15',
    email: 'contact@dembeni.fr',
    benefits: '' // String representation of checklist array
  });

  const [pubForm, setPubForm] = useState({
    title: '',
    content: '',
    type: 'information',
    category: 'Services publics',
    status: 'published',
    isPinned: false,
    isFeatured: false,
    isUrgent: false,
    showOnHomepage: false,
    tags: ''
  });

  const categories = [
    { name: 'État civil', icon: 'FileText', color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
    { name: 'Identité & Passeport', icon: 'Shield', color: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
    { name: 'Urbanisme', icon: 'MapPin', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
    { name: 'Élections', icon: 'Globe', color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' },
    { name: 'Santé & Solidarité', icon: 'Heart', color: '#ec4899', bg: 'rgba(236,72,153,0.06)' },
    { name: 'Éducation', icon: 'FileText', color: '#6366f1', bg: 'rgba(99,102,241,0.06)' },
    { name: 'Environnement', icon: 'Globe', color: '#14b8a6', bg: 'rgba(20,184,166,0.06)' },
    { name: 'Vie citoyenne', icon: 'User', color: '#0f766e', bg: 'rgba(15,118,110,0.06)' },
    { name: 'Culture & Patrimoine', icon: 'FileText', color: '#a855f7', bg: 'rgba(168,85,247,0.06)' },
    { name: 'Services techniques', icon: 'Shield', color: '#64748b', bg: 'rgba(100,116,139,0.06)' }
  ];

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/services`);
      if (res.data && res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error("Erreur chargement services:", err);
      triggerToast("Impossible de charger les démarches", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPublications = async () => {
    try {
      setPubsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/publications?category=Services publics&status=published`);
      if (res.data && res.data.success) {
        setPublications(res.data.data);
      }
    } catch (err) {
      console.error("Erreur chargement actualités administratives:", err);
    } finally {
      setPubsLoading(false);
    }
  };

  const fetchPageContent = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/content-sections/demarches_page`);
      if (res.data && res.data.success && res.data.data) {
        const doc = res.data.data;
        setPageContent({
          title: doc.title || pageContent.title,
          subtitle: doc.subtitle || pageContent.subtitle,
          stats: Array.isArray(doc.items) ? doc.items : pageContent.stats,
          btn1Text: doc.buttons?.[0]?.text || pageContent.btn1Text,
          btn2Text: doc.buttons?.[1]?.text || pageContent.btn2Text
        });
      }
    } catch (err) {
      console.log("No custom content section found for demarches_page, using defaults.");
    }
  };

  useEffect(() => {
    fetchData();
    fetchPublications();
    fetchPageContent();
  }, []);

  // Filter & Search Logic
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'all') {
      return matchesSearch;
    }
    return matchesSearch && service.category === activeCategory;
  });

  const getCategoryCount = (categoryName) => {
    return services.filter(s => s.category === categoryName).length;
  };

  // Suggestions list
  const suggestions = searchQuery 
    ? services.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  // Service CRUD handlers
  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const payload = {
        ...serviceForm,
        benefits: serviceForm.benefits ? serviceForm.benefits.split(',').map(b => b.trim()).filter(b => b) : []
      };

      if (activeAdminModal === 'add_service') {
        const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/services`, payload, { headers });
        if (res.data.success) {
          triggerToast("Démarche ajoutée avec succès");
          setServices([...services, res.data.data]);
        }
      } else {
        const res = await axios.put(`${import.meta.env.VITE_API_URL || ''}/api/services/${selectedItem._id}`, payload, { headers });
        if (res.data.success) {
          triggerToast("Démarche mise à jour");
          setServices(services.map(s => s._id === selectedItem._id ? res.data.data : s));
        }
      }
      setActiveAdminModal(null);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur lors de la sauvegarde", "error");
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette démarche ?")) return;
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.delete(`${import.meta.env.VITE_API_URL || ''}/api/services/${id}`, { headers });
      triggerToast("Démarche supprimée");
      setServices(services.filter(s => s._id !== id));
      if (selectedService?._id === id) setSelectedService(null);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur lors de la suppression", "error");
    }
  };

  // Public/Admin News CRUD handlers
  const handleSavePublication = async (e) => {
    e.preventDefault();
    try {
      const headers = { 
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'multipart/form-data'
      };
      
      const formData = new FormData();
      formData.append('title', pubForm.title);
      formData.append('content', pubForm.content);
      formData.append('type', pubForm.type);
      formData.append('category', pubForm.category);
      formData.append('status', pubForm.status);
      formData.append('isFeatured', pubForm.isFeatured);
      formData.append('isPinned', pubForm.isPinned);
      formData.append('isUrgent', pubForm.isUrgent);
      formData.append('showOnHomepage', pubForm.showOnHomepage);
      formData.append('tags', pubForm.tags);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      if (activeAdminModal === 'add_pub') {
        const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/publications`, formData, { headers });
        if (res.data.success) {
          triggerToast("Actualité publiée avec succès");
          setPublications([res.data.data, ...publications]);
        }
      } else {
        const res = await axios.put(`${import.meta.env.VITE_API_URL || ''}/api/publications/${selectedItem._id}`, formData, { headers });
        if (res.data.success) {
          triggerToast("Actualité mise à jour");
          setPublications(publications.map(p => p._id === selectedItem._id ? res.data.data : p));
        }
      }
      setActiveAdminModal(null);
      setSelectedItem(null);
      setSelectedFile(null);
      setFilePreview('');
    } catch (err) {
      console.error(err);
      triggerToast("Erreur lors de la publication de l'actualité", "error");
    }
  };

  const handleDeletePublication = async (id) => {
    if (!window.confirm("Supprimer cette actualité ?")) return;
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.delete(`${import.meta.env.VITE_API_URL || ''}/api/publications/${id}`, { headers });
      triggerToast("Actualité supprimée");
      setPublications(publications.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      triggerToast("Erreur de suppression", "error");
    }
  };

  // Custom text configuration CRUD handler
  const handleSavePageContent = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const payload = {
        key: 'demarches_page',
        title: pageContent.title,
        subtitle: pageContent.subtitle,
        items: pageContent.stats,
        buttons: [
          { text: pageContent.btn1Text, style: 'primary' },
          { text: pageContent.btn2Text, style: 'secondary' }
        ]
      };
      await axios.put(`${import.meta.env.VITE_API_URL || ''}/api/content-sections/demarches_page`, payload, { headers });
      triggerToast("Contenu de la page mis à jour !");
      setActiveAdminModal(null);
    } catch (err) {
      // If it doesn't exist, create it
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const payload = {
          key: 'demarches_page',
          title: pageContent.title,
          subtitle: pageContent.subtitle,
          items: pageContent.stats,
          buttons: [
            { text: pageContent.btn1Text, style: 'primary' },
            { text: pageContent.btn2Text, style: 'secondary' }
          ]
        };
        await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/content-sections`, payload, { headers });
        triggerToast("Contenu de la page initialisé et enregistré !");
        setActiveAdminModal(null);
      } catch (postErr) {
        console.error(postErr);
        triggerToast("Erreur lors de la sauvegarde du contenu", "error");
      }
    }
  };

  const getIconComponent = (iconName, color = '#475569') => {
    switch (iconName) {
      case 'Shield': return <Shield size={22} style={{ color }} />;
      case 'MapPin': return <MapPin size={22} style={{ color }} />;
      case 'Globe': return <Globe size={22} style={{ color }} />;
      case 'Heart': return <Heart size={22} style={{ color }} />;
      default: return <FileText size={22} style={{ color }} />;
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              top: '90px',
              right: '24px',
              zIndex: 9999,
              background: toast.type === 'success' ? '#10b981' : '#ef4444',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '700'
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Controls Panel */}
      {isAdmin && (
        <div style={{ background: '#0b3d2e', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#16c47f', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>Mode Administrateur</span>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Personnalisez entièrement la page des démarches</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                setServiceForm({ title: '', desc: '', fullDesc: '', icon: 'FileText', img: '', category: 'État civil', location: 'Mairie de Dembéni', hours: 'Lun - Ven : 8h00 - 12h00 / 13h30 - 16h30', phone: '02 69 62 15 15', email: 'contact@dembeni.fr', benefits: '' });
                setActiveAdminModal('add_service');
              }}
              style={{ background: '#16c47f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'transform 0.2s' }}
              className="admin-btn"
            >
              <Plus size={14} /> Ajouter une démarche
            </button>
            <button 
              onClick={() => {
                setPubForm({ title: '', content: '', type: 'information', category: 'Services publics', status: 'published', isPinned: false, isFeatured: false, isUrgent: false, showOnHomepage: false, tags: '' });
                setSelectedFile(null);
                setFilePreview('');
                setActiveAdminModal('add_pub');
              }}
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Publier actualité administrative
            </button>
            <button 
              onClick={() => setActiveAdminModal('edit_page')}
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '8px 16px', borderRadius: '8px', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit size={14} /> Éditer Hero & Stats
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section style={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #0b3d2e 0%, #16c47f 40%, #ffffff 100%)', 
        padding: '80px 24px 60px 24px', 
        color: 'white', 
        textAlign: 'left',
        overflow: 'hidden'
      }}>
        {/* Soft grid lines overlay for dynamic texture */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, pointerEvents: 'none', background: 'radial-gradient(circle, #000 10%, transparent 11%)', backgroundSize: '16px 16px' }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '40px', position: 'relative', zIndex: 2 }}>
          <div>
            <span style={{ background: 'rgba(255, 255, 255, 0.18)', color: 'white', padding: '6px 14px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🏛️ Portail Officiel de Services Publics
            </span>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.15, marginTop: '16px', marginBottom: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {pageContent.title}
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#f1f5f9', maxWidth: '650px', lineHeight: 1.5, marginBottom: '28px' }}>
              {pageContent.subtitle}
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  const target = document.getElementById('procedure-directory');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ background: 'white', color: '#0b3d2e', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}
              >
                {pageContent.btn1Text} <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => navigate(user ? '/compte' : '/user-login')}
                style={{ background: 'rgba(11, 61, 46, 0.5)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
              >
                {pageContent.btn2Text} <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          {/* Statistics Strip */}
          <div style={{ 
            background: 'rgba(255,255,255,0.08)', 
            backdropFilter: 'blur(16px)', 
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '24px', 
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
          }}>
            {pageContent.stats.map((stat, index) => (
              <div key={index} style={{ borderRight: index < pageContent.stats.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingRight: '12px' }}>
                <span style={{ display: 'block', fontSize: '2rem', fontWeight: 900, color: 'white' }}>{stat.value}</span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase' }}>{stat.label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SEARCH AND CATEGORY BAR */}
      <section id="procedure-directory" style={{ maxWidth: '1200px', margin: '-40px auto 0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* Instant Intelligent Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'white', 
            borderRadius: '20px', 
            padding: '12px 24px',
            boxShadow: '0 15px 30px rgba(13, 74, 62, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <Search size={22} style={{ color: '#94a3b8', marginRight: '16px' }} />
            <input 
              type="text" 
              placeholder="Rechercher une démarche, un document ou un service..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '1.05rem',
                fontWeight: '600',
                color: '#1e293b'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: '105%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  zIndex: 999,
                  overflow: 'hidden',
                  textAlign: 'left'
                }}
              >
                <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Suggestions de recherche rapide :
                </div>
                {suggestions.map(s => (
                  <div 
                    key={s._id}
                    onClick={() => {
                      setSearchQuery(s.title);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.2s'
                    }}
                    className="suggestion-item"
                    onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <span>{s.title}</span>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {s.category}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Categories Horizontal Tabs */}
        <div style={{ 
          marginTop: '28px', 
          display: 'flex', 
          gap: '10px', 
          overflowX: 'auto', 
          paddingBottom: '8px',
          alignItems: 'center',
          scrollbarWidth: 'none'
        }} className="category-tabs-container">
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '10px 18px',
              borderRadius: '25px',
              border: activeCategory === 'all' ? '1px solid #16c47f' : '1px solid #e2e8f0',
              background: activeCategory === 'all' ? '#16c47f' : 'white',
              color: activeCategory === 'all' ? 'white' : '#475569',
              fontWeight: '750',
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              boxShadow: activeCategory === 'all' ? '0 4px 10px rgba(22, 196, 127, 0.2)' : 'none'
            }}
          >
            Tous les services ({services.length})
          </button>
          
          {categories.map((cat, idx) => {
            const count = getCategoryCount(cat.name);
            return (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat.name)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '25px',
                  border: activeCategory === cat.name ? `1px solid ${cat.color}` : '1px solid #e2e8f0',
                  background: activeCategory === cat.name ? cat.color : 'white',
                  color: activeCategory === cat.name ? 'white' : '#475569',
                  fontWeight: '750',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: activeCategory === cat.name ? `0 4px 10px ${cat.color}25` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {getIconComponent(cat.icon, activeCategory === cat.name ? 'white' : cat.color)}
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>

      </section>

      {/* PROCEDURAL DIRECTORY GRID */}
      <section style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 24px 60px 24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', textAlign: 'left' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0b3d2e', margin: 0 }}>
              {activeCategory === 'all' ? 'Toutes les démarches disponibles' : `Rubrique : ${activeCategory}`}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Sélectionnez une démarche pour initier la procédure officielle ou consulter ses détails.
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>
            {filteredServices.length} démarche{filteredServices.length > 1 ? 's' : ''} trouvée{filteredServices.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #16c47f', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.9rem' }}>Récupération des données en cours...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '60px 24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <Info size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <h4 style={{ margin: 0, color: '#64748b', fontWeight: '800' }}>Aucun service ne correspond à vos critères de recherche.</h4>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              style={{ marginTop: '16px', background: '#16c47f', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            {filteredServices.map(service => {
              const matchingCat = categories.find(c => c.name === service.category);
              const color = matchingCat?.color || '#16c47f';
              const bg = matchingCat?.bg || 'rgba(22, 196, 127, 0.05)';
              
              return (
                <div 
                  key={service._id} 
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                  className="procedure-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(11, 61, 46, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                  }}
                >
                  <div>
                    {/* Header: Icon and Category Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ 
                        background: bg, 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        {getIconComponent(service.icon, color)}
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        color,
                        background: bg,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}>
                        {service.category}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0b3d2e', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                      {service.title}
                    </h3>
                    
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.45', margin: '0 0 16px 0', minHeight: '40px' }}>
                      {service.desc}
                    </p>

                    {/* Delay marker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', marginBottom: '20px' }}>
                      <Clock size={12} style={{ color: '#16c47f' }} />
                      <span>Délai moyen : <strong>{service.hours ? service.hours.split('/')[0].trim().substring(0, 15) : 'Quelques jours'}</strong></span>
                    </div>
                  </div>

                  {/* Actions & Admin Overlays */}
                  <div>
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <button 
                        onClick={() => navigate(user ? '/compte' : '/user-login')}
                        style={{ flex: 1, background: '#16c47f', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        Accéder
                      </button>
                      <button 
                        onClick={() => setSelectedService(service)}
                        style={{ flex: 1, background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 14px', borderRadius: '10px', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Détails
                      </button>
                    </div>

                    {/* Inline Admin editing overlay */}
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', background: '#0b3d2e', padding: '8px', borderRadius: '10px' }}>
                        <button 
                          onClick={() => {
                            setSelectedItem(service);
                            setServiceForm({
                              title: service.title,
                              desc: service.desc,
                              fullDesc: service.fullDesc || '',
                              icon: service.icon || 'FileText',
                              img: service.img || '',
                              category: service.category,
                              location: service.location || 'Mairie de Dembéni',
                              hours: service.hours || '',
                              phone: service.phone || '',
                              email: service.email || '',
                              benefits: Array.isArray(service.benefits) ? service.benefits.join(', ') : service.benefits || ''
                            });
                            setActiveAdminModal('edit_service');
                          }}
                          style={{ flex: 1, padding: '4px 0', fontSize: '0.72rem', fontWeight: 800, background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
                        >
                          <Edit size={10} /> Éditer
                        </button>
                        <button 
                          onClick={() => handleDeleteService(service._id)}
                          style={{ flex: 1, padding: '4px 0', fontSize: '0.72rem', fontWeight: 800, background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
                        >
                          <Trash2 size={10} /> Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION INFORMATIONS UTILES */}
      <section style={{ background: 'white', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
          <span style={{ color: '#16c47f', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assistance Locale & Contacts</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0b3d2e', marginTop: '6px', marginBottom: '32px' }}>
            Informations administratives utiles
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            
            {/* Horaires */}
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ background: 'rgba(22, 196, 127, 0.1)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyIntersection: 'center', justifyContent: 'center', color: '#16c47f', marginBottom: '16px' }}>
                <Clock size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0b3d2e', margin: '0 0 8px 0' }}>Horaires de la Mairie</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                Lundi au Jeudi : 7h30 - 12h00 / 13h00 - 16h15<br />
                Vendredi : 7h30 - 11h30 (Fermé l'après-midi)<br />
                <strong>Guichet État-Civil : accessible sans rendez-vous en matinée.</strong>
              </p>
            </div>

            {/* Documents */}
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyIntersection: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '16px' }}>
                <FileText size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0b3d2e', margin: '0 0 8px 0' }}>Documents génériques requis</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                Pour la plupart des actes, munissez-vous de :<br />
                • Pièce d'identité valide (CNI ou Passeport)<br />
                • Justificatif de domicile de moins de 3 mois<br />
                • Livret de famille si applicable.
              </p>
            </div>

            {/* Assistance */}
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyIntersection: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '16px' }}>
                <Phone size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0b3d2e', margin: '0 0 8px 0' }}>Support & Numéros Utiles</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                Service Relations Citoyens : <strong>02 69 62 15 15</strong><br />
                Permanence État Civil : <strong>02 69 62 15 16</strong><br />
                Courriel : <a href="mailto:contact@dembeni.fr" style={{ color: '#16c47f', textDecoration: 'none', fontWeight: 700 }}>contact@dembeni.fr</a>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION ACTUALITES ADMINISTRATIVES (DYNAMIQUE) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span style={{ color: '#16c47f', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dernières informations</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0b3d2e', marginTop: '6px', margin: 0 }}>
              Actualités & Alertes Administratives
            </h2>
          </div>
        </div>

        {pubsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #16c47f', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : publications.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontWeight: 650, margin: 0 }}>Aucune annonce ou alerte administrative récente disponible.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {publications.map(pub => (
              <div 
                key={pub._id} 
                style={{ 
                  background: 'white', 
                  borderRadius: '20px', 
                  border: '1px solid #e2e8f0', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                }}
              >
                <div style={{ height: '180px', position: 'relative', width: '100%', background: '#eaeaea' }}>
                  <img 
                    src={pub.image ? (pub.image.startsWith('/public/') ? `${import.meta.env.VITE_API_URL || ''}${pub.image}` : pub.image) : 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'} 
                    alt={pub.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  {pub.isUrgent && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>🚨 URGENT</span>
                  )}
                </div>
                
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyIntersection: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#16c47f', background: 'rgba(22, 196, 127, 0.08)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {pub.type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                        📅 {new Date(pub.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#0b3d2e', margin: '0 0 10px 0', lineHeight: '1.35' }}>
                      {pub.title}
                    </h3>
                    
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                      {pub.content?.substring(0, 150)}...
                    </p>
                  </div>

                  {/* Actions for Admin in actualités */}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '16px' }}>
                      <button
                        onClick={() => {
                          setSelectedItem(pub);
                          setPubForm({
                            title: pub.title,
                            content: pub.content,
                            type: pub.type,
                            category: pub.category,
                            status: pub.status,
                            isPinned: pub.isPinned || false,
                            isFeatured: pub.isFeatured || false,
                            isUrgent: pub.isUrgent || false,
                            showOnHomepage: pub.showOnHomepage || false,
                            tags: pub.tags ? pub.tags.join(', ') : ''
                          });
                          setSelectedFile(null);
                          setFilePreview(pub.image ? (pub.image.startsWith('/public/') ? `${import.meta.env.VITE_API_URL || ''}${pub.image}` : pub.image) : '');
                          setActiveAdminModal('edit_pub');
                        }}
                        style={{ flex: 1, padding: '6px 0', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '750', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
                      >
                        <Edit size={12} /> Modifier
                      </button>
                      <button
                        onClick={() => handleDeletePublication(pub._id)}
                        style={{ flex: 1, padding: '6px 0', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '750', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
                      >
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DETAILED SERVICE MODAL (Citoyen Detail View Drawer) */}
      <AnimatePresence>
        {selectedService && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(11, 61, 46, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }} onClick={() => setSelectedService(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                textAlign: 'left'
              }}
            >
              {/* Image banner */}
              <div style={{ height: '200px', position: 'relative', background: '#0b3d2e' }}>
                <img 
                  src={selectedService.img || 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&w=800&q=80'} 
                  alt={selectedService.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} 
                />
                <button 
                  onClick={() => setSelectedService(null)}
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
                <div style={{ position: 'absolute', bottom: '16px', left: '20px' }}>
                  <span style={{ fontSize: '0.72rem', background: '#16c47f', color: 'white', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', fontWeight: 800 }}>
                    {selectedService.category}
                  </span>
                </div>
              </div>

              {/* Body info */}
              <div style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0b3d2e', margin: '0 0 12px 0' }}>
                  {selectedService.title}
                </h3>
                
                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                  {selectedService.fullDesc || selectedService.desc}
                </p>

                {/* Checklist (Benefits / Required documents) */}
                {selectedService.benefits && selectedService.benefits.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0b3d2e', marginBottom: '12px', textTransform: 'uppercase' }}>Documents à fournir :</h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {selectedService.benefits.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                          <Check size={14} style={{ color: '#16c47f', marginTop: '3px', flexShrink: 0 }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical Information */}
                <div style={{ 
                  background: '#f8fafc', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '28px',
                  fontSize: '0.82rem',
                  color: '#475569'
                }}>
                  <div>
                    <span style={{ fontWeight: '800', color: '#0b3d2e', display: 'block', marginBottom: '4px' }}>📍 Lieu d'instruction :</span>
                    <span>{selectedService.location || 'Mairie de Dembéni'}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '800', color: '#0b3d2e', display: 'block', marginBottom: '4px' }}>📅 Horaires d'accueil :</span>
                    <span>{selectedService.hours || 'Lun - Ven: 8h - 12h'}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '800', color: '#0b3d2e', display: 'block', marginBottom: '4px' }}>📞 Contact Direct :</span>
                    <span>{selectedService.phone || '02 69 62 15 15'}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '800', color: '#0b3d2e', display: 'block', marginBottom: '4px' }}>✉️ E-mail Service :</span>
                    <span>{selectedService.email || 'contact@dembeni.fr'}</span>
                  </div>
                </div>

                {/* Bottom actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => navigate(user ? '/compte' : '/user-login')}
                    style={{ flex: 2, background: '#16c47f', color: 'white', border: 'none', padding: '14px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    Déposer une demande en ligne
                  </button>
                  <button 
                    onClick={() => setSelectedService(null)}
                    style={{ flex: 1, background: '#cbd5e1', color: '#1e293b', border: 'none', padding: '14px 20px', borderRadius: '12px', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Fermer
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN SERVICE EDIT/ADD MODAL */}
      <AnimatePresence>
        {(activeAdminModal === 'add_service' || activeAdminModal === 'edit_service') && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }} onClick={() => setActiveAdminModal(null)}>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                textAlign: 'left'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0b3d2e', marginBottom: '20px', display: 'flex', justifyIntersection: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{activeAdminModal === 'add_service' ? 'Créer une nouvelle démarche' : 'Modifier la démarche'}</span>
                <X size={18} style={{ cursor: 'pointer' }} onClick={() => setActiveAdminModal(null)} />
              </h3>

              <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Titre du service / Démarche *</label>
                  <input 
                    type="text" 
                    value={serviceForm.title} 
                    onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} 
                    placeholder="Ex: Acte de naissance" 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Catégorie *</label>
                    <select 
                      value={serviceForm.category}
                      onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Icône Lucide</label>
                    <select 
                      value={serviceForm.icon}
                      onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="FileText">Document (FileText)</option>
                      <option value="Shield">Identité (Shield)</option>
                      <option value="MapPin">Localisation (MapPin)</option>
                      <option value="Globe">Mondial (Globe)</option>
                      <option value="Heart">Santé / Cœur (Heart)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Description courte *</label>
                  <input 
                    type="text" 
                    value={serviceForm.desc} 
                    onChange={e => setServiceForm({ ...serviceForm, desc: e.target.value })} 
                    placeholder="Une courte explication affichée sur la carte..." 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Description détaillée / Instructions</label>
                  <textarea 
                    rows={4}
                    value={serviceForm.fullDesc} 
                    onChange={e => setServiceForm({ ...serviceForm, fullDesc: e.target.value })} 
                    placeholder="Détails complets de la procédure, étapes..." 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Pièces à fournir (séparées par des virgules)</label>
                  <input 
                    type="text" 
                    value={serviceForm.benefits} 
                    onChange={e => setServiceForm({ ...serviceForm, benefits: e.target.value })} 
                    placeholder="Ex: CNI, Justificatif de domicile, Photo d'identité" 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Lieu d'instruction</label>
                    <input 
                      type="text" 
                      value={serviceForm.location} 
                      onChange={e => setServiceForm({ ...serviceForm, location: e.target.value })} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Délai d'obtention moyen / Horaires</label>
                    <input 
                      type="text" 
                      value={serviceForm.hours} 
                      onChange={e => setServiceForm({ ...serviceForm, hours: e.target.value })} 
                      placeholder="Ex: 3 jours / Lun - Ven"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Image URL</label>
                    <input 
                      type="text" 
                      value={serviceForm.img} 
                      onChange={e => setServiceForm({ ...serviceForm, img: e.target.value })} 
                      placeholder="https://images.unsplash.com/..."
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Téléphone Direct</label>
                    <input 
                      type="text" 
                      value={serviceForm.phone} 
                      onChange={e => setServiceForm({ ...serviceForm, phone: e.target.value })} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  style={{ background: '#16c47f', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}
                >
                  Sauvegarder les modifications
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN PUBLICATION EDIT/ADD MODAL */}
      <AnimatePresence>
        {(activeAdminModal === 'add_pub' || activeAdminModal === 'edit_pub') && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }} onClick={() => setActiveAdminModal(null)}>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                textAlign: 'left'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0b3d2e', marginBottom: '20px', display: 'flex', justifyIntersection: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{activeAdminModal === 'add_pub' ? 'Créer une actualité administrative' : 'Modifier l\'actualité administrative'}</span>
                <X size={18} style={{ cursor: 'pointer' }} onClick={() => setActiveAdminModal(null)} />
              </h3>

              <form onSubmit={handleSavePublication} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Titre *</label>
                  <input 
                    type="text" 
                    value={pubForm.title} 
                    onChange={e => setPubForm({ ...pubForm, title: e.target.value })} 
                    placeholder="Ex: Élections Municipales Partielles 2026" 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Contenu *</label>
                  <textarea 
                    rows={5}
                    value={pubForm.content} 
                    onChange={e => setPubForm({ ...pubForm, content: e.target.value })} 
                    placeholder="Rédigez l'annonce officielle ici..." 
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Drag and Drop File Zone */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Image d'illustration (JPG, JPEG, PNG, WEBP)</label>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        setSelectedFile(file);
                        setFilePreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{
                      border: isDragOver ? '2px dashed #16c47f' : '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      background: isDragOver ? 'rgba(22, 196, 127, 0.05)' : '#f8fafc',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => document.getElementById('admin-pub-file-input').click()}
                  >
                    <input 
                      type="file" 
                      id="admin-pub-file-input" 
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedFile(file);
                          setFilePreview(URL.createObjectURL(file));
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    
                    {filePreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <img src={filePreview} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', background: '#000', borderRadius: '6px' }} />
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Glissez-déposez un nouveau fichier pour remplacer</span>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                        <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Glissez l'image ici ou cliquez pour la sélectionner</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Type</label>
                    <select 
                      value={pubForm.type}
                      onChange={e => setPubForm({ ...pubForm, type: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="actualite">Actualité</option>
                      <option value="annonce">Annonce officielle</option>
                      <option value="information">Information publique</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Paramètres</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={pubForm.isUrgent} onChange={e => setPubForm({ ...pubForm, isUrgent: e.target.checked })} />
                        🚨 Urgent
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={pubForm.showOnHomepage} onChange={e => setPubForm({ ...pubForm, showOnHomepage: e.target.checked })} />
                        🏠 Afficher sur l'accueil
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}
                >
                  Sauvegarder l'actualité
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN TITLE/HERO CONFIG MODAL */}
      <AnimatePresence>
        {activeAdminModal === 'edit_page' && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }} onClick={() => setActiveAdminModal(null)}>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                textAlign: 'left'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0b3d2e', marginBottom: '20px', display: 'flex', justifyIntersection: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Éditer la mise en page (Déméches)</span>
                <X size={18} style={{ cursor: 'pointer' }} onClick={() => setActiveAdminModal(null)} />
              </h3>

              <form onSubmit={handleSavePageContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Titre Principal du Hero *</label>
                  <input 
                    type="text" 
                    value={pageContent.title} 
                    onChange={e => setPageContent({ ...pageContent, title: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Sous-titre / Description *</label>
                  <textarea 
                    rows={3}
                    value={pageContent.subtitle} 
                    onChange={e => setPageContent({ ...pageContent, subtitle: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Texte Bouton 1</label>
                    <input 
                      type="text" 
                      value={pageContent.btn1Text} 
                      onChange={e => setPageContent({ ...pageContent, btn1Text: e.target.value })} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Texte Bouton 2</label>
                    <input 
                      type="text" 
                      value={pageContent.btn2Text} 
                      onChange={e => setPageContent({ ...pageContent, btn2Text: e.target.value })} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '10px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0b3d2e', marginBottom: '12px' }}>Chiffres clés & Statistiques du Hero</h4>
                  
                  {pageContent.stats.map((stat, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        value={stat.value} 
                        onChange={(e) => {
                          const newStats = [...pageContent.stats];
                          newStats[idx].value = e.target.value;
                          setPageContent({ ...pageContent, stats: newStats });
                        }}
                        placeholder="Valeur (Ex: +20)" 
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <input 
                        type="text" 
                        value={stat.label} 
                        onChange={(e) => {
                          const newStats = [...pageContent.stats];
                          newStats[idx].label = e.target.value;
                          setPageContent({ ...pageContent, stats: newStats });
                        }}
                        placeholder="Label (Ex: Services disponibles)" 
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  ))}
                </div>

                <button 
                  type="submit"
                  style={{ background: '#0b3d2e', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}
                >
                  Enregistrer les configurations de page
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DemarchesPage;
