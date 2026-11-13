import React from 'react';

export default function MovingDots({ className = '', size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <div className={`inline-flex items-center gap-1.5 py-1 ${className}`} aria-label="Loading">
      <span
        className={`${sizeClass} rounded-full bg-zinc-800 dark:bg-zinc-200 animate-pulse [animation-duration:1s] [animation-delay:0ms]`}
      />
      <span
        className={`${sizeClass} rounded-full bg-zinc-800 dark:bg-zinc-200 animate-pulse [animation-duration:1s] [animation-delay:200ms]`}
      />
      <span
        className={`${sizeClass} rounded-full bg-zinc-800 dark:bg-zinc-200 animate-pulse [animation-duration:1s] [animation-delay:400ms]`}
      />
    </div>
  );
}
