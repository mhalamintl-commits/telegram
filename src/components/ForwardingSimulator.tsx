import React, { useState, useRef, useEffect } from 'react';
import { ForwardingRule, SimulatedMessage, ForwardingLog, User } from '../types';
import { SIMULATED_STREAM_MESSAGES } from './SimulatedData';
import { Send, Terminal, AlertTriangle, CheckCircle, Eye, RefreshCw, FileText, HelpCircle, Image, Film, FileCode } from 'lucide-react';

interface ForwardingSimulatorProps {
  rules: ForwardingRule[];
  currentUser: User;
  logs: ForwardingLog[];
  onAddLog: (log: ForwardingLog) => void;
}

export default function ForwardingSimulator({
  rules,
  currentUser,
  logs,
  onAddLog
}: ForwardingSimulatorProps) {
  const activeUserRules = rules.filter(r => r.userId === currentUser.id);

  // States for compiling simulated custom message
  const [selectedSource, setSelectedSource] = useState('@telecom_insider');
  const [msgText, setMsgText] = useState('Breaking: operator wins major local cellular spectrum for standard 5G operations.');
  const [msgMedia, setMsgMedia] = useState<'text' | 'photo' | 'video' | 'document' | 'animation'>('photo');
  const [customFileName, setCustomFileName] = useState('spectrum_deal.pdf');
  
  // Custom media links
  const mediaPresets: Record<string, string> = {
    photo: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80",
    video: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80",
    animation: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
  };

  // Log buffer states
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Initialize daemon engine loop...",
    "Pyrogram Client established successfully with E.164 authentication.",
    "Synchronized with panel configuration: 2 active rules loaded.",
    "Listening live to Telegram channels: @telecom_insider, @telecom_deals, @broadband_news_global...",
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside terminal console
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const addTerminalLine = (line: string) => {
    const stamp = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, `[${stamp}] ${line}`]);
  };

  const handleApplyPreset = (preset: SimulatedMessage) => {
    setSelectedSource(preset.sourceChannel);
    setMsgText(preset.text);
    setMsgMedia(preset.mediaType);
    if (preset.fileName) {
      setCustomFileName(preset.fileName);
    }
  };

  const executeSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    addTerminalLine(`Captured packet on source: ${selectedSource}`);
    
    // Check active rules that list this source
    const applicableRules = activeUserRules.filter(rule => {
      // rule must be enabled
      if (!rule.isEnabled) return false;
      // rule must monitor this source (case-insensitive)
      return rule.sources.some(src => {
        const cleanSrc = src.startsWith('@') ? src.toLowerCase() : `@${src.toLowerCase()}`;
        return cleanSrc === selectedSource.toLowerCase() || src.toLowerCase() === selectedSource.toLowerCase();
      });
    });

    if (applicableRules.length === 0) {
      addTerminalLine(`[SKIP] No enabled forwarding rules are listening to source "${selectedSource}". Skipping packet.`);
      return;
    }

    applicableRules.forEach(rule => {
      addTerminalLine(`[TRIGGER] Input message matches active rule "${rule.name}"`);

      // 1. Check Media Type Filters
      const isMediaAllowed = rule.mediaFilters[msgMedia];
      if (!isMediaAllowed) {
        const logId = "log_" + Date.now() + Math.random().toString(36).substr(2, 5);
        const actionText = `Skipped: Media type '${msgMedia}' disabled in criteria configuration hooks.`;
        
        addTerminalLine(`[FILTERED] ${actionText}`);
        onAddLog({
          id: logId,
          ruleName: rule.name,
          source: selectedSource,
          destination: rule.destinations[0],
          messageType: msgMedia,
          originalText: msgText,
          status: 'filtered_media',
          actionTaken: actionText,
          timestamp: new Date().toISOString().replace('T', ' ').split('.')[0]
        });
        return;
      }

      // 2. Keyword check includes
      if (rule.keywordIncludes.length > 0) {
        const hasIncludesMatch = rule.keywordIncludes.some(kw => 
          msgText.toLowerCase().includes(kw.toLowerCase())
        );

        if (!hasIncludesMatch) {
          const logId = "log_" + Date.now();
          const actionText = `Skipped: Message does not contain any of required keywords: ${rule.keywordIncludes.join(', ')}`;
          
          addTerminalLine(`[FILTERED] ${actionText}`);
          onAddLog({
            id: logId,
            ruleName: rule.name,
            source: selectedSource,
            destination: rule.destinations[0],
            messageType: msgMedia,
            originalText: msgText,
            status: 'filtered_keyword',
            actionTaken: actionText,
            timestamp: new Date().toISOString().replace('T', ' ').split('.')[0]
          });
          return;
        }
      }

      // 3. Keyword check excludes
      if (rule.keywordExcludes.length > 0) {
        const matchedExclude = rule.keywordExcludes.find(kw => 
          msgText.toLowerCase().includes(kw.toLowerCase())
        );

        if (matchedExclude) {
          const logId = "log_" + Date.now();
          const actionText = `Skipped: Excluded spam word matched: "${matchedExclude}"`;
          
          addTerminalLine(`[FILTERED] Exclude filter active on keyword "${matchedExclude}". Cancelling forward loop.`);
          onAddLog({
            id: logId,
            ruleName: rule.name,
            source: selectedSource,
            destination: rule.destinations[0],
            messageType: msgMedia,
            originalText: msgText,
            status: 'filtered_keyword',
            actionTaken: actionText,
            timestamp: new Date().toISOString().replace('T', ' ').split('.')[0]
          });
          return;
        }
      }

      // 4. Success forward mapping
      rule.destinations.forEach(dest => {
        const logId = "log_ok_" + Date.now() + Math.random().toString(36).substr(2, 5);
        const copyModelText = rule.forwardAsCopy 
          ? "Forwarded as Copy (Original Tag Cleared)" 
          : "Standard Forward Completed (Preserves Author Metadata)";

        addTerminalLine(`[SUCCESS] Router matched successfully. Routing packet to destination: ${dest}`);
        addTerminalLine(`[API_CALL] API: ${rule.forwardAsCopy ? 'copy_message()' : 'forward_message()'} dispatched to Telegram.`);
        
        onAddLog({
          id: logId,
          ruleName: rule.name,
          source: selectedSource,
          destination: dest,
          messageType: msgMedia,
          originalText: msgText,
          status: 'success',
          actionTaken: copyModelText,
          timestamp: new Date().toISOString().replace('T', ' ').split('.')[0]
        });
      });
    });
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Sender Input Panels */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/70 backdrop-blur-md border border-slate-100 p-6 rounded-2xl shadow-xs">
            <h3 className="font-sans font-semibold text-slate-800 text-sm mb-1.5 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-500" />
              Simulated Message Sender
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              Choose a simulated source channel and compose custom text matching your rule filters. Trigger the forwarding router to observe live results on the destination layout mockups.
            </p>

            {/* Quick Presets */}
            <div className="mb-4">
              <span className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase font-sans">Quick Sender Presets</span>
              <div className="flex flex-wrap gap-2">
                {SIMULATED_STREAM_MESSAGES.map((msg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(msg)}
                    className="p-1 px-2.5 bg-slate-50 border border-slate-100/50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[10px] font-mono text-slate-500 text-left transition-colors cursor-pointer"
                  >
                    {msg.sourceChannel} ({msg.mediaType})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={executeSimulation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">CHOOSE EMITTER CHANNEL</label>
                  <select
                    value={selectedSource}
                    onChange={e => setSelectedSource(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden"
                  >
                    <option value="@telecom_insider">@telecom_insider (Inside feed)</option>
                    <option value="@telecom_deals">@telecom_deals (Deal announcements)</option>
                    <option value="@broadband_news_global">@broadband_news_global (Macro-news)</option>
                    <option value="@telecom_feed">@telecom_feed (Standard robot logs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">ATTACHED MEDIA TYPE</label>
                  <select
                    value={msgMedia}
                    onChange={e => setMsgMedia(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs capitalize text-slate-800 focus:outline-hidden"
                  >
                    <option value="text">Text only</option>
                    <option value="photo">Photo Image</option>
                    <option value="video">MP4 Video</option>
                    <option value="document">PDF Document File</option>
                    <option value="animation">GIF Animation Loop</option>
                  </select>
                </div>
              </div>

              {msgMedia === 'document' && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">DOCUMENT FILENAME</label>
                  <input
                    type="text"
                    value={customFileName}
                    onChange={e => setCustomFileName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">POST CONTENT TEXT (OR IMAGE CAPTION)</label>
                <textarea
                  required
                  rows={3}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Transmit Simulated Post
              </button>
            </form>
          </div>

          {/* Running logs console terminal */}
          <div className="geometric-console">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#38bdf8] animate-pulse" />
                <span className="font-semibold text-slate-300">VPS Daemon Logging Terminal / syslog</span>
              </div>
              <button
                type="button"
                onClick={() => setTerminalLogs(["Daemon state initialized gracefully.", "Waiting for incoming MTProto packets..."])}
                className="text-slate-400 hover:text-white transition-colors"
                title="Clear Terminal Logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {terminalLogs.map((log, index) => {
                let colorClass = "text-slate-300";
                if (log.includes("[SUCCESS]")) colorClass = "text-[#38bdf8] font-bold";
                if (log.includes("[TRIGGER]")) colorClass = "text-slate-100 font-semibold";
                if (log.includes("[FILTERED]")) colorClass = "text-amber-400";
                if (log.includes("[SKIP]")) colorClass = "text-slate-400 italic";
                return (
                  <div key={index} className={`${colorClass} whitespace-pre-wrap`}>
                    {log}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* Right Side: Destination visual Mock Phone Feed */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-100 p-4 rounded-3xl relative overflow-hidden flex flex-col h-[520px]">
          
          <div className="bg-white border-b border-slate-100 p-3 rounded-t-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-100 hover:bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-mono text-xs font-semibold">
                TG
              </div>
              <div>
                <h4 className="font-sans font-semibold text-xs text-slate-800">Telegram Destination</h4>
                <p className="text-[9px] font-mono text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  Active Channel Feed
                </p>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-100">
              Mock Feed
            </div>
          </div>

          {/* Chat bubbles */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin" style={{ backgroundImage: "linear-gradient(#f0f2f5, #e4e7eb)" }}>
            
            {logs.filter(l => l.status === 'success').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-400">
                <Eye className="w-10 h-10 text-slate-300 mb-2" />
                <h5 className="text-[11px] font-bold uppercase tracking-wider font-sans text-slate-500">No Forwarded Posts Received</h5>
                <p className="text-[10px] mt-1 max-w-[200px] leading-relaxed mx-auto">
                  Transmit messages from matching sources and filters to pop up bubbles onto this live feed mockup!
                </p>
              </div>
            ) : (
              logs.filter(l => l.status === 'success').map((item, index) => (
                <div key={index} className="max-w-[85%] bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden relative group">
                  
                  {/* Top indicators representing standard watermarks */}
                  <div className="px-2.5 py-1.5 bg-slate-50 border-b border-slate-50 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>Target: {item.destination}</span>
                    <span>{item.timestamp ? item.timestamp.split(' ')[1] : 'Now'}</span>
                  </div>

                  {/* Forward marker watermark tags (Only shows if NOT copy_mode) */}
                  {!item.actionTaken.includes('Copy') && (
                    <div className="px-2.5 py-1 text-[9px] font-sans text-slate-400 bg-slate-50/50 border-b border-dashed border-slate-100 italic">
                      Forwarded from <span className="font-semibold">{item.source}</span>
                    </div>
                  )}

                  {/* Media visual representations */}
                  {item.messageType === 'photo' && (
                    <img
                      src={mediaPresets.photo}
                      alt="Preset upload"
                      className="w-full h-32 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {item.messageType === 'video' && (
                    <div className="bg-indigo-950/90 h-32 flex flex-col items-center justify-center text-indigo-200 relative overflow-hidden group">
                      <img src={mediaPresets.video} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-10" referrerPolicy="no-referrer" />
                      <Film className="w-8 h-8 opacity-8var0 relative z-10 animate-pulse text-indigo-400" />
                      <span className="text-[9px] font-mono mt-1 relative z-10 text-white font-semibold">VIDEO STREAM (MP4)</span>
                    </div>
                  )}

                  {item.messageType === 'animation' && (
                    <div className="bg-indigo-900/40 h-32 flex flex-col items-center justify-center relative overflow-hidden">
                      <img src={mediaPresets.animation} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-20" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-mono font-bold px-1 py-0.5 rounded-sm">GIF</div>
                      <span className="text-[10px] font-mono text-slate-700 relative z-10">Animation Loop</span>
                    </div>
                  )}

                  {item.messageType === 'document' && (
                    <div className="m-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2 text-[11px] font-mono">
                      <div className="p-1.5 bg-rose-50 text-rose-500 rounded-md">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-[10px] text-slate-700 font-semibold truncate leading-tight">spectrum_deal.pdf</div>
                        <div className="text-[8px] text-slate-400">PDF Document • 4.8 MB</div>
                      </div>
                    </div>
                  )}

                  {/* Body Captions text layouts */}
                  <div className="p-3">
                    <p className="text-xs text-slate-800 leading-relaxed font-sans">{item.originalText}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
        </div>

      </div>

      {/* History table view */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-xs">
        <h3 className="font-sans font-semibold text-slate-800 text-sm mb-4">Total Routing History & Audits Logs</h3>
        
        <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-xs">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 font-mono text-[10px] text-slate-400 border-b border-slate-100">
                <th className="p-3">RULE REFERENCE</th>
                <th className="p-3">SOURCE ROUTE</th>
                <th className="p-3">ATTACHMENT</th>
                <th className="p-3">DECISION STATUS</th>
                <th className="p-3 text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
              {logs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="p-3 font-sans font-medium text-slate-800">{item.ruleName}</td>
                  <td className="p-3">
                    <div className="font-mono text-slate-500 flex items-center gap-1.5">
                      <span>{item.source}</span>
                      {item.status === 'success' && <span className="text-slate-300">➔</span>}
                      {item.status === 'success' && <span className="text-slate-700">{item.destination}</span>}
                    </div>
                  </td>
                  <td className="p-3 capitalize font-mono text-slate-400">{item.messageType}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      {item.status === 'success' ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          Forward Success
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          Filtered & Skipped
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 mt-0.5">{item.actionTaken}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono text-slate-400">{item.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
