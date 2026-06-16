import React, { useState, useEffect } from 'react';
import { 
  Users, Layers, Settings, ShieldCheck, DollarSign, RefreshCw, 
  UserX, Check, Edit, Save, Trash, AlertCircle, Key, Terminal, Code2 
} from 'lucide-react';
import { User } from '../types';

interface AdminDashboardProps {
  adminUser: User;
}

export default function AdminDashboard({ adminUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets'>('overview');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // System credentials edit state
  const [apiKey, setApiKey] = useState('');
  
  // SMTP settings state
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit user state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [targetPlan, setTargetPlan] = useState<'Free' | 'Monthly' | 'Yearly' | 'Enterprise'>('Free');
  const [targetRole, setTargetRole] = useState<'user' | 'admin'>('user');
  const [targetStatus, setTargetStatus] = useState<'active' | 'suspended'>('active');

  // Ticket Reply state
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets', {
        headers: { 'x-user-id': adminUser.id }
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'x-user-id': adminUser.id }
      });
      const statsData = await statsRes.json();
      
      if (!statsRes.ok) {
        throw new Error(statsData.error || 'Failed to authenticate admin stats');
      }
      setAdminStats(statsData.stats);
      const settings = statsData.stats.systemSettings || {};
      setApiKey(settings.dorjiApiKey || '');
      setSmtpHost(settings.smtpHost || '');
      setSmtpPort(settings.smtpPort || 587);
      setSmtpSecure(settings.smtpSecure || false);
      setSmtpUser(settings.smtpUser || '');
      setSmtpPass(settings.smtpPass || '');
      setSmtpFrom(settings.smtpFrom || 'support@dorjigroup.org');

      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'x-user-id': adminUser.id }
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setUsersList(usersData.users);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred fetching admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({
          dorjiApiKey: apiKey,
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpSecure,
          smtpUser,
          smtpPass,
          smtpFrom
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Global Dorji Payment gateway keys updated successfully and loaded into live server memory.');
        fetchAdminData();
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        throw new Error(data.error || 'Failed updating variables');
      }
    } catch (e: any) {
      alert(e.message || 'Settings error');
    }
  };

  const handleEditUserClick = (usr: User) => {
    setEditingUserId(usr.id);
    setTargetPlan(usr.plan);
    setTargetRole(usr.role);
    setTargetStatus(usr.status);
  };

  const handleSaveUserConfig = async (usrId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${usrId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({
          plan: targetPlan,
          role: targetRole,
          status: targetStatus
        })
      });

      const data = await res.json();
      if (res.ok) {
        setEditingUserId(null);
        fetchAdminData();
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleDeleteUser = async (usrId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? All resources (forwarders, logs, invoices) will be removed.')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${usrId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': adminUser.id
        }
      });
      const data = await res.json();
      if (res.ok) {
        fetchAdminData();
      } else {
        throw new Error(data.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({
          adminReply: replyContent,
          repliedAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        setReplyingTicketId(null);
        setReplyContent('');
        fetchTickets();
      }
    } catch (e) {
      alert('Failed to reply to ticket');
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser.id
        },
        body: JSON.stringify({
          status: 'closed'
        })
      });

      if (res.ok) {
        fetchTickets();
      }
    } catch (e) {
      alert('Failed to close ticket');
    }
  };

  if (loading && !adminStats) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn text-white">
      {/* Admin Title Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1e2230] pb-4 gap-4">
        <div>
          <span className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 font-bold px-2.5 py-0.5 rounded-lg font-mono">
            SECURE SYSTEM ADMINISTRATOR BAR
          </span>
          <h2 className="text-2xl font-extrabold mt-1">TeleFlow Overlord Console</h2>
          <p className="text-xs text-gray-400 mt-0.5">Global controls over system-wide user routing databases, subscription levels, and payment gateway keys.</p>
        </div>
        <button
          id="btn_admin_refresh"
          onClick={() => {
            fetchAdminData();
            if (activeTab === 'tickets') fetchTickets();
          }}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#14161f] border border-[#1e2230] hover:bg-[#1a1c24] px-4 py-2 text-xs font-semibold cursor-pointer text-gray-300 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Synchronize Stats Feed
        </button>
      </div>

      <div className="border-b border-[#1e2230] mb-6 overflow-x-auto scrollbar-none">
        <nav className="-mb-px flex space-x-6 whitespace-nowrap min-w-max pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all ${
              activeTab === 'tickets'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Support Tickets
          </button>
        </nav>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admin metrics dashboard */}
      {activeTab === 'overview' && adminStats && (
        <>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-indigo-500 opacity-15">
              <Users className="h-12 w-12" />
            </div>
            <p className="text-xs text-gray-400 font-bold">Total Clients</p>
            <p className="text-2xl font-extrabold text-white mt-1">{adminStats.totalUsers}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Across Free, Pro & Enterprise tiers</p>
          </div>

          <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-amber-500 opacity-15">
              <Layers className="h-12 w-12" />
            </div>
            <p className="text-xs text-gray-400 font-bold">Total Active Forwarders</p>
            <p className="text-2xl font-extrabold text-white mt-1">{adminStats.activeForwarders}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Continuous 24/7 client worker loops</p>
          </div>

          <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-green-500 opacity-15">
              <Terminal className="h-12 w-12" />
            </div>
            <p className="text-xs text-gray-400 font-bold">Accumulated System Logs</p>
            <p className="text-2xl font-extrabold text-[#10b981] mt-1">{adminStats.totalLogs}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Parsed, formatted, or excluded logs</p>
          </div>

          <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-purple-500 opacity-15">
              <DollarSign className="h-12 w-12" />
            </div>
            <p className="text-xs text-gray-400 font-bold">Dorji Net Earnings</p>
            <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 mt-1">
              ${adminStats.totalEarnings.toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Processed successfully via Bhutan networks</p>
          </div>
        </div>

        {/* Main double column administrative dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: User Account Config Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-5 shadow-lg">
            <h3 className="font-bold text-white text-base mb-3 flex items-center gap-1.5">
              <Users className="h-5 w-5 text-indigo-400" />
              User accounts catalog & access panel
            </h3>
            
            <div className="overflow-x-auto pb-1">
              <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1e2230] text-gray-400 font-bold">
                    <th className="pb-3 pt-1">User Email</th>
                    <th className="pb-3 pt-1">Membership Plan</th>
                    <th className="pb-3 pt-1">System Status</th>
                    <th className="pb-3 pt-1">User Role</th>
                    <th className="pb-3 pt-1 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#14161f]">
                  {usersList.map((usr) => {
                    const isEditing = editingUserId === usr.id;
                    const isUserTheAdminSelf = usr.email.toLowerCase() === adminUser.email.toLowerCase();

                    return (
                      <tr key={usr.id} className="hover:bg-[#14161f]/50 transition-colors">
                        <td className="py-3.5 font-medium pr-2 max-w-[170px] truncate">
                          <div className="flex flex-col">
                            <span className="text-white truncate font-semibold" title={usr.email}>{usr.email}</span>
                            <span className="text-[10px] text-gray-500 truncate font-mono">ID: {usr.id}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          {isEditing ? (
                            <select
                              className="bg-[#14161f] border border-[#1e2230] rounded px-1.5 py-0.5 text-xs text-indigo-300 focus:outline-none"
                              value={targetPlan}
                              onChange={(e) => setTargetPlan(e.target.value as any)}
                            >
                              <option value="Free">Free</option>
                              <option value="Monthly">Monthly</option>
                              <option value="Yearly">Yearly</option>
                              <option value="Enterprise">Enterprise</option>
                            </select>
                          ) : (
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              usr.plan === 'Enterprise' 
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25' 
                                : usr.plan === 'Yearly' 
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                  : usr.plan === 'Monthly' 
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/25'
                            }`}>
                              {usr.plan}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5">
                          {isEditing ? (
                            <select
                              className="bg-[#14161f] border border-[#1e2230] rounded px-1.5 py-0.5 text-xs text-yellow-500 focus:outline-none"
                              value={targetStatus}
                              onChange={(e) => setTargetStatus(e.target.value as any)}
                              disabled={isUserTheAdminSelf}
                            >
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              usr.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${usr.status === 'active' ? 'bg-green-400' : 'bg-red-500'}`} />
                              {usr.status.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 font-mono text-[10.5px]">
                          {isEditing ? (
                            <select
                              className="bg-[#14161f] border border-[#1e2230] rounded px-1.5 py-0.5 text-xs text-gray-300 focus:outline-none"
                              value={targetRole}
                              onChange={(e) => setTargetRole(e.target.value as any)}
                              disabled={isUserTheAdminSelf}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className="text-gray-400">{usr.role}</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right font-medium">
                          {isEditing ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleSaveUserConfig(usr.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 rounded p-1 text-white cursor-pointer"
                                title="Commit and Save"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="bg-gray-700 hover:bg-gray-600 rounded p-1 text-gray-300 cursor-pointer"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleEditUserClick(usr)}
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px] cursor-pointer"
                              >
                                <Edit className="h-3 w-3" />
                                Override Config
                              </button>
                              {!isUserTheAdminSelf && (
                                <button
                                  onClick={() => handleDeleteUser(usr.id)}
                                  className="text-red-500 hover:text-red-400 flex items-center cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Dorji gateway API Config Panels */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-5 shadow-lg">
            <h3 className="font-bold text-white text-base mb-2 flex items-center gap-1.5">
              <Key className="h-5 w-5 text-indigo-400" />
              Dorji Pay API parameters
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              Synchronized securely with key constraints matching backend <code className="text-indigo-400 font-mono">pay.dorjigroup.org</code> transactions. 
              <br /><span className="text-green-500 font-bold">NOTE: Integrated gateway is currently ENABLED. Purchases will redirect to secure checkout.</span>
            </p>

            <form onSubmit={handleUpdateSystemSettings} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Dorji API Key</label>
                <input
                  id="admin_dorji_apikey"
                  type="password"
                  required
                  className="w-full rounded bg-[#14161f] border border-[#1e2230] px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              
              <div className="pt-4 border-t border-[#1e2230]">
                <h5 className="font-bold text-xs text-white mb-3">SMTP Mail Configuration</h5>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">SMTP Host</label>
                      <input
                        type="text"
                        placeholder="smtp.gmail.com"
                        className="w-full rounded bg-[#14161f] border border-[#1e2230] px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Port</label>
                      <input
                        type="number"
                        className="w-full rounded bg-[#14161f] border border-[#1e2230] px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">SMTP User</label>
                      <input
                        type="text"
                        className="w-full rounded bg-[#14161f] border border-[#1e2230] px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">SMTP Password</label>
                      <input
                        type="password"
                        className="w-full rounded bg-[#14161f] border border-[#1e2230] px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">From Email Address</label>
                      <input
                        type="text"
                        placeholder="support@dorjigroup.org"
                        className="w-full rounded bg-[#14161f] border border-[#1e2230] px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        value={smtpFrom}
                        onChange={(e) => setSmtpFrom(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-4 space-x-2">
                       <input 
                         type="checkbox" 
                         id="smtp_secure_check"
                         className="rounded bg-[#14161f] border-[#1e2230]"
                         checked={smtpSecure}
                         onChange={(e) => setSmtpSecure(e.target.checked)}
                       />
                       <label htmlFor="smtp_secure_check" className="text-[10px] text-gray-400 font-bold cursor-pointer">Use Secure SSL/TLS (true for 465)</label>
                    </div>
                  </div>
                </div>
              </div>

              {successMsg && (
                <div className="p-2.5 rounded bg-green-500/10 border border-green-500/25 text-green-400 text-[11px]">
                  {successMsg}
                </div>
              )}

              <button
                id="btn_admin_save_payment_keys"
                type="submit"
                className="w-full flex items-center justify-center gap-1 rounded bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-bold text-white shadow font-sans cursor-pointer transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Gateway credentials</span>
              </button>
            </form>
          </div>

          {/* Quick Stats list */}
          <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-5">
            <h4 className="font-bold text-sm mb-3 text-white">Continuous Worker Metrics</h4>
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between border-b border-[#14161f] pb-1.5">
                <span className="text-gray-400">Background Poller</span>
                <span className="text-green-400 bg-green-500/10 px-1.5 border border-green-400/20 rounded">ONLINE</span>
              </div>
              <div className="flex justify-between border-b border-[#14161f] pb-1.5">
                <span className="text-gray-400">Target Queue latency</span>
                <span className="text-white">Instant (&lt; 100ms)</span>
              </div>
              <div className="flex justify-between border-b border-[#14161f] pb-1.5">
                <span className="text-gray-400">24/7 Engine uptime</span>
                <span className="text-white">99.98% SLA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Process threads bound</span>
                <span className="text-indigo-400">Node JS Event-Loop (v22)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      </>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-4 max-w-4xl">
          <h3 className="text-lg font-bold text-white mb-4">Customer Support Tickets</h3>
          {tickets.length === 0 ? (
            <div className="text-center py-10 bg-[#0d0e12] rounded-xl border border-[#1e2230]">
              <p className="text-gray-500 text-xs">No active tickets.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-5">
                  <div className="flex items-start justify-between mb-3 border-b border-[#14161f] pb-3">
                    <div>
                      <h4 className="font-bold text-white">{ticket.subject}</h4>
                      <p className="text-[10px] text-gray-500">Ticket ID: {ticket.id} | User ID: {ticket.userId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${ticket.status === 'open' ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'}`}>
                        {ticket.status}
                      </span>
                      {ticket.status === 'open' && (
                        <button
                          onClick={() => handleCloseTicket(ticket.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded px-2 py-1 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 whitespace-pre-wrap">{ticket.message}</p>
                  
                  {ticket.adminReply ? (
                    <div className="mt-4 bg-[#14161f] p-3 rounded-lg border border-[#1e2230]">
                      <span className="font-bold text-[10px] text-indigo-400 flex items-center gap-1 mb-1"><Check className="h-3.5 w-3.5" /> Sent Reply:</span>
                      <p className="text-xs text-gray-300">{ticket.adminReply}</p>
                    </div>
                  ) : ticket.status === 'open' ? (
                    <div className="mt-4 pt-4 border-t border-[#14161f]">
                      {replyingTicketId === ticket.id ? (
                        <div className="space-y-3">
                          <textarea
                            className="w-full bg-[#14161f] border border-[#1e2230] rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                            rows={3}
                            placeholder="Draft reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => { setReplyingTicketId(null); setReplyContent(''); }}
                              className="px-3 py-1.5 text-[10.5px] rounded border border-[#1e2230] text-gray-400 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReplyTicket(ticket.id)}
                              className="px-3 py-1.5 text-[10.5px] font-bold rounded bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                            >
                              Send Response
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setReplyingTicketId(ticket.id); setReplyContent(''); }}
                          className="text-[10.5px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <Terminal className="h-3.5 w-3.5" />
                          Reply to user
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
