/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { User, SubscriptionPlan, ForwardingRule, TelegramSession, ForwardingLog } from './types';
import { INITIAL_USERS, INITIAL_PLANS, INITIAL_RULES, INITIAL_LOGS } from './components/SimulatedData';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';
import ForwardingSimulator from './components/ForwardingSimulator';
import CodeCenter from './components/CodeCenter';
import SecurityGuide from './components/SecurityGuide';
import { 
  Terminal, 
  Shield, 
  Settings, 
  Code, 
  Cpu, 
  Activity, 
  LogOut, 
  User as UserIcon, 
  ArrowRight, 
  Layers, 
  ExternalLink,
  Smartphone,
  Eye,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Inbox
} from 'lucide-react';

export default function App() {
  // Global active states inside our client dashboard
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [rules, setRules] = useState<ForwardingRule[]>(INITIAL_RULES);
  const [logs, setLogs] = useState<ForwardingLog[]>(INITIAL_LOGS);

  // Simulated login/auth layer state
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Starts as user HDBijoy
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'sandbox' | 'admin' | 'codes' | 'security'>('dashboard');

  // Trigger simulated upgrade using user wallet balances
  const handleUpgradePlan = (planId: number) => {
    const targetPlan = plans.find(p => p.id === planId);
    if (!targetPlan) return;

    if (currentUser.balance < targetPlan.priceMonthly) {
      alert(`Insufficient funds! Please add money to your wallet in the Creator Admin panel first. Cost is $${targetPlan.priceMonthly.toFixed(2)}.`);
      return;
    }

    // Deduct and upgrade
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          planId: planId,
          balance: parseFloat((u.balance - targetPlan.priceMonthly).toFixed(2))
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    const updatedSelf = updatedUsers.find(u => u.id === currentUser.id);
    if (updatedSelf) {
      setCurrentUser(updatedSelf);
    }
    
    alert(`Successfully upgraded to ${targetPlan.name}! Limits increased.`);
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    const updatedSelf = updatedUsers.find(u => u.id === currentUser.id);
    if (updatedSelf) {
      setCurrentUser(updatedSelf);
    }
  };

  const handleUpdatePlans = (updatedPlans: SubscriptionPlan[]) => {
    setPlans(updatedPlans);
  };

  const handleUpdateRules = (updatedRules: ForwardingRule[]) => {
    setRules(updatedRules);
  };

  const handleUpdateSessions = (updatedSessions: TelegramSession[]) => {
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, telegramSessions: updatedSessions };
      }
      return u;
    });
    setUsers(updatedUsers);
    const updatedSelf = updatedUsers.find(u => u.id === currentUser.id);
    if (updatedSelf) {
      setCurrentUser(updatedSelf);
    }
  };

  const handleAddLog = (newLog: ForwardingLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  // Quick stats computed live
  const activeUserRules = rules.filter(r => r.userId === currentUser.id);
  const activeSessionsCount = currentUser.telegramSessions.filter(s => s.status === 'active').length;
  const currentPlan = plans.find(p => p.id === currentUser.planId) || plans[0];
  const totalForwardsCount = logs.filter(l => l.status === 'success').length;

  return (
    <div id="main-panel" className="min-h-screen bg-slate-100 text-[#1e293b] flex flex-col md:flex-row font-sans">
      
      {/* Sidebar - Geometric Style */}
      <aside className="w-full md:w-60 geometric-sidebar flex flex-col shrink-0 min-h-screen border-r border-slate-900/40">
        <div className="p-6 md:p-8 shrink-0">
          <div className="text-lg font-black tracking-tight text-[#38bdf8] flex items-center gap-1">
            TELEFORWARD <span className="text-white">PRO</span>
          </div>
          <div className="font-mono text-[9px] text-[#475569] mt-1 tracking-wider uppercase">PHP + Pyrogram Core</div>
        </div>

        {/* Navigation tree */}
        <div className="flex-1 space-y-1.5 px-3">
          <span className="block text-[10px] font-bold text-[#475569] uppercase tracking-widest px-4 py-1.5 font-mono">
            Main Operations
          </span>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full geometric-nav-item ${
              activeTab === 'dashboard' ? 'geometric-nav-item-active' : ''
            }`}
          >
            <div className="w-3.5 h-3.5 border-2 border-current rounded-xs shrink-0" />
            Dashboard Hub
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`w-full geometric-nav-item ${
              activeTab === 'rules' ? 'geometric-nav-item-active' : ''
            }`}
          >
            <div className="w-3.5 h-3.5 border-2 border-current rounded-xs shrink-0" />
            Forwarding Rules
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`w-full geometric-nav-item ${
              activeTab === 'sandbox' ? 'geometric-nav-item-active' : ''
            }`}
          >
            <div className="w-3.5 h-3.5 border-2 border-current rounded-xs shrink-0" />
            Sessions & Sandbox
          </button>

          <span className="block text-[10px] font-bold text-[#475569] uppercase tracking-widest px-4 py-1.5 mt-4 font-mono">
            System Code & Setup
          </span>

          <button
            onClick={() => setActiveTab('codes')}
            className={`w-full geometric-nav-item ${
              activeTab === 'codes' ? 'geometric-nav-item-active' : ''
            }`}
          >
            <div className="w-3.5 h-3.5 border-2 border-current rounded-xs shrink-0" />
            Subscriptions & Code
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full geometric-nav-item ${
              activeTab === 'security' ? 'geometric-nav-item-active' : ''
            }`}
          >
            <div className="w-3.5 h-3.5 border-2 border-current rounded-xs shrink-0" />
            Wallet & Security
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full geometric-nav-item border-l-red-500/50 ${
                activeTab === 'admin' ? 'geometric-nav-item-active bg-red-950/20 text-red-100' : ''
              }`}
            >
              <div className="w-3.5 h-3.5 border-2 border-red-500 rounded-xs shrink-0" />
              Admin Console
            </button>
          )}
        </div>

        {/* Sidebar Static Info */}
        <div className="mt-auto p-6 bg-[#020617] text-[11px] text-[#475569] leading-snug border-t border-slate-900/50">
          <div>Version 2.4.1 (Stable)</div>
          <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-[#38bdf8]">
            <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-pulse"></span>
            Userbot Engine: Running
          </div>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f1f5f9]">
        
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 shrink-0 sticky top-0 z-40">
          <div>
            <span className="text-[#64748b] text-[13px]">Overview / </span>
            <span className="font-semibold text-[#0f172a] capitalize">
              {activeTab === 'dashboard' ? 'Active Rules' : activeTab === 'sandbox' ? 'Sessions Sandbox' : activeTab === 'codes' ? 'Source Center' : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-6">
            
            {/* Simulation Controls: Role Selector Switch */}
            <div className="hidden sm:flex items-center gap-1 bg-[#f1f5f9] p-1 border border-[#e2e8f0] rounded-xs text-xs font-mono">
              <span className="text-[9px] uppercase font-bold text-slate-400 px-1.5">Simulate:</span>
              <button
                type="button"
                onClick={() => {
                  const demoUser = users.find(u => u.role === 'user') || users[0];
                  setCurrentUser(demoUser);
                }}
                className={`px-2 py-0.5 rounded-xs font-medium cursor-pointer transition-all ${
                  currentUser.role === 'user' 
                    ? 'bg-white text-[#0f172a] shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                HDBijoy (Client)
              </button>
              <button
                type="button"
                onClick={() => {
                  const adUser = users.find(u => u.role === 'admin') || users[1];
                  setCurrentUser(adUser);
                }}
                className={`px-2.5 py-0.5 rounded-xs font-medium transition-all cursor-pointer ${
                  currentUser.role === 'admin' 
                    ? 'bg-white text-[#0f172a] shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Admin Mode
              </button>
            </div>

            {/* Wallet values display */}
            <div className="text-right flex flex-col justify-center">
              <div className="text-[10px] text-[#64748b] uppercase font-bold tracking-wider leading-none">Wallet Balance</div>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">${currentUser.balance.toFixed(2)}</div>
            </div>

            {/* User credentials badge */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-slate-200 border border-slate-300 rounded-full flex items-center justify-center font-bold text-[#475569] text-xs">
                {currentUser.username ? currentUser.username.slice(0, 2).toUpperCase() : 'JD'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-[#0f172a]">{currentUser.username}</div>
                <div className="text-[10px] text-[#64748b] font-mono leading-none capitalize">{currentUser.role}</div>
              </div>
            </div>

          </div>
        </header>

        {/* Tab container */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* Fallback Simulation alert bar for mobile screens */}
          <div className="sm:hidden bg-white p-3 rounded-xs border border-[#e2e8f0] flex items-center justify-between text-xs font-mono">
            <span>Role: <strong className="capitalize">{currentUser.role}</strong></span>
            <button 
              onClick={() => {
                const isUsr = currentUser.role === 'user';
                const nextUser = isUsr ? (users.find(u => u.role === 'admin') || users[1]) : (users.find(u => u.role === 'user') || users[0]);
                setCurrentUser(nextUser);
              }}
              className="px-2 py-1 bg-slate-950 text-white rounded-xs"
            >
              Switch Role
            </button>
          </div>
          
          {/* Dashboard Hub Screen */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Core metrics visual grid - styled to match exactly with Geometric Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                <div className="geometric-stat-card">
                  <div className="text-[#64748b] text-[11px] font-bold tracking-wider uppercase font-mono">Active Rules</div>
                  <div className="text-2xl font-bold mt-2 font-mono text-slate-900">
                    {activeUserRules.length} / 20
                  </div>
                </div>

                <div className="geometric-stat-card">
                  <div className="text-[#64748b] text-[11px] font-bold tracking-wider uppercase font-mono">Forwarded (24h)</div>
                  <div className="text-2xl font-bold mt-2 font-mono text-[#0ea5e9]">
                    {logs.filter(l => l.status === 'success').length}
                  </div>
                </div>

                <div className="geometric-stat-card">
                  <div className="text-[#64748b] text-[11px] font-bold tracking-wider uppercase font-mono">Total Media</div>
                  <div className="text-2xl font-bold mt-2 font-mono text-slate-900">
                    89.4 GB
                  </div>
                </div>

                <div className="geometric-stat-card">
                  <div className="text-[#64748b] text-[11px] font-bold tracking-wider uppercase font-mono">Session Health</div>
                  <div className="text-2xl font-bold mt-2 font-mono text-[#10b981]">
                    {activeSessionsCount > 0 ? 'Excellent' : 'No Account'}
                  </div>
                </div>

              </div>

              {/* Informative tutorial header card - Styled to fit geometric theme perfectly */}
              <div className="bg-white border border-[#e2e8f0] rounded-xs p-6 space-y-4 relative overflow-hidden">
                <div className="relative z-10">
                  <span className="px-2 py-0.5 bg-[#38bdf8]/10 text-[#0ea5e9] font-mono text-[9px] font-semibold border border-[#38bdf8]/20 tracking-wider rounded-xs uppercase">
                    DEPLOYMENT TUTORIAL
                  </span>
                  <h3 className="font-semibold text-slate-800 text-sm mt-2.5">Deploy and test your system:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4 text-[12px] leading-relaxed text-slate-600">
                    <div className="bg-slate-50 p-4 border border-[#e2e8f0] rounded-xs">
                      <span className="font-bold text-slate-800 block mb-1">1. Generate SessionString</span>
                      <p className="text-[11px] text-[#64748b]">
                        Navigate to <strong>&quot;Sessions & Sandbox&quot;</strong>, link your phone number, and generate a Pyrogram string session.
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 border border-[#e2e8f0] rounded-xs">
                      <span className="font-bold text-slate-800 block mb-1">2. Launch Rules Router</span>
                      <p className="text-[11px] text-[#64748b]">
                        Configure automated post forwarding rules specifying target handles and custom include/exclude keywords.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 border border-[#e2e8f0] rounded-xs">
                      <span className="font-bold text-slate-800 block mb-1">3. Live Playground Test</span>
                      <p className="text-[11px] text-[#64748b]">
                        Compose a mock message in the <strong>&quot;Sessions & Sandbox&quot;</strong> tab and trace live routing inside the syslogs module instantly.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                  <span className="text-[#64748b]">Configured via self-hosted PHP and Python frameworks. Build custom rules sets anytime.</span>
                  <button
                    onClick={() => setActiveTab('rules')}
                    className="px-4 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors self-start shrink-0 text-xs"
                  >
                    Configure Rules
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Recent activity and transaction logs */}
              <div className="bg-white border border-[#e2e8f0] rounded-xs p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
                  <div>
                    <h3 className="font-semibold text-[#0f172a] text-sm font-sans uppercase tracking-wider">System Audit Streams - Activity Logs</h3>
                    <p className="text-xs text-[#64748b] font-mono mt-0.5">Live synchronization with VPS logging APIs</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('sandbox')}
                    className="text-xs font-bold text-[#0ea5e9] hover:text-sky-600 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    Open Live Sandbox
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="geometric-table">
                    <thead>
                      <tr>
                        <th>Rule Name</th>
                        <th>Source Stream</th>
                        <th>Delivery Target</th>
                        <th>Status</th>
                        <th className="text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[#1e293b]">
                      {logs.slice(0, 5).map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 font-semibold text-slate-800">{log.ruleName}</td>
                          <td className="py-3 font-mono text-[12px] text-slate-500">{log.source}</td>
                          <td className="py-3 font-mono text-[12px] text-slate-800">{log.destination}</td>
                          <td className="py-3">
                            <span className={log.status === 'success' ? 'geometric-badge-success' : 'geometric-badge-warning'}>
                              {log.status === 'success' ? 'Active' : 'Paused'}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono text-[#64748b] text-[11px]">
                            {log.timestamp.split(' ')[1] || 'Now'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <div className="text-xs font-mono font-bold text-[#64748b] uppercase flex justify-between">
                    <span>Real-time Forwarding Logs</span>
                    <span className="text-[#38bdf8] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-ping"></span>
                      LIVE • STREAMING
                    </span>
                  </div>
                  <div className="geometric-console geometric-console-fade opacity-95">
                    <div>[2026-06-03 14:42:01] INFO: Received Message (ID: 49202) from @binance_feed</div>
                    <div>[2026-06-03 14:42:01] INFO: Applied Rule &apos;Crypto Alerts Daily&apos; - Filtering: OK</div>
                    <div>[2026-06-03 14:42:02] SUCCESS: Forwarded to @my_crypto_hub (Method: Copy)</div>
                    <div>[2026-06-03 14:42:15] INFO: Received Message (ID: 1029) from @pyrogram_news</div>
                    <div>[2026-06-03 14:42:16] SUCCESS: Forwarded to @internal_dev_log (Method: Forward)</div>
                    <div>[2026-06-03 14:42:30] WARN: Message filtered out (Keyword &apos;Ads&apos; excluded)</div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Rules and Session configuration views */}
          {activeTab === 'rules' && (
            <UserPanel
              currentUser={currentUser}
              plans={plans}
              rules={rules}
              onUpdateRules={handleUpdateRules}
              onUpdateSessions={handleUpdateSessions}
              onUpgradePlan={handleUpgradePlan}
            />
          )}

          {/* Live Simulator View */}
          {activeTab === 'sandbox' && (
            <ForwardingSimulator
              rules={rules}
              currentUser={currentUser}
              logs={logs}
              onAddLog={handleAddLog}
            />
          )}

          {/* Administrator View */}
          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <AdminPanel
              users={users}
              plans={plans}
              onUpdateUsers={handleUpdateUsers}
              onUpdatePlans={handleUpdatePlans}
              currentUser={currentUser}
            />
          )}

          {/* Code Showcase Tab */}
          {activeTab === 'codes' && (
            <CodeCenter />
          )}

          {/* VPS deployment handbook */}
          {activeTab === 'security' && (
            <SecurityGuide />
          )}

        </main>
        
        {/* Footers */}
        <footer className="bg-white border-t border-[#e2e8f0] py-4 px-6 text-center shrink-0">
          <p className="text-xs text-[#64748b] font-mono">
            TeleForward Pro • Designed for Robust Self-Hosted Pyrogram userbots & PHP cPanel systems. Under strict Terms of Service.
          </p>
        </footer>

      </div>

    </div>
  );
}
