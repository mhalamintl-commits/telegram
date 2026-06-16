import fs from 'fs';

function loadDb() {
  const json = fs.readFileSync('data/db.json', 'utf8');
  return JSON.parse(json);
}

async function test() {
  const db = loadDb();
  console.log('Total users:', db.users.length);
  const activeUserClients = db.users.filter((u: any) => 
    u.telegramClient?.authType === 'user' && 
    u.telegramClient?.status === 'connected' && 
    u.telegramClient?.sessionString
  );
  console.log('Active user clients:', activeUserClients.map((u: any) => u.email));
  for (const u of activeUserClients) {
    const userPipelines = db.forwarders.filter((f: any) => 
      f.isActive && (f.userId === u.id || (!f.userId && u.id === 'user-1'))
    );
    console.log('User pipelines for', u.email, ':', userPipelines.length);
    for (const p of userPipelines) {
      console.log(' - Pipeline:', p.name, p.sources, '->', p.targets);
    }
  }
}
test();
