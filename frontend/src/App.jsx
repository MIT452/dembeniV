import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import UserLogin from './components/UserLogin';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Contact from './components/Contact';
import SubPage from './components/SubPage';
import NewsPage from './components/NewsPage';
import NewsDetailPage from './components/NewsDetailPage';
import SantePage from './components/SantePage';
import DemarchesPage from './components/DemarchesPage';
import ProjetPage from './components/ProjetPage';
import ServicesPublicsPage from './components/ServicesPublicsPage';
import { FileText, Hammer, Briefcase, Globe, Heart, Shield } from 'lucide-react';
import { AuthContext } from './context/AuthContext';


function App() {
  const ProtectedRoute = ({ children, role }) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (!user) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    if (role && user.role !== role) {
      return <Navigate to={user.role === 'admin' ? '/admin' : '/compte'} replace />;
    }
    return children;
  };

  const demarchesData = [
    { title: 'État Civil', description: 'Actes de naissance, mariage, décès et livret de famille.', icon: <FileText size={24}/> },
    { title: 'Identité', description: 'Demandes de passeport et carte nationale d\'identité.', icon: <Shield size={24}/> },
    { title: 'Urbanisme', description: 'Permis de construire, déclaration préalable et PLU.', icon: <Hammer size={24}/> },
    { title: 'Élections', description: 'Inscription sur les listes électorales et vote par procuration.', icon: <Globe size={24}/> },
  ];

  const projetsData = [
    { title: 'Éco-quartier Dembéni', description: 'Développement d\'un nouvel espace de vie durable et moderne.', icon: <Hammer size={24}/> },
    { title: 'Rénovation Scolaire', description: 'Modernisation des infrastructures éducatives de la commune.', icon: <Briefcase size={24}/> },
    { title: 'Parc Municipal', description: 'Aménagement d\'un nouvel espace vert pour les familles.', icon: <Heart size={24}/> },
  ];

  const servicesData = [
    { title: 'Éducation', description: 'Écoles, cantines et activités périscolaires.', icon: <Heart size={24}/> },
    { title: 'Social & Santé', description: 'Accompagnement des familles et services de soins.', icon: <Shield size={24}/> },
    { title: 'Environnement', description: 'Gestion des déchets et propreté urbaine.', icon: <Globe size={24}/> },
    { title: 'Culture & Sport', description: 'Médiathèque, stades et associations locales.', icon: <Briefcase size={24}/> },
  ];

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route
              path="/compte"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login"     element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/contact"   element={<Contact />} />
            
            {/* New Sub-pages */}
            <Route path="/demarches" element={<DemarchesPage />} />
            <Route path="/projet"    element={<ProjetPage />} />
            <Route path="/services"  element={<ServicesPublicsPage />} />
            <Route path="/actualites" element={<NewsPage />} />
            <Route path="/actualites/:slug" element={<NewsDetailPage />} />
            <Route path="/culture"    element={<SubPage title="Culture & Patrimoine" subtitle="Découvrez la richesse culturelle et historique de Dembéni." category="Culture" />} />
            <Route path="/solidarite" element={<SantePage />} />
            <Route path="/sante"      element={<SantePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
