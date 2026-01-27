export type CardState = 'active' | 'minimized';
export type CardPriority = 'high' | 'normal' | 'low';
export type CardType = 'progress' | 'status' | 'markdown' | 'list' | 'custom';

export interface Card {
  id: string;
  type: CardType;
  title: string;
  icon?: string;
  state: CardState;
  priority: CardPriority;
  /** If true, user cannot dismiss - only agent can remove */
  persistent: boolean;
  data: CardData;
  createdAt: number;
  updatedAt?: number;
  /** Tracks if user manually changed state - prevents auto-updates from overriding */
  userStateChange?: boolean;
  /** Group related cards */
  group?: string;
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

export interface CustomData {
  /** Component name from the registry */
  component?: string;
  /** Props to pass to the component */
  props?: Record<string, unknown>;
  /** Raw HTML content (sandboxed) */
  html?: string;
  /** Additional CSS class names */
  className?: string;
}

export type CardData = ProgressData | StatusData | MarkdownData | ListData | CustomData;

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

export function isCustomData(data: CardData): data is CustomData {
  return 'component' in data || 'html' in data;
}


