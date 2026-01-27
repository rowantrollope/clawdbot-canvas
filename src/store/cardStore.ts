import { create } from 'zustand';
import type { Card, CardState } from '../types/card';

interface CardStore {
  cards: Map<string, Card>;

  // Actions
  upsert: (card: Omit<Card, 'createdAt'> & { createdAt?: number }) => void;
  update: (id: string, updates: Partial<Omit<Card, 'id'>>) => void;
  remove: (id: string) => void;
  minimize: (id: string) => void;
  expand: (id: string) => void;
  clear: () => void;

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

      // If card exists and user manually changed state, preserve their choice
      if (existing?.userStateChange && card.state !== existing.state) {
        newCards.set(card.id, {
          ...card,
          createdAt: existing.createdAt,
          state: existing.state,
          userStateChange: true,
        });
      } else {
        newCards.set(card.id, {
          ...card,
          createdAt: card.createdAt ?? Date.now(),
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
