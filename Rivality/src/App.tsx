import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import './styles.css';
import { Toaster, toast } from 'react-hot-toast';
import { supabase, loadGroups, createGroup } from './lib/storage';
import { Group } from './types';

// Import de tes composants existants
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
// 1. LANDING PAGE : LE VESTIAIRE BY RIVALITY
// ==========================================
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  // Détection du scroll pour la navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <h1 className={`text-xl font-bold ${scrolled ? 'text-slate-900' : 'text-white'} tracking-tight flex flex-col md:flex-row md:items-baseline`}>
              Le Vestiaire
              <span className={`text-xs font-medium ml-1 ${scrolled ? 'text-purple-600' : 'text-purple-300'}`}>by Rivality</span>
            </h1>
          </div>
          <div className="flex gap-6 items-center text-sm font-medium">
            <a href="#solutions" className={`${scrolled ? 'text-slate-600' : 'text-slate-200'} hover:opacity-80 hidden md:block`}>Concept</a>
            <a href="#features" className={`${scrolled ? 'text-slate-600' : 'text-slate-200'} hover:opacity-80 hidden md:block`}>Outils</a>
            {/* Lien ajouté vers la nouvelle section Badges */}
            <a href="#badges" className={`${scrolled ? 'text-slate-600' : 'text-slate-200'} hover:opacity-80 hidden md:block text-purple-400 font-bold`}>Trophées</a>
            <a href="#pricing" className={`${scrolled ? 'text-slate-600' : 'text-slate-200'} hover:opacity-80 hidden md:block`}>Tarifs</a>
            <Link to="/login" className={`btn ${colors.primary} text-white px-5 py-2 rounded-full transition-transform hover:scale-105 shadow-md border border-transparent`}>
              Entrer dans Le Vestiaire
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (Inchangé) --- */}
      <header className="relative pt-32 pb-24 flex flex-col items-center text-center px-6 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-indigo-900/90 to-slate-900/90 z-0"></div>

        <div className="relative z-10 max-w-5xl mt-8">
          <div className="inline-block py-1 px-4 rounded-full bg-white/10 border border-white/20 text-purple-200 text-sm font-medium mb-6 backdrop-blur-sm">
            👕 Le QG numérique de votre club
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Gérez le Club.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">Animez le Vestiaire.</span>
          </h2>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            La solution Toulousaine qui réunit le sérieux de la gestion sportive et l'ambiance unique d'un groupe soudé. Performance pour le coach, Jeu pour les adhérents.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="btn text-base px-8 py-3 bg-white text-purple-900 rounded-full font-bold shadow-lg hover:bg-purple-50 transition">
              Rejoindre Le Vestiaire
            </a>
            <a href="#solutions" className="btn text-base px-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium hover:bg-white/20 transition">
              Visite guidée
            </a>
          </div>
          
          <div className="mt-12 flex justify-center items-center gap-6 text-slate-300 text-sm font-medium opacity-80">
            <span className="flex items-center gap-2">📱 App Mobile</span>
            <span className="flex items-center gap-2">💻 Dashboard Coach</span>
            <span className="flex items-center gap-2">🛡️ Données Sécurisées</span>
          </div>
        </div>
      </header>

      {/* --- PROPOSITION DE VALEUR (Inchangé) --- */}
      <section id="solutions" className="py-20 px-6 bg-white relative z-10 -mt-8 rounded-t-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${colors.textPrimary}`}>Double Impact</h3>
            <h4 className="text-3xl font-bold text-slate-900">Tout se joue ici.</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
            {/* Côté Bureau / Staff */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Pour le Staff : Le Bureau</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Fini les tableaux Excel perdus. Centralisez toute la gestion administrative et sportive. Gagnez du temps pour ce qui compte : le terrain.
              </p>
              <ul className="space-y-3 text-sm text-slate-700 font-medium bg-white p-4 rounded-xl">
                <li className="flex items-center gap-3">✅ <strong>Planification :</strong> Séances, Matchs, Événements.</li>
                <li className="flex items-center gap-3">✅ <strong>Suivi :</strong> Stats, Présences, Records.</li>
                <li className="flex items-center gap-3">✅ <strong>Admin :</strong> Licences et cotisations.</li>
              </ul>
            </div>

            {/* Côté Vestiaire / Joueurs */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-6">🔥</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Pour les Joueurs : Le Vestiaire</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Créez une communauté addictive. L'application motive vos adhérents à venir s'entraîner grâce à la gamification et aux défis.
              </p>
              <ul className="space-y-3 text-sm text-slate-700 font-medium bg-white p-4 rounded-xl">
                <li className="flex items-center gap-3">🏆 <strong>Gamification :</strong> Badges et niveaux à débloquer.</li>
                <li className="flex items-center gap-3">⚔️ <strong>Rivalité :</strong> Comparaison de stats entre amis.</li>
                <li className="flex items-center gap-3">💬 <strong>Social :</strong> Mur du club et sondages.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- FONCTIONNALITÉS CLÉS (Inchangé) --- */}
      <section id="features" className={`py-20 px-6 ${colors.bgLight}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${colors.textPrimary}`}>Boîte à outils</h3>
            <h4 className="text-3xl font-bold text-slate-900">L'équipement complet du club moderne</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Agenda */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📅</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Agenda Partagé</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Synchronisation automatique des matchs et entraînements sur les téléphones des joueurs.
              </p>
            </div>
            {/* 2. Messagerie */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">💬</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Causerie / Chat</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Canaux de discussion sécurisés (Coach-Joueurs, Groupe complet) pour les infos officielles.
              </p>
            </div>
            {/* 3. Gamification */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🏅</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Trophées Club</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                "Le Pilier", "Le Goleador"... Des récompenses automatiques pour valoriser l'assiduité.
              </p>
            </div>
            {/* 4. Perf */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📊</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Data Performance</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Suivi précis de la progression (Temps, Poids, Scores) adapté à chaque sport.
              </p>
            </div>
            {/* 5. Covoiturage */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🚗</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Covoiturage</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Module intégré aux convocations : "Qui a une place ?" réglé en un clic.
              </p>
            </div>
            {/* 6. Administratif */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📁</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Administratif</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Suivi des certificats médicaux, tailles de maillots et paiements des cotisations.
              </p>
            </div>
            {/* 7. Météo */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🌦️</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">Météo Terrain</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Alertes automatiques en cas de pluie ou impraticabilité du terrain.
              </p>
            </div>
            {/* 8. Multi-Device */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📱</div>
              <h5 className="font-bold text-slate-800 text-lg mb-2">100% Mobile</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Accessible partout. Au bureau, dans le bus ou sur le banc de touche.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* --- NOUVELLE SECTION : EXEMPLES DE BADGES --- */}
      {/* ========================================= */}
      <section id="badges" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Header de section */}
          <div className="text-center mb-16">
             <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${colors.textPrimary}`}>Gamification</h3>
             <h4 className="text-3xl font-bold text-slate-900">Le Mur des Trophées</h4>
             <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
               Motivez vos joueurs en transformant chaque effort en récompense. Voici quelques exemples de badges que vos adhérents vont adorer débloquer.
             </p>
          </div>

          {/* Grille des Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             {/* Badge 1: Fidélité */}
             <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 shadow-sm relative overflow-hidden group hover:border-purple-400 transition-all">
               {/* Effet de brillance au survol */}
               <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.6),transparent_70%)]"></div>
               <div className="text-6xl mb-4 drop-shadow-md filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">🏗️</div>
               <h5 className="font-bold text-slate-800 text-lg mb-1">Le Pilier</h5>
               <p className="text-xs text-purple-600 font-semibold uppercase mb-3">Assiduité</p>
               <p className="text-slate-500 text-sm leading-snug">
                 Présent à 10 entraînements consécutifs. L'âme du club.
               </p>
             </div>

             {/* Badge 2: Performance Foot/Co-situations */}
             <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all">
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.6),transparent_70%)]"></div>
               <div className="text-6xl mb-4 drop-shadow-md filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">🧱</div>
               <h5 className="font-bold text-slate-800 text-lg mb-1">Mur de Briques</h5>
               <p className="text-xs text-blue-600 font-semibold uppercase mb-3">Performance</p>
               <p className="text-slate-500 text-sm leading-snug">
                 Réaliser 3 matchs sans encaisser de but (Clean Sheets) d'affilée.
               </p>
             </div>

             {/* Badge 3: Performance Endurance/Natation */}
             <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 shadow-sm relative overflow-hidden group hover:border-cyan-400 transition-all">
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.6),transparent_70%)]"></div>
               <div className="text-6xl mb-4 drop-shadow-md filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">🦈</div>
               <h5 className="font-bold text-slate-800 text-lg mb-1">Le Requin</h5>
               <p className="text-xs text-cyan-600 font-semibold uppercase mb-3">Endurance</p>
               <p className="text-slate-500 text-sm leading-snug">
                 Avoir parcouru un total de 50km de nage dans la saison.
               </p>
             </div>

             {/* Badge 4: Social/Fun */}
             <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 shadow-sm relative overflow-hidden group hover:border-pink-400 transition-all">
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.6),transparent_70%)]"></div>
               <div className="text-6xl mb-4 drop-shadow-md filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">📣</div>
               <h5 className="font-bold text-slate-800 text-lg mb-1">L'Ambianceur</h5>
               <p className="text-xs text-pink-600 font-semibold uppercase mb-3">Communauté</p>
               <p className="text-slate-500 text-sm leading-snug">
                 Toujours le premier à répondre aux sondages et à animer le chat du vestiaire.
               </p>
             </div>
          </div>
          
          <p className="text-center text-slate-500 text-sm mt-12 italic">
            + des dizaines d'autres badges adaptés automatiquement à votre sport (Football, Rugby, Judo, Handball...).
          </p>
        </div>
      </section>

      {/* --- TARIFICATION (4 OFFRES) --- */}
      <section id="pricing" className={`py-20 px-6 ${colors.bgLight}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900">Abonnements Club</h3>
            <p className="text-slate-600 mt-2">Une offre adaptée à chaque taille de vestiaire. Sans engagement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            
            {/* Offre 1 : 50€ */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-white hover:border-purple-300 transition relative flex flex-col shadow-sm h-full">
              <h4 className="text-lg font-bold text-slate-700 mb-2">Amateur</h4>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-4">Jusqu'à 50 Adhérents</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-slate-900">50€</span>
                <span className="text-slate-500 ml-1">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-600 flex-1">
                <li>✓ Accès "Le Vestiaire"</li>
                <li>✓ App Coach & Joueur</li>
                <li>✓ Support Email 48h</li>
              </ul>
              <Link to="/login" className="block w-full py-2.5 rounded-xl text-center font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition">
                Démarrer
              </Link>
            </div>

            {/* Offre 2 : 85€ (Mise en avant) */}
            <div className="p-6 rounded-3xl border-2 border-purple-600 shadow-xl relative bg-slate-900 text-white transform md:-translate-y-4 flex flex-col z-10 h-full">
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAIRE</div>
              <h4 className="text-lg font-bold text-white mb-2">Semi-Pro</h4>
              <p className="text-xs text-purple-300 uppercase tracking-wide font-bold mb-4">50 à 200 Adhérents</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-white">85€</span>
                <span className="text-purple-200 ml-1">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-300 flex-1">
                <li>✓ Tout le pack "Amateur"</li>
                <li>✓ Support Prioritaire</li>
                <li>✓ Import de données offert</li>
              </ul>
              <Link to="/login" className="block w-full py-3 rounded-xl text-center font-bold text-purple-900 bg-white hover:bg-slate-100 transition">
                Choisir
              </Link>
            </div>

            {/* Offre 3 : 100€ */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-white hover:border-purple-300 transition relative flex flex-col shadow-sm h-full">
              <h4 className="text-lg font-bold text-slate-700 mb-2">Pro</h4>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-4">200 à 500 Adhérents</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-slate-900">100€</span>
                <span className="text-slate-500 ml-1">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-600 flex-1">
                <li>✓ Tout le pack "Semi-Pro"</li>
                <li>✓ Multi-Comptes Admin</li>
                <li>✓ Formation Visio (1h)</li>
              </ul>
              <Link to="/login" className="block w-full py-2.5 rounded-xl text-center font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition">
                Choisir
              </Link>
            </div>

            {/* Offre 4 : Sur Devis */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-purple-50 hover:border-purple-300 transition relative flex flex-col shadow-sm h-full">
              <h4 className="text-lg font-bold text-purple-900 mb-2">Elite / Custom</h4>
              <p className="text-xs text-purple-400 uppercase tracking-wide font-bold mb-4">+500 Adhérents</p>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold text-purple-900">Sur Devis</span>
              </div>
              <div className="mb-6 flex-1">
                <p className="text-sm font-bold text-purple-700 mb-2">Grands Clubs & Ligues</p>
                <p className="text-sm text-slate-600 leading-snug">
                  API dédiée, développements spécifiques et accompagnement sur site.
                </p>
              </div>
              <a href="#contact" className="block w-full py-2.5 rounded-xl text-center font-bold text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 transition">
                Nous contacter
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* --- FORMULAIRE CONTACT (Inchangé) --- */}
      <section id="contact" className="py-20 px-6 bg-slate-50">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Contactez le Staff</h3>
            <p className="text-slate-500 text-sm mt-2">Une question ? Une démo ? On vous répond sous 24h.</p>
          </div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message envoyé au vestiaire !"); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition" placeholder="Nom du Club" />
              <input type="email" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition" placeholder="Email contact" />
            </div>
            <select className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition text-slate-600">
              <option>Taille du club...</option>
              <option>Petit ( -500 )</option>
              <option>Moyen ( 500-10000 )</option>
              <option>Grand ( +10000 )</option>
            </select>
            <textarea className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition h-32" placeholder="Besoin d'une démo ou d'un développement spécifique ?"></textarea>
            <button className={`w-full py-3 rounded-xl font-bold text-white shadow-lg ${colors.primary} ${colors.primaryHover} transition`}>
              Envoyer au Staff
            </button>
          </form>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 px-6 bg-slate-900 text-center text-slate-500 text-sm">
        <p className="mb-2">© 2025 Le Vestiaire by Rivality. Fait avec passion à Toulouse 🧱.</p>
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
        <h1 className="text-3xl font-bold mb-2">Le Vestiaire</h1>
        <p className="text-gray-500 mb-8">Connectez-vous pour accéder à votre espace club.</p>
        <button
          className="btn w-full bg-purple-700 text-white hover:bg-purple-800 py-3 rounded-lg flex items-center justify-center gap-2"
          onClick={handleLogin}
        >
          <span>G</span> Se connecter avec Google
        </button>
        <div className="mt-6 text-sm">
          <Link to="/" className="text-purple-600 hover:underline">← Retour à l'accueil</Link>
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
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    }) ?? { data: null };

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