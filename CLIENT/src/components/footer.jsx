import React from 'react';
import { ScrollReveal } from './motion/index.jsx';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#0c0c0e] border-t border-black/[0.06] dark:border-white/[0.07] text-zinc-500 dark:text-zinc-500 text-xs sm:text-sm py-8 px-6 text-center font-sans tracking-wide select-none transition-colors duration-200">
      <ScrollReveal y={10} scale={1} duration={0.4} amount={0.2}>
        <span>&copy; {new Date().getFullYear()} Look Loom. All rights reserved.</span>
      </ScrollReveal>
    </footer>
  );
}
