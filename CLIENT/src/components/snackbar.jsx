import React from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { APPLE_EASE } from '../hooks/useScrollAnimations.js';

const typeConfig = {
  success: {
    wrapper: 'bg-emerald-50/95 dark:bg-[#0f1d19]/95 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-100 shadow-[0_8px_24px_rgba(16,185,129,0.15)]',
    icon: 'fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400',
    close: 'text-emerald-700/70 hover:text-emerald-950 hover:bg-emerald-100/60 dark:text-emerald-200/60 dark:hover:text-emerald-100 dark:hover:bg-white/10',
  },
  error: {
    wrapper: 'bg-rose-50/95 dark:bg-[#220f14]/95 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-100 shadow-[0_8px_24px_rgba(244,63,94,0.15)]',
    icon: 'fa-solid fa-circle-exclamation text-rose-600 dark:text-rose-400',
    close: 'text-rose-700/70 hover:text-rose-950 hover:bg-rose-100/60 dark:text-rose-200/60 dark:hover:text-rose-100 dark:hover:bg-white/10',
  },
  warning: {
    wrapper: 'bg-amber-50/95 dark:bg-[#22180a]/95 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-100 shadow-[0_8px_24px_rgba(251,191,36,0.15)]',
    icon: 'fa-solid fa-triangle-exclamation text-amber-600 dark:text-amber-400',
    close: 'text-amber-700/70 hover:text-amber-950 hover:bg-amber-100/60 dark:text-amber-200/60 dark:hover:text-amber-100 dark:hover:bg-white/10',
  },
  info: {
    wrapper: 'bg-violet-50/95 dark:bg-[#18181b]/95 border-violet-200 dark:border-violet-700/40 text-violet-900 dark:text-violet-100 shadow-[0_8px_24px_rgba(139,92,246,0.15)]',
    icon: 'fa-solid fa-circle-info text-violet-600 dark:text-violet-400',
    close: 'text-violet-700/70 hover:text-violet-950 hover:bg-violet-100/60 dark:text-violet-200/60 dark:hover:text-violet-100 dark:hover:bg-white/10',
  },
};

export default function Snackbar({
  show = false,
  type = 'success',
  message = '',
  onClose,
  duration = 3500,
}) {
  React.useEffect(() => {
    if (show && duration > 0 && onClose) {
      const timer = setTimeout(() => onClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const config = typeConfig[type] || typeConfig.info;

  return (
    <AnimatePresence>
      {show && message && (
        <Motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.28, ease: APPLE_EASE }}
          className={`fixed top-5 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-md z-[200] flex items-center justify-between gap-3 px-4 py-3 rounded-2xl backdrop-blur-2xl border text-xs sm:text-sm font-medium shadow-xl ${config.wrapper}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <i className={`text-sm shrink-0 ${config.icon}`} />
            <span className="truncate">{message}</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notification"
              className={`p-1 rounded-full transition-colors shrink-0 cursor-pointer ${config.close}`}
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          )}
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
