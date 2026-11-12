import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'motion/react';
import Footer from '../components/footer';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  ParallaxLayer,
} from '../components/motion/index.jsx';
import { APPLE_EASE, useParallaxTransform } from '../hooks/useScrollAnimations.js';
import { isLoggedIn, logout } from '../redux/actions/auth_actions';

const FEATURES = [
  { heading: 'Outfit Posting', body: 'Upload your daily outfits and keep track of your style journey.' },
  { heading: 'Mix & Match', body: 'Combine individual pieces to create stunning outfits for any occasion.' },
  { heading: 'Event Planning', body: 'Plan and schedule your looks ahead of events, trips, or important days.' },
  { heading: 'Favorites & Search', body: 'Mark your favorite outfits and search instantly through your wardrobe.' },
  { heading: 'Smart Modifications', body: 'Edit and manage your wardrobe on the go with intelligent outfit tools.' },
  { heading: 'Community Inspired', body: 'Share, explore and get inspired by others outfit ideas and styles.' },
];

export default function Landing_Page() {
  const authState = useSelector((state) => state.auth);
  const authDispatch = useDispatch();
  const navigate = useNavigate();

  const heroRef = React.useRef(null);
  const { y: heroY, scale: heroScale, opacity: heroOpacity, prefersReducedMotion } = useParallaxTransform(heroRef, {
    yRange: [0, 72],
    scaleRange: [1, 0.95],
    opacityRange: [1, 0.15],
  });

  React.useEffect(() => {
    authDispatch(isLoggedIn());
  }, [authDispatch]);

  return (
    <div className="landing_page_container text-white">
      {/* Frosted Glass Navigation Bar */}
      <div className="landing_page_navbar bg-black sticky top-0 z-50 min-h-[6rem] md:h-[5rem] w-full flex justify-between items-center px-6">
        <div className="text-xl md:text-4xl font-bold">Look Loom</div>
        <div className="flex items-center gap-3 text-nowrap">
          {!authState.loggedIn ? (
            <>
              <div onClick={() => navigate('/auth')} className="login_btn cursor-pointer">
                <i className="fa-solid fa-arrow-right-to-bracket" /> LOGIN
              </div>
              <div onClick={() => navigate('/auth')} className="sign_up cursor-pointer">
                <i className="fa-solid fa-user-plus" /> SIGN UP
              </div>
            </>
          ) : (
            <div onClick={() => authDispatch(logout())} className="logout cursor-pointer">
              <i className="fa-solid fa-arrow-right-from-bracket" /> LOGOUT
            </div>
          )}
        </div>
      </div>

      <div className="main_body">
        {/* Keynote-Style Hero Section */}
        <div ref={heroRef} className="hero_container text-center flex items-center justify-center h-screen w-full bg-gradient-to-r from-gray-900 to-black font-sans px-4">
          <Motion.div
            style={{ y: heroY, scale: heroScale, opacity: heroOpacity, willChange: 'transform, opacity' }}
            className="flex flex-col justify-center items-center w-full max-w-4xl gap-6"
          >
            <ScrollReveal y={24} scale={0.98} duration={0.85} delay={0} amount={0.1}>
              <div className="hero_heading text-4xl md:text-6xl font-[800] bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Simplify Your Style with Look Loom
              </div>
            </ScrollReveal>

            <ScrollReveal y={20} scale={1} duration={0.85} delay={0.12} amount={0.1}>
              <div className="hero_para text-sm md:text-xl text-gray-300">
                Tired of spending hours searching for the perfect outfit? Look Loom is your ultimate
                outfit planning partner. Create, combine, and organize your wardrobe effortlessly.
                Plan your looks for events, save favorites, and enjoy total control over your fashion game.
              </div>
            </ScrollReveal>

            <ScrollReveal y={18} scale={0.98} duration={0.8} delay={0.24} amount={0.1}>
              <Motion.button
                onClick={() => navigate('/home')}
                whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.25, ease: APPLE_EASE }}
                className="bg-purple-400 text-black text-lg px-10 py-4 rounded-md hover:bg-purple-500 transition"
              >
                Get Started
              </Motion.button>
            </ScrollReveal>
          </Motion.div>
        </div>

        {/* Bento Grid Feature Showcase */}
        <div className="hero_lower_container relative z-10 bg-[#232323] py-20 px-15">
          <ParallaxLayer yRange={[14, -14]} className="text-4xl font-[700] text-center">
            <ScrollReveal y={26} scale={0.98} duration={0.75}>
              Features You'll Love
            </ScrollReveal>
          </ParallaxLayer>

          <StaggerContainer className="flex justify-center flex-wrap text-center gap-6 pt-10" stagger={0.09} delay={0.05}>
            {FEATURES.map((card, index) => (
              <StaggerItem
                key={index}
                whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                transition={{ duration: 0.35, ease: APPLE_EASE }}
                className="card p-6 bg-zinc-900 h-auto rounded-xl w-4/5 sm:w-[45%] md:w-[30%]"
              >
                <div className="cardHead text-purple-400 text-xl font-base">{card.heading}</div>
                <div className="card_body text-gray-400">{card.body}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <Footer />
      </div>
    </div>
  );
}
