import React, { useState, useEffect } from 'react';
import { 
  Zap, Compass, Server, Shield, Lock, CreditCard, ChevronRight, 
  User as UserIcon, RefreshCw, Send, CheckCircle, Database, Layout, 
  Layers, Plus, Terminal, HelpCircle, ArrowRight, ShieldAlert, Sparkles, 
  Check, PlayCircle, Star, Circle, Globe, DollarSign, LogOut, Sun, Moon
} from 'lucide-react';
import LoginModal from './components/LoginModal';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import FaqSection from './components/FaqSection';
import { User, BillingInvoice } from './types';
import { useTheme } from './components/ThemeContext';
import { getSessionToken, setSessionToken, clearSessionToken } from './lib/auth-storage';
import { motion } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();

  // Load active session from local storage on bootstrap
  useEffect(() => {
    const initSession = async () => {
      let savedUserId = sessionStorage.getItem('tf_user_id');
      if (!savedUserId) {
        savedUserId = await getSessionToken();
      }
      
      if (savedUserId) {
        fetchUserSession(savedUserId);
      }
      fetchBaseStats();
    };
    initSession();
  }, []);

  const fetchUserSession = async (uid: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'x-user-id': uid }
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        sessionStorage.removeItem('tf_user_id');
        await clearSessionToken();
      }
    } catch (e) {
      console.error('Session restoration failed', e);
    }
  };

  const fetchBaseStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-user-id': 'admin-1' } // Fallback admin query to display real dashboard counters
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setSystemStats(data.stats);
      } else {
        console.warn('Stats endpoint returned non-JSON response or failed');
      }
    } catch (e) {
      console.error('Could not load landing stats panel', e);
    }
  };

  const handleAuthSuccess = async (user: User, rememberMe?: boolean) => {
    setCurrentUser(user);
    if (rememberMe) {
      await setSessionToken(user.id);
    } else {
      sessionStorage.setItem('tf_user_id', user.id);
    }
    fetchBaseStats();
    if (user.role === 'admin') {
      setAdminMode(true);
    } else {
      setAdminMode(false);
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setAdminMode(false);
    sessionStorage.removeItem('tf_user_id');
    await clearSessionToken();
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-[#06070a] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Absolute ambient lights background */}
      <div className="fixed inset-x-0 top-0 -z-10 h-[500px] overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-transparent blur-[120px]" />
        <div className="absolute top-[-10%] right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-violet-500/10 to-transparent blur-[100px]" />
      </div>

      {/* Primary Top Bar Header */}
      <header className={`sticky top-0 z-40 shrink-0 border-b border-[#1e2230]/75 backdrop-blur-md transition-colors duration-300 ${theme === 'dark' ? 'bg-[#06070ab3]' : 'bg-white/75'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow shadow-indigo-500/30">
              <svg className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor font-extrabold" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className={`text-lg font-extrabold tracking-tight font-sans ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tele<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Flow</span></span>
              <span className="ml-1 text-[8px] bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 rounded px-1 font-mono uppercase font-bold py-0.2">v2.1</span>
            </div>
          </div>

          {/* Nav links / session toggles */}
          <div className="flex items-center gap-4">
            
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${theme === 'dark' ? 'bg-[#14161f] text-gray-400 hover:text-white border border-[#1e2230]' : 'bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-300'}`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            
            {currentUser ? (
              <div className="flex items-center gap-3">
                
                {/* Admin / User view switcher for administrators */}
                {currentUser.role === 'admin' && (
                  <div className="flex items-center rounded-lg bg-[#14161f] p-0.5 border border-[#1e2230] text-xs">
                    <button
                      id="btn_admin_view_toggle_user"
                      onClick={() => setAdminMode(false)}
                      className={`rounded px-3 py-1 font-semibold transition-all cursor-pointer ${
                        !adminMode 
                          ? 'bg-[#1e2230] text-indigo-400 shadow'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      User View
                    </button>
                    <button
                      id="btn_admin_view_toggle_admin"
                      onClick={() => setAdminMode(true)}
                      className={`rounded px-3 py-1 font-semibold transition-all cursor-pointer ${
                        adminMode 
                          ? 'bg-[#1e2230] text-red-400 shadow'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Admin Panel
                    </button>
                  </div>
                )}

                {/* Profile pill indicators */}
                <div className="hidden sm:flex items-center gap-2 bg-[#0d0e12] border border-[#1e2230] rounded-lg px-3 py-1 text-xs">
                  <UserIcon className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-gray-300 truncate max-w-[120px]" title={currentUser.email}>
                    {currentUser.email}
                  </span>
                  <span className="bg-indigo-500/10 border border-indigo-400/25 text-indigo-400 text-[10px] font-bold rounded px-1.5 py-0.1">
                    {currentUser.plan}
                  </span>
                </div>

                {/* Secure Log-out */}
                <button
                  id="btn_sess_logout"
                  onClick={handleLogout}
                  className="rounded-lg border border-[#1e2230] hover:bg-[#14161f] p-2 text-gray-400 hover:text-white transition-all cursor-pointer"
                  title="Logout Session"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  id="btn_landing_pricing_scroller"
                  onClick={() => {
                    const el = document.getElementById('pricing_block');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-200 hover:underline cursor-pointer"
                >
                  Plans & Options
                </button>
                <button
                  id="btn_open_login_modal"
                  onClick={() => setAuthModalOpen(true)}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  Sign In / Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-grow shrink-0">
        
        {currentUser ? (
          /* AUTHENTICATED WORKBENCH STAGE */
          <div className="animate-fadeIn">
            {adminMode ? (
              <AdminDashboard adminUser={currentUser} />
            ) : (
              <UserDashboard 
                user={currentUser} 
                onUpdateUser={setCurrentUser} 
                onLogout={handleLogout}
              />
            )}
          </div>
        ) : (
          /* ANONYMOUS LANDING PAGE STAGE */
          <div className="relative isolate overflow-hidden">
            
            {/* HERO HERO SECTION */}
            <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
              <span className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 px-3.5 py-1 text-xs font-semibold text-indigo-400">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Sleek multi-pipeline forwarding worker 24/7
              </span>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-sans max-w-4xl mx-auto">
                Multi-Channel Telegram Post <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-pulse">Forwarding</span> in Real-Time
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-gray-400 leading-relaxed">
                Empower your syndication network. Read streams from multiple source chats, apply advanced find & replace formulas, isolate exclusions, and forward target messages instantly 24/7 non-stop.
              </p>

              {/* Action buttons CTA */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button
                  id="cta_landing_create_acc"
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/25 cursor-pointer transition-all"
                >
                  Initialize Free Pipeline
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
                <button
                  id="cta_landing_view_plans"
                  onClick={() => {
                    const el = document.getElementById('pricing_block');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-lg border border-[#1e2230] hover:bg-[#14161f] px-6 py-3 text-sm font-bold text-gray-300 hover:text-white cursor-pointer transition-all"
                >
                  View Subscription Options
                </button>
              </div>

              {/* LIVE WORKER INTERACTIVE VISUAL CANVAS */}
              <div className="mt-14 max-w-3xl mx-auto rounded-2xl border border-[#1e2230] bg-[#0d0e12] p-4 md:p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 p-3 flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
                <div className="absolute top-2.5 right-4 font-mono text-[9px] text-gray-600 flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>ACTIVE EVENT STREAM HANDLER</span>
                </div>

                <div className="border-t border-[#14161f] pt-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  
                  {/* Left Source Block */}
                  <div className="space-y-3">
                    <span className="block text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider text-left">MULTIPLE SOURCES</span>
                    <div className="rounded-lg bg-[#14161f] p-3 text-left border border-[#1e2230] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                        <Circle className="h-2 w-2 rounded-full fill-indigo-500 text-indigo-500" />
                        <span>@market_updates</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 font-bold">
                        <Circle className="h-2 w-2 rounded-full fill-indigo-500 text-indigo-500 animate-ping" />
                        <span>@alpha_alerts</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                        <Circle className="h-2 w-2 rounded-full fill-indigo-500 text-indigo-500 animate-pulse" />
                        <span>@world_news_now</span>
                      </div>
                    </div>
                  </div>

                  {/* Mid Hub Engine block */}
                  <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
                      <Zap className="absolute inset-0 h-6 w-6 mx-auto my-auto text-indigo-400" />
                    </div>
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider mt-1 block">TeleFlow Engine</span>
                    <span className="text-[9px] text-green-400 font-mono flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                      NON-STOP REALTIME
                    </span>
                  </div>

                  {/* Right Destination target Block */}
                  <div className="space-y-3">
                    <span className="block text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider text-right">TARGET CHANNELS</span>
                    <div className="rounded-lg bg-[#14161f] p-3 text-right border border-[#1e2230] space-y-2">
                      <div className="flex items-center justify-end gap-2 text-xs font-semibold text-indigo-400 font-bold">
                        <span>@all_market_feed</span>
                        <CheckCircle className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div className="flex items-center justify-end gap-2 text-xs font-semibold text-gray-400">
                        <span>@backup_news_chat</span>
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* BENETO FEATURE GRID SECTION */}
            <div className={`border-t py-16 transition-colors duration-300 ${theme === 'dark' ? 'border-[#1e2230]/50 bg-[#090b0e50]' : 'border-gray-200 bg-gray-100/50'}`}>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-12">
                  <h2 className={`text-2xl font-bold tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Automated Rules Engine features</h2>
                  <p className={`text-xs max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>TeleFlow operates at MTProto speed, giving you precise controls of how posts are delivered.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      title: "No-Delay Forwarding",
                      description: "Messages are captured directly from Telegram user API channels and piped to targets with less than 150ms of latency — genuinely instant.",
                      icon: <Zap className="h-5 w-5" />,
                      iconBg: "bg-indigo-500/10",
                      iconColor: "text-indigo-400"
                    },
                    {
                      title: "Regex Find & Replace",
                      description: "Strip original source branding, affiliate links, or custom banners. Dynamically inject your signature or custom tokens using regex.",
                      icon: <RefreshCw className="h-5 w-5 animate-spin" style={{ animationDuration: '6s' }} />,
                      iconBg: "bg-violet-500/10",
                      iconColor: "text-violet-400"
                    },
                    {
                      title: "Robust Keyword blacklists",
                      description: "Protect your audience. Drop posts context with custom blacklisted terms automatically, or whitelists where posts must contain target terms.",
                      icon: <Shield className="h-5 w-5" />,
                      iconBg: "bg-red-500/10",
                      iconColor: "text-red-400"
                    },
                    {
                      title: "24/7 Autonomous execution",
                      description: "Our reliable Node.js server system is designed to run in background containers permanently, ensuring forwarding works even if your browser is closed.",
                      icon: <Server className="h-5 w-5" />,
                      iconBg: "bg-emerald-500/10",
                      iconColor: "text-emerald-400"
                    }
                  ].map((feature, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className={`rounded-xl border p-5 ${theme === 'dark' ? 'border-[#1e2230] bg-[#0d0e12]' : 'border-gray-200 bg-white shadow-sm'}`}
                    >
                      <div className={`h-10 w-10 shrink-0 ${feature.iconBg} rounded-lg flex items-center justify-center ${feature.iconColor} mb-4`}>
                        {feature.icon}
                      </div>
                      <h3 className={`font-bold text-sm mb-1.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                      <p className={`text-xs leading-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>

              </div>
            </div>

            {/* PRICING PLANS BLOCK */}
            <div id="pricing_block" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Fair, Transparent Pricing</h2>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">Upgrade to unlock unlimited multi-channel routing configurations and zero forwarding limits.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Re-using visual standard plans representation of types */}
                <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-5 flex flex-col justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500">STARTER</span>
                    <h4 className="text-lg font-bold text-white mt-1">Free Tier</h4>
                    <p className="text-xs text-gray-400 mt-1 lines-clamp-2">Test out our user API routing engine for free forever.</p>
                    <div className="my-4 flex items-baseline text-white">
                      <span className="text-3xl font-extrabold">$0</span>
                      <span className="ml-1 text-xs text-gray-400">/ forever</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-gray-400 border-t border-[#1e2230] pt-3">
                      <li className="flex items-center gap-1.5">✓ 1 Active Forwarder</li>
                      <li className="flex items-center gap-1.5">✓ Max 50 routing logs/day</li>
                      <li className="flex items-center gap-1.5">✓ Basic find & replace</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setAuthModalOpen(true)}
                    className="mt-6 w-full rounded bg-indigo-600 hover:bg-indigo-500 py-1.5 text-xs font-bold text-white cursor-pointer cursor-pointer"
                  >
                    Get Started Free
                  </button>
                </div>

                <div className="rounded-xl border border-indigo-500 ring-1 ring-indigo-500 bg-[#0d0e12] p-5 flex flex-col justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400">POPULAR LICENSING</span>
                    <h4 className="text-lg font-bold text-white mt-1">Pro Monthly</h4>
                    <p className="text-xs text-gray-300 mt-1 lines-clamp-2">Essential for serious signal directors and syndicators.</p>
                    <div className="my-4 flex items-baseline text-white">
                      <span className="text-3xl font-extrabold">$9.99</span>
                      <span className="ml-1 text-xs text-gray-400">/ month</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-gray-300 border-t border-[#1e2230] pt-3">
                      <li className="flex items-center gap-1.5">✓ Unlimited Forwarder tasks</li>
                      <li className="flex items-center gap-1.5">✓ No daily limitations</li>
                      <li className="flex items-center gap-1.5">✓ Instant real-time routing</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setAuthModalOpen(true)}
                    className="mt-6 w-full rounded bg-indigo-600 hover:bg-indigo-500 py-1.5 text-xs font-bold text-white cursor-pointer"
                  >
                    Upgrade Monthly
                  </button>
                </div>

                <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-5 flex flex-col justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] font-bold text-violet-400">BEST VALUE</span>
                    <h4 className="text-lg font-bold text-white mt-1">Pro Yearly</h4>
                    <p className="text-xs text-gray-400 mt-1 lines-clamp-2">Secure the route and save over 30% dynamically.</p>
                    <div className="my-4 flex items-baseline text-white">
                      <span className="text-3xl font-extrabold">$79.99</span>
                      <span className="ml-1 text-xs text-gray-400">/ year</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-gray-400 border-t border-[#1e2230] pt-3">
                      <li className="flex items-center gap-1.5">✓ Save over 30% compared to monthly</li>
                      <li className="flex items-center gap-1.5">✓ Priority process queues 24/7</li>
                      <li className="flex items-center gap-1.5">✓ Advanced regex keyword support</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setAuthModalOpen(true)}
                    className="mt-6 w-full rounded bg-indigo-600 hover:bg-indigo-500 py-1.5 text-xs font-bold text-white cursor-pointer"
                  >
                    Upgrade Yearly
                  </button>
                </div>

                <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-5 flex flex-col justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400">MASS SCALE</span>
                    <h4 className="text-lg font-bold text-white mt-1">Enterprise Plan</h4>
                    <p className="text-xs text-gray-400 mt-1 lines-clamp-2">Ultimate standalone container for heavy networks.</p>
                    <div className="my-4 flex items-baseline text-white">
                      <span className="text-3xl font-extrabold">$199.99</span>
                      <span className="ml-1 text-xs text-gray-400">/ year</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-gray-400 border-t border-[#1e2230] pt-3">
                      <li className="flex items-center gap-1.5">✓ SLA 99.99% server guarantee</li>
                      <li className="flex items-center gap-1.5">✓ Custom webhooks for status callbacks</li>
                      <li className="flex items-center gap-1.5">✓ Dedicated container thread allocation</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setAuthModalOpen(true)}
                    className="mt-6 w-full rounded bg-indigo-600 hover:bg-indigo-500 py-1.5 text-xs font-bold text-white cursor-pointer"
                  >
                    Upgrade Scale
                  </button>
                </div>
              </div>
            </div>

            <FaqSection />

          </div>
        )}
      </main>

      {/* UNIVERSAL RECONSTRUCTED FOOTER */}
      <footer className="border-t border-[#1e2230]/50 py-6 bg-[#040507]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <span>© 2026 TeleFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powerd By : DorjiGroup</span>
          </div>
        </div>
      </footer>

      {/* LOGIN OR SIGNUP MODAL OVERLAY POPUP */}
      <LoginModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess} 
      />
    </div>
  );
}
