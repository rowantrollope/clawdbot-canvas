import { useEffect } from 'react';
import { useCardStore } from '@/store/cardStore';
import type { Card } from '@/types/card';

function connectSSE(): EventSource {
  const es = new EventSource('/api/events');

  es.addEventListener('upsert', (e) => {
    const { card } = JSON.parse(e.data);
    useCardStore.getState().upsert(card);
  });

  es.addEventListener('remove', (e) => {
    const { id } = JSON.parse(e.data);
    useCardStore.getState().remove(id);
  });

  es.addEventListener('clear', () => {
    useCardStore.getState().clear();
  });

  return es;
}

export function useServerSync() {
  useEffect(() => {
    let disposed = false;
    let es: EventSource | null = null;

    // Initial load
    fetch('/api/cards')
      .then((r) => r.json())
      .then((cards: Card[]) => {
        if (!disposed) useCardStore.getState().replaceAll(cards);
      })
      .catch(() => {});

    // SSE with reconnect
    function connect() {
      if (disposed) return;
      es = connectSSE();
      es.onerror = () => {
        es?.close();
        if (!disposed) setTimeout(connect, 2000);
      };
    }
    connect();

    return () => {
      disposed = true;
      es?.close();
    };
  }, []);
}
