import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Plus, Edit, Trash2, MapPin, Clock, DollarSign, Calendar, TrendingUp, 
  CheckCircle2, ChevronRight, Upload, X, Link as LinkIcon, FileDown, 
  Play, Image as ImageIcon, Map, Layers, ChevronDown, Check, ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'Urbanisme', 
  'Éducation', 
  'Santé', 
  'Environnement', 
  'Numérique', 
  'Culture', 
  'Jeunesse', 
  'Routes & Infrastructures'
];

const STATUSES = ['En cours', 'Terminé', 'Futur'];

const ProjetPage = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user && user.role === 'admin';

  // Projects State
  const [projets, setProjets] = useState([]);
  const [featuredProjet, setFeaturedProjet] = useState(null);
  const [phareProjet, setPhareProjet] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    termines: 0,
    futurs: 0,
    avgProgress: 0,
    totalBudget: '35.1 M€' // Mocked total budget or dynamically calculated
  });

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedStatus, setSelectedStatus] = useState('Tous');

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected project for details view
  const [activeProject, setActiveProject] = useState(null);

  // Related publications state
  const [relatedNews, setRelatedNews] = useState([]);

  // Map state
  const [hoveredMapPin, setHoveredMapPin] = useState(null);

  // Admin Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Admin Hero Edit Modal State
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [heroConfig, setHeroConfig] = useState({
    title: "Les grands projets de la commune de Dembéni",
    subtitle: "Développement durable, infrastructures d'avenir et modernisation de notre territoire pour améliorer le cadre de vie de tous les citoyens.",
    bgImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1600"
  });

  // Project Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFullDescription, setFormFullDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Urbanisme');
  const [formStatus, setFormStatus] = useState('En cours');
  const [formBudget, setFormBudget] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const [formLocation, setFormLocation] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState('');

  // Complex array Form fields
  const [formObjectives, setFormObjectives] = useState(['']);
  const [formTimeline, setFormTimeline] = useState([{ label: '', date: '', done: false }]);
  const [formDocuments, setFormDocuments] = useState([{ name: '', url: '' }]);
  const [formVideos, setFormVideos] = useState(['']);
  const [formGalleryFiles, setFormGalleryFiles] = useState([]);
  const [formGalleryPreviews, setFormGalleryPreviews] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);

  // Active Photo in details modal gallery
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const projetsRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/projets?published=all`);
      const projetsData = await projetsRes.json();
      
      if (projetsData.success) {
        setProjets(projetsData.data);
        
        // Featured project (at the Une in Hero)
        const featured = projetsData.data.find(p => p.isFeatured) || projetsData.data[0];
        setFeaturedProjet(featured);

        // Phare project (middle banner showcase)
        const phare = projetsData.data.find(p => p.progress > 40 && !p.isFeatured) || projetsData.data[1] || projetsData.data[0];
        setPhareProjet(phare);
      }

      // Fetch statistics
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/projets/stats`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        // Compute sum of budgets if they are formatted like "12,5 M€" or "3,2 M€"
        let totalBudgetValue = 35.1;
        if (projetsData.success && projetsData.data.length > 0) {
          let sum = 0;
          projetsData.data.forEach(p => {
            const num = parseFloat(p.budget?.replace(',', '.').replace(/[^0-9.]/g, ''));
            if (!isNaN(num)) sum += num;
          });
          if (sum > 0) totalBudgetValue = Math.round(sum * 10) / 10;
        }

        setStats({
          ...statsData.data,
          totalBudget: `${totalBudgetValue} M€`
        });
      }

      // Fetch config if saved in content sections
      const configRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/content-sections/projets_page`);
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.success && configData.data) {
          setHeroConfig({
            title: configData.data.title || heroConfig.title,
            subtitle: configData.data.subtitle || heroConfig.subtitle,
            bgImage: configData.data.bgImage || heroConfig.bgImage
          });
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch news related to project category/title when activeProject changes
  useEffect(() => {
    if (!activeProject) {
      setRelatedNews([]);
      return;
    }
    const fetchRelatedNews = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/publications?status=published`);
        const data = await res.json();
        if (data.success) {
          const projectKeywords = activeProject.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const filtered = data.data.filter(pub => {
            const matchesCategory = pub.category.toLowerCase() === activeProject.category.toLowerCase();
            const matchesContent = projectKeywords.some(keyword => 
              pub.title.toLowerCase().includes(keyword) || pub.content.toLowerCase().includes(keyword)
            );
            return matchesCategory || matchesContent;
          });
          setRelatedNews(filtered.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching related news:', err);
      }
    };
    fetchRelatedNews();
  }, [activeProject]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormImage(file);
      setFormImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormGalleryFiles(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setFormGalleryPreviews(prev => [...prev, ...previews]);
    }
  };

  const removeGalleryPreview = (index) => {
    setFormGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setFormGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = async (imagePath) => {
    if (!window.confirm('Voulez-vous supprimer cette image de la galerie ?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/projets/${editingId}/gallery`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ imagePath })
      });
      if (res.ok) {
        setExistingGallery(prev => prev.filter(img => img !== imagePath));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormFullDescription('');
    setFormCategory('Urbanisme');
    setFormStatus('En cours');
    setFormBudget('');
    setFormProgress(0);
    setFormLocation('');
    setFormStartDate('');
    setFormEndDate('');
    setFormIsFeatured(false);
    setFormImage(null);
    setFormImagePreview('');
    setFormObjectives(['']);
    setFormTimeline([{ label: '', date: '', done: false }]);
    setFormDocuments([{ name: '', url: '' }]);
    setFormVideos(['']);
    setFormGalleryFiles([]);
    setFormGalleryPreviews([]);
    setExistingGallery([]);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (p) => {
    setIsEditing(true);
    setEditingId(p._id);
    setFormTitle(p.title);
    setFormDescription(p.description);
    setFormFullDescription(p.fullDescription || '');
    setFormCategory(p.category);
    setFormStatus(p.status);
    setFormBudget(p.budget || '');
    setFormProgress(p.progress || 0);
    setFormLocation(p.location || '');
    setFormStartDate(p.startDate ? p.startDate.split('T')[0] : '');
    setFormEndDate(p.endDate ? p.endDate.split('T')[0] : '');
    setFormIsFeatured(p.isFeatured || false);
    setFormImage(null);
    setFormImagePreview(p.image ? `${import.meta.env.VITE_API_URL || ''}${p.image}` : '');
    setFormObjectives(p.objectives && p.objectives.length > 0 ? p.objectives : ['']);
    setFormTimeline(p.timeline && p.timeline.length > 0 ? p.timeline : [{ label: '', date: '', done: false }]);
    setFormDocuments(p.documents && p.documents.length > 0 ? p.documents : [{ name: '', url: '' }]);
    setFormVideos(p.videos && p.videos.length > 0 ? p.videos : ['']);
    setFormGalleryFiles([]);
    setFormGalleryPreviews([]);
    setExistingGallery(p.gallery || []);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formDescription) {
      alert('Veuillez remplir le titre et la description.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('description', formDescription);
      formData.append('fullDescription', formFullDescription);
      formData.append('category', formCategory);
      formData.append('status', formStatus);
      formData.append('budget', formBudget);
      formData.append('progress', formProgress);
      formData.append('location', formLocation);
      formData.append('isFeatured', formIsFeatured);
      if (formStartDate) formData.append('startDate', formStartDate);
      if (formEndDate) formData.append('endDate', formEndDate);
      
      const cleanObjectives = formObjectives.filter(o => o.trim() !== '');
      formData.append('objectives', JSON.stringify(cleanObjectives));

      const cleanTimeline = formTimeline.filter(t => t.label.trim() !== '');
      formData.append('timeline', JSON.stringify(cleanTimeline));

      const cleanDocs = formDocuments.filter(d => d.name.trim() !== '' && d.url.trim() !== '');
      formData.append('documents', JSON.stringify(cleanDocs));

      const cleanVideos = formVideos.filter(v => v.trim() !== '');
      formData.append('videos', JSON.stringify(cleanVideos));

      if (formImage) {
        formData.append('image', formImage);
      }

      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL || ''}/api/projets/${editingId}`
        : `${import.meta.env.VITE_API_URL || ''}/api/projets`;
        
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        const savedProject = data.data;

        if (formGalleryFiles.length > 0) {
          const projectId = savedProject._id;
          for (const file of formGalleryFiles) {
            const galData = new FormData();
            galData.append('image', file);
            await fetch(`${import.meta.env.VITE_API_URL || ''}/api/projets/${projectId}/gallery`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
              },
              body: galData
            });
          }
        }

        setShowFormModal(false);
        fetchData();
        alert(isEditing ? 'Projet mis à jour !' : 'Nouveau projet créé !');
      } else {
        alert(data.message || 'Erreur lors de la sauvegarde.');
      }
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue.');
    }
  };

  const handleDeleteProjet = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet définitivement ?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/projets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        alert('Projet supprimé avec succès.');
      } else {
        alert(data.message || 'Erreur.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveHeroConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/content-sections/projets_page`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          sectionName: 'projets_page',
          title: heroConfig.title,
          subtitle: heroConfig.subtitle,
          bgImage: heroConfig.bgImage
        })
      });
      if (res.ok) {
        setShowHeroModal(false);
        alert('Hero mis à jour !');
      } else {
        alert('Erreur de mise à jour.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Terminé':
        return <span className="premium-badge badge-termined">Terminé</span>;
      case 'En cours':
        return <span className="premium-badge badge-ongoing">En cours</span>;
      case 'Futur':
        return <span className="premium-badge badge-future">À venir</span>;
      default:
        return <span className="premium-badge badge-default">{status}</span>;
    }
  };

  const getProjectImage = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800';
    return path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL || ''}${path}`;
  };

  const filteredProjets = projets.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Tous' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="premium-projets-wrapper">
      
      {/* 💅 Isolated Premium CSS Style Override for Perfect UI/UX Visual Hierarchy */}
      <style dangerouslySetInnerHTML={{__html: `
        .premium-projets-wrapper {
          background-color: #f8fafc;
          font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
          color: #0f172a;
          min-height: 100vh;
          padding-top: 80px;
        }

        /* Admin Action Bar */
        .admin-action-bar-p {
          background: linear-gradient(135deg, #0b3d2e, #062f22);
          border-bottom: 1.5px solid #16c47f;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
          position: sticky;
          top: 64px;
          z-index: 49;
          box-shadow: 0 4px 20px rgba(11,61,46,0.15);
        }

        /* Hero styling */
        .hero-section-p {
          position: relative;
          height: 60vh;
          min-height: 500px;
          max-height: 620px;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          padding: 0 5%;
        }

        .hero-section-p::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(6, 47, 34, 0.92) 30%, rgba(6, 47, 34, 0.55) 70%, rgba(6, 47, 34, 0.2) 100%);
          z-index: 1;
        }

        .hero-container-p {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          z-index: 2;
          display: grid;
          grid-template-cols: 1fr;
          gap: 40px;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .hero-container-p {
            grid-template-columns: 1.2fr 0.8fr;
          }
        }

        .hero-badge-p {
          background: rgba(22, 196, 127, 0.15);
          border: 1px solid rgba(22, 196, 127, 0.4);
          color: #16c47f;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
        }

        .hero-title-p {
          font-size: 2.5rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.15;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        @media (min-width: 768px) {
          .hero-title-p { font-size: 3.2rem; }
        }

        .hero-subtitle-p {
          font-size: 0.95rem;
          color: #cbd5e1;
          font-weight: 300;
          max-width: 540px;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .hero-actions-p {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        /* Glassmorphic floating card in Hero */
        .glass-floating-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          color: #ffffff;
          transition: all 0.3s ease;
        }

        .glass-floating-card:hover {
          border-color: rgba(22, 196, 127, 0.3);
          transform: translateY(-4px);
        }

        /* Stats Section */
        .stats-section-p {
          margin-top: -50px;
          position: relative;
          z-index: 10;
          padding: 0 24px;
        }

        .stats-grid-p {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (min-width: 768px) {
          .stats-grid-p {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .stat-card-p {
          background: #ffffff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
          border: 1.5px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .stat-card-p:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(15, 23, 42, 0.06);
          border-color: #e2e8f0;
        }

        .stat-card-p::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 4px;
          background: #cbd5e1;
        }

        .stat-card-p.stat-total::after { background: #0f172a; }
        .stat-card-p.stat-ongoing::after { background: #3b82f6; }
        .stat-card-p.stat-done::after { background: #16c47f; }
        .stat-card-p.stat-future::after { background: #f59e0b; }
        .stat-card-p.stat-budget::after { background: #8b5cf6; }

        .stat-label-p {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        .stat-value-p {
          font-size: 2.1rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1;
        }

        .stat-icon-wrap {
          position: absolute;
          right: 16px;
          top: 16px;
          opacity: 0.12;
          color: #0f172a;
        }

        /* Filter Tabs */
        .filter-section-p {
          max-width: 1280px;
          margin: 48px auto 32px;
          padding: 0 24px;
        }

        .search-row-p {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        @media (min-width: 768px) {
          .search-row-p {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .premium-search-input {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 12px 16px 12px 42px;
          font-size: 0.88rem;
          width: 100%;
          max-width: 420px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(15,23,42,0.01);
        }

        .premium-search-input:focus {
          outline: none;
          border-color: #16c47f;
          box-shadow: 0 8px 24px rgba(22,196,127,0.08);
        }

        /* Project Phare Banner Showcase */
        .projet-phare-section {
          max-width: 1280px;
          margin: 64px auto;
          padding: 0 24px;
        }

        .phare-container {
          background: #ffffff;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(15,23,42,0.04);
          border: 1.5px solid #f1f5f9;
          display: grid;
          grid-template-columns: 1fr;
        }

        @media (min-width: 1024px) {
          .phare-container {
            grid-template-columns: 1.1fr 0.9fr;
          }
        }

        .phare-banner-img {
          height: 320px;
          position: relative;
        }

        @media (min-width: 1024px) {
          .phare-banner-img {
            height: 100%;
          }
        }

        .phare-details-col {
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Project Cards */
        .projects-grid-p {
          max-width: 1280px;
          margin: 0 auto 64px;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 768px) {
          .projects-grid-p {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .projects-grid-p {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .premium-project-card {
          background: #ffffff;
          border: 1.5px solid #f1f5f9;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(15,23,42,0.02);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }

        .premium-project-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 45px rgba(15,23,42,0.08);
          border-color: #e2e8f0;
        }

        /* Badges styling */
        .premium-badge {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 6px 12px;
          border-radius: 8px;
          display: inline-block;
          border: 1px solid transparent;
        }

        .badge-termined { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
        .badge-ongoing { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
        .badge-future { background: #fffbeb; color: #92400e; border-color: #fde68a; }

        /* Progress Bar style */
        .premium-progress-bar-wrap {
          width: 100%;
          background: #f1f5f9;
          border-radius: 99px;
          height: 6px;
          overflow: hidden;
          position: relative;
        }

        .premium-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #14b8a6);
          border-radius: 99px;
          transition: width 0.8s ease;
        }

        /* Vector pins map section */
        .map-section-p {
          background: #ffffff;
          padding: 64px 24px;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }

        .map-wrapper-p {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* Drawer & Modals */
        .modal-overlay-p {
          background: rgba(6, 32, 24, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .modal-body-p {
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 860px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalScaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Custom buttons styling */
        .btn-premium-p {
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 10px 20px;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .btn-primary-p {
          background: #16c47f;
          color: #0b3d2e;
          border: none;
        }

        .btn-primary-p:hover {
          background: #10b372;
          box-shadow: 0 6px 20px rgba(22,196,127,0.25);
        }

        .btn-secondary-p {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: #ffffff;
        }

        .btn-secondary-p:hover {
          background: rgba(255,255,255,0.15);
        }

        .btn-outline-p {
          border: 1.5px solid #e2e8f0;
          background: transparent;
          color: #475569;
        }

        .btn-outline-p:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
      `}} />

      {/* 🔴 ADMIN OVERLAY TRIGGER BAR */}
      {isAdmin && (
        <div className="admin-action-bar-p">
          <div className="flex items-center gap-2 mr-auto text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            Mode Administrateur activé
          </div>
          <button 
            onClick={() => setShowHeroModal(true)} 
            className="btn-premium-p btn-secondary-p py-2 text-xs"
          >
            <Edit size={13} /> Éditer la page
          </button>
          <button 
            onClick={handleOpenCreateModal} 
            className="btn-premium-p btn-primary-p py-2 text-xs font-black shadow-lg"
          >
            <Plus size={13} /> Nouveau Projet
          </button>
        </div>
      )}

      {/* 🦸 1. HERO SECTION (MAX HEIGHT 70VH) */}
      <section 
        className="hero-section-p"
        style={{ backgroundImage: `url(${heroConfig.bgImage})` }}
      >
        <div className="hero-container-p">
          {/* Left Text details */}
          <div className="text-left">
            <span className="hero-badge-p">
              <TrendingUp size={12} /> Développement & Modernisation
            </span>
            <h1 className="hero-title-p">
              {heroConfig.title}
            </h1>
            <p className="hero-subtitle-p">
              {heroConfig.subtitle}
            </p>
            <div className="hero-actions-p">
              <a href="#projects-grid" className="btn-premium-p btn-primary-p py-3 px-6 text-sm">
                Voir les projets
              </a>
              <a href="#map-section" className="btn-premium-p btn-secondary-p py-3 px-6 text-sm">
                Suivre l'avancement
              </a>
            </div>
          </div>

          {/* Right Floating glassmorphic card */}
          <div>
            {featuredProjet ? (
              <div className="glass-floating-card text-left">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">Projet Phare</span>
                  {getStatusBadge(featuredProjet.status)}
                </div>
                <h3 className="text-lg font-black text-white leading-snug mb-2 truncate">{featuredProjet.title}</h3>
                <p className="text-xs text-slate-300 font-light mb-4 line-clamp-2 leading-relaxed">{featuredProjet.description}</p>
                
                {/* Progress bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[10px] text-slate-300">
                    <span>Avancement</span>
                    <span className="font-bold text-white">{featuredProjet.progress}%</span>
                  </div>
                  <div className="premium-progress-bar-wrap">
                    <div className="premium-progress-fill" style={{ width: `${featuredProjet.progress}%` }}></div>
                  </div>
                </div>

                {/* Quick financial + geography markers */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 border-t border-white/10 pt-3 mb-4">
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-emerald-400" />
                    <span>Budget: <strong>{featuredProjet.budget || 'N/C'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-400" />
                    <span className="truncate">{featuredProjet.location || 'Dembéni'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveProject(featuredProjet)}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1"
                >
                  Détails du projet <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center text-slate-400 text-xs">
                Aucun projet vedette disponible
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 📊 2. STATISTICS SECTION (CLEAN & MINIMALIST) */}
      <section className="stats-section-p">
        <div className="stats-grid-p">
          
          <div className="stat-card-p stat-total">
            <span className="stat-label-p">Total Projets</span>
            <span className="stat-value-p">{stats.total}</span>
            <div className="stat-icon-wrap"><Layers size={22} /></div>
          </div>

          <div className="stat-card-p stat-ongoing">
            <span className="stat-label-p">En Cours</span>
            <span className="stat-value-p text-blue-600">{stats.enCours}</span>
            <div className="stat-icon-wrap"><Clock size={22} className="text-blue-500" /></div>
          </div>

          <div className="stat-card-p stat-done">
            <span className="stat-label-p">Terminés</span>
            <span className="stat-value-p text-emerald-600">{stats.termines}</span>
            <div className="stat-icon-wrap"><CheckCircle2 size={22} className="text-emerald-500" /></div>
          </div>

          <div className="stat-card-p stat-future">
            <span className="stat-label-p">À venir</span>
            <span className="stat-value-p text-amber-500">{stats.futurs}</span>
            <div className="stat-icon-wrap"><Calendar size={22} className="text-amber-500" /></div>
          </div>

          <div className="stat-card-p stat-budget">
            <span className="stat-label-p">Budget Commis</span>
            <span className="stat-value-p text-purple-600">{stats.totalBudget}</span>
            <div className="stat-icon-wrap"><DollarSign size={22} className="text-purple-500" /></div>
          </div>

        </div>
      </section>

      {/* 🏷️ 3. FILTER TABS & SEARCH */}
      <section className="filter-section-p">
        <div className="search-row-p">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Répertoire des Chantiers</h2>
            <p className="text-slate-500 text-xs mt-1">Filtrer par thématique ou statut d'exécution.</p>
          </div>

          {/* Search Input wrapper */}
          <div className="relative w-full max-w-sm">
            <span className="absolute left-3.5 top-3.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </span>
            <input 
              type="text" 
              placeholder="Rechercher par mot-clé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab list */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 category-tabs-container">
          <button
            onClick={() => setSelectedCategory('Tous')}
            className={`text-xs px-4 py-2 rounded-xl font-bold whitespace-nowrap transition border ${selectedCategory === 'Tous' ? 'bg-emerald-800 border-emerald-800 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500'}`}
          >
            Tous les chantiers
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-4 py-2 rounded-xl font-bold whitespace-nowrap transition border ${selectedCategory === cat ? 'bg-emerald-800 border-emerald-800 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start w-fit border border-slate-200">
          {['Tous', 'En cours', 'Terminé', 'Futur'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`text-xs px-4 py-1.5 rounded-lg font-bold transition ${selectedStatus === st ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </section>

      {/* 🏢 4. PROJECTS CARDS GRID */}
      <section id="projects-grid" className="projects-grid-p">
        {loading ? (
          <div className="col-span-full text-center py-20 text-slate-400 text-sm">Chargement du portefeuille de projets...</div>
        ) : filteredProjets.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm font-light">
            Aucun projet trouvé avec les filtres sélectionnés.
          </div>
        ) : (
          filteredProjets.map((p) => (
            <div 
              key={p._id}
              className="premium-project-card text-left"
            >
              {/* Card Thumbnail */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img 
                  src={getProjectImage(p.image)} 
                  alt={p.title} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                
                {/* Admin controls inside card hover */}
                {isAdmin && (
                  <div className="absolute top-3 left-3 flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(p); }}
                      className="p-2 bg-white/95 hover:bg-slate-50 text-slate-800 rounded-lg shadow-md border border-slate-200 transition"
                      title="Modifier"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteProjet(p._id); }}
                      className="p-2 bg-white/95 hover:bg-red-50 text-red-600 rounded-lg shadow-md border border-slate-200 transition"
                      title="Supprimer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                <div className="absolute top-3 right-3">
                  {getStatusBadge(p.status)}
                </div>

                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                  {p.category}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug line-clamp-1">{p.title}</h3>
                  <p className="text-slate-500 text-xs font-light line-clamp-3 mb-4 leading-relaxed">{p.description}</p>
                </div>

                {/* Metrics */}
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  
                  {/* Progress slider display */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Niveau d'achèvement</span>
                      <span className="font-extrabold text-slate-800">{p.progress}%</span>
                    </div>
                    <div className="premium-progress-bar-wrap">
                      <div className="premium-progress-fill" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>

                  {/* Financial & Location details */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-slate-400" />
                      <span>Financement: <strong className="text-slate-700">{p.budget || 'N/A'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400" />
                      <span className="truncate">{p.location || 'Dembéni'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Card Footer Action */}
              <div className="p-6 pt-0">
                <button 
                  onClick={() => setActiveProject(p)}
                  className="w-full btn-premium-p btn-outline-p justify-center py-2.5 text-xs font-bold"
                >
                  Consulter les détails <ChevronRight size={14} />
                </button>
              </div>

            </div>
          ))
        )}
      </section>

      {/* 🚀 5. PROJET PHARE SECTION (LARGE MID-PAGE PANEL) */}
      {phareProjet && (
        <section className="projet-phare-section text-left">
          <div className="phare-container">
            
            {/* Left large photo with gradient overlay */}
            <div 
              className="phare-banner-img bg-cover bg-center"
              style={{ backgroundImage: `url(${getProjectImage(phareProjet.image)})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white z-10">
                <span className="bg-emerald-500 text-emerald-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-md mb-2 inline-block">
                  {phareProjet.category}
                </span>
                <h3 className="text-2xl font-black">{phareProjet.title}</h3>
              </div>
            </div>

            {/* Right details panel */}
            <div className="phare-details-col">
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block mb-1">Aménagement Phare</span>
              <h2 className="text-2xl font-black text-slate-800 mb-4">Investissement Prioritaire de Dembéni</h2>
              <p className="text-slate-600 text-xs leading-relaxed font-light mb-6">
                {phareProjet.description}
              </p>

              {/* Detailed metrics showcase */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-xs border-y border-slate-100 py-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">Budget prévisionnel</span>
                  <strong className="text-slate-800 text-sm flex items-center"><DollarSign size={14} className="text-emerald-600" /> {phareProjet.budget || 'Non communiqué'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Localisation</span>
                  <strong className="text-slate-800 text-sm flex items-center"><MapPin size={14} className="text-emerald-600" /> {phareProjet.location || 'Dembéni'}</strong>
                </div>
              </div>

              {/* Progress dynamic strip */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Progrès des chantiers physiques</span>
                  <span className="text-emerald-600">{phareProjet.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full" style={{ width: `${phareProjet.progress}%` }}></div>
                </div>
              </div>

              <button 
                onClick={() => setActiveProject(phareProjet)}
                className="btn-premium-p btn-primary-p py-3 text-xs w-full sm:w-fit justify-center"
              >
                Découvrir l'aménagement complet <ArrowRight size={15} />
              </button>
            </div>

          </div>
        </section>
      )}

      {/* 🗺️ 6. VECTOR INTERACTIVE MAP */}
      <section id="map-section" className="map-section-p">
        <div className="map-wrapper-p text-left">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cartographie des Investissements</h2>
            <p className="text-slate-500 text-xs mt-1">Implantation des travaux et infrastructures sur le territoire communal de Dembéni.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50 p-6 rounded-3xl border border-slate-200">
            
            {/* Interactive list */}
            <div className="lg:col-span-4 space-y-2 max-h-[380px] overflow-y-auto pr-2">
              {projets.map((p, index) => (
                <button
                  key={p._id}
                  onMouseEnter={() => setHoveredMapPin(index)}
                  onMouseLeave={() => setHoveredMapPin(null)}
                  onClick={() => setActiveProject(p)}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs transition flex items-center justify-between ${hoveredMapPin === index ? 'bg-white border-emerald-500 shadow-md text-emerald-950 font-semibold' : 'bg-transparent border-transparent hover:bg-slate-100 text-slate-600'}`}
                >
                  <div className="space-y-0.5 truncate max-w-[220px]">
                    <div className="font-bold truncate text-slate-800">{p.title}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin size={11} /> {p.location || 'Dembéni'}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              ))}
            </div>

            {/* Map canvas */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl relative h-[400px] overflow-hidden flex items-center justify-center">
              {/* Dot grid mock */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(#0f172a 2px, transparent 2px)',
                backgroundSize: '24px 24px'
              }}></div>
              
              {/* Simulated Mayotte outline SVG overlay */}
              <svg className="w-full h-full text-emerald-50 absolute inset-0 pointer-events-none p-6" fill="none" viewBox="0 0 800 400" stroke="currentColor" strokeWidth="2">
                <path d="M120,40 Q240,70 310,110 T460,230 T620,190 T720,290 Q600,390 480,330 T280,270 T80,180 Z" fill="rgba(22,196,127,0.02)" stroke="rgba(22,196,127,0.1)" />
              </svg>

              {/* Dynamic Interactive Pin Markers */}
              {projets.map((p, idx) => {
                const x = 180 + (idx * 90) % 360;
                const y = 100 + (idx * 60) % 240;

                return (
                  <div
                    key={p._id}
                    className="absolute cursor-pointer"
                    style={{ left: `${x}px`, top: `${y}px` }}
                    onClick={() => setActiveProject(p)}
                    onMouseEnter={() => setHoveredMapPin(idx)}
                    onMouseLeave={() => setHoveredMapPin(null)}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className={`w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-300 block ${hoveredMapPin === idx ? 'bg-emerald-500 scale-125' : 'bg-emerald-950'}`}></span>
                      {hoveredMapPin === idx && (
                        <>
                          <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></span>
                          {/* Popover */}
                          <div className="absolute bottom-6 bg-slate-900 border border-slate-800 text-white rounded-xl p-3 w-48 shadow-2xl text-[10px] z-20 pointer-events-none">
                            <div className="font-extrabold truncate text-[11px] mb-0.5">{p.title}</div>
                            <div className="text-slate-400 flex justify-between">
                              <span>{p.category}</span>
                              <span className="text-emerald-400 font-bold">{p.budget}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* 🪟 7. DETAILED PROJECT VIEW (TIROIR / DRAWER MODAL) */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-emerald-950/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-slide-in relative text-left">
            
            {/* Modal header banner */}
            <div className="relative h-80 bg-slate-100">
              <img 
                src={getProjectImage(activeProject.image)} 
                alt={activeProject.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20"></div>
              
              <button 
                onClick={() => setActiveProject(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md transition border border-white/10"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-500 text-emerald-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md">
                    {activeProject.category}
                  </span>
                  {getStatusBadge(activeProject.status)}
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">{activeProject.title}</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-10 space-y-8 flex-1">
              
              {/* Financial/Time metrics bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Budget alloué</span>
                  <strong className="text-slate-800 text-sm flex items-center gap-0.5"><DollarSign size={14} className="text-emerald-600" /> {activeProject.budget || 'Non communiqué'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Lieu d'implantation</span>
                  <strong className="text-slate-800 text-sm flex items-center gap-0.5"><MapPin size={14} className="text-emerald-600" /> {activeProject.location || 'Dembéni'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Début du projet</span>
                  <strong className="text-slate-800 text-sm flex items-center gap-0.5"><Calendar size={14} className="text-emerald-600" /> {activeProject.startDate ? new Date(activeProject.startDate).toLocaleDateString('fr-FR') : 'Non définie'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Livraison prévue</span>
                  <strong className="text-slate-800 text-sm flex items-center gap-0.5"><Clock size={14} className="text-emerald-600" /> {activeProject.endDate ? new Date(activeProject.endDate).toLocaleDateString('fr-FR') : 'Non définie'}</strong>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Progrès global des travaux</span>
                  <span className="text-emerald-600">{activeProject.progress}%</span>
                </div>
                <div className="premium-progress-bar-wrap h-3">
                  <div className="premium-progress-fill" style={{ width: `${activeProject.progress}%` }}></div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Présentation détaillée</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-light">
                  {activeProject.fullDescription || activeProject.description}
                </p>
              </div>

              {/* Objectives List */}
              {activeProject.objectives && activeProject.objectives.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Objectifs prioritaires</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeProject.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 text-xs">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timeline Steps */}
              {activeProject.timeline && activeProject.timeline.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Calendrier d'exécution</h3>
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                    {activeProject.timeline.map((item, i) => (
                      <div key={i} className="relative flex items-start gap-4">
                        <span className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm block ${item.done ? 'bg-emerald-600' : 'bg-slate-300'}`}></span>
                        <div>
                          <h4 className={`text-xs font-bold ${item.done ? 'text-slate-800' : 'text-slate-400'}`}>{item.label}</h4>
                          <span className="text-[10px] text-slate-400">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Photos */}
              {activeProject.gallery && activeProject.gallery.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Galerie Photos du Chantier</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {activeProject.gallery.map((img, i) => (
                      <div 
                        key={i} 
                        className="relative h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-zoom-in"
                        onClick={() => setSelectedGalleryPhoto(getProjectImage(img))}
                      >
                        <img 
                          src={getProjectImage(img)} 
                          alt={`chantier-${i}`} 
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related news / Actualités liées */}
              {relatedNews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Actualités liées au domaine</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedNews.map((news) => (
                      <a 
                        href="/actualites" 
                        key={news._id} 
                        className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-emerald-500 transition flex flex-col h-full group"
                      >
                        <div className="relative h-28 bg-slate-200">
                          <img 
                            src={getProjectImage(news.image)} 
                            alt={news.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">{news.title}</h4>
                          <span className="text-[9px] text-slate-400 block mt-2">{new Date(news.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents useful */}
              {activeProject.documents && activeProject.documents.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Documents administratifs</h3>
                  <div className="space-y-2">
                    {activeProject.documents.map((doc, i) => (
                      <a 
                        key={i} 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition text-xs font-semibold text-slate-700"
                      >
                        <span>{doc.name}</span>
                        <FileDown size={16} className="text-emerald-700" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Video links */}
              {activeProject.videos && activeProject.videos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Vidéos du projet</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeProject.videos.map((vid, i) => (
                      <a 
                        key={i} 
                        href={vid} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition text-xs text-red-950 font-bold"
                      >
                        <Play size={18} className="text-red-600 fill-red-600" />
                        <span>Visualiser le reportage vidéo {i + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 🖼️ PHOTO VIEWER MODAL OVERLAY */}
      {selectedGalleryPhoto && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedGalleryPhoto(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-slate-300">
            <X size={32} />
          </button>
          <img src={selectedGalleryPhoto} alt="Zoom" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
        </div>
      )}

      {/* 🛠️ MODAL FORM: CREATE / EDIT PROJECT */}
      {showFormModal && (
        <div className="modal-overlay-p">
          <div className="modal-body-p text-left">
            <div className="p-6 md:p-8 flex flex-col h-full">
              
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <ImageIcon size={22} className="text-emerald-700" /> 
                  {isEditing ? 'Modifier le Projet' : 'Ajouter un Projet municipal'}
                </h3>
                <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Titre du Projet</label>
                      <input 
                        type="text" 
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Catégorie</label>
                        <select 
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Statut</label>
                        <select 
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Budget (ex: 12,5 M€)</label>
                        <input 
                          type="text" 
                          value={formBudget}
                          onChange={(e) => setFormBudget(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Localisation précise</label>
                        <input 
                          type="text" 
                          value={formLocation}
                          onChange={(e) => setFormLocation(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date de début</label>
                        <input 
                          type="date" 
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date de livraison</label>
                        <input 
                          type="date" 
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Avancement ({formProgress}%)</label>
                      <input 
                        type="range" 
                        min="0"
                        max="100"
                        value={formProgress}
                        onChange={(e) => setFormProgress(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="formIsFeatured"
                        checked={formIsFeatured}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                      />
                      <label htmlFor="formIsFeatured" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Mettre ce projet en vedette dans le Hero</label>
                    </div>

                    {/* Image Drag and Drop */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Image principale du projet</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 relative min-h-[140px]">
                        {formImagePreview ? (
                          <div className="w-full h-32 relative rounded-xl overflow-hidden">
                            <img src={formImagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => { setFormImage(null); setFormImagePreview(''); }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition shadow"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload size={32} className="text-slate-400 mx-auto mb-2" />
                            <p className="text-xs text-slate-500 font-medium">Glissez l'image principale ici, ou</p>
                            <label className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer block">
                              Parcourir les fichiers
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden" 
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description courte (2-3 phrases)</label>
                      <textarea 
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-emerald-500 h-16 resize-none"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description complète</label>
                      <textarea 
                        value={formFullDescription}
                        onChange={(e) => setFormFullDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-emerald-500 h-36 resize-none"
                      ></textarea>
                    </div>

                    {/* Objectives list */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Objectifs clés</label>
                        <button 
                          type="button" 
                          onClick={() => setFormObjectives([...formObjectives, ''])}
                          className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5"
                        >
                          <Plus size={10} /> Ajouter
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {formObjectives.map((obj, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input 
                              type="text"
                              value={obj}
                              onChange={(e) => {
                                const copy = [...formObjectives];
                                copy[idx] = e.target.value;
                                setFormObjectives(copy);
                              }}
                              placeholder={`Objectif ${idx + 1}`}
                              className="flex-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs"
                            />
                            <button 
                              type="button" 
                              onClick={() => setFormObjectives(formObjectives.filter((_, i) => i !== idx))}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Timeline phases, Documents & Gallery uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  
                  {/* Timeline Phases */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Étapes clés / Calendrier</label>
                      <button 
                        type="button" 
                        onClick={() => setFormTimeline([...formTimeline, { label: '', date: '', done: false }])}
                        className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5"
                      >
                        <Plus size={10} /> Ajouter
                      </button>
                    </div>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {formTimeline.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input 
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const copy = [...formTimeline];
                              copy[index].label = e.target.value;
                              setFormTimeline(copy);
                            }}
                            placeholder="Étape"
                            className="flex-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
                          />
                          <input 
                            type="text"
                            value={item.date}
                            onChange={(e) => {
                              const copy = [...formTimeline];
                              copy[index].date = e.target.value;
                              setFormTimeline(copy);
                            }}
                            placeholder="Date"
                            className="w-24 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
                          />
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={item.done}
                              onChange={(e) => {
                                const copy = [...formTimeline];
                                copy[index].done = e.target.checked;
                                setFormTimeline(copy);
                              }}
                              className="w-3.5 h-3.5 text-emerald-600 rounded"
                            />
                            <span className="text-[9px] font-bold text-slate-500">FAIT</span>
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setFormTimeline(formTimeline.filter((_, i) => i !== index))}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents & video links */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Documents (.pdf / .docx)</label>
                        <button 
                          type="button" 
                          onClick={() => setFormDocuments([...formDocuments, { name: '', url: '' }])}
                          className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5"
                        >
                          <Plus size={10} /> Ajouter
                        </button>
                      </div>
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {formDocuments.map((doc, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input 
                              type="text"
                              value={doc.name}
                              onChange={(e) => {
                                const copy = [...formDocuments];
                                copy[idx].name = e.target.value;
                                setFormDocuments(copy);
                              }}
                              placeholder="Nom"
                              className="w-1/2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
                            />
                            <input 
                              type="text"
                              value={doc.url}
                              onChange={(e) => {
                                const copy = [...formDocuments];
                                copy[idx].url = e.target.value;
                                setFormDocuments(copy);
                              }}
                              placeholder="Lien/URL"
                              className="w-1/2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
                            />
                            <button 
                              type="button" 
                              onClick={() => setFormDocuments(formDocuments.filter((_, i) => i !== idx))}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Gallery photo upload list */}
                <div className="pt-4 border-t space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Galerie photo de chantier</label>
                  
                  {existingGallery.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold block mb-1">PHOTOS ACTUELLES :</span>
                      <div className="flex flex-wrap gap-2">
                        {existingGallery.map((img, i) => (
                          <div key={i} className="relative w-16 h-12 rounded-lg overflow-hidden border">
                            <img src={getProjectImage(img)} alt="gallery" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => removeExistingGalleryImage(img)}
                              className="absolute inset-0 bg-red-600/70 hover:opacity-100 opacity-0 text-white flex items-center justify-center transition text-[9px] font-bold"
                            >
                              Effacer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer transition">
                      <Plus size={14} /> Ajouter des photos de chantier
                      <input 
                        type="file" 
                        multiple
                        accept="image/*"
                        onChange={handleGalleryChange}
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {formGalleryPreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formGalleryPreviews.map((preview, idx) => (
                        <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border">
                          <img src={preview} alt="New Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeGalleryPreview(idx)}
                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-full"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action footer */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button 
                    type="button" 
                    onClick={() => setShowFormModal(false)}
                    className="btn-premium-p btn-outline-p text-xs py-2.5"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="btn-premium-p btn-primary-p text-xs py-2.5"
                  >
                    Sauvegarder
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* 🛠️ MODAL HERO CONFIG */}
      {showHeroModal && (
        <div className="modal-overlay-p">
          <div className="modal-body-p max-w-md text-left p-6 md:p-8">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h3 className="text-lg font-black text-slate-800">Configuration de l'en-tête</h3>
              <button onClick={() => setShowHeroModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveHeroConfig} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Titre principal</label>
                <input 
                  type="text" 
                  value={heroConfig.title}
                  onChange={(e) => setHeroConfig({ ...heroConfig, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description / Accroche</label>
                <textarea 
                  value={heroConfig.subtitle}
                  onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none h-24 resize-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Image de fond (URL)</label>
                <input 
                  type="text" 
                  value={heroConfig.bgImage}
                  onChange={(e) => setHeroConfig({ ...heroConfig, bgImage: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowHeroModal(false)}
                  className="btn-premium-p btn-outline-p text-xs py-2.5"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-premium-p btn-primary-p text-xs py-2.5"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjetPage;
