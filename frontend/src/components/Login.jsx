
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Loader2, Mail, Lock, ArrowRight, Home, User,
  MapPin, CheckCircle, AlertCircle, Building, Users, ShieldAlert,
  Eye, EyeOff, Camera, X, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  // Auto-detect route to activate correct form tab
  const isRegisterRoute = location.pathname === '/register';
  const [activeTab, setActiveTab] = useState(isRegisterRoute ? 'register' : 'login');

  // Input states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    firstname: '', lastname: '', email: '',
    password: '', confirmPassword: '', quartier: ''
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [isRegistered, setIsRegistered] = useState(false);

  // Registration extras
  const [fieldErrors, setFieldErrors] = useState({});
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Forgot Password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);

  // Sync tab with URL changes
  useEffect(() => {
    setActiveTab(location.pathname === '/register' ? 'register' : 'login');
    setMsg({ type: '', text: '' });
  }, [location.pathname]);

  const onLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  // Password strength scorer (0–4)
  const calcStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[@$!%*?&_\-#]/.test(pwd)) s++;
    return Math.min(4, s);
  };

  const onRegisterChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    // Auto-capitalize first letter for names
    if ((name === 'firstname' || name === 'lastname') && v.length > 0) {
      v = v.charAt(0).toUpperCase() + v.slice(1);
    }
    setRegisterData(prev => ({ ...prev, [name]: v }));

    // Real-time validation
    const errs = { ...fieldErrors };
    if (name === 'firstname' || name === 'lastname') {
      if (v && !/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(v)) errs[name] = 'Lettres et espaces uniquement';
      else delete errs[name];
    }
    if (name === 'email') {
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) errs.email = 'Format e-mail invalide';
      else delete errs.email;
    }
    if (name === 'password') {
      setPasswordStrength(calcStrength(v));
      if (v && v.length < 8) errs.password = 'Minimum 8 caractères';
      else delete errs.password;
    }
    setFieldErrors(errs);
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const email = (forgotEmail || '').trim().toLowerCase();
      const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/forgot-password`, { email });
      
      setMsg({ 
        type: 'success', 
        text: `Un code de vérification a été envoyé à votre adresse e-mail.` 
      });
      setForgotStep(2);
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || "Une erreur est survenue lors de la demande."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const email = (forgotEmail || '').trim().toLowerCase();
      const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/verify-otp`, {
        email,
        code: resetCode
      });
      setMsg({ type: 'success', text: res.data.message });
      setForgotStep(3);
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || "Le code saisi est invalide ou expiré."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    if (newPassword !== confirmNewPassword) {
      setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      setLoading(false);
      return;
    }

    try {
      const email = (forgotEmail || '').trim().toLowerCase();
      const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/reset-password`, {
        email,
        code: resetCode,
        newPassword
      });
      setMsg({ type: 'success', text: res.data.message + ' Redirection vers la page de connexion...' });
      setTimeout(() => {
        setForgotEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotStep(1);
        setActiveTab('login');
        setMsg({ type: '', text: '' });
      }, 2500);
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || "Une erreur est survenue lors de la réinitialisation."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const email = (loginData.email || '').trim().toLowerCase();
      const password = (loginData.password || '').trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!email || !password) {
        setMsg({ type: 'error', text: 'Veuillez saisir votre e-mail et votre mot de passe.' });
        return;
      }
      if (!emailRegex.test(email)) {
        setMsg({ type: 'error', text: 'Format d’adresse e-mail invalide.' });
        return;
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, { email, password });
      const { token, ...userData } = res.data.data;
      
      login(token, userData);
      setMsg({ type: 'success', text: 'Connexion réussie ! Redirection...' });
      
      setTimeout(() => {
        if (userData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/compte');
        }
      }, 900);
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Une erreur est survenue lors de la connexion.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    // Frontend guards
    if (registerData.password !== registerData.confirmPassword) {
      setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (Object.keys(fieldErrors).length > 0) {
      setMsg({ type: 'error', text: 'Veuillez corriger les erreurs avant de soumettre.' });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('firstname',  registerData.firstname);
      fd.append('lastname',   registerData.lastname);
      fd.append('email',      (registerData.email || '').trim().toLowerCase());
      fd.append('password',   registerData.password);
      fd.append('quartier',   (registerData.quartier || '').trim());
      if (profileFile) fd.append('profileImage', profileFile);

      await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/register`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMsg({ type: 'success', text: 'Inscription réussie ! Votre compte est en attente de validation. Redirection...' });
      setRegisterData({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '', quartier: '' });
      setProfileFile(null);
      setProfilePreview('');
      setPasswordStrength(0);
      setTimeout(() => {
        setActiveTab('login');
        setMsg({ type: '', text: '' });
      }, 2800);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-portal-fullscreen">

      {/* LEFT PANE */}
      <div className="auth-pane-left">
        <div className="pane-image-overlay" />
        <div className="pane-content-wrap">

          {/* Logo */}
          <Link to="/" className="pane-logo-badge">
            <img src="/logo_dembeni.svg" alt="Blason de Dembéni" className="pane-logo-img-vector" />
            <div className="logo-text-block">
              <span className="logo-label">DEMB<span className="accent-red">É</span>NI</span>
              <span className="logo-sub">PORTAIL CITOYEN</span>
            </div>
          </Link>

          {/* Headline */}
          <div className="pane-welcome-text">
            <h1 className="pane-title">
              Votre mairie numérique,{' '}
              <span className="pane-title-highlight">plus proche de vous.</span>
            </h1>
            <p className="pane-subtitle">
              Accédez à vos démarches, documents et services en quelques clics.
            </p>
          </div>

          {/* Feature cards */}
          <div className="pane-features-grid">
            <div className="pane-feature-card">
              <div className="feature-card-icon">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="feature-card-title">SÉCURISÉ</p>
                <p className="feature-card-desc">Vos données protégées</p>
              </div>
            </div>
            <div className="pane-feature-card">
              <div className="feature-card-icon">
                <Users size={22} />
              </div>
              <div>
                <p className="feature-card-title">ACCESSIBLE</p>
                <p className="feature-card-desc">Services disponibles 24h/24, 7j/7</p>
              </div>
            </div>
            <div className="pane-feature-card">
              <div className="feature-card-icon">
                <Building size={22} />
              </div>
              <div>
                <p className="feature-card-title">SIMPLE</p>
                <p className="feature-card-desc">Démarches rapides et en ligne</p>
              </div>
            </div>
          </div>

          {/* RGPD badge */}
          <div className="pane-rgpd-badge">
            <ShieldCheck size={14} />
            <span>Conforme RGPD • Hébergé en toute sécurité</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="auth-pane-right">
        <div className="auth-card">

          {isRegistered ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="registration-success-container"
            >
              <div className="success-lottie-badge">
                <div className="success-ring" />
                <CheckCircle size={48} className="success-icon-active" />
              </div>
              <h2 className="success-title">Inscription Enregistrée !</h2>
              <p className="success-desc">
                Votre demande a bien été reçue. Votre compte est en attente de validation.
              </p>
              <div className="success-info-card">
                <Info size={18} className="success-info-icon" />
                <p className="success-info-text">
                  Vous recevrez une notification par email dès que votre compte sera validé par l'administration.
                </p>
              </div>
              <button onClick={() => { setIsRegistered(false); setActiveTab('login'); }} className="btn-success-back">
                Retour à la connexion
              </button>
            </motion.div>
          ) : (
            <>
              <div className="auth-form-header">
                <h2 className="form-portal-title">Bienvenue</h2>
                <p className="form-portal-subtitle">
                  {activeTab === 'register' ? 'Créez votre espace citoyen' : 'Connectez-vous à votre espace citoyen'}
                </p>
              </div>

              {/* Tabs */}
              {activeTab !== 'forgot' ? (
                <div className="auth-tabs-slider-wrapper">
                  <div className="auth-tabs-slider">
                    <div className={`slider-active-indicator ${activeTab === 'register' ? 'slide-right' : ''}`} />
                    <button type="button" onClick={() => { setActiveTab('login'); navigate('/login'); }} className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}>
                      <User size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                      Connexion
                    </button>
                    <button type="button" onClick={() => { setActiveTab('register'); navigate('/register'); }} className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}>
                      <User size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                      Créer un compte
                    </button>
                  </div>
                </div>
              ) : (
                <div className="forgot-header">
                  <h3>Réinitialisation du mot de passe</h3>
                  <p>
                    {forgotStep === 1 && 'Étape 1/3 — Saisissez votre e-mail.'}
                    {forgotStep === 2 && 'Étape 2/3 — Entrez le code reçu.'}
                    {forgotStep === 3 && 'Étape 3/3 — Nouveau mot de passe.'}
                  </p>
                </div>
              )}

              {/* Alert */}
              {msg.text && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`auth-alert-banner ${msg.type === 'error' ? 'error' : msg.type === 'warning' ? 'warning' : 'success'}`}
                  style={msg.type === 'warning' ? { background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1px solid #f59e0b', color: '#92400e' } : {}}
                >
                  {msg.type === 'error' ? <AlertCircle size={16} /> : msg.type === 'warning' ? <AlertCircle size={16} style={{ color: '#d97706' }} /> : <CheckCircle size={16} />}
                  <span>{msg.text}</span>
                </motion.div>
              )}

              <AnimatePresence mode="wait">

                {/* LOGIN FORM */}
                {activeTab === 'login' && (
                  <motion.form key="login" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.22 }} onSubmit={handleLoginSubmit} className="auth-reactive-form">
                    <div className="auth-input-group">
                      <label className="auth-input-label">Adresse e-mail</label>
                      <div className="auth-field-wrapper">
                        <Mail className="field-icon-active" size={18} />
                        <input type="email" name="email" className="auth-styled-input" value={loginData.email} onChange={onLoginChange} required placeholder="exemple@domaine.com" autoComplete="email" />
                      </div>
                    </div>
                    <div className="auth-input-group">
                      <label className="auth-input-label">Mot de passe</label>
                      <div className="auth-field-wrapper">
                        <Lock className="field-icon-active" size={18} />
                        <input type={showPassword ? 'text' : 'password'} name="password" className="auth-styled-input" value={loginData.password} onChange={onLoginChange} required placeholder="Votre mot de passe" autoComplete="current-password" style={{ paddingRight: '2.8rem' }} />
                        <button type="button" className="pwd-toggle-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                      <button type="button" className="forgot-pw-link" onClick={() => { setActiveTab('forgot'); setMsg({ type: '', text: '' }); }}>
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <button type="submit" className="btn-auth-submit-gradient" disabled={loading}>
                      {loading ? <Loader2 className="h-spin" size={20} /> : <><ArrowRight size={18} /> Se connecter</>}
                    </button>
                    
                    <div className="auth-card-footer" style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: '#64748B' }}>
                      Nouveau sur le portail ?{' '}
                      <Link to="/register" onClick={() => setActiveTab('register')} style={{ color: '#16A34A', fontWeight: '700', textDecoration: 'none' }}>
                        Créer un compte
                      </Link>
                    </div>
                  </motion.form>
                )}

                {/* REGISTER FORM */}
                {activeTab === 'register' && (
                  <motion.form key="register" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.22 }} onSubmit={handleRegisterSubmit} className="auth-reactive-form">
                    <div 
                      className="reg-avatar-container"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('profileImageInput').click()}
                    >
                      <div className="reg-avatar-circle">
                        {profilePreview ? (
                          <img src={profilePreview} alt="Aperçu" className="reg-avatar-img" />
                        ) : (
                          <div className="reg-avatar-placeholder">
                            <Camera size={22} />
                          </div>
                        )}
                        <div className="reg-avatar-overlay">
                          <Camera size={12} />
                          <span>Modifier</span>
                        </div>
                      </div>
                      <div className="reg-avatar-meta">
                        <p className="reg-avatar-title">Photo de profil <span>(optionnelle)</span></p>
                        <p className="reg-avatar-dragtext">Glissez-déposez ou cliquez pour choisir</p>
                      </div>
                      <input id="profileImageInput" type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handleProfileFileChange} />
                    </div>

                    <div className="input-grid-double">
                      <div className="auth-input-group">
                        <label className="auth-input-label">Prénom <span className="req-star">*</span></label>
                        <div className={`auth-field-wrapper${fieldErrors.firstname ? ' field-input-error' : ''}`}>
                          <User className="field-icon-active" size={16} />
                          <input type="text" name="firstname" className="auth-styled-input" value={registerData.firstname} onChange={onRegisterChange} required placeholder="Ahmed" autoComplete="given-name" />
                        </div>
                        {fieldErrors.firstname && <p className="field-err-msg"><AlertCircle size={10} /> {fieldErrors.firstname}</p>}
                      </div>
                      <div className="auth-input-group">
                        <label className="auth-input-label">Nom <span className="req-star">*</span></label>
                        <div className={`auth-field-wrapper${fieldErrors.lastname ? ' field-input-error' : ''}`}>
                          <User className="field-icon-active" size={16} />
                          <input type="text" name="lastname" className="auth-styled-input" value={registerData.lastname} onChange={onRegisterChange} required placeholder="Abdou" autoComplete="family-name" />
                        </div>
                        {fieldErrors.lastname && <p className="field-err-msg"><AlertCircle size={10} /> {fieldErrors.lastname}</p>}
                      </div>
                    </div>

                    <div className="input-grid-double">
                      <div className="auth-input-group">
                        <label className="auth-input-label">Adresse e-mail <span className="req-star">*</span></label>
                        <div className={`auth-field-wrapper${fieldErrors.email ? ' field-input-error' : ''}`}>
                          <Mail className="field-icon-active" size={16} />
                          <input type="email" name="email" className="auth-styled-input" value={registerData.email} onChange={onRegisterChange} required placeholder="nom@email.com" autoComplete="email" />
                        </div>
                        {fieldErrors.email && <p className="field-err-msg"><AlertCircle size={10} /> {fieldErrors.email}</p>}
                      </div>
                      <div className="auth-input-group">
                        <label className="auth-input-label">Quartier de résidence</label>
                        <div className="auth-field-wrapper">
                          <MapPin className="field-icon-active" size={16} />
                          <select name="quartier" className="auth-styled-input" value={registerData.quartier} onChange={onRegisterChange} style={{ appearance: 'auto', paddingLeft: '2.5rem' }}>
                            <option value="">Sélectionnez...</option>
                            <option value="Dembéni Centre">Dembéni Centre</option>
                            <option value="Tsararano">Tsararano</option>
                            <option value="Iloni">Iloni</option>
                            <option value="Ongojou">Ongojou</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="input-grid-double">
                      <div className="auth-input-group">
                        <label className="auth-input-label">Mot de passe <span className="req-star">*</span></label>
                        <div className={`auth-field-wrapper${fieldErrors.password ? ' field-input-error' : ''}`} style={{ position: 'relative' }}>
                          <Lock className="field-icon-active" size={16} />
                          <input type={showPassword ? 'text' : 'password'} name="password" className="auth-styled-input" value={registerData.password} onChange={onRegisterChange} required placeholder="••••••••" autoComplete="new-password" style={{ paddingRight: '2.8rem' }} />
                          <button type="button" className="pwd-toggle-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                      </div>
                      <div className="auth-input-group">
                        <label className="auth-input-label">Confirmer le mot de passe <span className="req-star">*</span></label>
                        <div className={`auth-field-wrapper${fieldErrors.password ? ' field-input-error' : ''}`} style={{ position: 'relative' }}>
                          <Lock className="field-icon-active" size={16} />
                          <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" className="auth-styled-input" value={registerData.confirmPassword} onChange={onRegisterChange} required placeholder="••••••••" autoComplete="new-password" style={{ paddingRight: '2.8rem' }} />
                          <button type="button" className="pwd-toggle-btn" onClick={() => setShowConfirmPassword(p => !p)} tabIndex={-1}>{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                      </div>
                    </div>

                    {registerData.password && (
                      <div className="pwd-strength-container" style={{ width: '100%' }}>
                        <div className="pwd-strength-wrap">
                          <div className="pwd-strength-bar"><div className={`pwd-strength-fill s${passwordStrength}`} style={{ width: `${(passwordStrength / 4) * 100}%` }} /></div>
                          <span className={`pwd-strength-lbl s${passwordStrength}`}>{['Très faible','Faible','Moyen','Fort','Très fort'][passwordStrength]}</span>
                        </div>
                        <div className="pwd-rules">
                          {[[/[A-Z]/.test(registerData.password),'1 majuscule'],[/[a-z]/.test(registerData.password),'1 minuscule'],[/\d/.test(registerData.password),'1 chiffre'],[/[@$!%*?&_\-#]/.test(registerData.password),'1 spécial'],[registerData.password.length>=8,'8 car. min.']].map(([ok,label],i)=>(
                            <span key={i} className={ok?'rule-ok':'rule-nok'}>{ok?<CheckCircle size={9}/>:<X size={9}/>} {label}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && <p className="field-err-msg" style={{ margin: 0 }}><AlertCircle size={10} /> Les mots de passe ne correspondent pas</p>}
                    {registerData.confirmPassword && registerData.password === registerData.confirmPassword && <p className="field-ok-msg" style={{ margin: 0 }}><CheckCircle size={10} /> Les mots de passe correspondent</p>}

                    <button type="submit" className="btn-auth-submit-gradient" disabled={loading} style={{ marginTop: '6px' }}>
                      {loading ? <Loader2 className="h-spin" size={20} /> : <>Créer mon compte <ArrowRight size={18} /></>}
                    </button>

                    <div className="auth-card-footer" style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.82rem', color: '#64748B' }}>
                      Vous avez déjà un compte ?{' '}
                      <Link to="/login" onClick={() => setActiveTab('login')} style={{ color: '#16A34A', fontWeight: '700', textDecoration: 'none' }}>
                        Se connecter
                      </Link>
                    </div>
                  </motion.form>
                )}

                {/* FORGOT PASSWORD FORM */}
                {activeTab === 'forgot' && (
                  <motion.form key="forgot" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.22 }}
                    onSubmit={forgotStep === 1 ? handleForgotPasswordSubmit : forgotStep === 2 ? handleVerifyOtpSubmit : handleResetPasswordSubmit}
                    className="auth-reactive-form"
                  >
                    {forgotStep === 1 && (
                      <div className="auth-input-group">
                        <label className="auth-input-label">Adresse e-mail</label>
                        <div className="auth-field-wrapper">
                          <Mail className="field-icon-active" size={18} />
                          <input type="email" className="auth-styled-input" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required placeholder="citoyen@email.com" autoComplete="email" />
                        </div>
                      </div>
                    )}

                    {forgotStep === 2 && (
                      <>

                        <div className="auth-input-group">
                          <label className="auth-input-label">Code de vérification (6 chiffres)</label>
                          <div className="auth-field-wrapper">
                            <CheckCircle className="field-icon-active" size={18} />
                            <input type="text" className="auth-styled-input" value={resetCode} onChange={e => setResetCode(e.target.value)} required placeholder="123456" maxLength={6} />
                          </div>
                        </div>
                      </>
                    )}

                    {forgotStep === 3 && (
                      <>
                        <div className="auth-input-group">
                          <label className="auth-input-label">Nouveau mot de passe</label>
                          <div className="auth-field-wrapper">
                            <Lock className="field-icon-active" size={18} />
                            <input type="password" className="auth-styled-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="••••••••" />
                          </div>
                        </div>
                        <div className="auth-input-group" style={{ marginTop: '12px' }}>
                          <label className="auth-input-label">Confirmer le mot de passe</label>
                          <div className="auth-field-wrapper">
                            <Lock className="field-icon-active" size={18} />
                            <input type="password" className="auth-styled-input" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required placeholder="••••••••" />
                          </div>
                        </div>
                      </>
                    )}

                    <button type="submit" className="btn-auth-submit-gradient" disabled={loading} style={{ marginTop: '20px' }}>
                      {loading ? <Loader2 className="h-spin" size={20} /> : forgotStep === 1 ? <><ArrowRight size={18} /> Envoyer le code</> : forgotStep === 2 ? <><ArrowRight size={18} /> Valider le code</> : <><ArrowRight size={18} /> Réinitialiser</>}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
                      {forgotStep > 1 && (
                        <button type="button" onClick={() => { setForgotStep(forgotStep - 1); setMsg({ type: '', text: '' }); }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
                          Étape précédente
                        </button>
                      )}
                      <button type="button" onClick={() => { setActiveTab('login'); setForgotStep(1); setMsg({ type: '', text: '' }); }} style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', marginLeft: 'auto' }}>
                        Retour à la connexion
                      </button>
                    </div>
                  </motion.form>
                )}

              </AnimatePresence>

              {/* Back to home */}
              <div className="auth-back-link-wrapper">
                <Link to="/" className="auth-back-link">
                  <Home size={14} /> Retour à la page d'accueil
                </Link>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default Login;
