import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../redux/actions/auth_actions';
import { useTheme } from '../context/ThemeContext.jsx';

const NAV_ITEMS = [
  { path: '/home', label: 'Dashboard', icon: 'fa-solid fa-table-cells-large' },
  { path: '/outfits', label: 'Outfits', icon: 'fa-solid fa-shirt' },
  { path: '/dresses', label: 'Dresses', icon: 'fa-solid fa-layer-group' },
  { path: '/future_plans', label: 'Plans', icon: 'fa-regular fa-calendar' },
  { path: '/connections', label: 'Friends', icon: 'fa-solid fa-user-group' },
  { path: '/myProfile', label: 'Profile', icon: 'fa-regular fa-user' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/auth', { replace: true });
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-[#0c0c0e]/80 border-b border-black/[0.06] dark:border-white/[0.07] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand with Pastel Accent Badge */}
        <div
          onClick={() => handleNavClick('/home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/60 text-violet-600 dark:text-violet-300 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 shadow-sm">
            <i className="fa-solid fa-shirt" />
          </div>
          <span className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            LookLoom
          </span>
        </div>

        {/* Desktop Navigation Links with Contrast Active & Pastel Hover */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === '/home'
                ? location.pathname === '/home'
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavClick(item.path)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-tight cursor-pointer transition-all duration-150 select-none ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30'
                }`}
              >
                <i className={`${item.icon} text-xs opacity-90`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle, Logout, Mobile Menu Trigger */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button with Pastel Accent */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 bg-zinc-100/80 hover:bg-amber-50 dark:bg-zinc-800/60 dark:hover:bg-amber-950/30 border border-zinc-200/80 dark:border-zinc-700/80 transition-colors cursor-pointer"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <i className="fa-solid fa-sun text-xs text-amber-400" />
            ) : (
              <i className="fa-solid fa-moon text-xs text-zinc-600" />
            )}
          </button>

          {/* Desktop Logout Button with Pastel Rose Accent */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 bg-zinc-100/80 hover:bg-rose-50 dark:bg-zinc-800/60 dark:hover:bg-rose-950/30 border border-zinc-200/80 dark:border-zinc-700/80 transition-colors cursor-pointer select-none"
            title="Sign out"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
            <span>Logout</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-sm`} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/[0.06] dark:border-white/[0.07] bg-white dark:bg-[#0c0c0e] px-4 pt-3 pb-5 shadow-lg flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === '/home'
                ? location.pathname === '/home'
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium tracking-tight transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-300'
                }`}
              >
                <i className={`${item.icon} text-sm w-5 text-center`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 mt-2 border-t border-black/[0.06] dark:border-white/[0.07] flex items-center justify-between">
            <span className="text-xs text-zinc-500">Theme</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              {isDark ? (
                <>
                  <i className="fa-solid fa-sun text-xs text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-moon text-xs text-zinc-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
