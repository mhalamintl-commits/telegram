import fs from 'fs';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';

function loadDb() {
  const json = fs.readFileSync('data/db.json', 'utf8');
  return JSON.parse(json);
}

async function test() {
  const db = loadDb();
  const u = db.users.find((u: any) => u.email === 'support@dorjigroup.org');
  const { apiId, apiHash, sessionString } = u.telegramClient;
  console.log('Connecting...');
  const client = new TelegramClient(new StringSession(sessionString), Number(apiId), apiHash, {
    connectionRetries: 1,
  });
  await client.connect();
  console.log('Connected! Fetching messages for @dorjigroup...');
  try {
    const messages = await client.getMessages('@dorjigroup', { limit: 5 });
    console.log('Got messages:', messages.length);
    for (const msg of messages) {
      console.log('Message:', msg.id, msg.message);
    }
  } catch (err: any) {
    console.error('Error fetching messages:', err.message);
  }
  await client.destroy();
}
test();
