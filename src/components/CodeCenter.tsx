import React, { useState } from 'react';
import { 
  MYSQL_SCHEMA, 
  PHP_DATABASE, 
  PHP_AUTH_CONTROLLER, 
  PHP_RULE_CONTROLLER, 
  PHP_API_SYNC, 
  PYTHON_PYROGRAM_ENGINE 
} from './CodeTemplates';
import { Database, FolderCode, FileCode, Check, Copy, Code, Terminal, Server, Key } from 'lucide-react';

export default function CodeCenter() {
  const [activeTab, setActiveTab] = useState<'sql' | 'php_db' | 'php_auth' | 'php_rule' | 'php_api' | 'python'>('sql');
  const [copiedText, setCopiedText] = useState(false);

  const codeMap = {
    sql: { title: "MySQL Schema", lang: "sql", code: MYSQL_SCHEMA, icon: <Database className="w-4 h-4" /> },
    php_db: { title: "database.php (DB config)", lang: "php", code: PHP_DATABASE, icon: <FileCode className="w-4 h-4" /> },
    php_auth: { title: "AuthController.php", lang: "php", code: PHP_AUTH_CONTROLLER, icon: <Code className="w-4 h-4" /> },
    php_rule: { title: "RuleController.php", lang: "php", code: PHP_RULE_CONTROLLER, icon: <FolderCode className="w-4 h-4" /> },
    php_api: { title: "get_tasks.php (API endpoint)", lang: "php", code: PHP_API_SYNC, icon: <Server className="w-4 h-4" /> },
    python: { title: "forwarder.py (VPS Userbot)", lang: "python", code: PYTHON_PYROGRAM_ENGINE, icon: <Terminal className="w-4 h-4 text-sky-400" /> }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const currentFileData = codeMap[activeTab];

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="font-sans font-semibold text-lg text-slate-800 flex items-center gap-2">
            <FolderCode className="w-5 h-5 text-indigo-500" />
            Codebase & Deployment Center
          </h2>
          <p className="font-mono text-xs text-slate-400">Pure PHP + MySQL (cPanel) & Python (VPS Daemon strings)</p>
        </div>

        <button
          onClick={() => handleCopy(currentFileData.code)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          {copiedText ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Copied File!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy File Code
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation file tree */}
        <div className="lg:col-span-3 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2 font-mono">
            cPanel Database Files
          </span>
          
          <button
            onClick={() => setActiveTab('sql')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'sql' 
                ? 'bg-indigo-50 text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            schema.sql
          </button>
          
          <button
            onClick={() => setActiveTab('php_db')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'php_db' 
                ? 'bg-indigo-50 text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderCode className="w-4 h-4 shrink-0" />
            config/database.php
          </button>

          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mt-4 mb-2 font-mono">
            PHP MVC Controllers
          </span>

          <button
            onClick={() => setActiveTab('php_auth')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'php_auth' 
                ? 'bg-indigo-50 text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code className="w-4 h-4 shrink-0" />
            AuthController.php
          </button>

          <button
            onClick={() => setActiveTab('php_rule')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'php_rule' 
                ? 'bg-indigo-50 text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code className="w-4 h-4 shrink-0" />
            RuleController.php
          </button>

          <button
            onClick={() => setActiveTab('php_api')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'php_api' 
                ? 'bg-indigo-50 text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Server className="w-4 h-4 shrink-0" />
            api/get_tasks.php
          </button>

          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mt-4 mb-2 font-mono">
            Python VPS Engine
          </span>

          <button
            onClick={() => setActiveTab('python')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'python' 
                ? 'bg-indigo-50 text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" />
            forwarder.py
          </button>
        </div>

        {/* Code display screen */}
        <div className="lg:col-span-9 space-y-2">
          
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs font-mono text-slate-600">
            <div className="flex items-center gap-2">
              {currentFileData.icon}
              <span className="font-semibold">{currentFileData.title}</span>
            </div>
            <span className="text-[10px] text-slate-400">Language: {currentFileData.lang.toUpperCase()}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
            <pre className="p-5 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed h-[420px] scrollbar-thin scrollbar-thumb-slate-800">
              <code>{currentFileData.code}</code>
            </pre>
          </div>

          <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl text-cyan-800 text-[11px] leading-relaxed flex items-start gap-2 font-sans">
            <Key className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">cPanel Hosting Tip</span>
              <span>
                Upload the DB and PHP controllers directly in your file explorer root or shared public folders inside your subdomain folders. Make sure you set your VPS running parameters to point to the secure, HTTPS-validated JSON API endpoint <span className="font-mono bg-cyan-100 p-0.5 rounded-sm">get_tasks.php</span> to transport sessions.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
