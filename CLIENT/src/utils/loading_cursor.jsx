import React from 'react';

export default function LoadingCursor() {
  return (
    <div className="fixed inset-0 z-[999] min-h-screen w-full flex flex-col justify-center items-center bg-[#060608] text-[#f5f5f7] font-sans select-none overflow-hidden">
      {/* Ambient Radial Glow */}
      <div className="pointer-events-none absolute w-[500px] max-w-[90vw] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute w-[300px] h-[300px] bg-pink-600/5 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Apple Luxury Double-Ring Spinner */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          {/* Faint Track Ring */}
          <div className="absolute inset-0 rounded-full border border-white/[0.08]" />

          {/* Glowing Silk Gradient Spinning Arc */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400 border-r-pink-400/70 animate-spin"
            style={{
              animationDuration: '0.9s',
              filter: 'drop-shadow(0 0 10px rgba(192, 132, 252, 0.45))',
            }}
          />

          {/* Center Luminous Gem */}
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-purple-300 via-pink-300 to-pink-400 shadow-[0_0_12px_rgba(192,132,252,0.7)] animate-pulse" />
        </div>

        {/* Minimalist Branding & Status */}
        <div className="mt-7 flex flex-col items-center gap-1.5">
          <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300 uppercase">
            Look Loom
          </span>
          <span className="text-[11px] tracking-wide text-[#86868b]">
            Verifying your session...
          </span>
        </div>
      </div>
    </div>
  );
}
