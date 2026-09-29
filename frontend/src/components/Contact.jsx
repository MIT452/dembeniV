import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2, AlertCircle, 
  HelpCircle, ChevronDown, ShieldAlert, ArrowRight, Compass, ExternalLink, Activity
} from 'lucide-react';
import { validateMayottePhone } from '../utils/phoneValidator';
import './Contact.css';

const INFO_CARDS = [
  { 
    icon: <MapPin size={24} />, 
    title: "Adresse de l'Hôtel de Ville", 
    text: "Mairie de Dembéni\n1 Rue de la Mairie, 97660 Dembéni, Mayotte",
    accent: "green"
  },
  { 
    icon: <Phone size={24} />, 
    title: "Permanence Téléphonique", 
    text: "02 69 61 11 00\nStandard général disponible en semaine",
    accent: "blue"
  },
  { 
    icon: <Mail size={24} />, 
    title: "Adresse Courriel", 
    text: "dembenimairie@gmail.com\nRéponse garantie sous 48h ouvrées",
    accent: "purple"
  },
  { 
    icon: <Clock size={24} />, 
    title: "Horaires de Guichet", 
    text: "Lun-Jeu: 7h30 - 15h30\nVen: 7h30 - 11h30 (fermé l'après-midi)",
    accent: "orange"
  },
];

const FAQ_ITEMS = [
  {
    q: "Quels sont les documents obligatoires pour renouveler ma CNI ?",
    a: "Pour renouveler votre Carte Nationale d'Identité, vous devez fournir votre ancienne CNI, une photo d'identité récente (moins de 6 mois) conforme aux normes, un justificatif de domicile de moins de 3 mois, et votre numéro de pré-demande ANTS effectué en ligne."
  },
  {
    q: "Comment obtenir un acte de naissance plurilingue ?",
    a: "Vous pouvez faire votre demande directement depuis votre Espace Citoyen dans la section 'Mes démarches'. Après validation par l'officier d'état civil, le document signé numériquement sera téléchargeable dans votre Espace sous format PDF certifié."
  },
  {
    q: "Quelles sont les aides d'urgence proposées par le CCAS ?",
    a: "Le Centre Communal d'Action Sociale (CCAS) de Dembéni propose des aides alimentaires d'urgence, des conseils en matière de logement social, ainsi qu'un accompagnement personnalisé pour la constitution de dossiers de prestations sociales."
  },
  {
    q: "Comment prendre rendez-vous avec le Maire de Dembéni ?",
    a: "Les demandes d'audience avec Monsieur le Maire ou ses Adjoints se font en remplissant le formulaire de contact ci-dessous, en sélectionnant le service 'Cabinet du Maire', ou directement en appelant le secrétariat de la mairie au 02 69 61 11 00."
  }
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', service: 'Secrétariat Général', message: ''
  });
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: '', type: '' }); // 'success' | 'error' | ''
  const [activeFaq, setActiveFaq] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  // Form field changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (id === 'phone') {
      const validation = validateMayottePhone(value);
      setPhoneError(validation.isValid ? '' : validation.message);
    }
  };

  const handleSelectService = (serviceName) => {
    setFormData(prev => ({ ...prev, service: serviceName }));
  };

  // Express API email submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneVal = validateMayottePhone(formData.phone);
    if (!phoneVal.isValid) {
      setPhoneError(phoneVal.message);
      setStatus({ text: phoneVal.message, type: 'error' });
      return;
    }
    
    setLoading(true);
    setStatus({ text: '', type: '' });

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/contact`, formData);
      setStatus({ 
        text: res.data.message || "Votre message a bien été transmis à la mairie.", 
        type: "success" 
      });
      // Clear form
      setFormData({ name: '', email: '', phone: '', service: 'Secrétariat Général', message: '' });
      setPhoneError('');
    } catch (err) {
      console.error(err);
      setStatus({ 
        text: err.response?.data?.message || "Une erreur est survenue lors de l'envoi de votre courriel.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      
      {/* 1. INSTITUTIONAL HERO SECTION */}
      <section className="contact-hero-premium">
        <div className="hero-dark-overlay" />
        <div className="h-container contact-hero-content-wrap">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="hero-text-block"
          >
            <span className="premium-administrative-badge">
              COMMUNICATION USAGERS • MAIRIE DE DEMBÉNI
            </span>
            <h1 className="premium-hero-title">
              Contactez la Mairie de Dembéni
            </h1>
            <p className="premium-hero-subtitle">
              Nos agents et officiers administratifs restent à votre entière disposition pour toute demande d'assistance, formalité civile ou signalement territorial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. DASHBOARD INFO CARDS */}
      <section className="h-container contact-cards-container">
        <div className="contact-cards-grid-premium">
          {INFO_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              className="premium-contact-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              whileHover={{ y: -5 }}
            >
              <div className={`premium-card-icon-wrap ${card.accent}`}>
                {card.icon}
              </div>
              <h3 className="premium-card-title">{card.title}</h3>
              <p className="premium-card-text" style={{ whiteSpace: 'pre-line' }}>{card.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. TRANSACTIONAL FORM & REAL INTERACTIVE MAP */}
      <section className="h-container form-map-layout-grid">
        
        {/* Contact Form Wrapper */}
        <motion.div 
          className="contact-form-glass-premium"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="form-title-block">
            <span className="form-meta-tag">Formulaire Sécurisé</span>
            <h2 className="premium-form-heading">Transmettre un message</h2>
            <p className="premium-form-desc">Complétez les champs ci-dessous. Votre message sera aiguillé vers le service municipal compétent.</p>
          </div>

          <form onSubmit={handleSubmit} className="premium-grid-form">
            <div className="form-group-capsule">
              <label>Nom complet *</label>
              <input 
                type="text" 
                id="name" 
                className="premium-form-input" 
                placeholder="Ex: Abdallah Said" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group-capsule">
              <label>Adresse courriel (E-mail) *</label>
              <input 
                type="email" 
                id="email" 
                className="premium-form-input" 
                placeholder="Ex: said@domaine.yt" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group-capsule">
              <label>Numéro de téléphone</label>
              <input 
                type="tel" 
                id="phone" 
                className={`premium-form-input ${phoneError ? 'input-error' : ''}`}
                placeholder="Ex: 06 39 00 00 00" 
                value={formData.phone} 
                onChange={handleChange} 
              />
              {phoneError && (
                <span className="phone-validation-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <AlertCircle size={12} /> {phoneError}
                </span>
              )}
            </div>

            <div className="form-group-capsule">
              <label>Service communal destinataire *</label>
              <select 
                id="service" 
                className="premium-form-input selector-styled"
                value={formData.service}
                onChange={handleChange}
              >
                <option value="Secrétariat Général">Secrétariat Général</option>
                <option value="État Civil & CNI">État Civil & Cartes d'identité</option>
                <option value="Action Sociale (CCAS)">Action Sociale & CCAS</option>
                <option value="Urbanisme & Aménagement">Service Urbanisme</option>
                <option value="Cabinet du Maire">Cabinet du Maire</option>
              </select>
            </div>

            <div className="form-group-capsule span-2-cols">
              <label>Message détaillé *</label>
              <textarea 
                id="message" 
                className="premium-form-input text-area-styled" 
                placeholder="Précisez votre demande ou décrivez précisément votre situation..." 
                value={formData.message} 
                onChange={handleChange} 
                required
              />
            </div>

            <div className="form-group-capsule span-2-cols" style={{ marginTop: '10px' }}>
              <button 
                type="submit" 
                className="btn-auth-submit-gradient" 
                disabled={loading}
                style={{ width: '100%', margin: 0 }}
              >
                {loading ? <Loader2 className="h-spin" size={20} /> : <Send size={18} />}
                {loading ? 'Traitement et transmission...' : 'Transmettre à l\'administration'}
              </button>
            </div>

            {/* Alert Status Banners */}
            <AnimatePresence>
              {status.text && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`auth-alert-banner ${status.type}`}
                  style={{ gridColumn: 'span 2', marginTop: '16px', marginBottom: 0 }}
                >
                  {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{status.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Real Interactive OpenStreetMap Widget */}
        <motion.div 
          className="interactive-map-frame-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="map-frame-header-premium">
            <Compass size={18} className="map-icon" />
            <div>
              <span className="map-title-main">Géolocalisation de l'Hôtel de Ville</span>
              <span className="map-subtitle-sub">1 Rue de la Mairie, Dembéni</span>
            </div>
          </div>

          <div className="osm-iframe-wrapper">
            <iframe 
              title="Carte interactive de la Mairie de Dembéni"
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight="0" 
              marginWidth="0" 
              src="https://www.openstreetmap.org/export/embed.html?bbox=45.170%2C-12.855%2C45.190%2C-12.835&amp;layer=mapnik&amp;marker=-12.844%2C45.180"
              style={{ border: 'none' }}
            />
          </div>

          <div className="map-frame-footer-actions">
            <a 
              href="https://www.openstreetmap.org/?mlat=-12.844&amp;mlon=45.180#map=16/-12.844/45.180" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-map-action route"
            >
              Calculer l'itinéraire <ExternalLink size={14} />
            </a>
            <a 
              href="https://www.openstreetmap.org/#map=16/-12.844/45.180" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-map-action zoom"
            >
              Agrandir la carte
            </a>
          </div>
        </motion.div>
      </section>

      {/* 4. MUNICIPAL FAQ ACCORDION SECTION */}
      <section className="faq-municipal-section h-container">
        <div className="faq-intro-block-premium">
          <span className="faq-small-badge">FAQ ADMINISTRATIVE</span>
          <h2 className="faq-section-title-premium">Questions fréquentes des administrés</h2>
          <p className="faq-section-desc-premium">Consultez en un instant les réponses aux formalités les plus récurrentes.</p>
        </div>

        <div className="faq-accordion-grid-wrapper">
          {FAQ_ITEMS.map((faq, idx) => (
            <div key={idx} className={`faq-premium-accordion-item ${activeFaq === idx ? 'open' : ''}`}>
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="faq-accordion-question-bar"
              >
                <HelpCircle size={18} className="question-icon" />
                <span className="question-text">{faq.q}</span>
                <ChevronDown size={16} className="question-chevron" />
              </button>
              
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="faq-accordion-answer-box"
                  >
                    <p className="answer-text">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOTLINE & EMERGENCY ADMINISTRATIVE SUPPORT SECTION */}
      <section className="emergency-support-section-premium">
        <div className="h-container emergency-grid-wrap-prem">
          
          <div className="emergency-card-active red-alert">
            <div className="emergency-header-row">
              <ShieldAlert size={28} className="emergency-icon-active" />
              <div>
                <h4>Urgence Administrative / Sécurité</h4>
                <p>Pour tout incident grave sur la voie publique ou danger immédiat.</p>
              </div>
            </div>
            <div className="emergency-numbers-wrapper">
              <div className="emergency-number-item">
                <span className="number-label">Police Municipale</span>
                <span className="number-val">📞 02 69 61 11 02</span>
              </div>
              <div className="emergency-number-item">
                <span className="number-label">Gendarmerie Nationale</span>
                <span className="number-val">📞 17 (Urgences)</span>
              </div>
            </div>
          </div>

          <div className="emergency-card-active green-support">
            <div className="emergency-header-row">
              <Activity size={28} className="emergency-icon-active" />
              <div>
                <h4>Assistance Sociale & CCAS</h4>
                <p>Guichet d'entraide pour les foyers isolés ou en grande précarité.</p>
              </div>
            </div>
            <div className="emergency-numbers-wrapper">
              <div className="emergency-number-item">
                <span className="number-label">Accueil CCAS Mairie</span>
                <span className="number-val">📞 02 69 61 11 04</span>
              </div>
              <div className="emergency-number-item">
                <span className="number-label">Service Logement</span>
                <span className="number-val">📞 contact@dembeni.fr</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Contact;
