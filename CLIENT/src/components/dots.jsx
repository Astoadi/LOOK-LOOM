import React from 'react';

export default function MovingDots() {
  return (
    <div className="flex gap-2 text-white text-4xl font-bold">
      <span className="animate-bounce [animation-delay:0s]">.</span>
      <span className="animate-bounce [animation-delay:0.2s]">.</span>
      <span className="animate-bounce [animation-delay:0.4s]">.</span>
    </div>
  );
}
