import type {
  CardType,
  CardData,
  ProgressData,
  StatusData,
  MarkdownData,
  ListData,
} from '../../types/card';
import {
  isProgressData,
  isStatusData,
  isMarkdownData,
  isListData,
} from '../../types/card';

interface CardContentProps {
  type: CardType;
  data: CardData;
}

function ProgressContent({ data }: { data: ProgressData }) {
  const { label, progress, status = 'active' } = data;

  const barColors = {
    active: 'bg-[#007AFF]',
    complete: 'bg-[#34c759]',
    error: 'bg-red-500',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#1d1d1f]">{label}</span>
        <div className="flex items-center gap-2">
          {status === 'active' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#007AFF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#007AFF]"></span>
            </span>
          )}
          <span className="text-sm font-semibold text-[#86868b]">{progress}%</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColors[status]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

function StatusContent({ data }: { data: StatusData }) {
  return (
    <div className="space-y-2">
      {data.entries.map((entry, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0"
        >
          <span className="text-sm text-[#86868b]">{entry.key}</span>
          <span className="text-sm font-medium text-[#1d1d1f]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function MarkdownContent({ data }: { data: MarkdownData }) {
  // Simple markdown rendering - handles **bold**, *italic*, `code`, and newlines
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, lineIndex) => {
      // Handle headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={lineIndex} className="text-sm font-semibold text-[#1d1d1f] mt-3 mb-1">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={lineIndex} className="text-base font-semibold text-[#1d1d1f] mt-3 mb-1">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={lineIndex} className="text-lg font-bold text-[#1d1d1f] mt-3 mb-1">
            {line.slice(2)}
          </h1>
        );
      }

      // Handle bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={lineIndex} className="flex gap-2 text-sm text-[#1d1d1f]">
            <span className="text-[#86868b]">•</span>
            <span>{renderInlineMarkdown(line.slice(2))}</span>
          </div>
        );
      }

      // Empty line
      if (line.trim() === '') {
        return <div key={lineIndex} className="h-2" />;
      }

      // Regular paragraph
      return (
        <p key={lineIndex} className="text-sm text-[#1d1d1f]">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (text: string) => {
    // Simple inline markdown: **bold**, *italic*, `code`
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Check for code
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono text-[#1d1d1f]"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Check for bold
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={key++} className="font-semibold">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Check for italic
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        parts.push(
          <em key={key++} className="italic">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Regular character
      const nextSpecial = remaining.search(/[`*]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  return <div className="space-y-1">{renderMarkdown(data.content)}</div>;
}

function ListContent({ data }: { data: ListData }) {
  const doneCount = data.items.filter((item) => item.done).length;

  return (
    <div className="space-y-2">
      {data.items.length > 0 && (
        <div className="text-xs text-[#86868b] font-medium">
          {doneCount} of {data.items.length} complete
        </div>
      )}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {data.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 py-1">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                item.done
                  ? 'bg-[#34c759] border-[#34c759]'
                  : 'border-[#d2d2d7] bg-white'
              }`}
            >
              {item.done && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            {item.icon && <span className="text-sm">{item.icon}</span>}
            <span
              className={`text-sm transition-all duration-200 ${
                item.done ? 'text-[#86868b] line-through' : 'text-[#1d1d1f]'
              }`}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardContent({ type, data }: CardContentProps) {
  switch (type) {
    case 'progress':
      if (isProgressData(data)) {
        return <ProgressContent data={data} />;
      }
      break;
    case 'status':
      if (isStatusData(data)) {
        return <StatusContent data={data} />;
      }
      break;
    case 'markdown':
      if (isMarkdownData(data)) {
        return <MarkdownContent data={data} />;
      }
      break;
    case 'list':
      if (isListData(data)) {
        return <ListContent data={data} />;
      }
      break;
  }

  return (
    <div className="text-sm text-[#86868b] italic">
      Invalid card data for type: {type}
    </div>
  );
}
