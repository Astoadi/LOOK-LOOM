import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { login, register } from '../redux/actions/auth_actions';
import { emptyMessage } from '../redux/reducers/auth_reducers/index.js';
import { APPLE_EASE } from '../hooks/useScrollAnimations.js';
import { useTheme } from '../context/ThemeContext';
import Snackbar from '../components/snackbar';
import Spinner from '../components/spinner';

const initialForm = { first_name: '', last_name: '', gender: '', user_name: '', password: '' };
const inputBase =
  'w-full pl-9 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-400/15 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';

export default function Auth_Page() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });

  const authState = useSelector((state) => state.auth);
  const authDispatch = useDispatch();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();

  const updateForm = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  const handle_user_auth = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    closeSnackbar();

    try {
      const isReg = !isLogin;
      const action = isReg ? register(form) : login({ user_name: form.user_name, password: form.password });
      const res = await authDispatch(action);
      const isSuccess = !res.error && (res.type?.endsWith('/fulfilled') ?? false);

      if (isSuccess) {
        setSnackbar({
          show: true,
          type: 'success',
          message: res.payload?.message || (isReg ? 'Account created. Please sign in.' : 'Login successful. Redirecting...'),
        });
        if (isReg) {
          setIsLogin(true);
          setForm(initialForm);
        } else {
          setForm((prev) => ({ ...prev, password: '' }));
        }
      } else {
        setSnackbar({
          show: true,
          type: 'error',
          message: res.payload?.message || res.error?.message || (isReg ? 'Registration failed. Please check your details.' : 'Invalid credentials.'),
        });
        setForm((prev) => ({ ...prev, password: '' }));
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'A network error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (authState.loggedIn) {
      const timer = setTimeout(() => navigate('/home'), 500);
      return () => clearTimeout(timer);
    }
  }, [authState.loggedIn, navigate]);

  React.useEffect(() => {
    if (snackbar.show) {
      const timer = setTimeout(() => {
        closeSnackbar();
        authDispatch(emptyMessage());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.show, authDispatch]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#fafafa] dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200 relative">
      <Snackbar
        show={snackbar.show}
        type={snackbar.type}
        message={snackbar.message}
        onClose={closeSnackbar}
      />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 max-w-4xl mx-auto flex items-center justify-between pointer-events-none z-20">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer active:scale-95 transition-all"
        >
          <i className="fa-solid fa-arrow-left text-xs text-violet-500" />
          <span>LookLoom</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer"
        >
          {theme === 'dark' ? (
            <i className="fa-solid fa-sun text-xs text-amber-400" />
          ) : (
            <i className="fa-solid fa-moon text-xs text-zinc-600" />
          )}
        </button>
      </div>

      <Motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.45, ease: APPLE_EASE }}
        className="w-full max-w-4xl rounded-3xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#161619] flex flex-col md:flex-row shadow-[0_1px_3px_rgba(0,0,0,0.05),0_12px_32px_rgba(0,0,0,0.06)] relative z-10 mt-12 md:mt-0"
      >
        {/* Left Visual Panel */}
        <div className="relative h-48 sm:h-64 md:h-auto md:w-1/2 bg-[url('/images/photo-1513569771920-c9e1d31714af.jpeg')] bg-center bg-cover overflow-hidden flex flex-col justify-end p-6 sm:p-8 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 pointer-events-none" />

          <div className="relative z-10 text-white">
            <span className="text-[10px] tracking-widest uppercase text-violet-300 font-semibold mb-1 block">
              Wardrobe Studio
            </span>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1 text-white">
              Curate Your Signature Style.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-sm hidden sm:block">
              Combine, organize, and plan your looks seamlessly with an intelligent fashion workspace.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-10">
          <div className="w-full max-w-sm flex flex-col">
            {/* Segmented Pill Selector with Contrast Highlight */}
            <div className="relative flex p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 mb-6">
              {[
                { key: true, label: 'Sign In' },
                { key: false, label: 'Create Account' },
              ].map(({ key, label }) => (
                <button
                  key={label}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsLogin(key);
                    closeSnackbar();
                  }}
                  className={`flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-150 cursor-pointer disabled:cursor-not-allowed ${
                    isLogin === key
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Header Text */}
            <div className="text-center mb-5">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
                {isLogin ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isLogin
                  ? 'Enter your credentials to access your wardrobe sanctuary.'
                  : 'Start your journey with a personalized digital closet.'}
              </p>
            </div>

            {/* Auth Form */}
            <form className="space-y-3.5" onSubmit={handle_user_auth}>
              <AnimatePresence initial={false}>
                {!isLogin && (
                  <Motion.div
                    key="register-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: APPLE_EASE }}
                    className="space-y-3.5 overflow-hidden"
                  >
                    <div className="flex gap-2.5">
                      {[
                        { name: 'first_name', placeholder: 'First Name' },
                        { name: 'last_name', placeholder: 'Last Name' },
                      ].map(({ name, placeholder }) => (
                        <div key={name} className="w-1/2 relative">
                          <i className="fa-regular fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400" />
                          <input
                            type="text"
                            name={name}
                            disabled={isSubmitting}
                            placeholder={placeholder}
                            className={`${inputBase} pr-3.5`}
                            required
                            value={form[name]}
                            onChange={updateForm}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="relative">
                      <i className="fa-solid fa-venus-mars absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none" />
                      <select
                        name="gender"
                        disabled={isSubmitting}
                        className={`${inputBase} pr-10 appearance-none cursor-pointer`}
                        required
                        value={form.gender}
                        onChange={updateForm}
                      >
                        <option value="" className="bg-white dark:bg-zinc-900 text-zinc-500">
                          Select Gender
                        </option>
                        <option value="M" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                          Male
                        </option>
                        <option value="F" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                          Female
                        </option>
                        <option value="O" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                          Other
                        </option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none" />
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Username Input */}
              <div className="relative">
                <i className="fa-solid fa-at absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400" />
                <input
                  type="text"
                  name="user_name"
                  disabled={isSubmitting}
                  placeholder="Username"
                  className={`${inputBase} pr-3.5`}
                  required
                  value={form.user_name}
                  onChange={updateForm}
                />
              </div>

              {/* Password Input with Visibility Toggle */}
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  disabled={isSubmitting}
                  placeholder="Password"
                  className={`${inputBase} pr-11`}
                  required
                  value={form.password}
                  onChange={updateForm}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors duration-150 cursor-pointer p-1"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>

              {/* Submit CTA Button with Contrast Highlight */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-6 rounded-full font-medium text-xs sm:text-sm text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all duration-150 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-1 active:scale-95"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner size="xs" color="currentColor" />
                    <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </span>
                ) : (
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Quick Switch Link */}
            <div className="text-center mt-5 text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsLogin(!isLogin);
                    closeSnackbar();
                  }}
                  className="text-violet-600 dark:text-violet-400 font-medium ml-1.5 hover:underline cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLogin ? 'Create one' : 'Sign In'}
                </button>
              </span>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
}
