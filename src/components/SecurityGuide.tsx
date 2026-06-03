import React from 'react';
import { VPS_DEPLOYMENT_GUIDE, SECURITY_ANTIBAN_GUIDE } from './CodeTemplates';
import { Terminal, ShieldAlert, Cpu, HeartPulse, RefreshCw } from 'lucide-react';

export default function SecurityGuide() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* VPS setup guide */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-50 pb-3">
          <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-slate-800 text-sm">VPS 24/7 Deployment Instructions</h3>
            <p className="font-mono text-[9px] text-slate-400">systemd configuration and virtual environment initialization</p>
          </div>
        </div>

        <div className="prose prose-slate text-xs font-sans max-h-[500px] overflow-y-auto scrollbar-thin leading-relaxed pr-2 space-y-4 text-slate-600">
          <p>
            Follow these sequence commands to deploy on typical cloud hosts like DigitalOcean, Linode, or AWS EC2 running Ubuntu 22.04 LTS:
          </p>

          <div className="space-y-2">
            <span className="font-bold block text-slate-800 text-xs">Step 1: Install Python Core</span>
            <pre className="bg-slate-900 text-slate-300 p-2.5 rounded-lg font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
              {"sudo apt update\nsudo apt install -y python3-pip python3-venv tmux screen"}
            </pre>
          </div>

          <div className="space-y-2">
            <span className="font-bold block text-slate-800 text-xs">Step 2: Initialize venv & dependencies</span>
            <pre className="bg-slate-900 text-slate-300 p-2.5 rounded-lg font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
              {"mkdir ~/tg-forwarder && cd ~/tg-forwarder\npython3 -m venv venv\nsource venv/bin/activate\npip install pyrogram tgcrypto requests"}
            </pre>
          </div>

          <div className="space-y-2">
            <span className="font-bold block text-slate-800 text-xs">Step 3: Setup systemd unit daemon</span>
            <p className="text-[11px] text-slate-500">
              Create <code className="bg-slate-100 p-0.5 rounded-sm">/etc/systemd/system/tg-forwarder.service</code> using your editor:
            </p>
            <pre className="bg-slate-900 text-slate-300 p-2.5 rounded-lg font-mono text-[10px] overflow-x-auto whitespace-pre">
{`[Unit]
Description=Telegram Post Forwarder Daemon
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/tg-forwarder
ExecStart=/root/tg-forwarder/venv/bin/python forwarder.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target`}
            </pre>
          </div>

          <div className="space-y-2">
            <span className="font-bold block text-slate-800 text-xs">Step 4: Enable Service</span>
            <pre className="bg-slate-900 text-slate-300 p-2.5 rounded-lg font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
              {"sudo systemctl daemon-reload\nsudo systemctl start tg-forwarder\nsudo systemctl enable tg-forwarder"}
            </pre>
          </div>
        </div>
      </div>

      {/* Security and evasion guide */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-50 pb-3">
          <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-slate-800 text-sm">Evasion of Account Bans & SPAM filters</h3>
            <p className="font-mono text-[9px] text-slate-400">Essential rules for userbot network longevity</p>
          </div>
        </div>

        <div className="prose prose-slate text-xs font-sans max-h-[500px] overflow-y-auto scrollbar-thin leading-relaxed pr-2 space-y-3.5 text-slate-600">
          
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 space-y-1">
            <span className="font-bold block text-xs">Why Account Bans Trigger</span>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Unlike normal bots, Pyrogram runs as an active client userbot. Sending too many forwarding sequences without cooling delays triggers Telegram anti-spam heuristics, resulting in instant session termination.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">1. Register Unique API Keys</span>
            <p>
              Do NOT connect many separate accounts using a single default Pyrogram API app key. Navigating to <a href="https://my.telegram.org" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">my.telegram.org</a> for each registered phone number, establishing a unique app configuration, and entering custom keys in your code prevents IP/key matching flag bans.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">2. Cool down spacing delays</span>
            <p>
              Always add <code className="bg-slate-100 p-0.5 rounded-sm">await asyncio.sleep(2.0)</code> between sequential forward steps. Mass spam forwards in less than 500ms trigger MTProto server alerts.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">3. Warm up fresh accounts first</span>
            <p>
              Never launch your forwarder on a phone number that is less than one week old. Maintain regular chats, join safe groups, and configure your mobile app profile organically for a few days to &quot;heat&quot; up the credentials first.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">4. Set Realistic System Values</span>
            <p>
              Configure the Pyrogram <code className="bg-indigo-50 p-0.5 text-indigo-700 text-[10px] font-mono">Client</code> to mimic actual mobile devices. When initializing, pass options like:
              <br />
              <code className="block bg-slate-900 text-slate-300 p-2 rounded-md font-mono text-[9px] mt-1">
                {"device_model='Samsung Galaxy S22',\nsystem_version='Android 13',\napp_version='9.6.1'"}
              </code>
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">5. Restrict source counts</span>
            <p>
              Limit each connected userbot to monitor no more than 15-20 active groups or channels. If you have to scale further, configure additional accounts to run asynchronously.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
