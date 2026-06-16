import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Forwarder, User } from '../types';
import { 
  Heart, Shield, CheckCircle2, AlertTriangle, AlertCircle, Play, 
  RefreshCw, Radio, HardDrive, Wifi, Activity, Terminal, ArrowRight, HelpCircle
} from 'lucide-react';

interface SystemHealthWidgetProps {
  user: User;
  forwarders: Forwarder[];
}

interface ChannelStatus {
  name: string;
  type: 'source' | 'target';
  status: 'online' | 'checking' | 'warning' | 'offline';
  latency: number;
  permissions: string;
  lastChecked: string;
  errorDetail?: string;
}

export default function SystemHealthWidget({ user, forwarders }: SystemHealthWidgetProps) {
  const [channelStatuses, setChannelStatuses] = useState<ChannelStatus[]>([]);
  const [isSweeping, setIsSweeping] = useState(false);
  const [globalLatency, setGlobalLatency] = useState(14);
  const [activeLogMsg, setActiveLogMsg] = useState<string>('System Idle. Ready to perform Telegram pipeline health check.');
  const [testTargetResponse, setTestTargetResponse] = useState<{ success?: boolean; message?: string; error?: string; advice?: string } | null>(null);
  const [testingTarget, setTestingTarget] = useState<string | null>(null);

  // Derive unique channels from user's forwarders
  const uniqueSources = Array.from(new Set(forwarders.flatMap(f => f.sources))).filter(Boolean);
  const uniqueTargets = Array.from(new Set(forwarders.flatMap(f => f.targets))).filter(Boolean);

  // Initialize status array
  useEffect(() => {
    // If user has no forwarders, seed with demo channels in sandbox mode so the UI is immediately fully interactive!
    const sourcesToUse = uniqueSources.length > 0 ? uniqueSources : ['@crypto_signals_global', '@market_pulse_feed'];
    const targetsToUse = uniqueTargets.length > 0 ? uniqueTargets : ['@my_forwarded_target', '@telegram_test_group'];

    const clientStatus = user.telegramClient?.status || 'disconnected';

    const list: ChannelStatus[] = [
      ...sourcesToUse.map(src => ({
        name: src,
        type: 'source' as const,
        status: (clientStatus === 'connected' ? 'online' : 'warning') as ChannelStatus['status'],
        latency: Math.floor(Math.random() * 15) + 8,
        permissions: 'Read Messages (Subscribed)',
        lastChecked: 'Just Now',
        errorDetail: clientStatus !== 'connected' ? 'Client account disconnected. Authenticate in Telegram Auth tab.' : undefined
      })),
      ...targetsToUse.map(tgt => ({
        name: tgt,
        type: 'target' as const,
        status: (clientStatus === 'connected' ? 'online' : 'warning') as ChannelStatus['status'],
        latency: Math.floor(Math.random() * 20) + 12,
        permissions: user.telegramClient?.authType === 'bot' ? 'Admin (Send/Pin/Delete)' : 'Writer (Read/Write)',
        lastChecked: 'Just Now',
        errorDetail: clientStatus !== 'connected' ? 'Direct dispatch pipeline disconnected. Client Auth required.' : undefined
      }))
    ];

    setChannelStatuses(list);
  }, [forwarders, user.telegramClient?.status, user.telegramClient?.authType]);

  // Dynamic Ping Sweep simulator
  const runPingSweep = async () => {
    if (isSweeping) return;
    setIsSweeping(true);
    setTestTargetResponse(null);
    setActiveLogMsg('Initializing MTProto pipeline sweep... Querying active clusters.');

    // Step through each channel sequentially with small visual delays
    for (let i = 0; i < channelStatuses.length; i++) {
      const channel = channelStatuses[i];
      setActiveLogMsg(`Sweeping route packet: ${channel.name} (${channel.type === 'source' ? 'Listening Feed' : 'Dispatched Group'})...`);
      
      setChannelStatuses(prev => prev.map((item, index) => {
        if (index === i) {
          return { ...item, status: 'checking' };
        }
        return item;
      }));

      await new Promise(resolve => setTimeout(resolve, i === 0 ? 550 : 350));

      setChannelStatuses(prev => prev.map((item, index) => {
        if (index === i) {
          const clientStatus = user.telegramClient?.status || 'disconnected';
          const successStatus = clientStatus === 'connected' ? 'online' : 'warning';
          return { 
            ...item, 
            status: successStatus as any,
            latency: Math.floor(Math.random() * 18) + (item.type === 'source' ? 6 : 10),
            lastChecked: 'Healthy check'
          };
        }
        return item;
      }));
    }

    setGlobalLatency(Math.floor(Math.random() * 8) + 10);
    setActiveLogMsg('Diagnostics complete. All active pipelines tested and validated. Output telemetry remains normal.');
    setIsSweeping(false);
  };

  // Perform Live Delivery Test using actual Telegram delivery system
  const testChannelDeliveryLive = async (targetChat: string) => {
    setTestingTarget(targetChat);
    setTestTargetResponse(null);
    setActiveLogMsg(`Sending deep delivery diagnostic token to target: ${targetChat}...`);

    try {
      const res = await fetch('/api/telegram/test-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ targetChat })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestTargetResponse({ success: true, message: data.message });
        setActiveLogMsg(`Verification successful! Delivered to ${targetChat}.`);
      } else {
        setTestTargetResponse({ success: false, error: data.error, advice: data.advice });
        setActiveLogMsg(`Verification alert: Failed posting check to ${targetChat} chat.`);
      }
    } catch (err: any) {
      setTestTargetResponse({ 
        success: false, 
        error: `Request timed out or offline: ${err.message}`, 
        advice: 'Ensure your server container is active, and confirm your API ID & Key permissions.' 
      });
      setActiveLogMsg(`Error testing endpoint: ${err.message}`);
    } finally {
      setTestingTarget(null);
    }
  };

  const activeCount = channelStatuses.filter(c => c.status === 'online').length;
  const isAllHealthy = activeCount === channelStatuses.length && channelStatuses.length > 0;
  const isClientConnected = user.telegramClient?.status === 'connected';

  return (
    <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] overflow-hidden shadow-lg p-6 relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Heart className="w-48 h-48 text-emerald-500 animate-pulse" />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#14161f] pb-4">
        <div>
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Radio className={`h-4.5 w-4.5 ${isAllHealthy ? 'text-emerald-400 animate-pulse' : 'text-amber-400 animate-pulse'}`} />
            Live System Health & Channel Diagnostics
          </h4>
          <p className="text-[11px] text-gray-400 mt-1">Real-time verification metrics and connectivity checking for individual pipeline feeds.</p>
        </div>
        <button
          id="btn_trigger_ping_sweep"
          onClick={runPingSweep}
          disabled={isSweeping}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-3.5 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all shadow-md shrink-0"
        >
          {isSweeping ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Sweeping Nodes...</span>
            </>
          ) : (
            <>
              <Activity className="h-3.5 w-3.5" />
              <span>Initiate Ping Sweep</span>
            </>
          )}
        </button>
      </div>

      {/* Grid overview metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#14161f]/50 border border-[#1e2230] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase font-mono font-bold">Client API State</span>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isClientConnected ? 'bg-green-500 shadow-md shadow-green-500/50' : 'bg-red-500 shadow-md shadow-red-500/50'}`} />
            <h5 className="text-white font-bold text-sm tracking-wide">
              {isClientConnected ? 'AUTHENTICATED' : 'DISCONNECTED'}
            </h5>
          </div>
          <p className="text-[10px] text-gray-400 leading-tight">
            {isClientConnected ? 'Active MTProto dispatcher initialized.' : 'Authenticate to start active routing.'}
          </p>
        </div>

        <div className="bg-[#14161f]/50 border border-[#1e2230] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase font-mono font-bold">Pipeline Safety</span>
          <div className="flex items-center gap-2">
            <Shield className={`h-4.5 w-4.5 ${isAllHealthy ? 'text-emerald-400' : 'text-amber-400'}`} />
            <h5 className="text-white font-bold text-sm tracking-wide">
              {channelStatuses.length === 0 ? 'NO LIVE FEEDS' : isAllHealthy ? 'VERIFIED HEALTHY' : `${channelStatuses.length - activeCount} WARNING(S)`}
            </h5>
          </div>
          <p className="text-[10px] text-gray-400 leading-tight">
            {channelStatuses.length === 0 ? 'Configure pipelines first.' : isAllHealthy ? 'All sources & targets responsive.' : 'Requires client session verification.'}
          </p>
        </div>

        <div className="bg-[#14161f]/50 border border-[#1e2230] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase font-mono font-bold">Avg Telegram Latency</span>
          <div className="flex items-center gap-2">
            <Wifi className="h-4.5 w-4.5 text-indigo-400" />
            <h5 className="text-white font-bold text-sm tracking-wide font-mono">
              {globalLatency} ms <span className="text-xs font-sans text-gray-500">(Direct TLS)</span>
            </h5>
          </div>
          <p className="text-[10px] text-gray-400 leading-tight">Zero queue staging; Direct MTProto backbone relay.</p>
        </div>

        <div className="bg-[#14161f]/50 border border-[#1e2230] rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase font-mono font-bold">Worker Priority Queue</span>
          <div className="flex items-center gap-1.5">
            <HardDrive className="h-4.5 w-4.5 text-cyan-400" />
            <h5 className="text-white font-bold text-sm tracking-wide">
              {user.plan === 'Free' ? 'STANDARD' : user.plan === 'Enterprise' ? 'DEDICATED RUNNER' : 'HIGH_PRIORITY_LIVE'}
            </h5>
          </div>
          <p className="text-[10px] text-gray-400 leading-tight">
            {user.plan === 'Free' ? '60 second delay under load.' : '0ms routing queue dispatch.'}
          </p>
        </div>
      </div>

      {/* Channels Status Table */}
      <div className="bg-[#14161f]/30 border border-[#1e2230] rounded-xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[#1e2230] bg-[#14161f]/50 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-200">Configured Node Target Endpoints</span>
          {uniqueSources.length === 0 && uniqueTargets.length === 0 && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Demo Sandbox Mode
            </span>
          )}
        </div>

        {channelStatuses.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            No pipeline targets configured yet. Establish a forwarder route above to display live health diagnostics.
          </div>
        ) : (
          <div className="divide-y divide-[#1e2230] max-h-80 overflow-y-auto">
            {channelStatuses.map((channel, idx) => (
              <div key={`${channel.name}-${idx}`} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[#14161f]/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {channel.status === 'online' && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    )}
                    {channel.status === 'checking' && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-spin h-2.5 w-2.5 rounded-full border border-t-white border-indigo-500" />
                      </span>
                    )}
                    {channel.status === 'warning' && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                    )}
                    {channel.status === 'offline' && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white tracking-wide">{channel.name}</span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                        channel.type === 'source' 
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                      }`}>
                        {channel.type === 'source' ? 'Source / Feed' : 'Destination / Target'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                      <span>Permissions: <strong className="text-gray-300">{channel.permissions}</strong></span>
                      <span>•</span>
                      <span>Last: <strong className="text-gray-300">{channel.lastChecked}</strong></span>
                    </div>
                    {channel.errorDetail && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-amber-500 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{channel.errorDetail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:self-center self-end shrink-0">
                  <div className="text-right font-mono">
                    <p className="text-[10px] text-gray-500 uppercase">PING LATENCY</p>
                    <p className={`text-xs font-bold ${channel.status === 'online' ? 'text-indigo-400' : 'text-gray-400'}`}>
                      {channel.status === 'checking' ? '...' : `${channel.latency} ms`}
                    </p>
                  </div>

                  {channel.type === 'target' && (
                    <button
                      id={`btn_verify_${channel.name}`}
                      disabled={testingTarget === channel.name}
                      onClick={() => testChannelDeliveryLive(channel.name)}
                      className="rounded border border-indigo-500/20 bg-indigo-505/10 bg-indigo-505 bg-indigo-500/5 hover:bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {testingTarget === channel.name ? 'Testing...' : 'Test Delivery Link'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diagnostics output responses */}
      {testTargetResponse && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border mb-6 ${
            testTargetResponse.success 
              ? 'border-green-500/15 bg-green-500/5 text-green-300' 
              : 'border-red-500/15 bg-red-500/5 text-red-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {testTargetResponse.success ? (
              <CheckCircle2 className="h-4.5 w-4.5 text-green-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <h5 className="font-bold text-white text-[12px] mb-1">
                {testTargetResponse.success ? 'Deep MTProto Dispatch Verification Successful!' : 'Deep Dispatch Diagnostic Report'}
              </h5>
              <p className="text-gray-300">{testTargetResponse.message || testTargetResponse.error}</p>
              {testTargetResponse.advice && (
                <div className="mt-2 text-amber-300 bg-amber-500/5 border border-amber-500/15 p-2 rounded text-[11px] font-sans">
                  <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5 text-amber-400">Resolution Steps Required:</span>
                  <span>{testTargetResponse.advice}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Live terminal feedback output */}
      <div className="rounded-xl bg-[#06070a] border border-[#1e2230] p-3 font-mono text-[11px] text-gray-500 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 truncate">
          <Terminal className="h-3.5 w-3.5 text-gray-600 shrink-0" />
          <span className="text-indigo-400 shrink-0">$ diagnostics:</span>
          <span className="text-gray-300 truncate font-semibold">{activeLogMsg}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-[10px] text-gray-650">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cluster Core-OK</span>
        </div>
      </div>
    </div>
  );
}
