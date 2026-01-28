import { useState } from 'react';

const isSecure = !!window.__CLAWDBOT_CANVAS_TOKEN;

export function SecurityBadge() {
  const [open, setOpen] = useState(false);

  if (isSecure) {
    return (
      <div className="inline-flex items-center gap-1 text-[#86868b]" title="Authenticated">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="10" height="7" rx="1.5" />
          <path d="M5 7V5a3 3 0 0 1 6 0v2" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative inline-flex">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[#FF9500] hover:text-[#E08600] transition-colors"
        title="Unsecured — click for info"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="10" height="7" rx="1.5" />
          <path d="M5 7V5a3 3 0 0 1 6 0" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-6 z-50 w-72 rounded-xl bg-white shadow-lg border border-[#e5e5ea] p-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#FF9500]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" />
                  <path d="M5 7V5a3 3 0 0 1 6 0" />
                </svg>
              </span>
              <span className="text-sm font-semibold text-[#1d1d1f]">API is unsecured</span>
            </div>
            <p className="text-xs text-[#86868b] leading-relaxed mb-3">
              No authentication token is configured. Anyone with network access can read and modify your cards.
            </p>
            <div className="bg-[#f5f5f7] rounded-lg p-3">
              <p className="text-xs font-medium text-[#1d1d1f] mb-1">To secure it:</p>
              <code className="text-[11px] text-[#86868b] block leading-relaxed">
                CLAWDBOT_CANVAS_TOKEN=secret npm run dev
              </code>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
