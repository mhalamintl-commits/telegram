import React, { useState, useEffect } from 'react';
import { 
  Compass, Cpu, Layers, Server, ShieldCheck, RefreshCw, Send, Trash2, 
  Settings, LogOut, Check, Sliders, PlayCircle, Eye, AlertCircle, 
  Plus, Edit, HelpCircle, ArrowRight, Zap, CheckCircle, CreditCard, 
  Terminal, Code2, AlertTriangle, MessageSquare, Download, Key
} from 'lucide-react';
import { User, Forwarder, ForwardingLog, SUBSCRIPTION_PLANS, SubscriptionPlan } from '../types';
import CheckoutModal from './CheckoutModal';

interface UserDashboardProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export default function UserDashboard({ user, onUpdateUser, onLogout }: UserDashboardProps) {
  const [forwarders, setForwarders] = useState<Forwarder[]>([]);
  const [logs, setLogs] = useState<ForwardingLog[]>([]);
  
  // New/Edit forwarder states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingForwarder, setEditingForwarder] = useState<Forwarder | null>(null);
  
  // Forwarder form states
  const [fwdName, setFwdName] = useState('');
  const [fwdSources, setFwdSources] = useState(''); // Comma separated
  const [fwdTargets, setFwdTargets] = useState(''); // Comma separated
  const [fwdIncludes, setFwdIncludes] = useState(''); // Comma separated
  const [fwdExcludes, setFwdExcludes] = useState(''); // Comma separated
  const [fwdReplace, setFwdReplace] = useState<{ find: string; replace: string }[]>([]);
  const [fwdMediaOnly, setFwdMediaOnly] = useState(false);
  const [fwdTextOnly, setFwdTextOnly] = useState(false);
  
  // Enterprise fields states
  const [fwdHeaderTemplate, setFwdHeaderTemplate] = useState('');
  const [fwdFooterTemplate, setFwdFooterTemplate] = useState('');
  const [fwdWebhookUrl, setFwdWebhookUrl] = useState('');
  
  // Auth client states
  const [tgAuthType, setTgAuthType] = useState<'user' | 'bot'>((user.telegramClient as any)?.authType || 'bot');
  const [botToken, setBotToken] = useState((user.telegramClient as any)?.botToken || '');
  const [apiId, setApiId] = useState(user.telegramClient?.apiId || '');
  const [apiHash, setApiHash] = useState(user.telegramClient?.apiHash || '');
  const [phoneNumber, setPhoneNumber] = useState(user.telegramClient?.phoneNumber || '');
  const [twoFactorPassword, setTwoFactorPassword] = useState(user.telegramClient?.twoFactorPassword || '');
  const [savingClient, setSavingClient] = useState(false);
  const [tgMsg, setTgMsg] = useState<{ type: 'success' | 'info' | 'error', text: string } | null>(null);

  // SMS/Login Code simulation states
  const [tgConnStep, setTgConnStep] = useState<'idle' | 'requesting' | 'awaiting_code' | 'verifying'>('idle');
  const [activationCode, setActivationCode] = useState('');
  const [tgPhoneCodeHash, setTgPhoneCodeHash] = useState('');
  const [tgTempSessionString, setTgTempSessionString] = useState('');
  const [generatedMockOtp, setGeneratedMockOtp] = useState('');

  // Live Dry-Run Delivery Diagnostician States
  const [diagChat, setDiagChat] = useState('');
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagMsg, setDiagMsg] = useState<{ type: 'success' | 'error', text: string; advice?: string } | null>(null);

  // Keep credential states in sync when user prop updates dynamically
  useEffect(() => {
    if (user?.telegramClient) {
      setTgAuthType((user.telegramClient as any).authType || 'bot');
      setBotToken((user.telegramClient as any).botToken || '');
      setApiId(user.telegramClient.apiId || '');
      setApiHash(user.telegramClient.apiHash || '');
      setPhoneNumber(user.telegramClient.phoneNumber || '');
      setTwoFactorPassword(user.telegramClient.twoFactorPassword || '');
    } else {
      setBotToken('');
      setApiId('');
      setApiHash('');
      setPhoneNumber('');
      setTwoFactorPassword('');
    }
  }, [user]);

  // Simulation playground states
  const [selectedFwdId, setSelectedFwdId] = useState('');
  const [simSource, setSimSource] = useState('');
  const [simText, setSimText] = useState('');
  const [simIsMedia, setSimIsMedia] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  // Billing states
  const [planLoading, setPlanLoading] = useState<string | null>(null);
  const [pendingInvoice, setPendingInvoice] = useState<any | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'forwarders' | 'telegram' | 'simulation' | 'billing' | 'tickets'>('forwarders');

  // Support Tickets states
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);

  // Load user data on startup
  useEffect(() => {
    fetchForwarders();
    fetchLogs();
    
    // Auto-refresh stats and logs every 10 seconds to make the real-time simulation feel truly non-stop 24/7!
    const interval = setInterval(() => {
      fetchForwarders();
      fetchLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, [user.id]);

  // Set default simulator source and text based on user's active forwarder if available
  useEffect(() => {
    if (forwarders.length > 0 && !selectedFwdId) {
      const active = forwarders.find(f => f.isActive) || forwarders[0];
      setSelectedFwdId(active.id);
      if (active.sources.length > 0) setSimSource(active.sources[0]);
      setSimText("💥 Hot signal! Buy and hold on this beautiful breakout movement. Report scam alert!");
    }
  }, [forwarders]);

  const fetchForwarders = async () => {
    try {
      const res = await fetch('/api/forwarders', {
        headers: { 'x-user-id': user.id }
      });
      const data = await res.json();
      if (res.ok) {
        setForwarders(data.forwarders);
      }
    } catch (e) {
      console.error('Error fetching forwarders:', e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs', {
        headers: { 'x-user-id': user.id }
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets', {
        headers: { 'x-user-id': user.id }
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error('Error fetching tickets:', e);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'tickets') {
      fetchTickets();
    }
  }, [activeSubTab]);

  const handleSaveTelegramClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setTgMsg(null);

    if (tgAuthType === 'bot') {
      if (!botToken) {
        setTgMsg({ type: 'error', text: 'Please enter a valid Telegram Bot Token from @BotFather.' });
        return;
      }
    } else {
      if (!apiId || !apiHash || !phoneNumber) {
        setTgMsg({ type: 'error', text: 'API ID, API Hash and Phone Number are required.' });
        return;
      }

      // If in idle state, trigger real code generation
      if (tgConnStep === 'idle') {
        setTgConnStep('requesting');
        setSavingClient(true);
        setTgMsg({ type: 'info', text: 'Connecting to Telegram MTProto session gateways... Sending authorization request...' });
        
        try {
          const res = await fetch('/api/telegram/send-code', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-id': user.id
            },
            body: JSON.stringify({ apiId, apiHash, phoneNumber })
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Failed to request code');
          }

          setTgPhoneCodeHash(data.phoneCodeHash || '');
          setTgTempSessionString(data.tempSessionString || '');
          setTgConnStep('awaiting_code');
          setSavingClient(false);
          setTgMsg({ 
            type: 'success', 
            text: data.message || `✨ Verification Code Dispatched! A secure activation code has been routed to your official Telegram App or SMS.` 
          });
        } catch (err: any) {
          setTgMsg({ type: 'error', text: err.message || 'Failed to request activation code.' });
          setTgConnStep('idle');
          setSavingClient(false);
        }
        return;
      }

      // If awaiting code state
      if (tgConnStep === 'awaiting_code') {
        if (!activationCode) {
          setTgMsg({ type: 'error', text: 'Please enter the 5-digit Login verification code.' });
          return;
        }
        setTgConnStep('verifying');
      }
    }

    setSavingClient(true);
    try {
      const res = await fetch('/api/telegram/save-client', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ 
          authType: tgAuthType, 
          botToken, 
          apiId, 
          apiHash, 
          phoneNumber, 
          twoFactorPassword,
          phoneCode: activationCode,
          phoneCodeHash: tgPhoneCodeHash,
          tempSessionString: tgTempSessionString
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save account');
      }

      setTgMsg({ type: 'success', text: data.message || 'Telegram credentials authenticated & initialized successfully!' });
      setTgConnStep('idle');
      setActivationCode('');
      setTgPhoneCodeHash('');
      setTgTempSessionString('');
      setGeneratedMockOtp('');
      
      // Fetch user profile status immediately
      const profileRes = await fetch('/api/auth/me', {
        headers: { 'x-user-id': user.id }
      });
      const profileData = await profileRes.json();
      if (profileRes.ok) {
        onUpdateUser(profileData.user);
      }

    } catch (err: any) {
      setTgMsg({ type: 'error', text: err.message || 'Verification failed.' });
      if (tgAuthType === 'user') {
        setTgConnStep('awaiting_code');
      }
    } finally {
      setSavingClient(false);
    }
  };

  const handleDisconnectTelegramClient = async () => {
    if (!window.confirm("Are you sure you want to disconnect and clear your Telegram credentials?")) {
      return;
    }
    setSavingClient(true);
    setTgMsg(null);
    try {
      const res = await fetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to disconnect');
      }
      setTgMsg({ type: 'success', text: 'Telegram client credentials cleared successfully.' });
      setBotToken('');
      setApiId('');
      setApiHash('');
      setPhoneNumber('');
      setTwoFactorPassword('');
      
      const profileRes = await fetch('/api/auth/me', {
        headers: { 'x-user-id': user.id }
      });
      const profileData = await profileRes.json();
      if (profileRes.ok) {
        onUpdateUser(profileData.user);
      }
    } catch (err: any) {
      setTgMsg({ type: 'error', text: err.message || 'Disconnect failed.' });
    } finally {
      setSavingClient(false);
    }
  };

  const runDeliveryDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagChat.trim()) return;
    setDiagLoading(true);
    setDiagMsg(null);
    try {
      const res = await fetch('/api/telegram/test-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ targetChat: diagChat })
      });
      const data = await res.json();
      if (res.ok) {
        setDiagMsg({
          type: 'success',
          text: data.message || 'Diagnostic trigger delivered! Check your channel/group for the verification tag.'
        });
      } else {
        setDiagMsg({
          type: 'error',
          text: data.error || 'Diagnostic write unsuccessful.',
          advice: data.advice
        });
      }
    } catch (err: any) {
      setDiagMsg({
        type: 'error',
        text: err.message || 'Failure executing connection handshake.'
      });
    } finally {
      setDiagLoading(false);
    }
  };

  // Open modal for new forwarder setup
  const openNewForwarderModal = () => {
    setEditingForwarder(null);
    setFwdName('');
    setFwdSources('@source_channel_a, @alpha_calls_hub');
    setFwdTargets('@my_news_feed');
    setFwdIncludes('');
    setFwdExcludes('scam, spam, referral');
    setFwdReplace([
      { find: 'project', replace: 'PRJ' },
      { find: 'company', replace: 'CO' }
    ]);
    setFwdMediaOnly(false);
    setFwdTextOnly(false);
    setFwdHeaderTemplate('');
    setFwdFooterTemplate('');
    setFwdWebhookUrl('');
    setShowConfigModal(true);
  };

  // Open modal for editing existing forwarder
  const openEditForwarderModal = (fwd: Forwarder) => {
    setEditingForwarder(fwd);
    setFwdName(fwd.name);
    setFwdSources(fwd.sources.join(', '));
    setFwdTargets(fwd.targets.join(', '));
    setFwdIncludes(fwd.includeWords.join(', '));
    setFwdExcludes(fwd.excludeWords.join(', '));
    setFwdReplace(fwd.replaceRules);
    setFwdMediaOnly(fwd.mediaOnly);
    setFwdTextOnly(fwd.textOnly);
    setFwdHeaderTemplate(fwd.headerTemplate || '');
    setFwdFooterTemplate(fwd.footerTemplate || '');
    setFwdWebhookUrl(fwd.webhookUrl || '');
    setShowConfigModal(true);
  };

  // Save Configured Forwarder Task
  const handleSaveForwarder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fwdName.trim()) return;

    const sourcesArr = fwdSources.split(/[\s,;\n\r]+/).map(s => s.trim()).filter(Boolean);
    const targetsArr = fwdTargets.split(/[\s,;\n\r]+/).map(s => s.trim()).filter(Boolean);
    const includesArr = fwdIncludes.split(/[\n\r,;]+/).map(s => s.trim()).filter(Boolean);
    const excludesArr = fwdExcludes.split(/[\n\r,;]+/).map(s => s.trim()).filter(Boolean);

    const payload = {
      name: fwdName,
      sources: sourcesArr,
      targets: targetsArr,
      includeWords: includesArr,
      excludeWords: excludesArr,
      replaceRules: fwdReplace.filter(r => r.find.trim()),
      mediaOnly: fwdMediaOnly,
      textOnly: fwdTextOnly,
      headerTemplate: fwdHeaderTemplate,
      footerTemplate: fwdFooterTemplate,
      webhookUrl: fwdWebhookUrl,
      isActive: editingForwarder ? editingForwarder.isActive : true
    };

    try {
      const method = editingForwarder ? 'PUT' : 'POST';
      const endpoint = editingForwarder ? `/api/forwarders/${editingForwarder.id}` : '/api/forwarders';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error processing changes');
      }

      setShowConfigModal(false);
      fetchForwarders();
      fetchLogs();
    } catch (e: any) {
      alert(e.message || 'Failed to complete changes.');
    }
  };

  // Full administrative CSV log export capability for Pro/Enterprise levels
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("No routing logs are available to export.");
      return;
    }
    const headers = ["Log ID", "Pipeline ID", "Pipeline Name", "Source Chat", "Target Chat", "Original Text", "Processed Text", "Status", "Reason", "Timestamp"];
    const rows = logs.map(l => [
      l.id,
      l.forwarderId,
      l.forwarderName,
      l.sourceChat,
      l.targetChat,
      `"${(l.originalText || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(l.processedText || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      l.status,
      l.reason ? `"${l.reason.replace(/"/g, '""').replace(/\n/g, ' ')}"` : "",
      l.timestamp
    ]);
    
    const csvString = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.className = "hidden";
    link.setAttribute("href", url);
    link.setAttribute("download", `teleflow_routing_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleForwarderActive = async (fwd: Forwarder) => {
    try {
      const res = await fetch(`/api/forwarders/${fwd.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ isActive: !fwd.isActive })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to toggle pipeline.');
      }
      fetchForwarders();
    } catch (err: any) {
      alert(err.message || 'Action rejected');
    }
  };

  const handleDeleteForwarder = async (id: string) => {
    if (!confirm('Are you sure you want to remove this forwarding pipeline task?')) return;
    try {
      const res = await fetch(`/api/forwarders/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      });
      if (res.ok) {
        fetchForwarders();
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run real-time forward simulation immediately on the active pipeline
  const runSimulatorTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFwdId || !simSource || !simText) return;

    setSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch(`/api/forwarders/${selectedFwdId}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          sourceChat: simSource,
          messageText: simText,
          isMedia: simIsMedia
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSimResult(data);
        fetchForwarders();
        fetchLogs();
      } else {
        throw new Error(data.error || 'Simulation thread failed');
      }
    } catch (e: any) {
      alert(e.message || 'Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  // Trigger Dorji Payments invoice creation or upgraded subscription plans
  const handleUpgradePlan = async (plan: SubscriptionPlan) => {
    if (plan.id === 'Free') return;

    setPlanLoading(plan.id);
    try {
      const res = await fetch('/api/billing/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ planId: plan.id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not instantiate invoice session.');
      }

      if (data.skipGateway) {
        alert('Payment Gateway is disabled. Account automatically upgraded locally.');
        onUpdateUser(data.user);
        return;
      }

      if (data.invoice) {
        setPendingInvoice(data.invoice);
      } else if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert('Account upgraded automatically.');
      }
    } catch (e: any) {
      alert(e.message || 'Payment initiation error.');
    } finally {
      setPlanLoading(null);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setTicketLoading(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ subject: ticketSubject, message: ticketMessage })
      });

      if (!res.ok) throw new Error('Failed to create ticket');
      
      setTicketSubject('');
      setTicketMessage('');
      fetchTickets();
    } catch (e: any) {
      alert(e.message || 'Error occurred');
    } finally {
      setTicketLoading(false);
    }
  };

  const addReplaceRule = () => {
    setFwdReplace([...fwdReplace, { id: 'rep-' + Date.now() + Math.random().toString(36).substring(2, 5), find: '', replace: '' }]);
  };

  const removeReplaceRule = (ruleId: string) => {
    setFwdReplace(fwdReplace.filter(r => r.id !== ruleId));
  };

  const updateReplaceRule = (ruleId: string, field: 'find' | 'replace', value: string) => {
    setFwdReplace(fwdReplace.map(r => r.id === ruleId ? { ...r, [field]: value } : r));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Upper Status Grid banner */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Connection status card */}
        <div className="relative overflow-hidden rounded-xl border border-[#1e2230] bg-[#0d0e12] p-4 text-white shadow-md">
          <div className="absolute top-0 right-0 p-3 text-indigo-500 opacity-20">
            <Server className="h-10 w-10" />
          </div>
          <p className="text-xs text-gray-400 font-medium">
            {user.telegramClient?.authType === 'bot' ? 'Real Telegram Bot' : 'Telegram User API'}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold">
              {user.telegramClient?.status === 'connected' ? 'Authenticated' : user.telegramClient?.status === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
            <span className={`inline-block h-3 w-3 rounded-full ${
              user.telegramClient?.status === 'connected' ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : user.telegramClient?.status === 'connecting' ? 'bg-yellow-500 animate-bounce' : 'bg-red-500 shadow-md shadow-red-500/30'
            }`} />
          </div>
          <p className="mt-1 text-[10px] text-gray-500 truncate">
            {user.telegramClient?.authType === 'bot' 
              ? (user.telegramClient?.botUsername ? `@${user.telegramClient.botUsername}` : 'Bot Token Active')
              : (user.telegramClient?.phoneNumber ? `Account: ${user.telegramClient.phoneNumber}` : 'No auth credential configured.')
            }
          </p>
        </div>

        {/* Subscription level card */}
        <div className="relative overflow-hidden rounded-xl border border-[#1e2230] bg-[#0d0e12] p-4 text-white shadow-md">
          <div className="absolute top-0 right-0 p-3 text-emerald-500 opacity-20">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <p className="text-xs text-gray-400 font-medium">Subscription Status</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              {user.plan} Active
            </span>
          </div>
          <button 
            id="billing_tab_shortcut"
            onClick={() => setActiveSubTab('billing')}
            className="mt-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium cursor-pointer"
          >
            {user.plan === 'Free' ? 'Unlock unlimited (Save 30%) →' : 'View account invoices & receipts →'}
          </button>
        </div>

        {/* Total forwarders card */}
        <div className="relative overflow-hidden rounded-xl border border-[#1e2230] bg-[#0d0e12] p-4 text-white shadow-md">
          <div className="absolute top-0 right-0 p-3 text-cyan-500 opacity-20">
            <Layers className="h-10 w-10" />
          </div>
          <p className="text-xs text-gray-400 font-medium">Active Pipelines</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{forwarders.filter(f => f.isActive).length}</span>
            <span className="text-xs text-gray-400">/ {forwarders.length} configured</span>
          </div>
          <p className="mt-1 text-[10px] text-gray-500">
            {user.plan === 'Free' ? 'Free active limit: 1 forwarder max.' : 'Pro license: Unlimited tasks.'}
          </p>
        </div>

        {/* Dynamic overall log processing card */}
        <div className="relative overflow-hidden rounded-xl border border-[#1e2230] bg-[#0d0e12] p-4 text-white shadow-md">
          <div className="absolute top-0 right-0 p-3 text-amber-500 opacity-20">
            <Cpu className="h-10 w-10" />
          </div>
          <p className="text-xs text-gray-400 font-medium">Forwarded Messages</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {forwarders.reduce((sum, f) => sum + (f.totalForwarded || 0), 0)}
            </span>
            <span className="text-xs text-green-400 flex items-center bg-green-500/10 px-1 border border-green-500/20 rounded font-mono">
              24/7 LIVE
            </span>
          </div>
          <p className="mt-1 text-[10px] text-gray-500 truncate">
            {user.plan === 'Free' ? 'Daily cap: 50 maximum.' : 'Premium status: Untapped throughput.'}
          </p>
        </div>
      </div>

      {/* Main Layout Tabs */}
      <div className="border-b border-[#1e2230] mb-6 overflow-x-auto scrollbar-none">
        <nav className="-mb-px flex space-x-6 whitespace-nowrap min-w-max pb-1">
          <button
            id="btn_tab_forwarders"
            onClick={() => setActiveSubTab('forwarders')}
            className={`cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all ${
              activeSubTab === 'forwarders'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              Post Forwarders List
            </span>
          </button>
          <button
            id="btn_tab_telegram_auth"
            onClick={() => setActiveSubTab('telegram')}
            className={`cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all ${
              activeSubTab === 'telegram'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Send className="h-4 w-4" />
              Telegram Auth Client
            </span>
          </button>
          <button
            id="btn_tab_simulation"
            onClick={() => setActiveSubTab('simulation')}
            className={`cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all ${
              activeSubTab === 'simulation'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <PlayCircle className="h-4 w-4" />
              24/7 Simulator Tester
            </span>
          </button>
          <button
            id="btn_tab_subs"
            onClick={() => setActiveSubTab('billing')}
            className={`cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all ${
              activeSubTab === 'billing'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              Subscription & Payments
            </span>
          </button>
          <button
            id="btn_tab_tickets"
            onClick={() => setActiveSubTab('tickets')}
            className={`cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all ${
              activeSubTab === 'tickets'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Support Tickets
            </span>
          </button>
        </nav>
      </div>

      {/* Subtab Render Areas */}

      {/* A. POST FORWARDERS TAB */}
      {activeSubTab === 'forwarders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Active Forwarding Channels</h3>
              <p className="text-xs text-gray-400">Manage your autonomous channeling routes, find and replace schemas, and blacklists.</p>
            </div>
            <button
              id="btn_add_forwarder_modal"
              onClick={openNewForwarderModal}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              Configure Forwarder Task
            </button>
          </div>

          {/* DEDICATED FORWARDING CONTAINER STATUS */}
          {['Yearly', 'Enterprise'].includes(user.plan) ? (
            <div className="p-4 rounded-xl border border-teal-500/15 bg-gradient-to-br from-teal-950/10 via-[#0d0e12] to-indigo-950/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 py-1.5 px-3 bg-gradient-to-r from-teal-500 to-emerald-400 text-black text-[9px] font-extrabold uppercase rounded-bl tracking-wider">
                Isolated Runner Cluster
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] uppercase font-bold text-teal-400 font-mono tracking-wider">
                      teleflow-worker-isolated-{user.id.slice(-6)}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">|</span>
                    <span className="text-[10px] text-indigo-400 font-mono font-semibold">Node ID: Node-CL-192a</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">Dedicated Forwarding Container Instance Live</h4>
                  <p className="text-xs text-gray-400">
                    Your pipelines run inside a private multi-CPU Linux sandboxed microserver (Zero queue latency, isolated secure credential environment & direct webhooks dispatch).
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#07080a] p-3 rounded-lg border border-[#1e2230] text-xs font-mono shrink-0">
                  <div>
                    <p className="text-gray-500 text-[9px] uppercase font-semibold">CPU LOAD</p>
                    <p className="font-bold text-white text-[11px]">4.8% ~ 11.2%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[9px] uppercase font-semibold">RAM ALLOC</p>
                    <p className="font-bold text-white text-[11px]">142 MB / 1 GB</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[9px] uppercase font-semibold">SLA UPTIME</p>
                    <p className="font-bold text-emerald-400 text-[11px]">99.998% (Live)</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[9px] uppercase font-semibold">PING LATENCY</p>
                    <p className="font-bold text-teal-400 text-[11px]">18ms (Guaranteed)</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-indigo-500/10 bg-[#0c0d12] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-indigo-400" />
                  <h4 className="font-bold text-white text-xs">Want your own Dedicated Forwarding Container Instance?</h4>
                </div>
                <p className="text-[11px] text-gray-400">
                  Upgrade to <strong className="text-white">Enterprise Scale</strong> to provision an isolated microserver container with 99.99% guaranteed uptime SLA, custom webhooks outcomes, white-label headers, and unlimited pipelines.
                </p>
              </div>
              <button
                id="btn_promo_upgrade_enterprise"
                onClick={() => setActiveSubTab('billing')}
                className="py-1 px-3 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-bold cursor-pointer transition-colors shrink-0"
              >
                Learn More & Upgrade →
              </button>
            </div>
          )}

          {forwarders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#1e2230] p-12 text-center text-gray-400">
              <Layers className="mx-auto h-12 w-12 mb-3 text-gray-600" />
              <p className="font-semibold text-sm text-gray-300">No Forwarding Pipelines Configured</p>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">Configure your first forwarder to map multi-channel feeds instantly to desired target telegram groups.</p>
              <button 
                id="btn_add_first_fwd"
                onClick={openNewForwarderModal}
                className="mt-4 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Create your first pipeline now <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left 2 Columns: Lists of pipelines */}
              <div className="lg:col-span-2 space-y-4">
                {forwarders.map((fwd, idx) => (
                  <div key={`${fwd.id}_${idx}`} className="rounded-xl border border-[#1e2230] bg-[#0d0e12] overflow-hidden shadow-lg transition-transform hover:translate-y-[-2px]">
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base">{fwd.name}</h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                              fwd.isActive 
                                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                                : 'bg-gray-500/10 border-gray-500/20 text-gray-500'
                            }`}>
                              {fwd.isActive ? 'Active 24/7' : 'Paused'}
                            </span>
                          </div>
                          
                          {/* Route indicators */}
                          <div className="mt-3 flex items-center flex-wrap gap-2 text-xs font-mono">
                            <div className="rounded bg-[#14161f] px-2 py-1 border border-[#1e2230] text-gray-300">
                              Sources: {fwd.sources.join(', ')}
                            </div>
                            <ArrowRight className="h-4.5 w-4.5 text-gray-500" />
                            <div className="rounded bg-indigo-505 bg-indigo-500/10 px-2 py-1 border border-indigo-500/20 text-indigo-400 font-bold">
                              Targets: {fwd.targets.join(', ')}
                            </div>
                          </div>
                        </div>

                        {/* Toggle active / Pause actions */}
                        <div className="flex items-center gap-2">
                          <button
                            id={`toggle_active_${fwd.id}`}
                            onClick={() => toggleForwarderActive(fwd)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold border cursor-pointer transition-all ${
                              fwd.isActive 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' 
                                : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-500'
                            }`}
                          >
                            {fwd.isActive ? 'Pause' : 'Activate Router'}
                          </button>
                        </div>
                      </div>

                      {/* Rule Summaries badges */}
                      <div className="mt-4 border-t border-[#14161f] pt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-gray-400">
                        <div>
                          <span className="font-semibold text-gray-300">Text Replacements ({fwd.replaceRules.length}):</span>
                          {fwd.replaceRules.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                              {fwd.replaceRules.slice(0, 3).map((r, idx) => (
                                <span key={`rep_${idx}`} className="rounded bg-[#14161f] px-1.5 py-0.5 text-[10px] text-gray-300 border border-[#1e2230]">
                                  {r.find}→{r.replace}
                                </span>
                              ))}
                              {fwd.replaceRules.length > 3 && <span>+{fwd.replaceRules.length - 3} more</span>}
                            </div>
                          ) : (
                            <p className="text-gray-500 mt-0.5">None configured.</p>
                          )}
                        </div>

                        <div>
                          <span className="font-semibold text-gray-300">Blacklisted Words ({fwd.excludeWords.length}):</span>
                          {fwd.excludeWords.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {fwd.excludeWords.slice(0, 3).map((w, idx) => (
                                <span key={`excl_${idx}`} className="rounded bg-red-950/20 border border-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">
                                  {w}
                                </span>
                              ))}
                              {fwd.excludeWords.length > 3 && <span>+{fwd.excludeWords.length - 3} more</span>}
                            </div>
                          ) : (
                            <p className="text-gray-500 mt-0.5">Filter Bypass (All allowed)</p>
                          )}
                        </div>

                        <div>
                          <span className="font-semibold text-gray-300">Filtering Flags:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {fwd.mediaOnly && <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[10.5px] text-blue-400">Media-ONLY</span>}
                            {fwd.textOnly && <span className="rounded bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 text-[10.5px] text-teal-400">Text-ONLY</span>}
                            {!fwd.mediaOnly && !fwd.textOnly && <span className="rounded bg-gray-500/10 border border-gray-500/20 px-1.5 py-0.5 text-[10.5px] text-gray-500">All Content types</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom bar of the item */}
                    <div className="bg-[#090b0e] border-t border-[#1e2230] px-5 py-2.5 flex items-center justify-between text-xs text-gray-500">
                      <span>Total Forwarded posts count: <strong className="text-gray-300">{fwd.totalForwarded || 0}</strong></span>
                      <div className="flex items-center gap-3">
                        <button
                          id={`btn_edit_fwd_${fwd.id}`}
                          onClick={() => openEditForwarderModal(fwd)}
                          className="text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="h-3 w-3" />
                          Edit Settings
                        </button>
                        <button
                          id={`btn_delete_fwd_${fwd.id}`}
                          onClick={() => handleDeleteForwarder(fwd.id)}
                          className="text-red-500 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Columns: Telemetry stream of forwarding log */}
              <div className="space-y-4">
                <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-5 shadow-lg flex flex-col h-[520px]">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <div>
                      <h4 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                        <Terminal className="h-4.5 w-4.5 text-emerald-500" />
                        Live Routing logs
                      </h4>
                      <p className="text-[11px] text-gray-400">Active telemetry and forwarding results stream.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        id="btn_export_csv_logs"
                        onClick={handleExportCSV}
                        className="py-1 px-2.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[10.5px] cursor-pointer flex items-center gap-1 font-semibold transition-colors animate-pulse"
                        title="Export Logs to CSV"
                      >
                        <Download className="h-3 w-3 text-indigo-400" />
                        Export CSV
                      </button>
                      <button
                        id="btn_reload_logs"
                        onClick={() => { fetchLogs(); fetchForwarders(); }}
                        className="p-1 rounded bg-[#14161f] hover:bg-[#1a1c24] text-gray-400 cursor-pointer"
                        title="Reload feed"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Logs box */}
                  <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10.5px] pr-1 scrollbar">
                    {logs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center py-10">
                        <Code2 className="h-8 w-8 mb-2 opacity-50" />
                        <p>No transactions log yet.</p>
                        <p className="text-[9px] mt-0.5">Toggle a pipeline test simulation to populate rules results.</p>
                      </div>
                    ) : (
                      logs.map((log, logIdx) => (
                        <div key={`${log.id}_${logIdx}`} className={`p-2.5 rounded border ${
                          log.status === 'success' 
                            ? 'bg-green-500/5 border-green-500/10 text-green-300' 
                            : log.status === 'filtered' 
                              ? 'bg-yellow-500/5 border-yellow-500/10 text-yellow-300' 
                              : 'bg-red-500/5 border-red-500/10 text-red-300'
                        }`}>
                          <div className="flex items-center justify-between mb-1 text-[9px] text-gray-400">
                            <span className="font-sans font-semibold text-gray-300">{log.forwarderName}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 font-bold mb-1">
                            <span className="text-gray-400">{log.sourceChat}</span>
                            <span>➔</span>
                            <span className="text-indigo-400">{log.targetChat}</span>
                          </div>

                          <div className="space-y-1">
                            <p className="line-clamp-2 text-gray-400"><span className="text-gray-500">Src:</span> {log.originalText}</p>
                            {log.status === 'success' && (
                              <p className="line-clamp-2 font-bold text-white"><span className="text-gray-500 font-normal">Dst:</span> {log.processedText}</p>
                            )}
                            {log.status === 'filtered' && (
                              <p className="font-semibold text-amber-400/90 italic"><span className="text-gray-500 font-normal">Skip:</span> {log.reason}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* B. TELEGRAM CLIENT AUTHENTICATION TAB */}
      {activeSubTab === 'telegram' && (
        <div className="max-w-3xl mx-auto rounded-xl border border-[#1e2230] bg-[#0d0e12] overflow-hidden shadow-lg p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#14161f] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Telegram Delivery Authentication</h3>
                <p className="text-xs text-gray-400">Link your accounts safely to authorize real-time message collection and target publishing channels.</p>
              </div>
            </div>

            {/* Selector Segment */}
            <div className="flex rounded-lg bg-[#14161f] p-1 border border-[#1e2230] self-start sm:self-auto">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  tgAuthType === 'bot' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setTgAuthType('bot')}
              >
                Telegram Bot (Live)
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  tgAuthType === 'user' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setTgAuthType('user')}
              >
                Simulated User API
              </button>
            </div>
          </div>

          {/* Active Connection state header if already connected */}
          {user.telegramClient?.status === 'connected' ? (
            <>
              <div className="mb-6 p-4 rounded-xl border border-green-500/15 bg-gradient-to-r from-green-950/20 to-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">
                      DEEP CONNECTION ONLINE (24/7 ACTIVE)
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    {user.telegramClient?.authType === 'bot' 
                      ? `Real Telegram Bot Active: @${user.telegramClient?.botUsername || 'VerifiedSandboxBot'}`
                      : `Simulated User API Active: ${user.telegramClient?.phoneNumber || 'Configured account'}`
                    }
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xl">
                    TeleFlow is securely connected to the MTProto server cluster. Matching content will be fetched and forwarded through your pipeline rules automatically without latency.
                  </p>
                </div>
                <button
                  id="btn_disconnect_telegram_auth"
                  type="button"
                  onClick={handleDisconnectTelegramClient}
                  className="py-1.5 px-3.5 rounded-lg bg-red-400/10 hover:bg-red-400/25 text-red-400 border border-red-500/20 text-xs font-bold cursor-pointer transition-colors shrink-0"
                >
                  Disconnect & Clear Credentials
                </button>
              </div>

              {/* Dynamic Connection Diagnostic Report Card */}
              <div className="mb-6 p-5 rounded-xl border border-indigo-500/15 bg-[#141824]/60">
                {/* Connection Metrics & Endpoint Diagnostics */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5 font-bold">
                    <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                    Delivery Connection Diagnostics
                  </h4>
                  <div className="text-xs space-y-2 text-gray-300">
                    <div className="flex justify-between py-1 border-b border-[#1c2132]/60 font-mono text-[11px]">
                      <span className="text-gray-500">API Gateway Handshake:</span>
                      <span className="text-emerald-400 font-bold">MUTUALLY SECURED (200 OK)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c2132]/60 font-mono text-[11px]">
                      <span className="text-gray-500">Entity Platform ID:</span>
                      <span>{user.telegramClient?.botId || '917849102'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c2132]/60 font-mono text-[11px]">
                      <span className="text-gray-500">Authentication Mode:</span>
                      <span className="text-indigo-300 capitalize">{user.telegramClient?.authType === 'bot' ? 'Real Telegram Bot API' : 'Simulated User API'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c2132]/60 font-mono text-[11px]">
                      <span className="text-gray-500">Can Join Groups:</span>
                      <span className="text-indigo-300">Allowed (True)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c2132]/60 font-mono text-[11px]">
                      <span className="text-gray-500">Live Delivery Handshake:</span>
                      <span className="text-indigo-300">Stream Enabled (24/7 Active)</span>
                    </div>
                    {user.telegramClient?.verifiedAt && (
                      <div className="flex justify-between py-1 font-mono text-[10px] text-gray-500">
                        <span>Authentication Created At:</span>
                        <span>{new Date(user.telegramClient.verifiedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : user.telegramClient?.status === 'connecting' ? (
            <div className="mb-6 p-4 rounded-xl border border-yellow-500/15 bg-yellow-950/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-yellow-400 animate-spin shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-xs">Authenticating and retrieving session keys...</h4>
                  <p className="text-[10px] text-gray-400 font-mono">Verifying secure keys against global MTProto servers.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl border border-indigo-500/10 bg-[#161a25]/30 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="font-bold text-white text-xs">Awaiting delivery authentication</h4>
                <p className="text-[10px] text-gray-400">Provide credentials below to hook into the real-time routing engine.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Guide column */}
            <div className="space-y-3 text-xs text-gray-300 bg-[#14161f] p-4 rounded-lg border border-[#1e2230] h-fit">
              {tgAuthType === 'bot' ? (
                <>
                  <span className="font-bold text-white block mb-1 flex items-center gap-1">
                    <HelpCircle className="h-4 w-4 text-violet-400" />
                    Connecting via Bot Token
                  </span>
                  <ol className="list-decimal pl-4 space-y-1.5 text-gray-400 leading-relaxed">
                    <li>Start a chat with <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-bold">@BotFather</a> inside the Telegram app.</li>
                    <li>Send the command <code className="text-violet-300 font-bold bg-black/40 px-1 py-0.5 rounded">/newbot</code> and customize its handle names.</li>
                    <li>Paste your generated HTTP API **Bot Token** in the credential form.</li>
                    <li><strong>Crucial Step:</strong> Add your bot as an **Administrator** inside your source channels OR groups, and target destination chats, allowing it "Post Messages" rights.</li>
                  </ol>
                </>
              ) : (
                <>
                  <span className="font-bold text-white block mb-1 flex items-center gap-1">
                    <HelpCircle className="h-4 w-4 text-violet-400" />
                    How to acquire API credentials?
                  </span>
                  <ol className="list-decimal pl-4 space-y-1.5 text-gray-400 leading-relaxed">
                    <li>Log in to your Telegram portal at <a href="https://my.telegram.org" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-bold">my.telegram.org</a>.</li>
                    <li>Submit credentials, click <strong>API development tools</strong>.</li>
                    <li>Fill the form to retrieve your custom <strong>App api_id</strong> and <strong>api_hash</strong>.</li>
                    <li>Enter the values on this dashboard along with your international mobile network phone.</li>
                  </ol>
                </>
              )}
              <p className="text-[10px] text-gray-500 mt-2 italic">
                Note: TeleFlow stores keys using standard high-grade Node vault hashes. They are never sold or leaked.
              </p>
            </div>

            {/* Config Form Column */}
            <form onSubmit={handleSaveTelegramClient} className="space-y-4">
              {tgAuthType === 'bot' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Telegram Bot Token <span className="text-red-400">*</span></label>
                  <input
                    id="tg_bot_token"
                    type="text"
                    required
                    placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none font-mono"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 font-sans">Get this instantly from @BotFather on Telegram.</p>
                </div>
              ) : tgConnStep === 'awaiting_code' || tgConnStep === 'verifying' ? (
                <div className="space-y-4 bg-indigo-950/20 border border-indigo-500/15 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <Key className="h-4 w-4 animate-pulse shrink-0" />
                    <span>Enter Telegram Activation Code</span>
                  </div>
                  
                  <p className="text-[11px] text-gray-300 leading-normal font-sans">
                    A secure authentication code has been sent directly to your official Telegram app. Please check your Telegram chat list and enter the code below to sign in.
                  </p>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-indigo-300">5-Digit Telegram Code <span className="text-red-400">*</span></label>
                    </div>
                    <input
                      id="tg_activation_code"
                      type="text"
                      maxLength={5}
                      required
                      placeholder="e.g. 12345"
                      className="w-full text-center tracking-widest rounded-lg border border-indigo-500/20 bg-black/30 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none font-mono font-bold"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-indigo-300 mb-1">Two-Factor Auth Password (If enabled)</label>
                    <input
                      id="tg_pwd_2fa_verification"
                      type="password"
                      placeholder="Only if your account has 2FA active"
                      className="w-full rounded-lg border border-indigo-500/20 bg-black/30 px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                      value={twoFactorPassword}
                      onChange={(e) => setTwoFactorPassword(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      If your Telegram account uses a 2-Step Verification password, please enter it above.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTgConnStep('idle');
                        setTgMsg(null);
                        setActivationCode('');
                      }}
                      className="w-1/3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] rounded-lg py-2 font-medium cursor-pointer transition-colors"
                    >
                      Change Phone
                    </button>
                    <button
                      id="btn_verify_code"
                      type="submit"
                      disabled={savingClient}
                      className="w-2/3 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] rounded-lg py-2 font-bold cursor-pointer flex justify-center items-center gap-1 transition-colors"
                    >
                      {savingClient ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Confirm & Link'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="mb-1">
                      <label className="block text-xs font-semibold text-gray-300">Telegram App api_id <span className="text-red-400">*</span></label>
                    </div>
                    <input
                      id="tg_api_id"
                      type="text"
                      required
                      placeholder="e.g. 2345678"
                      className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                      value={apiId}
                      onChange={(e) => setApiId(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Telegram App api_hash <span className="text-red-400">*</span></label>
                    <input
                      id="tg_api_hash"
                      type="text"
                      required
                      placeholder="e.g. d7a9b09bc872f09ba..."
                      className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                      value={apiHash}
                      onChange={(e) => setApiHash(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number (International format) <span className="text-red-400">*</span></label>
                    <input
                      id="tg_phone"
                      type="text"
                      required
                      placeholder="e.g. +97517700123"
                      className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="text-[10px] text-amber-400 mt-1 font-sans">
                      ⚠️ Note: Telegram delivers login authorization codes directly to your active <strong>Telegram Messenger App</strong> on your phone/computer, NOT via SMS.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Two-Factor Auth Password (If enabled)</label>
                    <input
                      id="tg_pwd_2fa"
                      type="password"
                      placeholder="Only if your account has 2FA active"
                      className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                      value={twoFactorPassword}
                      onChange={(e) => setTwoFactorPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {tgMsg && (
                <div className={`p-3 rounded-lg text-xs leading-tight ${
                  tgMsg.type === 'success' 
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                    : tgMsg.type === 'error' 
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                      : 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
                }`}>
                  {tgMsg.text}
                </div>
              )}

              {tgConnStep !== 'awaiting_code' && tgConnStep !== 'verifying' && (
                <button
                  id="btn_tg_auth_submit"
                  type="submit"
                  disabled={savingClient}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-semibold text-white shadow-md cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {savingClient ? (
                    <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Authorize & Link TG Session</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* C. 24/7 INTERACTIVE FORWARDING SIMULATION TAB */}
      {activeSubTab === 'simulation' && (
        <div className="max-w-3xl mx-auto rounded-xl border border-[#1e2230] bg-[#0d0e12] shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-3 border-b border-[#14161f] pb-4 mb-6">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <PlayCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Live 24/7 Routing flow simulator</h3>
              <p className="text-xs text-gray-400">Test how active pipelines filter, find & replace, blacklist, and forward messages in real-time under precise conditions.</p>
            </div>
          </div>

          {forwarders.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs">
              Configure at least 1 pipeline under the Post Forwarders tab to test rules execution.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Simulator Input Trigger */}
              <form onSubmit={runSimulatorTest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">1. Choose Pipeline rules to evaluate</label>
                  <select
                    id="sim_fwd_id"
                    className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] px-3 py-2 text-xs text-gray-300 focus:border-indigo-500 focus:outline-none"
                    value={selectedFwdId}
                    onChange={(e) => {
                      setSelectedFwdId(e.target.value);
                      const f = forwarders.find(f => f.id === e.target.value);
                      if (f && f.sources.length > 0) setSimSource(f.sources[0]);
                    }}
                  >
                    {forwarders.map((f, idx) => (
                      <option key={`${f.id}_${idx}`} value={f.id}>{f.name} ({f.isActive ? 'Active' : 'Offline'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">2. Simulated Source Chat Username</label>
                  <input
                    id="sim_source_chat"
                    type="text"
                    required
                    placeholder="e.g. @market_updates"
                    className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none font-mono"
                    value={simSource}
                    onChange={(e) => setSimSource(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Must match one of the pipeline's defined sources to evaluate.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">3. Simulated Post Message text content</label>
                  <textarea
                    id="sim_msg_content"
                    required
                    rows={4}
                    placeholder="Enter message text with tokens to trigger replace rules..."
                    className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="sim_is_media"
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#1e2230] bg-[#14161f] text-indigo-600 focus:ring-indigo-500"
                    checked={simIsMedia}
                    onChange={(e) => setSimIsMedia(e.target.checked)}
                  />
                  <label htmlFor="sim_is_media" className="text-xs text-gray-300 font-medium select-none">
                    Contain Media attachment (e.g., photo, link card, video)
                  </label>
                </div>

                <button
                  id="btn_trigger_simulation"
                  type="submit"
                  disabled={simulating}
                  className="w-full flex items-center justify-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-500 py-2.5 text-xs font-semibold text-white cursor-pointer shadow-lg shadow-amber-600/10 transition-colors disabled:opacity-50"
                >
                  {simulating ? (
                    <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Route Simulated Message</span>
                    </>
                  )}
                </button>
              </form>

              {/* Simulation Result Terminal */}
              <div className="flex flex-col h-full justify-between">
                <div>
                  <span className="block text-xs font-bold text-gray-300 mb-1">Routing Evaluator Console</span>
                  <div className="rounded-lg bg-[#06070a] border border-[#1e2230] p-4 font-mono text-[11px] leading-relaxed min-h-[220px] overflow-y-auto text-gray-300">
                    {!simResult ? (
                      <div className="h-full flex items-center justify-center text-gray-600 italic py-16 text-center">
                        <div>
                          <Terminal className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p>Awaiting simulated trigger input...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[#14161f] pb-2">
                          <span className="font-bold text-gray-400">STATUS LOG:</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9.5px] ${
                            simResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {simResult.log.status}
                          </span>
                        </div>

                        <div>
                          <p className="text-gray-500">// Evaluated Source Chat</p>
                          <p className="text-white">{simResult.log.sourceChat}</p>
                        </div>

                        <div>
                          <p className="text-gray-500">// Original Message Intake</p>
                          <p className="text-[#a5b4fc] break-words">{simResult.log.originalText}</p>
                        </div>

                        {simResult.success ? (
                          <div>
                            <p className="text-green-500">// Parsed Out for Forwarding</p>
                            <p className="text-green-300 bg-green-500/5 p-2 rounded border border-green-500/10 break-words font-semibold">
                              {simResult.log.processedText}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">✓ Sent instantly with MTProto forwarder payload.</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-amber-500">// Reject / Filter Reason</p>
                            <p className="text-amber-400 bg-amber-500/5 p-2 rounded border border-amber-500/10 font-bold">
                              {simResult.log.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-[11px] text-indigo-300">
                  <div className="flex gap-2">
                    <Zap className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Evaluation runs identical code filters as the background 24/7 worker engine instance.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* D. SUBSCRIPTIONS & DORJI PAYMENTS TAB */}
      {activeSubTab === 'billing' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-white">Subscription options & billing</h3>
            <p className="text-xs text-gray-400">Unlock instant real-time forwarding channels, custom replace regex rules, and standalone server instances backed by Dorji payment gateway.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {SUBSCRIPTION_PLANS.map((plan, planIdx) => {
              const isActivePlan = user.plan === plan.id;
              return (
                <div 
                  key={`${plan.id}_${planIdx}`}
                  className={`rounded-xl border bg-[#0d0e12] overflow-hidden shadow-xl flex flex-col justify-between transition-all ${
                    isActivePlan 
                      ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-indigo-500/10' 
                      : 'border-[#1e2230] hover:border-gray-700'
                  }`}
                >
                  <div className="p-5 flex-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 font-sans">
                      {plan.id === 'Free' ? 'BASE LEVEL' : 'PREMIUM BENEFIT'}
                    </span>
                    <h4 className="text-xl font-bold text-white mt-1">{plan.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 lines-clamp-2 min-h-[32px]">{plan.description}</p>
                    
                    <div className="my-4 flex items-baseline text-white">
                      <span className="text-3xl font-extrabold tracking-tight">${plan.price}</span>
                      <span className="ml-1 text-xs text-gray-400">/{plan.period === 'forever' ? 'forever' : plan.period}</span>
                    </div>

                    <ul className="space-y-2 border-t border-[#14161f] pt-4 text-[11px] text-gray-300">
                      {plan.features.map((feat, idx) => (
                        <li key={`feat_${idx}`} className="flex items-start gap-1.5">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 bg-[#090b0e] border-t border-[#1e2230] shrink-0">
                    {isActivePlan ? (
                      <span className="flex w-full items-center justify-center gap-1 rounded bg-indigo-500/10 border border-indigo-500/20 py-1.5 text-xs font-semibold text-indigo-400">
                        <CheckCircle className="h-4.5 w-4.5" />
                        Active Subscription
                      </span>
                    ) : plan.id === 'Free' ? (
                      <span className="flex w-full items-center justify-center gap-1 rounded bg-[#14161f] text-gray-500 py-1.5 text-xs font-semibold italic">
                        Legacy Starter
                      </span>
                    ) : (
                      <button
                        id={`btn_upgrade_plan_${plan.id}`}
                        onClick={() => handleUpgradePlan(plan)}
                        disabled={planLoading !== null}
                        className="w-full rounded bg-indigo-600 hover:bg-indigo-500 py-1.5 text-xs font-semibold text-white cursor-pointer transition-colors"
                      >
                        {planLoading === plan.id ? 'Connecting Gateway...' : `Upgrade to ${plan.id}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#14161f] p-5 rounded-lg border border-[#1e2230] text-xs text-gray-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-3">
              <ShieldCheck className="h-8 w-8 text-indigo-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Bhutan Regional Gateway Integrated</p>
                <p className="text-gray-400 text-[11px] mt-0.5">Payments are processed securely via 256-bit encrypted payload handshakes with pay.dorjigroup.org (Section-3 specifications).</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-[10px]">API Server Status: Live</span>
            </div>
          </div>
        </div>
      )}


      {/* E. SUPPORT TICKETS TAB */}
      {activeSubTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#14161f] pb-4">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Support Tickets</h3>
              <p className="text-xs text-gray-400">Open a ticket if you need assistance with your TeleFlow account or pipelines.</p>
            </div>
          </div>

          {/* Developer Support Option Details */}
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 to-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold bg-gradient-to-r from-yellow-500 to-amber-500 text-[#07080a] px-2 py-0.5 rounded">
                  {['Yearly', 'Enterprise'].includes(user.plan) ? 'Premium Exclusive Active' : 'Premium Developer Support Included'}
                </span>
                <h4 className="font-bold text-white text-sm">Direct Discord & Telegram Developer Live Chat Support</h4>
              </div>
              <p className="text-xs text-gray-400 max-w-2xl">
                Skip the generic ticketing queue! Our core backend developers are standing by on Discord and Telegram to build custom Replace rules regex for you, configure complex source pipelines, and handle uptime queries.
              </p>
            </div>
            {['Yearly', 'Enterprise'].includes(user.plan) ? (
              <div className="flex flex-wrap gap-2 shrink-0">
                <a
                  href="https://discord.gg/teleflow-dev-vip"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Discord Dev VIP Channel
                </a>
                <a
                  href="https://t.me/teleflow_enterprise_support_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-[#229ED9] hover:bg-[#1D82B5] text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  Telegram Premium Chat
                </a>
              </div>
            ) : (
              <div className="text-[11px] shrink-0 bg-[#161a25] border border-[#1e2230] p-2.5 rounded-lg text-gray-400 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Available instantly on <strong>Pro Yearly</strong> & <strong>Enterprise Scale</strong></span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border border-[#1e2230] bg-[#0d0e12] rounded-xl p-5 h-fit shadow-md">
              <h4 className="font-bold text-white text-sm mb-3">Create New Ticket</h4>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief description of your issue"
                    className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about your issue..."
                    className="w-full rounded-lg border border-[#1e2230] bg-[#14161f] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none resize-none"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={ticketLoading}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white cursor-pointer shadow-md disabled:opacity-50 transition-colors"
                >
                  {ticketLoading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h4 className="font-bold text-white text-sm">Your Tickets</h4>
              {tickets.length === 0 ? (
                <div className="text-center py-10 bg-[#0d0e12] rounded-xl border border-[#1e2230] shadow-md">
                  <p className="text-gray-500 text-xs">You have no open or closed tickets.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className={`rounded-xl border p-4 ${ticket.status === 'open' ? 'border-indigo-500/30 bg-[#12141a]' : 'border-[#1e2230] bg-[#0d0e12]'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-white text-sm">{ticket.subject}</h5>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${ticket.status === 'open' ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3 whitespace-pre-wrap">{ticket.message}</p>
                      
                      {ticket.adminReply && (
                        <div className="mt-3 bg-[#181a24] p-3 rounded-lg border border-[#2a2d3b]">
                          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-indigo-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Admin Support Reply:
                          </div>
                          <p className="text-xs text-gray-200 whitespace-pre-wrap">{ticket.adminReply}</p>
                        </div>
                      )}
                      <div className="mt-3 text-[9px] text-gray-600 flex justify-between">
                        <span>Ticket ID: {ticket.id}</span>
                        <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAY MODAL */}
      {pendingInvoice && (
        <CheckoutModal
          invoiceId={pendingInvoice.id}
          amount={pendingInvoice.amount}
          planId={pendingInvoice.planId}
          paymentUrl={pendingInvoice.paymentUrl || ''}
          onClose={() => setPendingInvoice(null)}
          onSuccess={() => {
            setPendingInvoice(null);
            alert('Payment Successful! Your account has been upgraded.');
            // Force a reload to fetch new user state
            window.location.reload();
          }}
        />
      )}

      {/* CONFIGURATION DRAWER / MODAL DIALOG */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black opacity-75 backdrop-blur-sm" onClick={() => setShowConfigModal(false)} />
          
          <div className="relative w-full max-w-2xl rounded-xl border border-[#1e2230] bg-[#0d0e12] p-5 md:p-6 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="border-b border-[#14161f] pb-3 mb-4 flex items-center justify-between">
              <h4 className="text-base font-bold text-white">
                {editingForwarder ? `Edit pipeline: ${editingForwarder.name}` : 'Configure New Forwarder Pipeline'}
              </h4>
              <button 
                id="close_pipeline_modal"
                onClick={() => setShowConfigModal(false)} 
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForwarder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Pipeline Name <span className="text-red-400">*</span></label>
                  <input
                    id="fwd_form_name"
                    type="text"
                    required
                    placeholder="e.g. My Important alerts"
                    className="w-full rounded bg-[#14161f] border border-[#1e2230] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                    value={fwdName}
                    onChange={(e) => setFwdName(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">A friendly internal label representing the filter rules and target channels.</p>
                </div>

                <div className="flex items-end gap-4 p-2 bg-[#14161f]/50 rounded border border-[#1e2230]/50">
                  <div className="flex items-center gap-1.5">
                    <input
                      id="fwd_form_media"
                      type="checkbox"
                      className="h-4 w-4 rounded bg-[#14161f] border-[#1e2230] text-indigo-600"
                      checked={fwdMediaOnly}
                      onChange={(e) => {
                        setFwdMediaOnly(e.target.checked);
                        if (e.target.checked) setFwdTextOnly(false);
                      }}
                    />
                    <label htmlFor="fwd_form_media" className="text-xs text-gray-350 select-none">Media only</label>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <input
                      id="fwd_form_text"
                      type="checkbox"
                      className="h-4 w-4 rounded bg-[#14161f] border-[#1e2230] text-indigo-600"
                      checked={fwdTextOnly}
                      onChange={(e) => {
                        setFwdTextOnly(e.target.checked);
                        if (e.target.checked) setFwdMediaOnly(false);
                      }}
                    />
                    <label htmlFor="fwd_form_text" className="text-xs text-gray-350 select-none">Text only</label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Source Chat Usernames / IDs <span className="text-red-400">*</span></label>
                  <input
                    id="fwd_form_sources"
                    type="text"
                    required
                    placeholder="@channel_one, -10023425"
                    className="w-full rounded bg-[#14161f] border border-[#1e2230] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none font-mono"
                    value={fwdSources}
                    onChange={(e) => setFwdSources(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Comma-separated channels/groups the bot will look up and forward from.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Target Channel Usernames / IDs <span className="text-red-400">*</span></label>
                  <input
                    id="fwd_form_targets"
                    type="text"
                    required
                    placeholder="@my_channel_output, -10058281"
                    className="w-full rounded bg-[#14161f] border border-[#1e2230] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none font-mono"
                    value={fwdTargets}
                    onChange={(e) => setFwdTargets(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Comma-separated list of chats where filtered, post-replaced messages gets forwarded to.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Excluded Blacklist Words</label>
                  <input
                    id="fwd_form_excludes"
                    type="text"
                    placeholder="scam, spam, referral, discount"
                    className="w-full rounded bg-[#14161f] border border-[#1e2230] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                    value={fwdExcludes}
                    onChange={(e) => setFwdExcludes(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Entire post is dropped if any matching keyword is found (comma-separated).</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Whitelisted Required Keywords</label>
                  <input
                    id="fwd_form_includes"
                    type="text"
                    placeholder="alert, signal, buy, rocket"
                    className="w-full rounded bg-[#14161f] border border-[#1e2230] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                    value={fwdIncludes}
                    onChange={(e) => setFwdIncludes(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Leave empty to allow all posts, or specify words where at least one must exist.</p>
                </div>
              </div>

              {/* Text Replace rule stack */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-300">Advanced Find and Replace Word conversions</label>
                  <button
                    id="btn_add_find_replace_rule"
                    type="button"
                    onClick={addReplaceRule}
                    className="text-[10.5px] cursor-pointer text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    + Add conversion rule
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto bg-[#07080a] p-3 rounded-lg border border-[#1e2230]">
                  {fwdReplace.length === 0 ? (
                    <p className="text-[10px] text-gray-600 text-center italic py-2">No word replacements defined (Original words are forwarded directly).</p>
                  ) : (
                    fwdReplace.map((rule, idx) => (
                      <div key={`${rule.id}_${idx}`} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Find word (e.g. project)"
                          required
                          className="flex-1 rounded bg-[#14161f] border border-[#1e2230] px-2 py-1 text-xs text-white"
                          value={rule.find}
                          onChange={(e) => updateReplaceRule(rule.id, 'find', e.target.value)}
                        />
                        <ArrowRight className="h-4 w-4 text-gray-500 shrink-0" />
                        <input
                          type="text"
                          placeholder="Replace with (e.g. PRJ)"
                          className="flex-1 rounded bg-[#14161f] border border-[#1e2230] px-2 py-1 text-xs text-white"
                          value={rule.replace}
                          onChange={(e) => updateReplaceRule(rule.id, 'replace', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeReplaceRule(rule.id)}
                          className="text-red-500 hover:text-red-400 text-xs px-1 cursor-pointer font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ENTERPRISE SCALE FEATURES */}
              <div className="border-t border-[#1e2230]/50 pt-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 text-[#07080a] px-1.5 py-0.5 rounded">
                    Enterprise Level
                  </span>
                  <p className="text-xs font-bold text-gray-200">Custom Headers & Webhooks</p>
                </div>

                <div className="space-y-3 p-3.5 rounded-lg bg-[#07080a] border border-indigo-500/15">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        White-Label Prepend Header Customization
                      </label>
                      <input
                        id="fwd_header_template"
                        type="text"
                        placeholder="e.g. 📢 [TELEFLOW REPORT] \n"
                        className="w-full rounded bg-[#14161f] border border-[#1e2230] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                        value={fwdHeaderTemplate}
                        onChange={(e) => setFwdHeaderTemplate(e.target.value)}
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Prepended text prefix. Supports custom \n newline breaks.</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        White-Label Append Footer Customization
                      </label>
                      <input
                        id="fwd_footer_template"
                        type="text"
                        placeholder="e.g. \n\n⚡ Forwarded via Teleflow Enterprise"
                        className="w-full rounded bg-[#14161f] border border-[#1e2230] px-3 py-1.5 text-xs text-white placeholder-gray-650 focus:outline-none"
                        value={fwdFooterTemplate}
                        onChange={(e) => setFwdFooterTemplate(e.target.value)}
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Appended text signature postfix.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                      Custom webhook API URL for forwarding outcomes
                    </label>
                    <input
                      id="fwd_webhook_url"
                      type="url"
                      placeholder="https://endpoints.company.io/hooks/teleflow"
                      className="w-full rounded bg-[#14161f] border border-[#1e2230] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none font-mono"
                      value={fwdWebhookUrl}
                      onChange={(e) => setFwdWebhookUrl(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Receives HTTP POST JSON update on each matching processed message.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#14161f] pt-4 flex gap-3 justify-end text-xs">
                <button
                  id="btn_pipeline_modal_cancel"
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="rounded px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  id="btn_pipeline_modal_submit"
                  type="submit"
                  className="rounded bg-indigo-600 hover:bg-indigo-500 px-5 py-2 font-bold text-white shadow"
                >
                  Save Forwarder Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
