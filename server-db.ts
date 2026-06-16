import fs from 'fs';
import path from 'path';
import { User, Forwarder, ForwardingLog, BillingInvoice } from './src/types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initial defaults to seed the database
const DEFAULT_DATA = {
  users: [
    {
      id: 'admin-1',
      email: 'admin@teleflow.com',
      password: 'adminpassword',
      role: 'admin',
      plan: 'Enterprise',
      telegramClient: {
        apiId: '2345678',
        apiHash: 'd7a9b09bc872f09ba9bc8fbcde831acb',
        phoneNumber: '+15550199',
        status: 'connected',
        sessionString: 'this_is_a_mock_production_auth_session_string_valid_24_7'
      },
      status: 'active',
      createdAt: new Date().toISOString()
    } as any,
    {
      id: 'user-1',
      email: 'user@teleflow.com',
      password: 'password123',
      role: 'user',
      plan: 'Free',
      telegramClient: {
        apiId: '',
        apiHash: '',
        phoneNumber: '',
        status: 'disconnected'
      },
      status: 'active',
      createdAt: new Date().toISOString()
    } as any
  ],
  forwarders: [] as Forwarder[],
  logs: [] as ForwardingLog[],
  invoices: [] as BillingInvoice[],
  tickets: [] as any[],
  settings: {
    dorjiMerchantId: 'MERCHANT_DEMO_998',
    dorjiApiKey: 'apiKey_demo_e7987cbac17',
    dorjiSecretKey: 'secretKey_demo_e2978cfbc',
    totalSystemForwarded: 0,
    serverUptime: '100%'
  }
};

interface DbSchema {
  users: (User & { password?: string })[];
  forwarders: (Forwarder & { userId?: string })[];
  logs: (ForwardingLog & { userId?: string })[];
  invoices: BillingInvoice[];
  tickets: any[];
  settings: typeof DEFAULT_DATA.settings;
}

let dbCache: DbSchema | null = null;

function ensureDbExists() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
  }
}

export function cleanAndNormalizeTelegramHandle(item: string): string {
  let cleaned = item.trim();
  // Strip URL prefixes like https://t.me/ or t.me/
  cleaned = cleaned.replace(/^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me|telegram\.dog)\/joinchat\//i, '');
  cleaned = cleaned.replace(/^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me|telegram\.dog)\/+/i, '');
  // Extract handle before any path or query param
  cleaned = cleaned.split('/')[0].split('?')[0].trim();
  
  if (!cleaned) return '';
  
  // If it's a numeric ID (either positive or negative), return as is
  if (/^-?\d+$/.test(cleaned)) {
    return cleaned;
  }
  
  // If it's a username handle, ensure it has a single leading @
  cleaned = cleaned.replace(/^@+/, '');
  return `@${cleaned}`;
}

export function loadDb(): DbSchema {
  if (dbCache) return dbCache;
  ensureDbExists();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    dbCache = JSON.parse(raw) as DbSchema;
    
    // Ensure back-compatibility and default properties exist
    if (!dbCache.users) dbCache.users = DEFAULT_DATA.users;
    if (!dbCache.forwarders) dbCache.forwarders = DEFAULT_DATA.forwarders;
    if (!dbCache.logs) dbCache.logs = DEFAULT_DATA.logs;
    if (!dbCache.invoices) dbCache.invoices = DEFAULT_DATA.invoices;
    if (!dbCache.tickets) dbCache.tickets = DEFAULT_DATA.tickets;
    if (!dbCache.settings) dbCache.settings = DEFAULT_DATA.settings;

    // Connect pre-existing forwarders and logs to first user and deeply normalize sources/targets
    dbCache.forwarders.forEach(f => {
      if (!f.userId) f.userId = 'user-1';
      if (Array.isArray(f.sources)) {
        f.sources = f.sources.map(cleanAndNormalizeTelegramHandle).filter(Boolean);
      }
      if (Array.isArray(f.targets)) {
        f.targets = f.targets.map(cleanAndNormalizeTelegramHandle).filter(Boolean);
      }
    });
    dbCache.logs.forEach(l => { if (!l.userId) l.userId = 'user-1'; });

    return dbCache;
  } catch (e) {
    console.error('Error loading Database, resetting default.', e);
    dbCache = JSON.parse(JSON.stringify(DEFAULT_DATA)) as DbSchema;
    return dbCache;
  }
}

export function saveDb(data: DbSchema) {
  dbCache = data;
  ensureDbExists();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Could not save database file', e);
  }
}

// Global user email configuration boot-strapper (from metadata rules)
export function checkAndBootAdmin(userEmail: string) {
  const db = loadDb();
  const index = db.users.findIndex(u => u.email.toLowerCase() === userEmail.toLowerCase());
  if (index !== -1) {
    if (db.users[index].role !== 'admin') {
      db.users[index].role = 'admin';
      db.users[index].plan = 'Enterprise';
      saveDb(db);
    }
  } else {
    // Add real email as booted admin automatically
    const newAdmin: User & { password?: string } = {
      id: 'admin-' + Math.random().toString(36).substr(2, 9),
      email: userEmail,
      password: 'adminPassword123',
      role: 'admin',
      plan: 'Enterprise',
      telegramClient: {
        apiId: '9847120',
        apiHash: 'e6bc0fac924bb0ac19db7f098ab1cd29',
        phoneNumber: '+447700900077',
        status: 'connected',
        sessionString: 'admin_auto_loaded_session_for_realtime_forwarding_active'
      },
      status: 'active',
      createdAt: new Date().toISOString()
    };
    db.users.push(newAdmin);
    saveDb(db);
  }
}
