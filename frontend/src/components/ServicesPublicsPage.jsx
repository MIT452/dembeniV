import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  FileText, Shield, MapPin, Globe, Heart, Activity, Phone, Clock, Mail, 
  BookOpen, Users, CheckCircle, AlertTriangle, Search, Plus, Info,
  Edit, Trash, ArrowRight, Upload, Settings, RefreshCw, X, ChevronDown, 
  ChevronUp, ExternalLink, Eye, EyeOff, Check, Layers
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './ServicesPublics.css';

// Custom counter animation hook/component
const AnimatedCounter = ({ value, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const numericVal = parseFloat(value.toString().replace(/\s/g, '')) || 0;
  const isFloat = value.toString().includes('.');

  useEffect(() => {
    let start = 0;
    const end = numericVal;
    if (end === 0) {
      setCount(value);
      return;
    }
    const duration = 1500;
    const startTime = performance.now();

    const updateCount = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = progress * (end - start) + start;
      
      setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [numericVal, isFloat, value]);

  // Format with spaces for thousands
  const formatNumber = (num) => {
    if (isNaN(num)) return num;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return <span>{formatNumber(count)}{suffix}</span>;
};

const ServicesPublicsPage = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  // CMS State (Global page config)
  const [cmsData, setCmsData] = useState({
    heroTitle: "Tous les services publics de la commune de Dembéni",
    heroBadge: "Services Administratifs & Citoyens",
    heroDesc: "Accédez en quelques clics à l'ensemble de vos guichets municipaux, suivez l'avancement de vos dossiers et effectuez vos démarches en ligne en toute simplicité.",
    heroBgImage: "https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&w=1200&q=80",
    
    // Floating card info
    floatingService: "Carte Nationale d'Identité",
    floatingTime: "3 à 4 semaines",
    floatingStatus: "Guichet & ANTS",
    floatingRequests: "1 248 ce mois",
    floatingServiceId: "", // Link to a specific service ID
    
    // Statistics
    stat1Val: "24", stat1Label: "Services Disponibles",
    stat2Val: "12450", stat2Label: "Demandes Traitées",
    stat3Val: "96%", stat3Label: "Satisfaction Citoyenne",
    stat4Val: "85%", stat4Label: "Services Numériques",
    stat5Val: "4.2", stat5Label: "Jours de Traitement",

    // Blocks Layout Order
    blockOrder: ["hero", "search", "services", "procedures", "stats", "news"]
  });

  // Services & News State
  const [services, setServices] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Modal / Detailed View State
  const [selectedService, setSelectedService] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Admin Mode State
  const [adminMode, setAdminMode] = useState(false);
  const [openCmsModal, setOpenCmsModal] = useState(false);
  const [openCrudModal, setOpenCrudModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [crudTab, setCrudTab] = useState("general");

  // Drag and Drop Uploader State
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const heroFileInputRef = useRef(null);

  // CRUD Service Form State
  const [serviceForm, setServiceForm] = useState({
    title: "",
    desc: "",
    fullDesc: "",
    category: "État civil",
    customCategory: "",
    icon: "FileText",
    badge: "Nouveau",
    location: "Hôtel de Ville de Dembéni",
    hours: "Lundi au Vendredi : 8h00 - 12h00 / 13h30 - 16h00",
    phone: "0269 62 15 15",
    email: "contact@dembeni.fr",
    delay: "3 à 5 jours",
    onlineStatus: "Disponible en ligne",
    order: 0,
    isVisible: true,
    documents: [],
    steps: [],
    faq: [],
    formulaireUrls: [],
    associatedDemarches: []
  });

  // Dynamic input fields for lists inside CRUD
  const [newDoc, setNewDoc] = useState("");
  const [newStep, setNewStep] = useState("");
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [newFormName, setNewFormName] = useState("");
  const [newFormUrl, setNewFormUrl] = useState("");
  const [newAssocTitle, setNewAssocTitle] = useState("");
  const [newAssocUrl, setNewAssocUrl] = useState("");

  // Categories list
  const defaultCategories = [
    "État civil",
    "Passeport & Identité",
    "Urbanisme",
    "Élections",
    "Santé",
    "Éducation",
    "Environnement",
    "Collecte & Voirie",
    "Espace citoyen",
    "Sécurité"
  ];
  
  // Extract all active categories from services database
  const getCategories = () => {
    const cats = new Set(defaultCategories);
    services.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats);
  };

  // Fetch Services, News and CMS settings
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Services
      const resServices = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/services`);
      if (resServices.ok) {
        const data = await resServices.json();
        if (data.success && Array.isArray(data.data)) {
          setServices(data.data);
        }
      }

      // 2. Fetch CMS content
      const resCms = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/content-sections/services_page`);
      if (resCms.ok) {
        const data = await resCms.json();
        if (data.success && data.data) {
          const cms = data.data;
          setCmsData({
            heroTitle: cms.title || cmsData.heroTitle,
            heroBadge: cms.subtitle || cmsData.heroBadge,
            heroDesc: cms.description || cmsData.heroDesc,
            heroBgImage: cms.bgImage || cmsData.heroBgImage,
            floatingService: cms.items?.floatingService || cmsData.floatingService,
            floatingTime: cms.items?.floatingTime || cmsData.floatingTime,
            floatingStatus: cms.items?.floatingStatus || cmsData.floatingStatus,
            floatingRequests: cms.items?.floatingRequests || cmsData.floatingRequests,
            floatingServiceId: cms.items?.floatingServiceId || cmsData.floatingServiceId,
            stat1Val: cms.items?.stat1Val || cmsData.stat1Val,
            stat1Label: cms.items?.stat1Label || cmsData.stat1Label,
            stat2Val: cms.items?.stat2Val || cmsData.stat2Val,
            stat2Label: cms.items?.stat2Label || cmsData.stat2Label,
            stat3Val: cms.items?.stat3Val || cmsData.stat3Val,
            stat3Label: cms.items?.stat3Label || cmsData.stat3Label,
            stat4Val: cms.items?.stat4Val || cmsData.stat4Val,
            stat4Label: cms.items?.stat4Label || cmsData.stat4Label,
            stat5Val: cms.items?.stat5Val || cmsData.stat5Val,
            stat5Label: cms.items?.stat5Label || cmsData.stat5Label,
            blockOrder: cms.items?.blockOrder || cmsData.blockOrder
          });
        }
      }
    } catch (err) {
      console.error("Erreur de chargement des services ou CMS:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      // Fetch news under category "Services publics" or general admin announcements
      const resNews = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/publications?category=Services publics&status=published`);
      if (resNews.ok) {
        const data = await resNews.json();
        if (data.success && Array.isArray(data.data)) {
          setNews(data.data);
        } else {
          // fallback to general news if category is empty
          const resAll = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/publications?status=published`);
          if (resAll.ok) {
            const dataAll = await resAll.json();
            if (dataAll.success && Array.isArray(dataAll.data)) {
              setNews(dataAll.data.slice(0, 3));
            }
          }
        }
      }
    } catch (err) {
      console.error("Erreur de chargement des actualités:", err);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNews();
  }, []);

  // Handle Instant Search & Suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = services.filter(s => 
      s.isVisible && (
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setSuggestions(filtered.slice(0, 5));
  }, [searchQuery, services]);

  // Resolve Lucide Icons dynamically
  const resolveIcon = (name, size = 20) => {
    const icons = {
      FileText: <FileText size={size} />,
      Shield: <Shield size={size} />,
      MapPin: <MapPin size={size} />,
      Globe: <Globe size={size} />,
      Heart: <Heart size={size} />,
      Activity: <Activity size={size} />,
      Phone: <Phone size={size} />,
      Clock: <Clock size={size} />,
      Mail: <Mail size={size} />,
      BookOpen: <BookOpen size={size} />,
      Users: <Users size={size} />,
      CheckCircle: <CheckCircle size={size} />,
      AlertTriangle: <AlertTriangle size={size} />,
      Layers: <Layers size={size} />
    };
    return icons[name] || <FileText size={size} />;
  };

  // Filter & Search services array
  const getFilteredServices = () => {
    return services.filter(s => {
      // If not admin, hide invisible services
      if (!isAdmin && !s.isVisible) return false;
      
      const matchesSearch = 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "Tous" || 
        s.category.toLowerCase() === selectedCategory.toLowerCase();
        
      return matchesSearch && matchesCategory;
    });
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.match('image.*')) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  // Convert image to Base64 (for hero background uploader)
  const handleHeroBgUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCmsData(prev => ({ ...prev, heroBgImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open CRUD Form for adding new service
  const handleAddServiceClick = () => {
    setEditingService(null);
    setImageFile(null);
    setImagePreview("");
    setServiceForm({
      title: "",
      desc: "",
      fullDesc: "",
      category: "État civil",
      customCategory: "",
      icon: "FileText",
      badge: "Nouveau",
      location: "Hôtel de Ville de Dembéni",
      hours: "Lundi au Vendredi : 8h00 - 12h00 / 13h30 - 16h00",
      phone: "0269 62 15 15",
      email: "contact@dembeni.fr",
      delay: "3 à 5 jours",
      onlineStatus: "Disponible en ligne",
      order: 0,
      isVisible: true,
      documents: [],
      steps: [],
      faq: [],
      formulaireUrls: [],
      associatedDemarches: []
    });
    setCrudTab("general");
    setOpenCrudModal(true);
  };

  // Open CRUD Form for editing existing service
  const handleEditServiceClick = (service) => {
    setEditingService(service);
    setImageFile(null);
    setImagePreview(service.img ? (service.img.startsWith('/public/') ? `${import.meta.env.VITE_API_URL || ''}${service.img}` : service.img) : "");
    setServiceForm({
      title: service.title || "",
      desc: service.desc || "",
      fullDesc: service.fullDesc || "",
      category: defaultCategories.includes(service.category) ? service.category : "Autre",
      customCategory: !defaultCategories.includes(service.category) ? service.category : "",
      icon: service.icon || "FileText",
      badge: service.badge || "En ligne",
      location: service.location || "Hôtel de Ville de Dembéni",
      hours: service.hours || "Lundi au Vendredi : 8h00 - 12h00 / 13h30 - 16h00",
      phone: service.phone || "0269 62 15 15",
      email: service.email || "contact@dembeni.fr",
      delay: service.delay || "3 à 5 jours",
      onlineStatus: service.onlineStatus || "Disponible en ligne",
      order: service.order || 0,
      isVisible: service.isVisible !== false,
      documents: service.documents || [],
      steps: service.steps || [],
      faq: service.faq || [],
      formulaireUrls: service.formulaireUrls || [],
      associatedDemarches: service.associatedDemarches || []
    });
    setCrudTab("general");
    setOpenCrudModal(true);
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.desc) {
      alert("Veuillez remplir le titre et la description courte.");
      return;
    }

    const finalCategory = serviceForm.category === "Autre" ? serviceForm.customCategory : serviceForm.category;
    if (!finalCategory) {
      alert("Veuillez spécifier la catégorie du service.");
      return;
    }

    // Build Form Data for multipart file upload
    const formData = new FormData();
    formData.append("title", serviceForm.title);
    formData.append("desc", serviceForm.desc);
    formData.append("fullDesc", serviceForm.fullDesc);
    formData.append("category", finalCategory);
    formData.append("icon", serviceForm.icon);
    formData.append("badge", serviceForm.badge);
    formData.append("location", serviceForm.location);
    formData.append("hours", serviceForm.hours);
    formData.append("phone", serviceForm.phone);
    formData.append("email", serviceForm.email);
    formData.append("delay", serviceForm.delay);
    formData.append("onlineStatus", serviceForm.onlineStatus);
    formData.append("order", serviceForm.order);
    formData.append("isVisible", serviceForm.isVisible);
    
    // Append arrays as JSON strings
    formData.append("documents", JSON.stringify(serviceForm.documents));
    formData.append("steps", JSON.stringify(serviceForm.steps));
    formData.append("faq", JSON.stringify(serviceForm.faq));
    formData.append("formulaireUrls", JSON.stringify(serviceForm.formulaireUrls));
    formData.append("associatedDemarches", JSON.stringify(serviceForm.associatedDemarches));

    if (imageFile) {
      formData.append("image", imageFile); // matches uploadService.single('image') field name
    } else {
      // if no new file, preserve current image string
      formData.append("img", editingService ? editingService.img : "");
    }

    const token = localStorage.getItem('userToken');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    try {
      let response;
      if (editingService) {
        // Update service
        response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/services/${editingService._id}`, {
          method: "PUT",
          headers: headers,
          body: formData
        });
      } else {
        // Create service
        response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/services`, {
          method: "POST",
          headers: headers,
          body: formData
        });
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(editingService ? "Service modifié avec succès !" : "Service créé avec succès !");
          setOpenCrudModal(false);
          fetchData(); // reload
        } else {
          alert(data.message || "Erreur de sauvegarde.");
        }
      } else {
        const errData = await response.json();
        alert(errData.message || "Erreur lors de la requête.");
      }
    } catch (err) {
      console.error("Erreur serveur lors de la sauvegarde du service:", err);
      alert("Erreur de connexion au serveur.");
    }
  };

  // Delete Service
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce service public ?")) {
      return;
    }

    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/services/${serviceId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        alert("Service supprimé avec succès.");
        fetchData();
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  // Toggle service visibility directly from the grid
  const handleToggleVisibility = async (service) => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/services/${service._id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVisible: !service.isVisible })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Erreur toggle visibility:", err);
    }
  };

  // Save CMS Content (Global Settings)
  const handleSaveCmsSettings = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    
    // Construct payload for ContentSection model
    const payload = {
      key: "services_page",
      title: cmsData.heroTitle,
      subtitle: cmsData.heroBadge,
      description: cmsData.heroDesc,
      bgImage: cmsData.heroBgImage,
      items: {
        floatingService: cmsData.floatingService,
        floatingTime: cmsData.floatingTime,
        floatingStatus: cmsData.floatingStatus,
        floatingRequests: cmsData.floatingRequests,
        floatingServiceId: cmsData.floatingServiceId,
        stat1Val: cmsData.stat1Val,
        stat1Label: cmsData.stat1Label,
        stat2Val: cmsData.stat2Val,
        stat2Label: cmsData.stat2Label,
        stat3Val: cmsData.stat3Val,
        stat3Label: cmsData.stat3Label,
        stat4Val: cmsData.stat4Val,
        stat4Label: cmsData.stat4Label,
        stat5Val: cmsData.stat5Val,
        stat5Label: cmsData.stat5Label,
        blockOrder: cmsData.blockOrder
      }
    };

    try {
      // First try to put (update)
      let response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/content-sections/services_page`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // If 404, section doesn't exist, we POST it to create it!
      if (response.status === 404) {
        response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/content-sections`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        alert("Configuration globale enregistrée avec succès !");
        setOpenCmsModal(false);
        fetchData();
      } else {
        alert("Erreur lors de l'enregistrement de la configuration.");
      }
    } catch (err) {
      console.error("Erreur CMS save:", err);
      alert("Erreur réseau.");
    }
  };

  // Reorder page layout blocks
  const moveBlock = (index, direction) => {
    const newOrder = [...cmsData.blockOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    // Swap
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    
    setCmsData(prev => ({ ...prev, blockOrder: newOrder }));
  };

  // Quick Action: Access the service in the floating hero card
  const handleQuickAccessClick = () => {
    if (cmsData.floatingServiceId) {
      const found = services.find(s => s._id === cmsData.floatingServiceId);
      if (found) {
        setSelectedService(found);
        return;
      }
    }
    // Fallback: search by title
    const foundByTitle = services.find(s => s.title.toLowerCase() === cmsData.floatingService.toLowerCase());
    if (foundByTitle) {
      setSelectedService(foundByTitle);
    } else {
      alert(`Le service "${cmsData.floatingService}" n'est pas détaillé pour le moment.`);
    }
  };

  // Render elements in customized blocks order
  const renderBlock = (blockName) => {
    switch (blockName) {
      case "hero":
        return (
          <section 
            key="hero"
            className="sp-hero" 
            style={{ backgroundImage: `url(${cmsData.heroBgImage})` }}
          >
            <div className="sp-hero-overlay" />
            
            {adminMode && (
              <button 
                type="button" 
                className="edit-hero-btn" 
                onClick={() => setOpenCmsModal(true)}
              >
                <Settings size={14} /> Gérer la page
              </button>
            )}

            <div className="sp-hero-container">
              <div className="sp-hero-content">
                <span className="sp-hero-badge">
                  <Globe size={14} /> {cmsData.heroBadge}
                </span>
                <h1 className="sp-hero-title">{cmsData.heroTitle}</h1>
                <p className="sp-hero-desc">{cmsData.heroDesc}</p>
                <div className="sp-hero-ctas">
                  <a href="#search-section" className="btn-sp-primary">
                    Accéder aux démarches <ArrowRight size={16} />
                  </a>
                  <a href="#services-grid" className="btn-sp-secondary">
                    Voir les services
                  </a>
                </div>
              </div>

              {/* Glassmorphic Floating Card */}
              <div className="sp-hero-glasscard-wrap">
                <div className="sp-hero-glasscard">
                  <span className="glasscard-tag">Service le plus sollicité</span>
                  <h3 className="glasscard-title">{cmsData.floatingService}</h3>
                  <div className="glasscard-grid">
                    <div className="glasscard-item">
                      <span className="glasscard-label">Temps Moyen</span>
                      <span className="glasscard-value">{cmsData.floatingTime}</span>
                    </div>
                    <div className="glasscard-item">
                      <span className="glasscard-label">Disponibilité</span>
                      <span className="glasscard-value">{cmsData.floatingStatus}</span>
                    </div>
                    <div className="glasscard-item" style={{ gridColumn: 'span 2', marginTop: '5px' }}>
                      <span className="glasscard-label">Demandes Traitées</span>
                      <span className="glasscard-value" style={{ color: '#4ade80' }}>📈 {cmsData.floatingRequests}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-glasscard-action"
                    onClick={handleQuickAccessClick}
                  >
                    Accès rapide <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      case "search":
        return (
          <section id="search-section" key="search" className="search-filter-section">
            <div className="search-filter-wrapper">
              <div className="search-bar-container">
                <Search className="search-input-icon" size={20} />
                <input 
                  type="text" 
                  className="sp-search-input"
                  placeholder="Rechercher une démarche, un document, un service municipal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                
                {/* Instant Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="search-suggestions-dropdown">
                    {suggestions.map(s => (
                      <div 
                        key={s._id} 
                        className="suggestion-item"
                        onClick={() => setSelectedService(s)}
                      >
                        <FileText size={16} style={{ color: '#0d4a3e' }} />
                        <span className="suggestion-title">{s.title}</span>
                        <span className="suggestion-category">{s.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories filters */}
              <div className="filters-container">
                <button 
                  className={`btn-filter-category ${selectedCategory === "Tous" ? 'active' : ''}`}
                  onClick={() => setSelectedCategory("Tous")}
                >
                  Tous les thèmes
                </button>
                {getCategories().map((cat, idx) => (
                  <button 
                    key={idx}
                    className={`btn-filter-category ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>
        );

      case "services":
        return (
          <section id="services-grid" key="services" className="services-grid-section">
            <div className="grid-header">
              <div className="section-title-wrap">
                <span className="section-pretitle">Annuaire Communal</span>
                <h2 className="section-main-title">Nos <span>Services Publics</span></h2>
              </div>
              {adminMode && (
                <button 
                  className="btn-sp-primary" 
                  onClick={handleAddServiceClick}
                  style={{ borderRadius: '12px', padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Nouveau Service
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <RefreshCw className="animate-spin" size={36} style={{ color: '#0d4a3e', margin: '0 auto 15px' }} />
                <p style={{ color: '#64748b', fontWeight: 600 }}>Chargement de l'annuaire municipal...</p>
              </div>
            ) : getFilteredServices().length === 0 ? (
              <div style={{ padding: '80px 0', background: 'white', borderRadius: '24px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                <AlertTriangle size={48} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Aucun service public ne correspond à votre recherche ou catégorie.</p>
              </div>
            ) : (
              <div className="sp-card-container">
                {getFilteredServices().map(s => (
                  <div key={s._id} className={`sp-service-card ${!s.isVisible ? 'invisible-service' : ''}`}>
                    
                    {adminMode && (
                      <>
                        {!s.isVisible && <span className="hidden-tag">Masqué</span>}
                        <div className="sp-card-admin-ctrls">
                          <button 
                            className="btn-card-ctrl edit"
                            title="Modifier"
                            onClick={() => handleEditServiceClick(s)}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn-card-ctrl delete"
                            title="Supprimer"
                            onClick={() => handleDeleteService(s._id)}
                          >
                            <Trash size={14} />
                          </button>
                          <button 
                            className="btn-card-ctrl"
                            style={{ background: s.isVisible ? '#475569' : '#10b981' }}
                            title={s.isVisible ? "Masquer" : "Rendre visible"}
                            onClick={() => handleToggleVisibility(s)}
                          >
                            {s.isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </>
                    )}

                    <div className="sp-card-img-wrap">
                      <img 
                        src={s.img ? (s.img.startsWith('/public/') ? `${import.meta.env.VITE_API_URL || ''}${s.img}` : s.img) : "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"} 
                        alt={s.title} 
                        className="sp-card-img" 
                      />
                      <div className="sp-card-gradient" />
                      <span className="sp-card-category">{s.category}</span>
                      {s.badge && <span className="sp-card-badge">{s.badge}</span>}
                      <span className="sp-card-icon-floating">
                        {resolveIcon(s.icon, 20)}
                      </span>
                    </div>

                    <div className="sp-card-body">
                      <div>
                        <h3 className="sp-card-title">{s.title}</h3>
                        <p className="sp-card-desc">{s.desc}</p>
                      </div>
                      
                      <div>
                        <div className="sp-card-meta-row">
                          <span className="sp-meta-item">
                            <Clock size={12} style={{ color: '#10b981' }} />
                            <span>Délai: <strong>{s.delay || 'N/A'}</strong></span>
                          </span>
                          <span className="sp-meta-item">
                            <Layers size={12} style={{ color: '#10b981' }} />
                            <span>{s.onlineStatus || 'Sur Place'}</span>
                          </span>
                        </div>
                        <button 
                          className="btn-card-access"
                          onClick={() => setSelectedService(s)}
                        >
                          Accéder au service <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      case "procedures":
        return (
          <section key="procedures" className="sp-procedures-section">
            <div className="sp-procedures-container">
              <div className="section-title-wrap" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="section-pretitle" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Popularités</span>
                <h2 className="section-main-title" style={{ textAlign: 'center' }}>Démarches Administratives <span>en Ligne</span></h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '600px', margin: '10px auto 0' }}>
                  Réalisez vos démarches les plus courantes sans vous déplacer. Les guichets numériques de la Mairie de Dembéni sont actifs 24h/24.
                </p>
              </div>

              <div className="procedures-list">
                {services.filter(s => s.isVisible && (s.badge === 'Populaire' || s.badge === 'Important' || s.onlineStatus.toLowerCase().includes('ligne'))).slice(0, 4).map(p => (
                  <div key={p._id} className="procedure-item-card">
                    <div className="proc-info">
                      <div className="proc-icon-wrap">
                        {resolveIcon(p.icon, 18)}
                      </div>
                      <div>
                        <h4 className="proc-title">{p.title}</h4>
                        <p className="proc-desc">{p.desc}</p>
                      </div>
                    </div>
                    
                    <div className="proc-delay">
                      <span>Délai d'instruction</span>
                      ⏳ {p.delay}
                    </div>

                    <div className="proc-docs">
                      <span>Pièces requises</span>
                      📂 {p.documents?.length || 0} document(s)
                    </div>

                    <div>
                      <span className={`proc-status-badge ${p.onlineStatus.toLowerCase().includes('ligne') ? 'online' : 'physical'}`}>
                        {p.onlineStatus}
                      </span>
                    </div>

                    <button 
                      className="btn-proc-action"
                      onClick={() => setSelectedService(p)}
                    >
                      <ArrowRight size={22} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "stats":
        return (
          <section key="stats" className="sp-stats-section">
            <div className="sp-stats-container">
              <div className="stat-item-premium">
                <span className="stat-num-anim">
                  <AnimatedCounter value={cmsData.stat1Val.replace(/\D/g, '')} suffix="+" />
                </span>
                <span className="stat-label-prem">{cmsData.stat1Label}</span>
              </div>
              <div className="stat-item-premium">
                <span className="stat-num-anim">
                  <AnimatedCounter value={cmsData.stat2Val.replace(/\D/g, '')} />
                </span>
                <span className="stat-label-prem">{cmsData.stat2Label}</span>
              </div>
              <div className="stat-item-premium">
                <span className="stat-num-anim">
                  <AnimatedCounter value={cmsData.stat3Val.replace(/\D/g, '')} suffix="%" />
                </span>
                <span className="stat-label-prem">{cmsData.stat3Label}</span>
              </div>
              <div className="stat-item-premium">
                <span className="stat-num-anim">
                  <AnimatedCounter value={cmsData.stat4Val.replace(/\D/g, '')} suffix="%" />
                </span>
                <span className="stat-label-prem">{cmsData.stat4Label}</span>
              </div>
              <div className="stat-item-premium">
                <span className="stat-num-anim">
                  <AnimatedCounter value={cmsData.stat5Val} suffix=" J" />
                </span>
                <span className="stat-label-prem">{cmsData.stat5Label}</span>
              </div>
            </div>
            
            {adminMode && (
              <button 
                type="button" 
                className="btn-edit-stats"
                onClick={() => setOpenCmsModal(true)}
              >
                Éditer Stats
              </button>
            )}
          </section>
        );

      case "news":
        return (
          <section key="news" className="sp-news-section">
            <div className="section-title-wrap" style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span className="section-pretitle">Actualités Administratives</span>
              <h2 className="section-main-title" style={{ textAlign: 'center' }}>Communiqués & <span>Alertes Citoyennes</span></h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '600px', margin: '10px auto 0' }}>
                Restez informés en temps réel des horaires exceptionnels, travaux d'infrastructures et annonces importantes des services publics.
              </p>
            </div>

            {loadingNews ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <RefreshCw className="animate-spin" size={24} style={{ color: '#0d4a3e', margin: '0 auto 10px' }} />
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Recherche d'annonces administratives...</p>
              </div>
            ) : news.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>Aucune alerte administrative n'est publiée pour le moment.</p>
              </div>
            ) : (
              <div className="news-cards-row">
                {news.map(n => (
                  <div key={n._id} className="sp-service-card" style={{ height: '100%' }}>
                    <div style={{ height: '180px', position: 'relative' }}>
                      <img 
                        src={n.image ? (n.image.startsWith('/public/') ? `${import.meta.env.VITE_API_URL || ''}${n.image}` : n.image) : "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800"} 
                        alt={n.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      {n.isUrgent && <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#dc2626', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>🚨 CRITIQUE</span>}
                    </div>
                    <div className="sp-card-body" style={{ padding: '20px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.68rem', fontWeight: 800, color: '#10b981' }}>
                          <span style={{ background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{n.type || 'COMMUNICATION'}</span>
                          <span style={{ color: '#64748b' }}>{new Date(n.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0d4a3e', margin: '0 0 8px 0', lineHeight: 1.35 }}>{n.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{n.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="services-page-wrapper">
      
      {/* Admin Toggle Bar */}
      {isAdmin && (
        <div className="admin-sticky-bar">
          <div className="admin-bar-title">
            <Settings size={18} /> Console Mairie / Services Publics
          </div>
          <div className="admin-bar-actions">
            <button 
              type="button" 
              className={`btn-admin-toggle ${adminMode ? 'active' : ''}`}
              onClick={() => setAdminMode(!adminMode)}
            >
              {adminMode ? "Mode Edition Actif" : "Activer l'Edition"}
            </button>
            {adminMode && (
              <>
                <button 
                  type="button" 
                  className="btn-admin-action"
                  onClick={() => setOpenCmsModal(true)}
                >
                  <Layers size={14} /> Structurer la page
                </button>
                <button 
                  type="button" 
                  className="btn-admin-action"
                  style={{ background: '#10b981', color: 'white' }}
                  onClick={handleAddServiceClick}
                >
                  <Plus size={14} /> Nouveau Service
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Render sections according to layout order */}
      {cmsData.blockOrder.map(block => renderBlock(block))}

      {/* ========================================================
          7. SERVICE DETAILED MODAL 
      ======================================================== */}
      {selectedService && (
        <div className="sp-detail-overlay" onClick={() => setSelectedService(null)}>
          <div className="sp-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button"
              className="btn-detail-close" 
              onClick={() => setSelectedService(null)}
            >
              <X size={18} />
            </button>

            <div className="sp-detail-banner">
              <img 
                src={selectedService.img ? (selectedService.img.startsWith('/public/') ? `${import.meta.env.VITE_API_URL || ''}${selectedService.img}` : selectedService.img) : "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"} 
                alt={selectedService.title} 
                className="sp-detail-banner-img" 
              />
              <div className="sp-detail-banner-overlay" />
              <div className="sp-detail-banner-info">
                <span className="sp-detail-category-badge">{selectedService.category}</span>
                <h2 className="sp-detail-title">{selectedService.title}</h2>
              </div>
            </div>

            <div className="sp-detail-body">
              <div className="sp-detail-main">
                <div>
                  <h3 className="detail-section-title">
                    <Info size={16} /> Présentation de la démarche
                  </h3>
                  <p className="sp-detail-desc">{selectedService.fullDesc || selectedService.desc}</p>
                </div>

                {selectedService.documents?.length > 0 && (
                  <div>
                    <h3 className="detail-section-title">
                      <FileText size={16} /> Pièces justificatives requises
                    </h3>
                    <ul className="docs-list-bullet">
                      {selectedService.documents.map((doc, idx) => (
                        <li key={idx}>
                          <CheckCircle size={14} />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedService.steps?.length > 0 && (
                  <div>
                    <h3 className="detail-section-title">
                      <Layers size={16} /> Étapes de traitement de votre dossier
                    </h3>
                    <ul className="steps-list-bullet">
                      {selectedService.steps.map((step, idx) => (
                        <li key={idx} data-step={idx + 1}>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedService.faq?.length > 0 && (
                  <div>
                    <h3 className="detail-section-title">
                      <BookOpen size={16} /> Questions Fréquentes (FAQ)
                    </h3>
                    <div className="faq-accordion">
                      {selectedService.faq.map((f, idx) => (
                        <div key={idx} className="faq-item">
                          <button 
                            type="button" 
                            className="faq-question-btn"
                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                          >
                            <span>{f.question}</span>
                            {openFaqIndex === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {openFaqIndex === idx && (
                            <div className="faq-answer">{f.answer}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sp-detail-aside">
                <div className="sp-info-box">
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 850, margin: '0 0 15px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#0d4a3e' }}>
                    Informations Guichet
                  </h3>
                  
                  <div className="info-tile">
                    <div className="info-tile-icon"><MapPin size={16} /></div>
                    <div className="info-tile-content">
                      <h4>Lieu de dépôt</h4>
                      <p>{selectedService.location || 'Hôtel de Ville'}</p>
                    </div>
                  </div>

                  <div className="info-tile">
                    <div className="info-tile-icon"><Clock size={16} /></div>
                    <div className="info-tile-content">
                      <h4>Horaires d'accueil</h4>
                      <p>{selectedService.hours}</p>
                    </div>
                  </div>

                  <div className="info-tile">
                    <div className="info-tile-icon"><Phone size={16} /></div>
                    <div className="info-tile-content">
                      <h4>Téléphone direct</h4>
                      <p>{selectedService.phone}</p>
                    </div>
                  </div>

                  <div className="info-tile">
                    <div className="info-tile-icon"><Mail size={16} /></div>
                    <div className="info-tile-content">
                      <h4>Adresse E-mail</h4>
                      <p>{selectedService.email}</p>
                    </div>
                  </div>
                </div>

                {selectedService.formulaireUrls?.length > 0 && (
                  <div className="download-box">
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 850, margin: '0 0 12px 0', color: '#10b981' }}>
                      Formulaires à télécharger
                    </h3>
                    <div className="download-list">
                      {selectedService.formulaireUrls.map((form, idx) => (
                        <a 
                          key={idx} 
                          href={form.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-download-form"
                        >
                          <Upload size={14} style={{ transform: 'rotate(180deg)' }} />
                          <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{form.name}</span>
                          <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedService.associatedDemarches?.length > 0 && (
                  <div className="sp-info-box" style={{ background: '#f1f5f9' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 10px 0', color: '#1e293b' }}>
                      Démarches associées
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedService.associatedDemarches.map((dem, idx) => (
                        <a 
                          key={idx} 
                          href={dem.url} 
                          className="btn-download-form" 
                          style={{ background: 'white' }}
                        >
                          <FileText size={14} style={{ color: '#0d4a3e' }} />
                          <span>{dem.title}</span>
                          <ArrowRight size={12} style={{ marginLeft: 'auto' }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sp-detail-footer">
              <button 
                type="button" 
                className="btn-modal-close-sp"
                onClick={() => setSelectedService(null)}
              >
                Retour aux services
              </button>
              <a href={`tel:${selectedService.phone}`} className="btn-sp-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
                <Phone size={14} /> Joindre le service
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          8. ADMIN CRUD MODAL (ADD & EDIT SERVICE)
      ======================================================== */}
      {openCrudModal && (
        <div className="crud-modal-overlay">
          <div className="crud-modal-card">
            <div className="crud-modal-header">
              <h2>{editingService ? `Modifier le service : ${serviceForm.title}` : "Créer un nouveau service public"}</h2>
              <button 
                type="button" 
                className="btn-crud-close"
                onClick={() => setOpenCrudModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form tabs */}
            <div className="crud-tabs">
              <button 
                type="button" 
                className={`crud-tab-btn ${crudTab === 'general' ? 'active' : ''}`}
                onClick={() => setCrudTab('general')}
              >
                Infos Générales
              </button>
              <button 
                type="button" 
                className={`crud-tab-btn ${crudTab === 'contacts' ? 'active' : ''}`}
                onClick={() => setCrudTab('contacts')}
              >
                Guichet & Contacts
              </button>
              <button 
                type="button" 
                className={`crud-tab-btn ${crudTab === 'media' ? 'active' : ''}`}
                onClick={() => setCrudTab('media')}
              >
                Image & Icône
              </button>
              <button 
                type="button" 
                className={`crud-tab-btn ${crudTab === 'content' ? 'active' : ''}`}
                onClick={() => setCrudTab('content')}
              >
                Pièces & Étapes
              </button>
              <button 
                type="button" 
                className={`crud-tab-btn ${crudTab === 'faq' ? 'active' : ''}`}
                onClick={() => setCrudTab('faq')}
              >
                FAQ & Liens
              </button>
            </div>

            <form onSubmit={handleSaveService} className="crud-form" encType="multipart/form-data">
              
              {/* Tab 1: General Info */}
              {crudTab === "general" && (
                <>
                  <div className="form-group">
                    <label>Titre officiel du service *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      placeholder="Ex: Acte de naissance, Passeport..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description courte (Affichée sur les cartes) *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={serviceForm.desc}
                      onChange={(e) => setServiceForm({ ...serviceForm, desc: e.target.value })}
                      placeholder="Ex: Obtenir une copie intégrale d'acte de naissance..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description complète (Affichée dans les détails)</label>
                    <textarea 
                      className="form-control"
                      rows={5}
                      value={serviceForm.fullDesc}
                      onChange={(e) => setServiceForm({ ...serviceForm, fullDesc: e.target.value })}
                      placeholder="Décrivez en détail les conditions, objectifs et contraintes du service..."
                    />
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Catégorie du Service</label>
                      <select 
                        className="form-control"
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      >
                        {defaultCategories.map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                        <option value="Autre">Autre...</option>
                      </select>
                    </div>

                    {serviceForm.category === "Autre" && (
                      <div className="form-group">
                        <label>Spécifier la catégorie personnalisée</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={serviceForm.customCategory}
                          onChange={(e) => setServiceForm({ ...serviceForm, customCategory: e.target.value })}
                          placeholder="Nom de la nouvelle catégorie"
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Badge d'accroche (Optionnel)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={serviceForm.badge}
                        onChange={(e) => setServiceForm({ ...serviceForm, badge: e.target.value })}
                        placeholder="Ex: Nouveau, Rapide, Populaire..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Ordre d'affichage (Trier)</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={serviceForm.order}
                        onChange={(e) => setServiceForm({ ...serviceForm, order: e.target.value })}
                        placeholder="Ordre numérique (ex: 1, 2, 3...)"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ flexDirection: 'row', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="isVisibleCheck"
                      checked={serviceForm.isVisible}
                      onChange={(e) => setServiceForm({ ...serviceForm, isVisible: e.target.checked })}
                    />
                    <label htmlFor="isVisibleCheck" style={{ cursor: 'pointer', textTransform: 'none', fontSize: '0.85rem' }}>
                      Rendre ce service public visible aux citoyens de la commune
                    </label>
                  </div>
                </>
              )}

              {/* Tab 2: Contacts & Hours */}
              {crudTab === "contacts" && (
                <>
                  <div className="form-group">
                    <label>Lieu physique d'accueil</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={serviceForm.location}
                      onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                      placeholder="Ex: Bureau de l'état civil - Hôtel de Ville"
                    />
                  </div>

                  <div className="form-group">
                    <label>Horaires d'accueil physique</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={serviceForm.hours}
                      onChange={(e) => setServiceForm({ ...serviceForm, hours: e.target.value })}
                      placeholder="Ex: Lundi au Vendredi : 8h00 - 15h00..."
                    />
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Téléphone direct</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={serviceForm.phone}
                        onChange={(e) => setServiceForm({ ...serviceForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Adresse E-mail du service</label>
                      <input 
                        type="email" 
                        className="form-control"
                        value={serviceForm.email}
                        onChange={(e) => setServiceForm({ ...serviceForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Délai moyen de traitement</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={serviceForm.delay}
                        onChange={(e) => setServiceForm({ ...serviceForm, delay: e.target.value })}
                        placeholder="Ex: 3 à 5 jours, 1 mois..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Statut de disponibilité</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={serviceForm.onlineStatus}
                        onChange={(e) => setServiceForm({ ...serviceForm, onlineStatus: e.target.value })}
                        placeholder="Ex: Disponible en ligne, Guichet uniquement..."
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Tab 3: Media & Icons */}
              {crudTab === "media" && (
                <>
                  <div className="form-group">
                    <label>Icône du Service (Lucide Icon Name)</label>
                    <select 
                      className="form-control"
                      value={serviceForm.icon}
                      onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                    >
                      <option value="FileText">📄 Document (FileText)</option>
                      <option value="Shield">🛡️ Protection / CNI (Shield)</option>
                      <option value="MapPin">📍 Urbanisme (MapPin)</option>
                      <option value="Globe">🌐 Élections / Voirie (Globe)</option>
                      <option value="Heart">❤️ Santé / CCAS (Heart)</option>
                      <option value="Activity">⚡ Activité (Activity)</option>
                      <option value="Phone">📞 Téléphone (Phone)</option>
                      <option value="Clock">⏱️ Horaires (Clock)</option>
                      <option value="Mail">✉️ Email (Mail)</option>
                      <option value="BookOpen">📖 Scolaire / Education (BookOpen)</option>
                      <option value="Users">👥 Social / Famille (Users)</option>
                      <option value="CheckCircle">✅ Validation (CheckCircle)</option>
                      <option value="AlertTriangle">⚠️ Alerte / Sécurité (AlertTriangle)</option>
                      <option value="Layers">🥞 Démarches (Layers)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Image d'illustration du Service</label>
                    
                    {/* Drag and Drop Zone */}
                    {!imagePreview ? (
                      <div 
                        className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="uploader-icon" size={32} />
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>
                          Faites glisser votre image ici ou cliquez pour parcourir.
                        </p>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.72rem' }}>
                          Formats acceptés : JPG, JPEG, PNG, WEBP uniquement.
                        </p>
                      </div>
                    ) : (
                      <div className="upload-preview-container">
                        <img src={imagePreview} alt="Aperçu upload" className="upload-preview-img" />
                        <button 
                          type="button" 
                          className="btn-remove-preview"
                          title="Supprimer l'image"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileChange}
                    />
                  </div>
                </>
              )}

              {/* Tab 4: Required documents & Steps */}
              {crudTab === "content" && (
                <>
                  <div className="form-group" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                    <label>Pièces justificatives requises</label>
                    <div className="list-builder-row">
                      <input 
                        type="text" 
                        className="form-control"
                        style={{ flex: 1 }}
                        placeholder="Ex: Justificatif de domicile de moins de 3 mois..."
                        value={newDoc}
                        onChange={(e) => setNewDoc(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="btn-sp-primary" 
                        style={{ borderRadius: '10px', padding: '10px 16px' }}
                        onClick={() => {
                          if (newDoc.trim()) {
                            setServiceForm({ ...serviceForm, documents: [...serviceForm.documents, newDoc.trim()] });
                            setNewDoc("");
                          }
                        }}
                      >
                        Ajouter
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {serviceForm.documents.map((doc, idx) => (
                        <div key={idx} className="list-builder-item">
                          <span>• {doc}</span>
                          <button 
                            type="button" 
                            className="btn-remove-list-item"
                            onClick={() => setServiceForm({
                              ...serviceForm,
                              documents: serviceForm.documents.filter((_, i) => i !== idx)
                            })}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Étapes à suivre pour la démarche</label>
                    <div className="list-builder-row">
                      <input 
                        type="text" 
                        className="form-control"
                        style={{ flex: 1 }}
                        placeholder="Ex: Étape 1 : Effectuer la pré-demande en ligne..."
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="btn-sp-primary" 
                        style={{ borderRadius: '10px', padding: '10px 16px' }}
                        onClick={() => {
                          if (newStep.trim()) {
                            setServiceForm({ ...serviceForm, steps: [...serviceForm.steps, newStep.trim()] });
                            setNewStep("");
                          }
                        }}
                      >
                        Ajouter
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {serviceForm.steps.map((st, idx) => (
                        <div key={idx} className="list-builder-item">
                          <span>{idx + 1}. {st}</span>
                          <button 
                            type="button" 
                            className="btn-remove-list-item"
                            onClick={() => setServiceForm({
                              ...serviceForm,
                              steps: serviceForm.steps.filter((_, i) => i !== idx)
                            })}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Tab 5: FAQ & Links */}
              {crudTab === "faq" && (
                <>
                  {/* FAQ Builder */}
                  <div className="form-group" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                    <label>Questions / Réponses (FAQ)</label>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="La question posée par l'administré..."
                        value={newFaqQ}
                        onChange={(e) => setNewFaqQ(e.target.value)}
                      />
                      <textarea 
                        className="form-control"
                        rows={2}
                        placeholder="La réponse claire apportée par la mairie..."
                        value={newFaqA}
                        onChange={(e) => setNewFaqA(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="btn-sp-primary" 
                        style={{ borderRadius: '10px', alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8rem' }}
                        onClick={() => {
                          if (newFaqQ.trim() && newFaqA.trim()) {
                            setServiceForm({ 
                              ...serviceForm, 
                              faq: [...serviceForm.faq, { question: newFaqQ.trim(), answer: newFaqA.trim() }] 
                            });
                            setNewFaqQ("");
                            setNewFaqA("");
                          }
                        }}
                      >
                        Ajouter à la FAQ
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {serviceForm.faq.map((item, idx) => (
                        <div key={idx} className="faq-builder-item">
                          <strong style={{ fontSize: '0.82rem', display: 'block', color: '#0d4a3e' }}>Q: {item.question}</strong>
                          <p style={{ fontSize: '0.78rem', margin: '4px 0 0', color: '#64748b' }}>R: {item.answer}</p>
                          <button 
                            type="button" 
                            className="btn-remove-faq-item"
                            onClick={() => setServiceForm({
                              ...serviceForm,
                              faq: serviceForm.faq.filter((_, i) => i !== idx)
                            })}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form URLs Builder */}
                  <div className="form-group" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                    <label>Formulaires à télécharger</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr auto', gap: '10px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Nom (ex: Cerfa 13406)" 
                        value={newFormName}
                        onChange={(e) => setNewFormName(e.target.value)}
                      />
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="URL de téléchargement" 
                        value={newFormUrl}
                        onChange={(e) => setNewFormUrl(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="btn-sp-primary" 
                        style={{ borderRadius: '10px' }}
                        onClick={() => {
                          if (newFormName.trim() && newFormUrl.trim()) {
                            setServiceForm({ 
                              ...serviceForm, 
                              formulaireUrls: [...serviceForm.formulaireUrls, { name: newFormName.trim(), url: newFormUrl.trim() }] 
                            });
                            setNewFormName("");
                            setNewFormUrl("");
                          }
                        }}
                      >
                        Ajouter
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {serviceForm.formulaireUrls.map((f, idx) => (
                        <div key={idx} className="list-builder-item">
                          <span>{f.name} ({f.url})</span>
                          <button 
                            type="button" 
                            className="btn-remove-list-item"
                            onClick={() => setServiceForm({
                              ...serviceForm,
                              formulaireUrls: serviceForm.formulaireUrls.filter((_, i) => i !== idx)
                            })}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Associated procedures */}
                  <div className="form-group">
                    <label>Démarches associées</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr auto', gap: '10px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Titre de la démarche" 
                        value={newAssocTitle}
                        onChange={(e) => setNewAssocTitle(e.target.value)}
                      />
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="URL ou chemin interne" 
                        value={newAssocUrl}
                        onChange={(e) => setNewAssocUrl(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="btn-sp-primary" 
                        style={{ borderRadius: '10px' }}
                        onClick={() => {
                          if (newAssocTitle.trim() && newAssocUrl.trim()) {
                            setServiceForm({ 
                              ...serviceForm, 
                              associatedDemarches: [...serviceForm.associatedDemarches, { title: newAssocTitle.trim(), url: newAssocUrl.trim() }] 
                            });
                            setNewAssocTitle("");
                            setNewAssocUrl("");
                          }
                        }}
                      >
                        Ajouter
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {serviceForm.associatedDemarches.map((a, idx) => (
                        <div key={idx} className="list-builder-item">
                          <span>{a.title} ({a.url})</span>
                          <button 
                            type="button" 
                            className="btn-remove-list-item"
                            onClick={() => setServiceForm({
                              ...serviceForm,
                              associatedDemarches: serviceForm.associatedDemarches.filter((_, i) => i !== idx)
                            })}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Modal controls */}
              <div className="crud-modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel-crud"
                  onClick={() => setOpenCrudModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-save-crud"
                >
                  <Check size={16} /> Enregistrer le Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          9. GLOBAL CMS PAGE CONFIGURATION MODAL (CMS DATA)
      ======================================================== */}
      {openCmsModal && (
        <div className="crud-modal-overlay">
          <div className="crud-modal-card" style={{ maxHeight: '620px' }}>
            <div className="crud-modal-header">
              <h2>Configuration Globale de la Page</h2>
              <button 
                type="button" 
                className="btn-crud-close"
                onClick={() => setOpenCmsModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCmsSettings} className="crud-form">
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 850, margin: '0 0 5px 0', color: '#0d4a3e', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    Textes de la Section Hero
                  </h3>

                  <div className="form-group">
                    <label>Badge d'en-tête</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={cmsData.heroBadge}
                      onChange={(e) => setCmsData({ ...cmsData, heroBadge: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Titre principal Hero</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={cmsData.heroTitle}
                      onChange={(e) => setCmsData({ ...cmsData, heroTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description explicative Hero</label>
                    <textarea 
                      className="form-control"
                      rows={3}
                      value={cmsData.heroDesc}
                      onChange={(e) => setCmsData({ ...cmsData, heroDesc: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Image d'arrière-plan Hero (Base64 ou URL)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={cmsData.heroBgImage.startsWith('data:') ? 'Image importée localement (Base64)' : cmsData.heroBgImage}
                      onChange={(e) => setCmsData({ ...cmsData, heroBgImage: e.target.value })}
                      placeholder="Coller l'URL de l'image"
                    />
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        type="button" 
                        className="btn-sp-secondary"
                        style={{ border: '1px solid #cbd5e1', color: '#1e293b', padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => heroFileInputRef.current?.click()}
                      >
                        Téléverser un fichier local
                      </button>
                      <input 
                        type="file" 
                        ref={heroFileInputRef} 
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleHeroBgUpload}
                      />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '0.9rem', fontWeight: 850, margin: '15px 0 5px 0', color: '#0d4a3e', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    Carte Flottante Hero
                  </h3>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Service mis en avant</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={cmsData.floatingService}
                        onChange={(e) => setCmsData({ ...cmsData, floatingService: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Lien vers la fiche détaillée</label>
                      <select 
                        className="form-control"
                        value={cmsData.floatingServiceId}
                        onChange={(e) => setCmsData({ ...cmsData, floatingServiceId: e.target.value })}
                      >
                        <option value="">-- Choisir un service --</option>
                        {services.map(s => (
                          <option key={s._id} value={s._id}>{s.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Délai moyen affiché</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={cmsData.floatingTime}
                        onChange={(e) => setCmsData({ ...cmsData, floatingTime: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Disponibilité affichée</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={cmsData.floatingStatus}
                        onChange={(e) => setCmsData({ ...cmsData, floatingStatus: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Nombre de demandes</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={cmsData.floatingRequests}
                        onChange={(e) => setCmsData({ ...cmsData, floatingRequests: e.target.value })}
                      />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '0.9rem', fontWeight: 850, margin: '15px 0 5px 0', color: '#0d4a3e', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    Statistiques du Portail
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '10px' }}>
                      <input type="text" className="form-control" value={cmsData.stat1Val} onChange={(e) => setCmsData({ ...cmsData, stat1Val: e.target.value })} placeholder="Valeur (ex: 24)" />
                      <input type="text" className="form-control" value={cmsData.stat1Label} onChange={(e) => setCmsData({ ...cmsData, stat1Label: e.target.value })} placeholder="Libellé" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '10px' }}>
                      <input type="text" className="form-control" value={cmsData.stat2Val} onChange={(e) => setCmsData({ ...cmsData, stat2Val: e.target.value })} placeholder="Valeur" />
                      <input type="text" className="form-control" value={cmsData.stat2Label} onChange={(e) => setCmsData({ ...cmsData, stat2Label: e.target.value })} placeholder="Libellé" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '10px' }}>
                      <input type="text" className="form-control" value={cmsData.stat3Val} onChange={(e) => setCmsData({ ...cmsData, stat3Val: e.target.value })} placeholder="Valeur" />
                      <input type="text" className="form-control" value={cmsData.stat3Label} onChange={(e) => setCmsData({ ...cmsData, stat3Label: e.target.value })} placeholder="Libellé" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '10px' }}>
                      <input type="text" className="form-control" value={cmsData.stat4Val} onChange={(e) => setCmsData({ ...cmsData, stat4Val: e.target.value })} placeholder="Valeur" />
                      <input type="text" className="form-control" value={cmsData.stat4Label} onChange={(e) => setCmsData({ ...cmsData, stat4Label: e.target.value })} placeholder="Libellé" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '10px' }}>
                      <input type="text" className="form-control" value={cmsData.stat5Val} onChange={(e) => setCmsData({ ...cmsData, stat5Val: e.target.value })} placeholder="Valeur" />
                      <input type="text" className="form-control" value={cmsData.stat5Label} onChange={(e) => setCmsData({ ...cmsData, stat5Label: e.target.value })} placeholder="Libellé" />
                    </div>
                  </div>

                </div>

                {/* Sidebar layout blocks reorder */}
                <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '24px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 850, margin: '0 0 15px 0', color: '#0d4a3e', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    Ordonner les Blocs
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 15px 0' }}>
                    Organisez l'agencement de la page. Les blocs s'afficheront du haut vers le bas dans l'ordre de cette liste.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cmsData.blockOrder.map((blockName, idx) => {
                      const translations = {
                        hero: "En-tête / Hero Section",
                        search: "Filtres et Barre de recherche",
                        services: "Grille des Services Publics",
                        procedures: "Démarches populaires en ligne",
                        stats: "Bandeau des Statistiques animées",
                        news: "Dernières actualités administratives"
                      };
                      return (
                        <div 
                          key={blockName} 
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '12px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{translations[blockName] || blockName}</span>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                              type="button" 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                              disabled={idx === 0}
                              onClick={() => moveBlock(idx, -1)}
                            >
                              ▲
                            </button>
                            <button 
                              type="button" 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: idx === cmsData.blockOrder.length - 1 ? 0.3 : 1 }}
                              disabled={idx === cmsData.blockOrder.length - 1}
                              onClick={() => moveBlock(idx, 1)}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="crud-modal-footer" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-cancel-crud"
                  onClick={() => setOpenCmsModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-save-crud"
                >
                  <Check size={16} /> Enregistrer la structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServicesPublicsPage;
