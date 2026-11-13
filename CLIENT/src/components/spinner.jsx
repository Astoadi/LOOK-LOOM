import React from 'react';

const SIZES = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export default function Spinner({
  size = 'md',
  className = '',
  color = 'text-zinc-900 dark:text-zinc-100',
  label,
}) {
  const sizeClass = SIZES[size] || size;

  return (
    <div className="inline-flex items-center gap-2.5">
      <svg
        className={`animate-spin ${sizeClass} ${color} ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v2.8a5.2 5.2 0 00-5.2 5.2H4z"
        />
      </svg>
      {label && <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">{label}</span>}
    </div>
  );
}
