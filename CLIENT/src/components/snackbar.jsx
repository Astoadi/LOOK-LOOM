import React from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { APPLE_EASE } from '../hooks/useScrollAnimations.js';

const typeConfig = {
  success: {
    wrapper: 'bg-[#0f1d19]/90 border-emerald-400/40 text-emerald-100 shadow-[0_12px_36px_rgba(16,185,129,0.25)]',
    icon: 'fa-solid fa-circle-check text-emerald-400',
  },
  error: {
    wrapper: 'bg-[#220f14]/90 border-rose-400/40 text-rose-100 shadow-[0_12px_36px_rgba(244,63,94,0.25)]',
    icon: 'fa-solid fa-circle-exclamation text-rose-400',
  },
  warning: {
    wrapper: 'bg-[#22180a]/90 border-amber-400/40 text-amber-100 shadow-[0_12px_36px_rgba(251,191,36,0.25)]',
    icon: 'fa-solid fa-triangle-exclamation text-amber-400',
  },
  info: {
    wrapper: 'bg-[#141226]/90 border-purple-400/40 text-purple-100 shadow-[0_12px_36px_rgba(168,85,247,0.25)]',
    icon: 'fa-solid fa-circle-info text-purple-400',
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
          className={`fixed top-5 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-md z-[200] flex items-center justify-between gap-3 px-4 py-3 rounded-2xl backdrop-blur-2xl border text-xs sm:text-sm font-medium shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)] ${config.wrapper}`}
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
              className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          )}
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
