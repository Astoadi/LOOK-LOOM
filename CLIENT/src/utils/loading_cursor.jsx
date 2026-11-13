import React from 'react';

export default function LoadingCursor() {
  return (
    <div className="fixed inset-0 z-[999] min-h-screen w-full flex flex-col justify-center items-center bg-white dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 font-sans select-none overflow-hidden transition-colors duration-200">
      <div className="relative z-10 flex flex-col items-center">
        {/* Apple Luxury Double-Ring Spinner */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-black/[0.08] dark:border-white/[0.08]" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900 dark:border-t-white animate-spin"
            style={{ animationDuration: '0.85s' }}
          />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
        </div>

        {/* Minimalist Branding & Status */}
        <div className="mt-6 flex flex-col items-center gap-1">
          <span className="text-xs font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
            Look Loom
          </span>
          <span className="text-[11px] tracking-wide text-zinc-500 dark:text-zinc-400">
            Loading studio...
          </span>
        </div>
      </div>
    </div>
  );
}
