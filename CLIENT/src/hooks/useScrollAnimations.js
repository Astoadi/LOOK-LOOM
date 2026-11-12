import { useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

export const APPLE_EASE = [0.16, 1, 0.3, 1];

export function useParallaxTransform(
  targetRef,
  {
    offset = ['start start', 'end start'],
    yRange = [0, 72],
    scaleRange = [1, 0.95],
    opacityRange = [1, 0.15],
  } = {}
) {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: targetRef, offset });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const y = useTransform(smooth, [0, 1], prefersReduced ? [0, 0] : yRange);
  const scale = useTransform(smooth, [0, 1], prefersReduced ? [1, 1] : scaleRange);
  const opacity = useTransform(smooth, [0, 1], prefersReduced ? [1, 1] : opacityRange);
  return { scrollYProgress: smooth, y, scale, opacity, prefersReducedMotion: prefersReduced };
}
