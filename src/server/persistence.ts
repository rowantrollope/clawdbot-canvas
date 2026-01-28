import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { join } from 'path';
import type { Card } from '../types/card';

const DATA_DIR = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'cards.json');

let saveTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 1000;

export function loadCards(): Map<string, Card> {
  const cards = new Map<string, Card>();
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, 'utf-8');
      const arr: Card[] = JSON.parse(raw);
      for (const card of arr) {
        cards.set(card.id, card);
      }
      console.log(`[persistence] Loaded ${cards.size} cards from ${DATA_FILE}`);
    }
  } catch (err) {
    console.warn(`[persistence] Failed to load ${DATA_FILE}, starting fresh:`, err);
  }
  return cards;
}

export function scheduleSave(cards: Map<string, Card>) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveNow(cards), DEBOUNCE_MS);
}

function saveNow(cards: Map<string, Card>) {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmp = DATA_FILE + '.tmp';
    writeFileSync(tmp, JSON.stringify(Array.from(cards.values()), null, 2));
    renameSync(tmp, DATA_FILE);
  } catch (err) {
    console.error('[persistence] Failed to save cards:', err);
  }
}
