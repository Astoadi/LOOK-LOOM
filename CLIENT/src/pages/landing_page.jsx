import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'motion/react';
import Footer from '../components/footer';
import { useTheme } from '../context/ThemeContext';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '../components/motion/index.jsx';
import { APPLE_EASE, useParallaxTransform } from '../hooks/useScrollAnimations.js';
import { isLoggedIn, logout } from '../redux/actions/auth_actions';

const FEATURES = [
  {
    icon: 'fa-shirt',
    heading: 'Outfit Cataloging',
    body: 'Photograph and catalog every piece in your wardrobe with instant search and clean tags.',
    badgeClass: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/60',
  },
  {
    icon: 'fa-layer-group',
    heading: 'Curated Categories',
    body: 'Combine individual garments into complete ensembles ready for daily rotation.',
    badgeClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
  },
  {
    icon: 'fa-calendar-check',
    heading: 'Event Planning',
    body: 'Schedule target looks ahead for dinners, travel, meetings, and important occasions.',
    badgeClass: 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60',
  },
  {
    icon: 'fa-heart',
    heading: 'Favorites & Quick Access',
    body: 'Bookmark go-to looks for fast access whenever you need instant outfit inspiration.',
    badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
  },
  {
    icon: 'fa-soap',
    heading: 'Laundry Tracking',
    body: 'Track wearable cleanliness with one-tap statuses so you always know what is clean.',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
  },
  {
    icon: 'fa-user-group',
    heading: 'Community Style',
    body: 'Connect with fellow style curators to share inspiration and explore public wardrobes.',
    badgeClass: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
  },
];

export default function Landing_Page() {
  const authState = useSelector((state) => state.auth);
  const authDispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const heroRef = React.useRef(null);
  const { y: heroY, scale: heroScale, opacity: heroOpacity, prefersReducedMotion } = useParallaxTransform(heroRef, {
    yRange: [0, 48],
    scaleRange: [1, 0.97],
    opacityRange: [1, 0.25],
  });

  React.useEffect(() => {
    authDispatch(isLoggedIn());
  }, [authDispatch]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 font-sans flex flex-col justify-between transition-colors duration-200">
      {/* Frosted Glass Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-[#fafafa]/80 dark:bg-[#0c0c0e]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/60 text-violet-600 dark:text-violet-300 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 shadow-sm">
              <i className="fa-solid fa-shirt" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
              LookLoom
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 bg-zinc-100/80 hover:bg-amber-50 dark:bg-zinc-800/60 dark:hover:bg-amber-950/30 border border-zinc-200/80 dark:border-zinc-700/80 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <i className="fa-solid fa-sun text-xs text-amber-400" />
              ) : (
                <i className="fa-solid fa-moon text-xs text-zinc-600" />
              )}
            </button>

            {!authState.loggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer active:scale-95"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer active:scale-95"
                >
                  Enter Studio
                </button>
                <button
                  type="button"
                  onClick={() => authDispatch(logout())}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1">
        {/* Apple Keynote Hero */}
        <section
          ref={heroRef}
          className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 flex flex-col items-center justify-center text-center max-w-4xl mx-auto"
        >
          <Motion.div
            style={{ y: heroY, scale: heroScale, opacity: heroOpacity, willChange: 'transform, opacity' }}
            className="flex flex-col items-center gap-6"
          >
            <ScrollReveal y={16} duration={0.6}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/60 mb-2 shadow-sm">
                <i className="fa-solid fa-sparkles text-[10px]" />
                <span>Intelligent Wardrobe Management</span>
              </div>
            </ScrollReveal>

            <ScrollReveal y={20} duration={0.65} delay={0.05}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1]">
                Curate your wardrobe.
                <br />
                <span className="text-violet-600 dark:text-violet-400">Effortlessly.</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal y={18} duration={0.65} delay={0.1}>
              <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                LookLoom brings precision, pastel vibrance, and clarity to your daily style. Catalog every garment, combine
                ensembles, and schedule looks for upcoming occasions.
              </p>
            </ScrollReveal>

            <ScrollReveal y={16} duration={0.6} delay={0.15}>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Motion.button
                  onClick={() => navigate(authState.loggedIn ? '/home' : '/auth')}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.2, ease: APPLE_EASE }}
                  className="px-6 py-3 rounded-full text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/25 transition-all cursor-pointer"
                >
                  {authState.loggedIn ? 'Enter Studio Dashboard' : 'Start Curating Free'}
                </Motion.button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('features-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer shadow-sm"
                >
                  Explore Capabilities
                </button>
              </div>
            </ScrollReveal>
          </Motion.div>
        </section>

        {/* Bento Grid Feature Showcase with Pastel Cards */}
        <section
          id="features-section"
          className="border-t border-black/[0.06] dark:border-white/[0.08] py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Engineered for seamless rotation
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Everything you need to organize your closet and master your personal presentation.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" stagger={0.06} delay={0.05}>
            {FEATURES.map((item, index) => (
              <StaggerItem
                key={index}
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.25, ease: APPLE_EASE }}
                className="rounded-3xl p-6 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4"
              >
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-sm ${item.badgeClass}`}>
                  <i className={`fa-solid ${item.icon} text-sm`} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 mb-1">
                    {item.heading}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </main>

      <Footer />
    </div>
  );
}
