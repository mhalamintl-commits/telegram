import React, { useState } from 'react';
import { User, SubscriptionPlan } from '../types';
import { Shield, Sparkles, Plus, Wallet, Trash2, Check, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  plans: SubscriptionPlan[];
  onUpdateUsers: (users: User[]) => void;
  onUpdatePlans: (plans: SubscriptionPlan[]) => void;
  currentUser: User;
}

export default function AdminPanel({
  users,
  plans,
  onUpdateUsers,
  onUpdatePlans,
  currentUser
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'plans'>('users');
  
  // States for adding user
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<number>(1);
  const [newUserBalance, setNewUserBalance] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');

  // States for adding plan
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('10.00');
  const [maxSrc, setMaxSrc] = useState('5');
  const [maxDst, setMaxDst] = useState('5');
  const [dailyLimit, setDailyLimit] = useState('100');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newUsername || !newEmail) {
      setErrorMsg('Username and email are required.');
      return;
    }
    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
      setErrorMsg('Username already exists.');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      username: newUsername,
      email: newEmail,
      role: 'user',
      planId: Number(newUserPlan),
      balance: Number(newUserBalance) || 0,
      joinedAt: new Date().toISOString().split('T')[0],
      telegramSessions: []
    };

    onUpdateUsers([...users, newUser]);
    setNewUsername('');
    setNewEmail('');
    setNewUserBalance(0);
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName) return;

    const newPlan: SubscriptionPlan = {
      id: Date.now(),
      name: newPlanName,
      priceMonthly: Number(newPlanPrice) || 0.00,
      priceYearly: (Number(newPlanPrice) || 0.00) * 8, // simulated discount
      maxSourceChannels: Number(maxSrc) || 3,
      maxDestinationChannels: Number(maxDst) || 3,
      dailyForwardLimit: Number(dailyLimit) || 100
    };

    onUpdatePlans([...plans, newPlan]);
    setNewPlanName('');
    setNewPlanPrice('10.00');
    setMaxSrc('5');
    setMaxDst('5');
    setDailyLimit('100');
  };

  const handleDeleteUser = (id: number) => {
    if (id === currentUser.id) {
      alert("Cannot delete yourself!");
      return;
    }
    const filtered = users.filter(u => u.id !== id);
    onUpdateUsers(filtered);
  };

  const handleModifyBalance = (userId: number, amount: number) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, balance: Math.max(0, parseFloat((u.balance + amount).toFixed(2))) };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans font-semibold text-lg text-slate-800">Administrator Console</h2>
            <p className="font-mono text-xs text-slate-400">cPanel Web-Hook Synchronizer State</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-md transition-all ${
              activeTab === 'users' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Manage Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-1.5 rounded-md transition-all ${
              activeTab === 'plans' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Subscription Plans ({plans.length})
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create User Card */}
          <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-5 h-fit">
            <h3 className="font-sans font-medium text-slate-700 text-sm mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              Register New Client Account
            </h3>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">USERNAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. telecom_pro"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value.replace(/\s+/g, ''))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@yourdomain.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">INITIAL PLAN</label>
                  <select
                    value={newUserPlan}
                    onChange={e => setNewUserPlan(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">INITIAL WALLET ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newUserBalance || ''}
                    onChange={e => setNewUserBalance(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                Create User Record
              </button>
            </form>
          </div>

          {/* User List Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-sans font-medium text-slate-700 text-sm">Active Subscriptions</h3>
            <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 font-mono text-[10px] text-slate-400 border-b border-slate-100">
                    <th className="p-3">CLIENT INFO</th>
                    <th className="p-3">TIER PLAN</th>
                    <th className="p-3">WALLET BALANCE</th>
                    <th className="p-3 text-right">CREDIT MANAGEMENT / ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                  {users.map(user => {
                    const userPlan = plans.find(p => p.id === user.planId) || plans[0];
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="p-3">
                          <div className="font-medium text-slate-800 font-sans flex items-center gap-1.5">
                            {user.username}
                            {user.role === 'admin' && (
                              <span className="px-1.5 py-0.5 bg-rose-50 text-rose-500 text-[9px] font-mono font-bold rounded-sm">ADMIN</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md inline-block">
                            {userPlan.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Max: {userPlan.maxSourceChannels} Src / {userPlan.maxDestinationChannels} Dst</div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-slate-800 font-semibold">${user.balance.toFixed(2)}</div>
                          <div className="text-[9px] font-mono text-slate-300">Active Telegram Sessions: {user.telegramSessions.length}</div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Wallet Adjust buttons */}
                            <button
                              onClick={() => handleModifyBalance(user.id, 10)}
                              title="Add $10.00"
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-md border border-emerald-100 transition-colors cursor-pointer"
                            >
                              +$10
                            </button>
                            <button
                              onClick={() => handleModifyBalance(user.id, -10)}
                              title="Deduct $10.00"
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold rounded-md border border-amber-100 transition-colors cursor-pointer"
                            >
                              -$10
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === 'admin'}
                              className={`p-1.5 rounded-lg border border-slate-100 ml-2 ${
                                user.role === 'admin' 
                                  ? 'text-slate-300 bg-slate-50 cursor-not-allowed' 
                                  : 'text-red-500 bg-red-50/20 hover:bg-red-50 hover:text-red-600 cursor-pointer'
                              }`}
                              title="Delete Client Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Plan Card */}
          <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-5 h-fit">
            <h3 className="font-sans font-medium text-slate-700 text-sm mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" />
              Configure Custom Subscription Plan
            </h3>

            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">PLAN NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scale Pro"
                  value={newPlanName}
                  onChange={e => setNewPlanName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">PRICE / MO ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="19.99"
                    value={newPlanPrice}
                    onChange={e => setNewPlanPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">DAILY LIMIT</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="500"
                    value={dailyLimit}
                    onChange={e => setDailyLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MAX SOURCES</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={maxSrc}
                    onChange={e => setMaxSrc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MAX DESTINATIONS</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={maxDst}
                    onChange={e => setMaxDst(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                Add Subscription Plan
              </button>
            </form>
          </div>

          {/* Subscription Plans List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-sans font-medium text-slate-700 text-sm">System Tier Structures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map(plan => (
                <div key={plan.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/30 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm font-sans">{plan.name}</h4>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">ID: p_{plan.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-base font-bold text-slate-800">${plan.priceMonthly.toFixed(2)}<span className="text-[10px] text-slate-400 font-normal">/mo</span></div>
                      <div className="text-[9px] font-mono text-slate-400">Yearly: ${plan.priceYearly.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 relative z-10">
                    <div className="text-center border-r border-slate-100">
                      <div className="text-[10px] font-semibold text-slate-400 font-mono">MAX SOURCES</div>
                      <div className="font-mono text-xs font-bold text-slate-700 mt-0.5">{plan.maxSourceChannels}</div>
                    </div>
                    <div className="text-center border-r border-slate-100">
                      <div className="text-[10px] font-semibold text-slate-400 font-mono">MAX DEST.</div>
                      <div className="font-mono text-xs font-bold text-slate-700 mt-0.5">{plan.maxDestinationChannels}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-semibold text-slate-400 font-mono">DAILY LMT.</div>
                      <div className="font-mono text-xs font-bold text-slate-700 mt-0.5">{plan.dailyForwardLimit}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
