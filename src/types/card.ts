export type CardState = 'active' | 'minimized';
export type CardPriority = 'high' | 'normal' | 'low';
export type CardType = 'progress' | 'status' | 'markdown' | 'list';

export interface Card {
  id: string;
  type: CardType;
  title: string;
  icon?: string;
  state: CardState;
  priority: CardPriority;
  data: CardData;
  createdAt: number;
  /** Tracks if user manually changed state - prevents auto-updates from overriding */
  userStateChange?: boolean;
}

// Card-specific data types
export interface ProgressData {
  label: string;
  progress: number; // 0-100
  status?: 'active' | 'complete' | 'error';
}

export interface StatusData {
  entries: Array<{ key: string; value: string }>;
}

export interface MarkdownData {
  content: string;
}

export interface ListData {
  items: Array<{
    id: string;
    text: string;
    done?: boolean;
    icon?: string;
  }>;
}

export type CardData = ProgressData | StatusData | MarkdownData | ListData;

// Helper type guards
export function isProgressData(data: CardData): data is ProgressData {
  return 'progress' in data && typeof (data as ProgressData).progress === 'number';
}

export function isStatusData(data: CardData): data is StatusData {
  return 'entries' in data && Array.isArray((data as StatusData).entries);
}

export function isMarkdownData(data: CardData): data is MarkdownData {
  return 'content' in data && typeof (data as MarkdownData).content === 'string';
}

export function isListData(data: CardData): data is ListData {
  return 'items' in data && Array.isArray((data as ListData).items);
}
