#!/usr/bin/env npx tsx
/**
 * CLI test tool for Clawdbot Canvas API
 * Usage: npx tsx test-cli.ts [command] [args...]
 *
 * Commands:
 *   list                  List active/minimized cards
 *   list-all              List all cards including archived
 *   list-archived         List only archived cards
 *   get <id>              Get a specific card
 *   push <type> <title>   Push a test card (types: progress, status, markdown, list)
 *   archive <id>          Archive a card
 *   restore <id>          Restore an archived card
 *   delete <id>           Permanently delete a card
 *   clear                 Clear all cards
 *   watch                 Watch SSE events in real-time
 */

const BASE = process.env.CANVAS_URL || 'http://localhost:5173';
const TOKEN = process.env.CLAWDBOT_CANVAS_TOKEN || '';

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (TOKEN) h['Authorization'] = `Bearer ${TOKEN}`;
  return h;
}

async function api(path: string, opts?: RequestInit) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { ...opts, headers: { ...headers(), ...opts?.headers } });
  const body = await res.json();
  if (!res.ok) {
    console.error(`HTTP ${res.status}:`, body);
    process.exit(1);
  }
  return body;
}

function printCards(cards: any[]) {
  if (cards.length === 0) {
    console.log('  (none)');
    return;
  }
  for (const c of cards) {
    const age = Math.round((Date.now() - c.createdAt) / 60000);
    const archived = c.archivedAt ? ` [archived ${Math.round((Date.now() - c.archivedAt) / 60000)}m ago]` : '';
    console.log(`  ${c.icon || ' '} ${c.id.padEnd(24)} ${c.state.padEnd(10)} ${c.type.padEnd(10)} ${c.title}${archived}  (${age}m old)`);
  }
}

const testCards: Record<string, () => any> = {
  progress: () => ({
    id: `test-progress-${Date.now()}`,
    type: 'progress',
    title: 'Test Deploy',
    icon: '🚀',
    state: 'active',
    priority: 'normal',
    persistent: false,
    data: { label: 'Deploying...', progress: 42, status: 'active' },
  }),
  status: () => ({
    id: `test-status-${Date.now()}`,
    type: 'status',
    title: 'Test Status',
    icon: '📡',
    state: 'active',
    priority: 'normal',
    persistent: false,
    data: { entries: [{ key: 'API', value: 'Healthy' }, { key: 'DB', value: 'Connected' }] },
  }),
  markdown: () => ({
    id: `test-markdown-${Date.now()}`,
    type: 'markdown',
    title: 'Test Note',
    icon: '📝',
    state: 'active',
    priority: 'normal',
    persistent: false,
    data: { content: '**Hello** from the CLI test tool.\n\n- Item one\n- Item two\n- Item three' },
  }),
  list: () => ({
    id: `test-list-${Date.now()}`,
    type: 'list',
    title: 'Test Checklist',
    icon: '✅',
    state: 'active',
    priority: 'normal',
    persistent: false,
    data: { items: [
      { id: '1', text: 'First task', done: true },
      { id: '2', text: 'Second task', done: false },
      { id: '3', text: 'Third task', done: false },
    ]},
  }),
};

async function main() {
  const [cmd, ...args] = process.argv.slice(2);

  switch (cmd) {
    case 'list': {
      const cards = await api('/api/cards');
      console.log(`Active/minimized cards (${cards.length}):`);
      printCards(cards);
      break;
    }
    case 'list-all': {
      const cards = await api('/api/cards?include=archived');
      console.log(`All cards (${cards.length}):`);
      printCards(cards);
      break;
    }
    case 'list-archived': {
      const cards = await api('/api/cards?state=archived');
      console.log(`Archived cards (${cards.length}):`);
      printCards(cards);
      break;
    }
    case 'get': {
      if (!args[0]) { console.error('Usage: get <id>'); process.exit(1); }
      const cards = await api('/api/cards?include=archived');
      const card = cards.find((c: any) => c.id === args[0]);
      if (!card) { console.error('Card not found'); process.exit(1); }
      console.log(JSON.stringify(card, null, 2));
      break;
    }
    case 'push': {
      const type = args[0] || 'markdown';
      const factory = testCards[type];
      if (!factory) {
        console.error(`Unknown type: ${type}. Available: ${Object.keys(testCards).join(', ')}`);
        process.exit(1);
      }
      const card = factory();
      if (args[1]) card.title = args.slice(1).join(' ');
      const result = await api('/api/cards', { method: 'POST', body: JSON.stringify(card) });
      console.log(`Pushed ${type} card: ${result.card.id}`);
      break;
    }
    case 'archive': {
      if (!args[0]) { console.error('Usage: archive <id>'); process.exit(1); }
      const result = await api(`/api/cards/${encodeURIComponent(args[0])}/archive`, { method: 'POST' });
      console.log(`Archived: ${result.card.id} (state: ${result.card.state})`);
      break;
    }
    case 'restore': {
      if (!args[0]) { console.error('Usage: restore <id>'); process.exit(1); }
      const result = await api(`/api/cards/${encodeURIComponent(args[0])}/restore`, { method: 'POST' });
      console.log(`Restored: ${result.card.id} (state: ${result.card.state})`);
      break;
    }
    case 'delete': {
      if (!args[0]) { console.error('Usage: delete <id>'); process.exit(1); }
      await api(`/api/cards/${encodeURIComponent(args[0])}`, { method: 'DELETE' });
      console.log(`Deleted: ${args[0]}`);
      break;
    }
    case 'clear': {
      await api('/api/cards', { method: 'DELETE' });
      console.log('All cards cleared.');
      break;
    }
    case 'watch': {
      const url = TOKEN
        ? `${BASE}/api/events?token=${encodeURIComponent(TOKEN)}`
        : `${BASE}/api/events`;
      console.log(`Watching SSE events at ${BASE}... (Ctrl+C to stop)\n`);
      const res = await fetch(url);
      if (!res.body) { console.error('No response body'); process.exit(1); }
      const decoder = new TextDecoder();
      const reader = res.body.getReader();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop()!;
        let event = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) event = line.slice(7);
          else if (line.startsWith('data: ')) {
            const data = line.slice(6);
            const ts = new Date().toLocaleTimeString();
            try {
              const parsed = JSON.parse(data);
              console.log(`[${ts}] ${event}: ${JSON.stringify(parsed, null, 2)}`);
            } catch {
              console.log(`[${ts}] ${event}: ${data}`);
            }
          }
        }
      }
      break;
    }
    default: {
      console.log(`Clawdbot Canvas CLI Test Tool

Usage: npx tsx test-cli.ts <command> [args...]

Commands:
  list                  List active/minimized cards
  list-all              List all cards including archived
  list-archived         List only archived cards
  get <id>              Get a specific card by ID
  push <type> [title]   Push a test card (progress|status|markdown|list)
  archive <id>          Archive a card
  restore <id>          Restore an archived card
  delete <id>           Permanently delete a card
  clear                 Clear all cards
  watch                 Watch SSE events in real-time

Environment:
  CANVAS_URL              Base URL (default: http://localhost:5173)
  CLAWDBOT_CANVAS_TOKEN   Auth token (optional)`);
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
