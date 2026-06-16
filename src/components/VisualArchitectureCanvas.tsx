import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Forwarder, ForwardingLog } from '../types';
import { Database, Server, Cpu, Box, Share2, Send, Filter, CircleDot, ArrowRight } from 'lucide-react';

interface VisualArchitectureCanvasProps {
  forwarders: Forwarder[];
  logs: ForwardingLog[];
}

export default function VisualArchitectureCanvas({ forwarders, logs }: VisualArchitectureCanvasProps) {
  // We extract unique sources and targets
  const uniqueSources = Array.from(new Set(forwarders.flatMap(f => f.sources))).filter(Boolean);
  const uniqueTargets = Array.from(new Set(forwarders.flatMap(f => f.targets))).filter(Boolean);
  
  // Track active flow packets based on logs
  const [activePackets, setActivePackets] = useState<{ id: string, source: string, target: string, status: string }[]>([]);

  useEffect(() => {
    if (logs.length > 0) {
      // Grab latest log, trigger packet
      const latest = logs[0];
      const newPacket = {
        id: `${latest.id}-${Date.now()}`,
        source: latest.sourceChat,
        target: latest.targetChat,
        status: latest.status
      };
      setActivePackets(prev => [...prev, newPacket]);
      
      // Remove packet after animation
      setTimeout(() => {
        setActivePackets(prev => prev.filter(p => p.id !== newPacket.id));
      }, 2000);
    }
  }, [logs]);

  return (
    <div className="rounded-xl border border-[#1e2230] bg-[#0d0e12] overflow-hidden shadow-lg p-6 relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Share2 className="w-64 h-64" />
      </div>

      <div className="mb-6 border-b border-[#14161f] pb-4">
         <h4 className="font-bold text-white text-sm flex items-center gap-2">
           <Box className="h-4 w-4 text-emerald-500" />
           Live Architecture Visualizer
         </h4>
         <p className="text-[11px] text-gray-400 mt-1">Real-time telemetry map of active MTProto pipelines routing traffic through the engine.</p>
      </div>

      <div className="relative h-64 md:h-80 w-full flex items-center justify-between px-2 md:px-12">
        {/* Source Channels */}
        <div className="flex flex-col gap-4 h-full justify-center w-1/4 z-10">
          {uniqueSources.length === 0 ? (
            <div className="text-[10px] text-gray-600 text-center border border-dashed border-gray-800 rounded p-4">No Data Sources</div>
          ) : (
            uniqueSources.map((src, i) => (
              <div key={`src-${i}`} className="relative bg-[#14161f] border border-[#1e2230] rounded-lg p-3 text-center shadow-lg shadow-black/50" id={`node-src-${src}`}>
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#14161f] border-t border-r border-[#1e2230] rotate-45" />
                <span className="text-[11px] font-mono text-gray-300 truncate block font-semibold">{src}</span>
              </div>
            ))
          )}
        </div>

        {/* TeleFlow Engine */}
        <div className="relative z-10 w-1/3 flex flex-col items-center justify-center">
          <div className="relative bg-gradient-to-br from-indigo-950/40 via-[#0d0e12] to-violet-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl shadow-indigo-500/10">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
            
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" />
                <Cpu className="h-10 w-10 text-indigo-400 relative z-10" />
              </div>
              <div className="text-center">
                <h5 className="text-white font-bold text-sm tracking-widest uppercase">TeleFlow Core</h5>
                <p className="text-[9px] text-indigo-300/70 font-mono mt-1">v4.Worker.Cluster</p>
              </div>
            </div>

            {/* Inner processors */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-[#1e2230]">
              <div className="flex items-center gap-1 text-[9px] bg-[#14161f] border border-[#1e2230] px-2 py-1 rounded text-gray-400">
                <Filter className="w-3 h-3 text-emerald-400" /> Filters
              </div>
              <div className="flex items-center gap-1 text-[9px] bg-[#14161f] border border-[#1e2230] px-2 py-1 rounded text-gray-400">
                <CircleDot className="w-3 h-3 text-amber-400" /> Replace
              </div>
            </div>
          </div>
        </div>

        {/* Target Channels */}
        <div className="flex flex-col gap-4 h-full justify-center w-1/4 z-10">
          {uniqueTargets.length === 0 ? (
            <div className="text-[10px] text-gray-600 text-center border border-dashed border-gray-800 rounded p-4">No Destinations</div>
          ) : (
            uniqueTargets.map((tgt, i) => (
              <div key={`tgt-${i}`} className="relative bg-[#14161f] border border-[#1e2230] rounded-lg p-3 text-center shadow-lg shadow-black/50">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#14161f] border-b border-l border-[#1e2230] rotate-45" />
                <span className="text-[11px] font-mono text-indigo-300 truncate block font-semibold">{tgt}</span>
              </div>
            ))
          )}
        </div>

        {/* Dynamic Activity Lines Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
          {uniqueSources.map((_, i) => (
             <div key={`wire-L-${i}`} className="absolute left-[12%] right-[50%] h-px bg-gradient-to-r from-gray-700 to-indigo-500" style={{ top: `${20 + (i * 15)}%` }} />
          ))}
          {uniqueTargets.map((_, i) => (
             <div key={`wire-R-${i}`} className="absolute left-[50%] right-[12%] h-px bg-gradient-to-r from-indigo-500 to-gray-700" style={{ top: `${20 + (i * 15)}%` }} />
          ))}
        </div>

        {/* Real-time Animated Particle Packets based on logs */}
        <AnimatePresence>
          {activePackets.map(packet => {
            const isSuccess = packet.status === 'success';
            const colorClass = isSuccess ? 'bg-emerald-400 shadow-emerald-400' : 'bg-amber-400 shadow-amber-400';
            
            return (
              <React.Fragment key={packet.id}>
                {/* Source to Engine Packet */}
                <motion.div
                  initial={{ left: '12%', top: '50%', scale: 0, opacity: 0 }}
                  animate={{ left: '50%', top: '50%', scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className={`absolute z-20 w-3 h-3 rounded-full shadow-[0_0_15px_3px] ${colorClass} -translate-x-1/2 -translate-y-1/2`}
                />
                
                {/* Engine to Target Packet (only if success) */}
                {isSuccess && (
                  <motion.div
                    initial={{ left: '50%', top: '50%', scale: 0, opacity: 0 }}
                    animate={{ left: '88%', top: '50%', scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: 0.8 }}
                    className={`absolute z-20 w-3 h-3 rounded-full shadow-[0_0_15px_3px] bg-indigo-400 shadow-indigo-400 -translate-x-1/2 -translate-y-1/2`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>

        {/* Idle Animated Packets for ambient visual effect */}
        {activePackets.length === 0 && uniqueSources.length > 0 && uniqueTargets.length > 0 && (
          <>
            <motion.div
              animate={{ left: ['12%', '50%'], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-[40%] z-20 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_1px] bg-gray-500 shadow-gray-500 -translate-x-1/2 -translate-y-1/2"
            />
            <motion.div
              animate={{ left: ['50%', '88%'], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
              className="absolute top-[60%] z-20 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_1px] bg-indigo-500 shadow-indigo-500 -translate-x-1/2 -translate-y-1/2"
            />
          </>
        )}
      </div>
    </div>
  );
}
