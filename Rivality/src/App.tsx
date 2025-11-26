import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import './styles.css';
import { Toaster, toast } from 'react-hot-toast';
import { supabase, loadGroups, createGroup } from './lib/storage';
import { Group } from './types';

// Import de tes composants existants (Assure-toi que les chemins sont bons)
import Tracker from './components/Tracker'; 
import GroupManagementModal from './components/GroupManagementModal';
import MusculationTracker from './components/MusculationTracker';
import NatationTracker from './components/NatationTracker';

// --- UTILITAIRES (Inchangé) ---
function getSportIcon(sportType: string | null | undefined): string {
  switch (sportType) {
    case 'badminton': return '🏸';
    case 'tennis': return '🎾';
    case 'tennis_de_table': return '🏓';
    case 'squash': return 'Squash';
    case 'padel': return 'Padel';
    case 'football': return '⚽';
    case 'basketball': return '🏀';
    case 'volleyball': return '🏐';
    case 'handball': return 'Handball';
    case 'flechettes': return '🎯';
    case 'billard': return '🎱';
    case 'bowling': return '🎳';
    case 'golf': return '⛳';
    case 'boxe': return '🥊';
    case 'judo': return 'Judo';
    case 'lutte': return 'Lutte';
    case 'course': return '🏃';
    case 'natation': return '🏊';
    case 'musculation': return '🏋️';
    case 'escalade': return '🧗';
    case 'esport': return '🎮';
    case 'echecs': return '♟️';
    default: return '🏅';
  }
}

// ==========================================
// 1. NOUVELLE LANDING PAGE (VIOLETTE & OFFRES)
// ==========================================
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  // Détection du scroll pour la navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Palette Violette Toulouse
  const colors = {
    primary: "bg-purple-800", // Violet Toulouse
    primaryHover: "hover:bg-purple-900",
    textPrimary: "text-purple-900",
    accent: "text-pink-600", // Touche de rose pour le dynamisme
    bgLight: "bg-slate-50",
  };

  return (
    <div className={`min-h-screen font-sans text-slate-800 flex flex-col`}>
      
      {/* --- NAVBAR (Plus discrète) --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-sm py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">😈</span> 
            <h1 className={`text-xl font-bold ${scrolled ? 'text-slate-900' : 'text-white'} tracking-tight`}>
              Rivality<span className="font-light">Club</span>
            </h1>
          </div>
          <div className="flex gap-6 items-center text-sm font-medium">
            <a href="#features" className={`${scrolled ? 'text-slate-600' : 'text-slate-200'} hover:opacity-80 hidden md:block`}>Fonctionnalités</a>
            <a href="#pricing" className={`${scrolled ? 'text-slate-600' : 'text-slate-200'} hover:opacity-80 hidden md:block`}>Tarifs</a>
            <a href="#contact" className={`btn ${colors.primary} text-white px-4 py-1.5 rounded-full transition-transform hover:scale-105 shadow-md border border-transparent`}>
              Demander un devis
            </a>
            <Link to="/login" className={`${scrolled ? 'text-purple-700' : 'text-white'} hover:underline`}>
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-24 flex flex-col items-center text-center px-6 bg-cover bg-center">
        {/* Overlay Violet dégradé */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/80 to-slate-900/80 z-0"></div>

        <div className="relative z-10 max-w-4xl mt-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Votre club mérite <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">l'excellence digitale.</span>
          </h2>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-10 font-light">
            La solution Toulousaine qui réunit gestion administrative rigoureuse et gamification sportive pour engager vos licenciés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="btn text-base px-8 py-3 bg-white text-purple-900 rounded-full font-bold shadow-lg hover:bg-purple-50 transition">
              Voir les offres
            </a>
            <Link to="/login" className="btn text-base px-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium hover:bg-white/20 transition">
              Démo Gratuite
            </Link>
          </div>
        </div>
      </header>

      {/* --- FONCTIONNALITÉS (Listing Compact) --- */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${colors.textPrimary}`}>Tout inclus</h3>
            <h4 className="text-3xl font-bold text-slate-900">Une suite complète pour votre club</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "📅", title: "Calendrier & Convocations", desc: "Gérez les matchs et entraînements. Suivi des présences en temps réel." },
              { icon: "🏆", title: "Gamification & Badges", desc: "Système de récompenses automatiques pour motiver les joueurs." },
              { icon: "📊", title: "Suivi de Performance", desc: "Stats détaillées par joueur, adaptées à chaque sport (Foot, Natation...)." },
              { icon: "🚗", title: "Module Covoiturage", desc: "Organisez les déplacements directement depuis la convocation." },
              { icon: "📁", title: "Gestion Administrative", desc: "Licences, certificats médicaux et cotisations centralisés." },
              { icon: "💬", title: "Mur du Vestiaire", desc: "Communication interne sécurisée entre coachs et joueurs." },
              { icon: "📱", title: "App Mobile Joueur", desc: "Chaque licencié a son accès pour suivre ses progrès." },
              { icon: "🌦️", title: "Météo Terrain", desc: "Alertes automatiques en cas de risque d'impraticabilité." }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:shadow-lg transition group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h5 className="font-bold text-slate-800 mb-2">{feature.title}</h5>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TARIFICATION & DEVIS --- */}
      <section id="pricing" className={`py-20 px-6 ${colors.bgLight}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900">Des tarifs adaptés aux clubs locaux</h3>
            <p className="text-slate-600 mt-2">Choisissez l'offre qui correspond à votre structure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Offre Standard */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-purple-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAIRE</div>
              <h4 className="text-xl font-bold text-slate-600 mb-2">Offre Club Starter</h4>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-extrabold text-purple-900">30€</span>
                <span className="text-slate-500 ml-2">/ mois</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Idéal pour les clubs amateurs jusqu'à 3 équipes.</p>
              
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Gestion jusqu'à 60 licenciés</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Calendrier & Convocations illimités</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Système de Badges basique</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Support par email</li>
              </ul>
              <Link to="/login" className={`block w-full py-3 rounded-xl text-center font-bold text-white ${colors.primary} ${colors.primaryHover} transition`}>
                Commencer l'essai
              </Link>
            </div>

            {/* Offre Sur Mesure */}
            <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white border border-slate-700">
              <h4 className="text-xl font-bold text-purple-300 mb-2">Offre "Industrialisation"</h4>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">Sur Devis</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">Pour les structures multisports ou besoins spécifiques.</p>
              
              <ul className="space-y-3 mb-8 text-sm text-slate-300">
                <li className="flex items-center gap-2"><span className="text-purple-400">✦</span> Licenciés illimités</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">✦</span> Personnalisation complète (Logo, Couleurs)</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">✦</span> Développement de stats spécifiques</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">✦</span> Formation des coachs sur site</li>
              </ul>
              <a href="#contact" className="block w-full py-3 rounded-xl text-center font-bold bg-white text-slate-900 hover:bg-slate-100 transition">
                Demander un devis
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* --- CONTACT / DEMANDE DE DEVIS --- */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-8">Parlons de votre projet</h3>
          <div className="bg-slate-50 p-8 rounded-3xl shadow-inner border border-slate-100 text-left">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Demande envoyée !"); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom du Club</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="ex: FC Toulouse" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Votre Email</label>
                  <input type="email" className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="contact@club.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sports pratiqués</label>
                <input type="text" className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Football, Judo, Natation..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Besoin spécifique</label>
                <textarea className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none h-32" placeholder="Bonjour, je souhaite digitaliser les convocations de mes 150 licenciés..."></textarea>
              </div>
              <button className={`w-full py-3 rounded-lg font-bold text-white shadow-lg ${colors.primary} ${colors.primaryHover} transition`}>
                Envoyer ma demande
              </button>
            </form>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            Basé à Toulouse. Réponse sous 24h. <br/>
            📧 contact@rivality.club
          </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 px-6 bg-slate-900 text-center text-slate-500 text-sm">
        <p>© 2025 Rivality Club. L'application qui fait bouger le sport amateur.</p>
      </footer>
    </div>
  );
};

// ==========================================
// 2. COMPOSANT LOGIN (Inchangé)
// ==========================================
const Login = () => {
  const handleLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="card max-w-md w-full text-center p-8 bg-white shadow-xl rounded-2xl">
        <h1 className="text-3xl font-bold mb-2">Bienvenue</h1>
        <p className="text-gray-500 mb-8">Connectez-vous pour accéder à votre espace.</p>
        <button
          className="btn w-full bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-lg flex items-center justify-center gap-2"
          onClick={handleLogin}
        >
          <span>G</span> Se connecter avec Google
        </button>
        <div className="mt-6 text-sm">
          <Link to="/" className="text-blue-500 hover:underline">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. COMPOSANT DASHBOARD (Ton ancienne App - Inchangé)
// ==========================================
const Dashboard = ({ session }: { session: any }) => {
  const user = session.user;
  const navigate = useNavigate();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [managingGroup, setManagingGroup] = useState<Group | null>(null);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newSportType, setNewSportType] = useState('badminton');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingGroups(true);
      loadGroups().then(loadedGroups => {
        setGroups(loadedGroups);
        setLoadingGroups(false);
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    navigate('/');
  };

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setIsCreatingGroup(true);
    const newGroup = await createGroup(newGroupName, newSportType); 
    if (newGroup) {
      setGroups(prev => [...prev, newGroup]);
      setNewGroupName('');
      setNewSportType('badminton');
      toast.success('Groupe créé !');
    } else {
      toast.error("Erreur création groupe.");
    }
    setIsCreatingGroup(false);
  }

  function handleGroupUpdated(updatedGroup: Group) {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    setManagingGroup(null);
    toast.success('Groupe renommé !');
  }

  function handleGroupDeleted(deletedGroupId: string) {
    setGroups(prev => prev.filter(g => g.id !== deletedGroupId));
    setManagingGroup(null);
    toast.success('Groupe supprimé.');
  }

  const DashboardHeader = () => (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
         {selectedGroup && (
           <button onClick={() => setSelectedGroup(null)} className="btn btn-sm mr-2 text-gray-500">
             &larr;
           </button>
         )}
         <h1 className="text-xl font-bold">
            {selectedGroup ? `${getSportIcon(selectedGroup.sport_type)} ${selectedGroup.name}` : '🏠 Mon Espace Club'}
         </h1>
      </div>
      
      <div className="flex items-center gap-3">
        {user.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
            {user.email?.[0].toUpperCase()}
          </div>
        )}
        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">Déconnexion</button>
      </div>
    </header>
  );
  
  if (selectedGroup) {
    const commonProps = {
      group: selectedGroup,
      user: user,
      onLogout: handleLogout,
      onBackToHub: () => setSelectedGroup(null)
    };

    if (selectedGroup.sport_type === 'musculation') {
      return <MusculationTracker {...commonProps} getSportIcon={getSportIcon} />;
    }
    if (selectedGroup.sport_type === 'natation') {
      return <NatationTracker {...commonProps} getSportIcon={getSportIcon} />;
    }
    return <Tracker {...commonProps} />;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <DashboardHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="card bg-white p-4 rounded shadow space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Mes Équipes</h2>
          {loadingGroups ? <p>Chargement...</p> : (
            <div className="space-y-2">
              {groups.map(group => (
                <div key={group.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200 transition">
                  <button 
                    className="flex-1 text-left flex items-center gap-3"
                    onClick={() => setSelectedGroup(group)}
                  >
                    <span className="text-2xl">{getSportIcon(group.sport_type)}</span>
                    <div>
                      <div className="font-bold text-slate-800">{group.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{group.sport_type.replace('_', ' ')}</div>
                    </div>
                  </button>
                  <button onClick={() => setManagingGroup(group)} className="text-gray-400 hover:text-blue-600 px-2">
                    ⚙️
                  </button>
                </div>
              ))}
              {groups.length === 0 && <p className="text-gray-400 italic text-sm">Aucune équipe rejointe.</p>}
            </div>
          )}
        </div>

        <div className="card bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-lg border-b pb-2 mb-4">Créer une équipe</h2>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'équipe</label>
              <input
                type="text"
                className="input w-full border rounded p-2"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Ex: FC Toulouse, Team Muscu..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sport</label>
              <select
                className="select w-full border rounded p-2 bg-white"
                value={newSportType}
                onChange={e => setNewSportType(e.target.value)}
              >
                <optgroup label="Individuel">
                  <option value="musculation">🏋️ Musculation</option>
                  <option value="natation">🏊 Natation</option>
                  <option value="course">🏃 Course</option>
                </optgroup>
                <optgroup label="Collectif / Duel">
                  <option value="football">⚽ Football</option>
                  <option value="badminton">🏸 Badminton</option>
                  <option value="tennis">🎾 Tennis</option>
                  <option value="basket">🏀 Basket</option>
                </optgroup>
              </select>
            </div>
            <button className="btn w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800" disabled={isCreatingGroup}>
              {isCreatingGroup ? 'Création...' : 'Créer l\'équipe'}
            </button>
          </form>
        </div>
      </div>

      <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-400">
        <p>Prochainement : Calendrier des matchs & Trophées du club</p>
      </div>

      {managingGroup && (
        <GroupManagementModal 
          group={managingGroup}
          onClose={() => setManagingGroup(null)}
          onGroupUpdated={handleGroupUpdated}
          onGroupDeleted={handleGroupDeleted}
        />
      )}
    </div>
  );
};

// ==========================================
// 4. MAIN APP ROUTER (Inchangé)
// ==========================================
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Récupérer la session actuelle
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Écouter les changements d'auth ET capturer la souscription
    // L'opérateur '??' gère le cas où supabase serait null
    const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    }) ?? { data: null };

    // 3. Nettoyage : Se désabonner proprement
    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Chargement...</div>;

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route 
          path="/dashboard/*" 
          element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}