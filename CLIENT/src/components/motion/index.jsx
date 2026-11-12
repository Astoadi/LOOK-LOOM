import React from 'react';
import { motion as Motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { APPLE_EASE } from '../../hooks/useScrollAnimations.js';

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.7,
  y = 24,
  scale = 0.98,
  amount = 0.15,
  once = true,
  style,
  ...rest
}) {
  const prefersReduced = useReducedMotion();
  return (
    <Motion.div
      className={className}
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y, scale }}
      whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{
        duration: prefersReduced ? 0.2 : duration,
        delay: prefersReduced ? 0 : delay,
        ease: APPLE_EASE,
      }}
      style={{ willChange: 'transform, opacity', ...style }}
      {...rest}
    >
      {children}
    </Motion.div>
  );
}

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.08,
  delay = 0.05,
  amount = 0.1,
  once = true,
  ...rest
}) {
  const prefersReduced = useReducedMotion();
  return (
    <Motion.div
      className={className}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReduced ? 0 : stagger,
            delayChildren: prefersReduced ? 0 : delay,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      {...rest}
    >
      {children}
    </Motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  y = 24,
  scale = 0.97,
  duration = 0.6,
  style,
  ...rest
}) {
  const prefersReduced = useReducedMotion();
  return (
    <Motion.div
      className={className}
      variants={{
        hidden: prefersReduced ? { opacity: 0 } : { opacity: 0, y, scale },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: prefersReduced ? 0.2 : duration,
            ease: APPLE_EASE,
          },
        },
      }}
      style={{ willChange: 'transform, opacity', ...style }}
      {...rest}
    >
      {children}
    </Motion.div>
  );
}

export function ParallaxLayer({
  children,
  className = '',
  yRange = [-20, 20],
  scaleRange = [1, 1],
  offset = ['start end', 'end start'],
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const y = useTransform(smooth, [0, 1], prefersReduced ? [0, 0] : yRange);
  const scale = useTransform(smooth, [0, 1], prefersReduced ? [1, 1] : scaleRange);

  return (
    <Motion.div
      ref={ref}
      className={className}
      style={{ y, scale, willChange: 'transform', ...style }}
      {...rest}
    >
      {children}
    </Motion.div>
  );
}

export function ScrollProgressBar() {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 32,
    restDelta: 0.001,
  });

  if (prefersReduced) return null;

  return (
    <Motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[120] pointer-events-none bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400"
      style={{ scaleX }}
    />
  );
}

export default ScrollReveal;
