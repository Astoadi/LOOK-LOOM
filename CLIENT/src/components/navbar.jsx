import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../redux/actions/auth_actions';

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

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/auth', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl backdrop-saturate-150 bg-[#07070b]/80 border-b border-white/[0.08] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[4.25rem] flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 shadow-[0_0_8px_rgba(192,132,252,0.6)] group-hover:scale-125 transition-transform duration-300" />
          <span className="text-xl sm:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300 group-hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.35)] transition-all duration-300">
            Look Loom
          </span>
        </div>

        {/* Navigation Pills */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === '/home'
                ? location.pathname === '/home'
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-tight cursor-pointer transition-all duration-200 select-none whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-white/[0.12] border border-purple-300/35 shadow-[0_2px_12px_rgba(168,85,247,0.2)]'
                    : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                <i className={`${item.icon} text-xs sm:text-sm opacity-90`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Action */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-red-300/90 hover:text-red-100 bg-red-500/[0.08] hover:bg-red-500/[0.18] border border-red-500/20 hover:border-red-400/40 transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-95"
          title="Sign out"
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
