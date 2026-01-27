import { create } from 'zustand';
import type { Card, CardState } from '../types/card';

interface CardStore {
  cards: Map<string, Card>;

  // Actions
  upsert: (card: Omit<Card, 'createdAt' | 'updatedAt'> & { createdAt?: number }) => void;
  update: (id: string, updates: Partial<Omit<Card, 'id'>>) => void;
  remove: (id: string) => void;
  /** User-initiated dismiss - respects persistent flag */
  dismiss: (id: string) => boolean;
  minimize: (id: string) => void;
  expand: (id: string) => void;
  clear: () => void;
  replaceAll: (cards: Card[]) => void;
  /** Batch multiple operations */
  batch: (operations: Array<{ action: 'upsert' | 'update' | 'remove'; card?: Omit<Card, 'createdAt' | 'updatedAt'> & { createdAt?: number }; id?: string; updates?: Partial<Omit<Card, 'id'>> }>) => void;

  // Selectors
  getActiveCards: () => Card[];
  getMinimizedCards: () => Card[];
  getCardById: (id: string) => Card | undefined;
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: new Map(),

  upsert: (card) => {
    set((state) => {
      const newCards = new Map(state.cards);
      const existing = newCards.get(card.id);
      const now = Date.now();

      // If card exists and user manually changed state, preserve their choice
      if (existing?.userStateChange && card.state !== existing.state) {
        newCards.set(card.id, {
          ...card,
          createdAt: existing.createdAt,
          updatedAt: now,
          state: existing.state,
          userStateChange: true,
        });
      } else if (existing) {
        // Existing card being updated
        newCards.set(card.id, {
          ...card,
          createdAt: existing.createdAt,
          updatedAt: now,
        });
      } else {
        // New card
        newCards.set(card.id, {
          ...card,
          createdAt: card.createdAt ?? now,
        });
      }

      return { cards: newCards };
    });
  },

  update: (id, updates) => {
    set((state) => {
      const newCards = new Map(state.cards);
      const existing = newCards.get(id);

      if (existing) {
        newCards.set(id, { ...existing, ...updates });
      }

      return { cards: newCards };
    });
  },

  remove: (id) => {
    set((state) => {
      const newCards = new Map(state.cards);
      newCards.delete(id);
      return { cards: newCards };
    });
  },

  dismiss: (id) => {
    const card = get().cards.get(id);
    // Only allow dismissing non-persistent cards
    if (card && !card.persistent) {
      get().remove(id);
      return true;
    }
    return false;
  },

  minimize: (id) => {
    set((state) => {
      const newCards = new Map(state.cards);
      const card = newCards.get(id);

      if (card) {
        newCards.set(id, {
          ...card,
          state: 'minimized' as CardState,
          userStateChange: true,
        });
      }

      return { cards: newCards };
    });
  },

  expand: (id) => {
    set((state) => {
      const newCards = new Map(state.cards);
      const card = newCards.get(id);

      if (card) {
        newCards.set(id, {
          ...card,
          state: 'active' as CardState,
          userStateChange: true,
        });
      }

      return { cards: newCards };
    });
  },

  clear: () => {
    set({ cards: new Map() });
  },

  replaceAll: (cardList) => {
    const newCards = new Map<string, Card>();
    for (const card of cardList) {
      newCards.set(card.id, card);
    }
    set({ cards: newCards });
  },

  batch: (operations) => {
    const store = get();
    for (const op of operations) {
      switch (op.action) {
        case 'upsert':
          if (op.card) store.upsert(op.card);
          break;
        case 'update':
          if (op.id && op.updates) store.update(op.id, op.updates);
          break;
        case 'remove':
          if (op.id) store.remove(op.id);
          break;
      }
    }
  },

  getActiveCards: () => {
    const cards = Array.from(get().cards.values());
    return cards
      .filter((card) => card.state === 'active')
      .sort((a, b) => {
        // Sort by priority first (high > normal > low)
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Then by creation time (newest first)
        return b.createdAt - a.createdAt;
      });
  },

  getMinimizedCards: () => {
    const cards = Array.from(get().cards.values());
    return cards
      .filter((card) => card.state === 'minimized')
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  getCardById: (id) => {
    return get().cards.get(id);
  },
}));
