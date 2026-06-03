import React, { useState } from 'react';
import { User, SubscriptionPlan, ForwardingRule, TelegramSession } from '../types';
import { Settings, Plus, Play, Pause, Trash2, Key, Link2, Copy, Check, Filter, ShieldCheck, Mail, Info, RefreshCw, AlertTriangle } from 'lucide-react';

interface UserPanelProps {
  currentUser: User;
  plans: SubscriptionPlan[];
  rules: ForwardingRule[];
  onUpdateRules: (rules: ForwardingRule[]) => void;
  onUpdateSessions: (sessions: TelegramSession[]) => void;
  onUpgradePlan: (planId: number) => void;
}

export default function UserPanel({
  currentUser,
  plans,
  rules,
  onUpdateRules,
  onUpdateSessions,
  onUpgradePlan
}: UserPanelProps) {
  // Current plan details
  const activePlan = plans.find(p => p.id === currentUser.planId) || plans[0];
  const userRules = rules.filter(r => r.userId === currentUser.id);

  // States for Pyrogram Generator Simulation
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sessionStep, setSessionStep] = useState<'idle' | 'requesting' | 'sms' | 'done'>('idle');
  const [smsCode, setSmsCode] = useState('');
  const [password2FA, setPassword2FA] = useState('');
  const [generatedSession, setGeneratedSession] = useState('');
  const [copiedSession, setCopiedSession] = useState(false);

  // States for Rule Creator Form
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [selectedPhone, setSelectedPhone] = useState(currentUser.telegramSessions[0]?.phoneNumber || '');
  const [sources, setSources] = useState('');
  const [destinations, setDestinations] = useState('');
  const [kwIncludes, setKwIncludes] = useState('');
  const [kwExcludes, setKwExcludes] = useState('');
  const [forwardAsCopy, setForwardAsCopy] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Media toggles
  const [mediaFilters, setMediaFilters] = useState({
    text: true,
    photo: true,
    video: true,
    document: true,
    animation: false
  });

  // Start Pyrogram Session generation
  const handleStartSessionGen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setSessionStep('requesting');
    
    // Simulate API Roundtrip delay
    setTimeout(() => {
      setSessionStep('sms');
    }, 1500);
  };

  const handleVerifySms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsCode) return;
    setSessionStep('requesting');

    setTimeout(() => {
      // Securely encrypt and generate simulated string
      const randomBase64 = Array.from({ length: 180 }, () => 
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(Math.floor(Math.random() * 64))
      ).join('');
      const pyrogramString = `BQD1_V${randomBase64}`;
      setGeneratedSession(pyrogramString);
      setSessionStep('done');

      // Add to user sessions
      const newSess: TelegramSession = {
        id: Date.now(),
        phoneNumber: phoneNumber,
        sessionString: pyrogramString,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };

      onUpdateSessions([...currentUser.telegramSessions, newSess]);
      if (!selectedPhone) {
        setSelectedPhone(phoneNumber);
      }
    }, 1800);
  };

  const resetSessionGen = () => {
    setPhoneNumber('');
    setSmsCode('');
    setPassword2FA('');
    setGeneratedSession('');
    setSessionStep('idle');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  // Rule additions
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ruleName || !sources || !destinations) {
      setErrorMsg('Required fields: Rule Name, Source list, and Destination list.');
      return;
    }

    if (!selectedPhone && currentUser.telegramSessions.length === 0) {
      setErrorMsg('Configure at least one Telegram Session string to delegate this forwarding rule.');
      return;
    }

    const srcArr = sources.split(',').map(s => s.trim()).filter(Boolean);
    const dstArr = destinations.split(',').map(s => s.trim()).filter(Boolean);

    // Verify constraints according to active plans
    if (srcArr.length > activePlan.maxSourceChannels) {
      setErrorMsg(`Plan Limit: Your plan only allows up to ${activePlan.maxSourceChannels} source channels. Add fewer sources, or upgrade to a higher tier.`);
      return;
    }

    if (dstArr.length > activePlan.maxDestinationChannels) {
      setErrorMsg(`Plan Limit: Your plan only allows up to ${activePlan.maxDestinationChannels} destination channels.`);
      return;
    }

    const newRule: ForwardingRule = {
      id: Date.now(),
      userId: currentUser.id,
      sessionPhone: selectedPhone || currentUser.telegramSessions[0]?.phoneNumber || "+14155552671",
      name: ruleName,
      sources: srcArr,
      destinations: dstArr,
      keywordIncludes: kwIncludes.split(',').map(k => k.trim()).filter(Boolean),
      keywordExcludes: kwExcludes.split(',').map(k => k.trim()).filter(Boolean),
      mediaFilters: { ...mediaFilters },
      forwardAsCopy: forwardAsCopy,
      isEnabled: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onUpdateRules([...rules, newRule]);
    
    // Clear Form
    setRuleName('');
    setSources('');
    setDestinations('');
    setKwIncludes('');
    setKwExcludes('');
    setShowRuleForm(false);
  };

  const handleDeleteRule = (id: number) => {
    const updated = rules.filter(r => r.id !== id);
    onUpdateRules(updated);
  };

  const toggleRuleEnabled = (id: number) => {
    const updated = rules.map(r => {
      if (r.id === id) {
        return { ...r, isEnabled: !r.isEnabled };
      }
      return r;
    });
    onUpdateRules(updated);
  };

  const handleDeleteSession = (sessId: number, phone: string) => {
    const updated = currentUser.telegramSessions.filter(s => s.id !== sessId);
    onUpdateSessions(updated);
    if (selectedPhone === phone) {
      setSelectedPhone('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tier plan headers */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -translate-x-16 translate-y-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-500/80 text-white font-mono text-[10px] font-bold rounded-lg tracking-wider uppercase">
                {activePlan.name}
              </span>
              <span className="font-mono text-xs text-slate-300">Client Panel</span>
            </div>
            <h1 className="font-sans font-semibold text-2xl text-white mt-1">Hello, {currentUser.username}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans">
              Setup your Pyrogram accounts, customize keywords filters, and watch automated channels feed post forwards simultaneously.
            </p>
          </div>

          <div className="flex bg-white/10 p-3 rounded-xl backdrop-blur-xs gap-4 items-center">
            <div className="text-slate-300">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">AVAILABLE WALLET</span>
              <span className="font-mono text-lg font-bold text-white">${currentUser.balance.toFixed(2)}</span>
            </div>
            {/* Pay upgrades option */}
            <div className="flex flex-col gap-1">
              {currentUser.planId < 3 && (
                <button
                  onClick={() => onUpgradePlan(currentUser.planId + 1)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-medium text-xs rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Upgrade Plan (${currentUser.planId === 1 ? '15.00' : '45.00'})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Plan Limits meter */}
        <div className="mt-6 border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
          <div className="bg-white/5 p-2 rounded-lg">
            <span className="text-slate-400 block text-[10px] mb-0.5">SOURCE CHANNELS LIMIT</span>
            <span className="font-mono font-bold text-slate-200">{userRules.reduce((acc, r) => acc + r.sources.length, 0)} / {activePlan.maxSourceChannels} configured</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg">
            <span className="text-slate-400 block text-[10px] mb-0.5">DESTINATION LIMIT</span>
            <span className="font-mono font-bold text-slate-200">{userRules.reduce((acc, r) => acc + r.destinations.length, 0)} / {activePlan.maxDestinationChannels} configured</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg">
            <span className="text-slate-400 block text-[10px] mb-0.5">MAX FORWARDS / DAY</span>
            <span className="font-mono font-bold text-slate-200">{activePlan.dailyForwardLimit} messages</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Sessions generator */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white/70 backdrop-blur-md border border-slate-100 p-5 rounded-2xl shadow-xs">
            <h3 className="font-sans font-semibold text-slate-800 text-sm mb-1.5 flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-500" />
              Pyrogram String Generator
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
              Create an encrypted authorization session string. The String session allows the Python forwarding script to listen safely.
            </p>

            {sessionStep === 'idle' && (
              <form onSubmit={handleStartSessionGen} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">TELEGRAM PHONE (E.164)</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +14155552671"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Specify your international phone extension first.</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  Generate Session String
                </button>
              </form>
            )}

            {sessionStep === 'requesting' && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                <p className="text-xs font-medium text-slate-700">Connecting MTProto Servers...</p>
                <p className="text-[10px] text-slate-400 mt-1">Acquiring API authentication code from Telegram network.</p>
              </div>
            )}

            {sessionStep === 'sms' && (
              <form onSubmit={handleVerifySms} className="space-y-3">
                <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-700 text-xs mb-3 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Interactive SIM Code Requested! Telegram has transmitted a verify code over SMS to {phoneNumber}.</span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">TELEGRAM SMS REGISTER CODE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 55219"
                    value={smsCode}
                    onChange={e => setSmsCode(e.target.value.replace(/\D/g,''))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-center tracking-widest text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">2FA PASSWORD (IF KEYED)</label>
                  <input
                    type="password"
                    placeholder="Leave empty if disabled"
                    value={password2FA}
                    onChange={e => setPassword2FA(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetSessionGen}
                    className="w-1/3 py-2 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                  >
                    Authenticate Account
                  </button>
                </div>
              </form>
            )}

            {sessionStep === 'done' && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold block">Authentication Complete!</span>
                    <span>Session stored securely in encrypted db block.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono font-semibold text-slate-400 mb-0.5">GENERATED PYROGRAM STR-SESSION:</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={generatedSession}
                      className="w-full p-2 bg-slate-100 border border-slate-200 rounded-md text-[9px] text-slate-500 font-mono focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleCopyText(generatedSession)}
                      className="p-2 border border-slate-200 hover:bg-slate-50 rounded-md shrink-0 cursor-pointer"
                      title="Copy Session"
                    >
                      {copiedSession ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetSessionGen}
                  className="w-full py-1.5 border border-slate-100 hover:bg-slate-50 text-slate-600 text-[11px] rounded-lg cursor-pointer"
                >
                  Generate Another
                </button>
              </div>
            )}
          </div>

          {/* Active accounts session lists */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-100 p-5 rounded-2xl shadow-xs">
            <h3 className="font-sans font-semibold text-slate-800 text-sm mb-3">
              Authorized Account Sessions ({currentUser.telegramSessions.length})
            </h3>
            
            {currentUser.telegramSessions.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100/50 text-amber-700 text-xs">
                <p className="font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  No accounts linked
                </p>
                <p className="mt-1 font-sans text-slate-500">
                  Generate your first credentials above to allow Pyrogram daemon to subscribe to telecom feeds.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentUser.telegramSessions.map(sess => (
                  <div key={sess.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100/20 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 px-1.5 bg-teal-50 text-teal-600 font-mono text-[9px] font-bold rounded-sm border border-teal-100 uppercase">
                        Active
                      </div>
                      <div>
                        <div className="font-mono text-xs font-semibold text-slate-700">{sess.phoneNumber}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">Created: {sess.createdAt}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSession(sess.id, sess.phoneNumber)}
                      className="p-1 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 border border-slate-100 rounded-md transition-colors cursor-pointer"
                      title="De-authorize Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right column: Active rules list */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white/70 backdrop-blur-md border border-slate-100 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sans font-semibold text-slate-800 text-sm">Post Forwarding Rules</h3>
                <p className="font-mono text-[10px] text-slate-400">Total configured: {userRules.length}</p>
              </div>

              {!showRuleForm && (
                <button
                  onClick={() => setShowRuleForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Rule
                </button>
              )}
            </div>

            {/* Rule Addition Form Slider */}
            {showRuleForm && (
              <form onSubmit={handleCreateRule} className="bg-slate-50/50 rounded-xl border border-slate-100 p-5 mb-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">New Forwarding Configuration</h4>
                  <button
                    type="button"
                    onClick={() => setShowRuleForm(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs"
                  >
                    Cancel
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">RULE NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5G News Feed Copy"
                      value={ruleName}
                      onChange={e => setRuleName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">DELEGATE FROM SUSTER ACCOUNT</label>
                    <select
                      value={selectedPhone}
                      onChange={e => setSelectedPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                    >
                      {currentUser.telegramSessions.map(s => (
                        <option key={s.id} value={s.phoneNumber}>{s.phoneNumber}</option>
                      ))}
                      {currentUser.telegramSessions.length === 0 && (
                        <option value="">(Create or link session first)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      SOURCE CHANNELS <span className="text-slate-400 font-normal">(Comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. @telecom_deals, -10012345678"
                      value={sources}
                      onChange={e => setSources(e.target.value.replace(/\s+/g, ''))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">Maximum allowed for your plan: {activePlan.maxSourceChannels} source paths.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      DESTINATION CHANNELS <span className="text-slate-400 font-normal">(Comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. @my_telco_channel"
                      value={destinations}
                      onChange={e => setDestinations(e.target.value.replace(/\s+/g, ''))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">Specify public handles or ID groups. Requires Admin access.</span>
                  </div>
                </div>

                {/* Filter constraints settings */}
                <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-3 font-sans">
                    Keyword & Media Filters (Optional)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">INCLUDE WORDS (OR MATCH)</label>
                      <input
                        type="text"
                        placeholder="e.g. 5G, Fiber, contract"
                        value={kwIncludes}
                        onChange={e => setKwIncludes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5 block">Forwards ONLY if message satisfies any keyword.</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">EXCLUDE WORDS (SPAM BLOCK)</label>
                      <input
                        type="text"
                        placeholder="e.g. ad, sponsored, coupon"
                        value={kwExcludes}
                        onChange={e => setKwExcludes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5 block">Skips any messages containing these words.</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[10px] font-semibold text-slate-500">ALLOWED MEDIA TYPES :</span>
                    <div className="flex flex-wrap gap-4 text-xs font-sans text-slate-700 bg-white p-2 border border-slate-100 rounded-lg">
                      {Object.keys(mediaFilters).map((key) => {
                        const filterKey = key as keyof typeof mediaFilters;
                        return (
                          <label key={filterKey} className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={mediaFilters[filterKey]}
                              onChange={() => setMediaFilters({
                                ...mediaFilters,
                                [filterKey]: !mediaFilters[filterKey]
                              })}
                              className="accent-indigo-600 rounded-sm"
                            />
                            <span className="capitalize">{filterKey}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={forwardAsCopy}
                      onChange={() => setForwardAsCopy(!forwardAsCopy)}
                      className="accent-slate-800 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold block text-slate-800">Forward as Copy</span>
                      <span className="text-[10px] text-slate-400 block font-normal">Removes &quot;Forwarded from&quot; watermarks and preserves clean original look</span>
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                  >
                    Deploy Forwarder Rule
                  </button>
                </div>
              </form>
            )}

            {/* Rules Dashboard listings */}
            {userRules.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-100 rounded-xl">
                <Settings className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-700">No Forwarding Rules Activated</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  Toggle the Add New Rule button above, link your Telegram accounts, specify your channels, and test the outputs cleanly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userRules.map(rule => (
                  <div key={rule.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs hover:border-slate-200 transition-all">
                    
                    <div className="flex items-start justify-between border-b border-slate-50 pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-semibold text-slate-800 text-sm">{rule.name}</h4>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-sm text-[9px] font-mono">
                            Via: {rule.sessionPhone}
                          </span>
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">Rule Created: {rule.createdAt}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Enable/Disable button */}
                        <button
                          onClick={() => toggleRuleEnabled(rule.id)}
                          className={`p-1 px-2 text-[10px] font-medium font-sans rounded-md border flex items-center gap-1 cursor-pointer transition-all ${
                            rule.isEnabled 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                          }`}
                        >
                          {rule.isEnabled ? (
                            <>
                              <Play className="w-2.5 h-2.5 fill-emerald-600" />
                              Active Monitoring
                            </>
                          ) : (
                            <>
                              <Pause className="w-2.5 h-2.5 fill-amber-600" />
                              Paused
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50/50 border border-slate-100 rounded-md transition-all cursor-pointer"
                          title="Purge Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-600">
                      
                      {/* Source destination mappings */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider font-mono">
                          <Link2 className="w-3.5 h-3.5 text-slate-400" />
                          Source Stream
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rule.sources.map((src, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 font-mono text-xs rounded-sm">
                              {src}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider font-mono pt-1">
                          <Link2 className="w-3.5 h-3.5 text-slate-400" />
                          Delivery Target
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rule.destinations.map((dst, i) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-mono text-xs rounded-sm">
                              {dst}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Rule criteria and output configs */}
                      <div className="space-y-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
                          <Filter className="w-3 h-3" />
                          Targeting Parameters
                        </div>

                        {rule.keywordIncludes.length > 0 && (
                          <div className="text-[11px]">
                            <span className="text-slate-400">Must include: </span>
                            <span className="font-mono text-slate-700 font-semibold">{rule.keywordIncludes.join(', ')}</span>
                          </div>
                        )}

                        {rule.keywordExcludes.length > 0 && (
                          <div className="text-[11px]">
                            <span className="text-slate-400">Excludes: </span>
                            <span className="font-mono text-red-600 font-semibold">{rule.keywordExcludes.join(', ')}</span>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                          <span className="font-semibold text-slate-500">Allowed:</span>
                          {Object.entries(rule.mediaFilters)
                            .filter(([_, isAllowed]) => isAllowed)
                            .map(([key]) => (
                              <span key={key} className="bg-white px-1.5 py-0.5 rounded-xs border border-slate-200 capitalize">{key}</span>
                            ))}
                        </div>

                        <div className="text-[10px] text-slate-500 font-medium">
                          {rule.forwardAsCopy ? (
                            <span className="text-teal-600">✓ Removes forwarded author labels (Copy mechanism)</span>
                          ) : (
                            <span className="text-indigo-600">➔ Preserves standard watermarked forwarding tags</span>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
