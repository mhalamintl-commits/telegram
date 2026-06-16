import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ForwardingLog } from '../types';
import { CheckCircle2, Clock, ArrowRight, Layers, Download, RefreshCw } from 'lucide-react';

interface RecentActivityFeedProps {
  logs: ForwardingLog[];
  onReload: () => void;
  onExport: () => void;
}

export default function RecentActivityFeed({ logs, onReload, onExport }: RecentActivityFeedProps) {
  // Filter only successful forwards based on the requirement
  const successLogs = logs.filter(l => l.status === 'success');

  return (
    <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] p-5 shadow-lg flex flex-col h-[520px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h4 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
            <Clock className="h-4.5 w-4.5 text-indigo-500" />
            Recent Activity
          </h4>
          <p className="text-[11px] text-gray-400">Live stream of successfully forwarded messages.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn_export_csv_logs"
            onClick={onExport}
            className="py-1 px-2.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[10.5px] cursor-pointer flex items-center gap-1 font-semibold transition-colors"
            title="Export Logs to CSV"
          >
            <Download className="h-3 w-3 text-indigo-400" />
            Export CSV
          </button>
          <button
            id="btn_reload_logs"
            onClick={onReload}
            className="p-1 rounded bg-[#14161f] hover:bg-[#1a1c24] text-gray-400 cursor-pointer transition-colors"
            title="Reload feed"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-none relative">
        <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-[#14161f] z-0" />
        
        {successLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center py-10 z-10 relative">
            <Layers className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No recent activity.</p>
            <p className="text-[10px] mt-0.5 max-w-[200px]">Successful forwards will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            <AnimatePresence>
              {successLogs.map((log, idx) => (
                <motion.div 
                  key={`${log.id}-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx > 10 ? 0 : idx * 0.05 }}
                  className="relative pl-8 pb-4"
                >
                  {/* Status Indicator Pip */}
                  <div className="absolute left-0 top-1 p-[2px] bg-[#0d0e12] rounded-full z-10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] bg-[#0d0e12]" />
                  </div>
                  
                  {/* Content Container */}
                  <div className="rounded-lg border border-[#1e2230] bg-[#14161f]/50 p-3 hover:bg-[#14161f] transition-colors shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-white truncate max-w-[140px]">{log.forwarderName}</span>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[11px] font-medium mb-2 opacity-90">
                      <span className="text-gray-400 truncate max-w-[90px]">{log.sourceChat}</span>
                      <ArrowRight className="h-3 w-3 text-gray-600 shrink-0" />
                      <span className="text-indigo-400 truncate max-w-[90px]">{log.targetChat}</span>
                    </div>

                    <div className="text-[11px] text-gray-300 bg-[#0d0e12] rounded p-2 border border-[#1e2230]/50 line-clamp-2 leading-relaxed">
                      {log.processedText || log.originalText}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
