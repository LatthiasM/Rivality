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
// 1. NOUVELLE LANDING PAGE (VERSION ÉQUIPE RIVALITY)
// ==========================================
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  // Détection du scroll pour la navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Palette Violette Toulouse conservée pour l'identité
  const colors = {
    primary: "bg-purple-800",
    primaryHover: "hover:bg-purple-900",
    textPrimary: "text-purple-900",
    bgLight: "bg-slate-50",
  };

  return (
    <div className={`min-h-screen font-sans text-slate-800 flex flex-col`}>
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-sm py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl"></span> 
            <h1 className={`text-xl font-bold ${scrolled ? 'text-slate-900' : 'text-white'} tracking-tight`}>
              Rivality
            </h1>
          </div>
          <div className="flex gap-6 items-center text-sm font-medium">
            <a href="#solutions" className={`${scrolled ? 'text-slate-600' : 'text-slate-200'} hover:opacity-80 hidden md:block`}>Solutions</a>
            <a href="#features" className={`${scrolled ? 'text-slate-600' : 'text-slate-200'} hover:opacity-80 hidden md:block`}>Fonctionnalités</a>
            <a href="#pricing" className={`${scrolled ? 'text-slate-600' : 'text-slate-200'} hover:opacity-80 hidden md:block`}>Tarifs</a>
            <Link to="/login" className={`btn ${colors.primary} text-white px-5 py-2 rounded-full transition-transform hover:scale-105 shadow-md border border-transparent`}>
              Espace Club
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION : PERFORMANCE & ENGAGEMENT --- */}
      <header className="relative pt-32 pb-24 flex flex-col items-center text-center px-6 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/85 to-slate-900/90 z-0"></div>

        <div className="relative z-10 max-w-5xl mt-8">
          <div className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-purple-200 text-sm font-medium mb-6 backdrop-blur-sm">
            🚀 La solution SaaS complète pour clubs & centres sportifs
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Optimisez la Performance.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">Boostez la Rétention.</span>
          </h2>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Rivality offre aux entraîneurs les outils pour créer des champions, tout en fidélisant vos adhérents grâce à une expérience communautaire et gamifiée unique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="btn text-base px-8 py-3 bg-white text-purple-900 rounded-full font-bold shadow-lg hover:bg-purple-50 transition">
              Voir les offres Club
            </a>
            <a href="#solutions" className="btn text-base px-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium hover:bg-white/20 transition">
              Découvrir la méthode
            </a>
          </div>
          
          {/* Badge Multi-plateforme */}
          <div className="mt-12 flex justify-center items-center gap-6 text-slate-300 text-sm font-medium opacity-80">
            <span className="flex items-center gap-2">💻 Ordinateur</span>
            <span className="flex items-center gap-2">📱 Mobile</span>
            <span className="flex items-center gap-2">📟 Tablette</span>
          </div>
        </div>
      </header>

      {/* --- PROPOSITION DE VALEUR (2 AXES) --- */}
      <section id="solutions" className="py-20 px-6 bg-white relative z-10 -mt-8 rounded-t-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Axe 1 : Performance */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6">📈</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Performance & Préparation</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Pour vos coachs. Une suite d'outils professionnels pour l'analyse de données, le suivi des records personnels et la planification précise des cycles d'entraînements.
              </p>
              <ul className="space-y-2 text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2">✅ Planification des séances</li>
                <li className="flex items-center gap-2">✅ Historique des records</li>
                <li className="flex items-center gap-2">✅ Préparation aux compétitions</li>
              </ul>
            </div>

            {/* Axe 2 : Engagement */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-6">🔥</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Engagement & Rétention</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Pour vos adhérents. Transformez l'effort en jeu. Notre système de gamification et de communauté motive vos membres à revenir s'entraîner plus souvent.
              </p>
              <ul className="space-y-2 text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2">✅ Système d'Achievements</li>
                <li className="flex items-center gap-2">✅ Défis & Challenges Club</li>
                <li className="flex items-center gap-2">✅ Renforcement Communautaire</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* --- FONCTIONNALITÉS CLÉS --- */}
      <section id="features" className={`py-20 px-6 ${colors.bgLight}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${colors.textPrimary}`}>Tout-en-un</h3>
            <h4 className="text-3xl font-bold text-slate-900">Une plateforme unique pour Coachs & Adhérents</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gestion Agenda */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-4xl mb-4">📅</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Gestion d'Agenda</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Planifiez vos séances, gérez les événements du club et visualisez les disponibilités des coachs en temps réel.
              </p>
            </div>

            {/* Messagerie */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-4xl mb-4">💬</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Messagerie Intégrée</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Fluidifiez la communication. Canaux directs entre administrateurs, coachs et membres sans quitter l'application.
              </p>
            </div>

            {/* Gamification */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-4xl mb-4">🏆</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Gamification</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Débloquez des badges, lancez des défis mensuels et créez une émulation positive au sein de votre structure.
              </p>
            </div>

            {/* Suivi Perf */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-4xl mb-4">📊</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Analyse de Performance</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Tableaux de bord détaillés pour suivre la progression physique et technique de chaque athlète.
              </p>
            </div>

             {/* Multi-Device */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2 flex flex-col justify-center items-center text-center">
              <div className="text-4xl mb-4">📱 💻</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">100% Multi-plateforme</h5>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                Accessible partout. Que vous soyez au bureau sur PC, ou au bord du terrain sur tablette ou smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TARIFICATION (MODÈLE ÉCONOMIQUE) --- */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900">Une tarification adaptée à votre taille</h3>
            <p className="text-slate-600 mt-2">Abonnement mensuel sans engagement. Évolue avec votre club.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tier 1 : Petit Club */}
            <div className="p-8 rounded-3xl border border-slate-200 hover:border-purple-300 transition relative">
              <h4 className="text-lg font-bold text-slate-700 mb-2">Démarrage</h4>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-4">Jusqu'à 50 Adhérents</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-slate-900">49€</span>
                <span className="text-slate-500 ml-1">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-600">
                <li>✓ Toutes les fonctionnalités</li>
                <li>✓ Support Email</li>
                <li>✓ App Coach & Adhérent</li>
              </ul>
              <Link to="/login" className="block w-full py-2.5 rounded-xl text-center font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition">
                Essayer
              </Link>
            </div>

            {/* Tier 2 : Club Moyen (Mise en avant) */}
            <div className="p-8 rounded-3xl border-2 border-purple-600 shadow-xl relative bg-slate-900 text-white transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAIRE</div>
              <h4 className="text-lg font-bold text-white mb-2">Croissance</h4>
              <p className="text-xs text-purple-300 uppercase tracking-wide font-bold mb-4">50 à 200 Adhérents</p>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-extrabold text-white">89€</span>
                <span className="text-purple-200 ml-1">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-300">
                <li>✓ Toutes les fonctionnalités</li>
                <li>✓ Support Prioritaire</li>
                <li>✓ Importation de données offerte</li>
              </ul>
              <Link to="/login" className="block w-full py-3 rounded-xl text-center font-bold text-purple-900 bg-white hover:bg-slate-100 transition">
                Choisir cette offre
              </Link>
            </div>

            {/* Tier 3 : Sur Mesure / Prestations */}
            <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50 hover:border-purple-300 transition">
              <h4 className="text-lg font-bold text-slate-700 mb-2">Sur Mesure</h4>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-4">+200 Adhérents ou Besoins Spécifiques</p>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold text-slate-900">Sur Devis</span>
              </div>
              <div className="mb-6">
                <p className="text-sm font-bold text-purple-700 mb-2">Prestations de services :</p>
                <p className="text-sm text-slate-600 leading-snug">
                  Nous développons des fonctionnalités spécifiques pour votre club sur demande (Statistiques personnalisées, Intégrations API...).
                </p>
              </div>
              <a href="#contact" className="block w-full py-2.5 rounded-xl text-center font-bold text-slate-700 border border-slate-300 hover:bg-white transition">
                Contacter l'équipe
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* --- FORMULAIRE CONTACT (POUR DEVIS) --- */}
      <section id="contact" className="py-20 px-6 bg-slate-50">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Demander une démo ou un devis</h3>
            <p className="text-slate-500 text-sm mt-2">Notre équipe basée à Toulouse vous répond sous 24h.</p>
          </div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Demande envoyée !"); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition" placeholder="Nom du Club" />
              <input type="email" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition" placeholder="Email contact" />
            </div>
            <select className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition text-slate-600">
              <option>Nombre d'adhérents...</option>
              <option>Moins de 50</option>
              <option>50 - 200</option>
              <option>Plus de 200</option>
            </select>
            <textarea className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition h-32" placeholder="Un besoin spécifique ? Une demande de personnalisation ?"></textarea>
            <button className={`w-full py-3 rounded-xl font-bold text-white shadow-lg ${colors.primary} ${colors.primaryHover} transition`}>
              Envoyer ma demande
            </button>
          </form>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 px-6 bg-slate-900 text-center text-slate-500 text-sm">
        <p className="mb-2">© 2025 Rivality . Développé avec passion à Toulouse 🧱.</p>
        <div className="flex justify-center gap-4 text-xs">
          <a href="#" className="hover:text-purple-400">Mentions Légales</a>
          <a href="#" className="hover:text-purple-400">CGV</a>
          <a href="#" className="hover:text-purple-400">Support</a>
        </div>
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