import React from 'react'
import { ScrollReveal } from './motion/index.jsx'

export default function Footer() {
  return (
    <div className='footer h-auto w-full bg-black text-gray-600 p-6 text-center'>
      <ScrollReveal y={14} scale={1} duration={0.6} amount={0.2}>
        &copy; 2025 Loom Loom. Thanks for visiting
      </ScrollReveal>
    </div>
  )
}
