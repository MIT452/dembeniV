import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook, Instagram, Linkedin,
  MapPin, Phone, Mail, Clock,
  Building2, Leaf
} from 'lucide-react';

const year = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="site-footer-premium">
      <div className="footer-deco-circle-1" />
      <div className="footer-deco-circle-2" />

      <div className="h-container">
        {/* Main Footer Links & Info */}
        <div className="footer-main-grid">
          
          {/* Column 1: Brand Info */}
          <div className="footer-brand-col">
            <div className="footer-logo-area">
              <div className="footer-logo-mark">
                <Building2 size={22} />
              </div>
              <div>
                <div className="footer-brand-name">COMMUNE DE DEMBÉNI</div>
                <div className="footer-brand-tagline">RÉPUBLIQUE FRANÇAISE</div>
              </div>
            </div>
            <p className="footer-desc">
              Portail institutionnel officiel de la Ville de Dembéni. Accédez à l'ensemble des services administratifs en ligne et suivez l'actualité de votre territoire.
            </p>
            <div className="footer-social-row">
              <a href="https://facebook.com" className="footer-social-btn" target="_blank" rel="noopener noreferrer">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" className="footer-social-btn" target="_blank" rel="noopener noreferrer">
                <Instagram size={18} />
              </a>
              <a href="https://linkedin.com" className="footer-social-btn" target="_blank" rel="noopener noreferrer">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-col-title">Liens Rapides</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/">Accueil</Link>
              </li>
              <li>
                <Link to="/actualites">Actualités</Link>
              </li>
              <li>
                <Link to="/services">Services publics</Link>
              </li>
              <li>
                <Link to="/demarches">Démarches en ligne</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="footer-col-title">Contact</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <MapPin size={16} className="footer-contact-icon" />
                <span>
                  Hôtel de Ville<br />
                  1 Rue de la Mairie, 97660 Dembéni
                </span>
              </div>
              <div className="footer-contact-item">
                <Phone size={16} className="footer-contact-icon" />
                <a href="tel:0269630115" style={{ color: 'inherit', textDecoration: 'none' }}>02 69 63 01 15</a>
              </div>
              <div className="footer-contact-item">
                <Mail size={16} className="footer-contact-icon" />
                <a href="mailto:contact@dembeni.fr" style={{ color: 'inherit', textDecoration: 'none' }}>contact@dembeni.fr</a>
              </div>
            </div>
          </div>

          {/* Column 4: Opening Hours */}
          <div>
            <h4 className="footer-col-title">Horaires</h4>
            <div className="footer-hours-list">
              <div className="footer-hour-row">
                <span className="footer-hour-day">Lundi au Jeudi</span>
                <span className="footer-hour-time">7h30 - 15h30</span>
              </div>
              <div className="footer-hour-row">
                <span className="footer-hour-day">Vendredi</span>
                <span className="footer-hour-time">7h30 - 11h30</span>
              </div>
              <div className="footer-hour-row">
                <span className="footer-hour-day">Samedi & Dimanche</span>
                <span className="footer-hour-time closed">Fermé</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Footer Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © {year} <strong>Commune de Dembéni</strong> — Mayotte. Tous droits réservés.
          </div>
          <div className="footer-legal-links">
            <Link to="#">Mentions Légales</Link>
            <Link to="#">Politique de Confidentialité</Link>
            <Link to="#">Accessibilité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
