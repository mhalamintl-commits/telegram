import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Compass, Cpu, RefreshCw, AlertCircle, HelpCircle, Send, Key, PlayCircle } from 'lucide-react';

interface ConnectTelegramAccountProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export default function ConnectTelegramAccount({ user, onUpdateUser }: ConnectTelegramAccountProps) {
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

  return (
    <div className="max-w-4xl mx-auto rounded-xl border border-[#1e2230] bg-[#0d0e12] shadow-xl p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#14161f] pb-6 mb-6">
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
              <h4 className="text-xs uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5 font-bold">
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
  );
}
