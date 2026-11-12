import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { login, register } from '../redux/actions/auth_actions';
import { emptyMessage } from '../redux/reducers/auth_reducers/index.js';
import { APPLE_EASE } from '../hooks/useScrollAnimations.js';
import Snackbar from '../components/snackbar';
import Spinner from '../components/spinner';

const initialForm = { first_name: '', last_name: '', gender: '', user_name: '', password: '' };
const inputBase = 'w-full pl-9 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.07] border border-white/[0.1] focus:border-purple-300/60 focus:ring-4 focus:ring-purple-400/15 text-sm sm:text-base text-[#f5f5f7] placeholder-[#86868b] outline-none transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed';

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
          message: res.payload?.message || (isReg ? 'Account created! Please sign in.' : 'Login successful. Redirecting...'),
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
      const timer = setTimeout(() => navigate('/home'), 650);
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
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 text-[#f5f5f7] relative overflow-x-hidden antialiased font-sans"
      style={{
        background:
          'radial-gradient(ellipse 75% 50% at 20% 0%, rgba(168, 85, 247, 0.16), transparent 60%), radial-gradient(circle at 85% 85%, rgba(216, 180, 254, 0.08), transparent 55%), linear-gradient(180deg, #060608 0%, #0a0a10 50%, #060608 100%)',
      }}
    >
      {/* Floating Apple-Grade Snackbar */}
      <Snackbar
        show={snackbar.show}
        type={snackbar.type}
        message={snackbar.message}
        onClose={closeSnackbar}
      />

      <Motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.75, ease: APPLE_EASE }}
        className="w-full max-w-5xl rounded-3xl overflow-hidden border border-white/[0.08] backdrop-blur-2xl flex flex-col md:flex-row shadow-[0_32px_80px_-20px_rgba(0,0,0,0.85),0_0_50px_rgba(168,85,247,0.1)] relative z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%), rgba(16, 16, 23, 0.82)',
        }}
      >
        {/* Left Visual Panel */}
        <div className="relative h-60 sm:h-72 md:h-auto md:w-1/2 bg-[url('/images/photo-1513569771920-c9e1d31714af.jpeg')] bg-center bg-cover overflow-hidden flex flex-col justify-between p-6 sm:p-8 border-b md:border-b-0 md:border-r border-white/[0.08]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 pointer-events-none" />

          {/* Floating Frosted Back Button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="relative z-10 self-start inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/45 hover:bg-white/15 border border-white/20 hover:border-purple-300/50 backdrop-blur-md text-xs sm:text-sm font-medium text-gray-200 hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            <span>Look Loom</span>
          </button>

          {/* Brand Statement */}
          <div className="relative z-10 mt-auto hidden sm:block">
            <span className="text-[10px] tracking-[0.2em] uppercase text-purple-300 font-semibold mb-1 block">
              Effortless Wardrobe
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
              Curate Your Signature Style.
            </h3>
            <p className="text-xs sm:text-sm text-gray-300/80 leading-relaxed max-w-sm">
              Combine, organize, and plan your looks seamlessly with an intelligent fashion workspace.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-12">
          <div className="w-full max-w-md flex flex-col">
            {/* Segmented Pill Selector */}
            <div className="relative flex p-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
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
                  className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
                    isLogin === key
                      ? 'bg-gradient-to-r from-purple-500/25 to-pink-500/20 text-white border border-purple-300/40 shadow-sm'
                      : 'text-[#86868b] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Header Text */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                {isLogin ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="text-xs sm:text-sm text-[#86868b]">
                {isLogin
                  ? 'Enter your credentials to access your wardrobe sanctuary.'
                  : 'Start your journey with a personalized digital closet.'}
              </p>
            </div>

            {/* Auth Form */}
            <form className="space-y-4" onSubmit={handle_user_auth}>
              <AnimatePresence initial={false}>
                {!isLogin && (
                  <Motion.div
                    key="register-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: APPLE_EASE }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="flex gap-3">
                      {[
                        { name: 'first_name', placeholder: 'First Name' },
                        { name: 'last_name', placeholder: 'Last Name' },
                      ].map(({ name, placeholder }) => (
                        <div key={name} className="w-1/2 relative">
                          <i className="fa-regular fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#86868b]" />
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
                      <i className="fa-solid fa-venus-mars absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#86868b] pointer-events-none" />
                      <select
                        name="gender"
                        disabled={isSubmitting}
                        className={`${inputBase} pr-10 appearance-none cursor-pointer`}
                        required
                        value={form.gender}
                        onChange={updateForm}
                      >
                        <option value="" className="bg-[#14141c] text-gray-400">
                          Select Gender
                        </option>
                        <option value="M" className="bg-[#14141c] text-white">
                          Male
                        </option>
                        <option value="F" className="bg-[#14141c] text-white">
                          Female
                        </option>
                        <option value="O" className="bg-[#14141c] text-white">
                          Other
                        </option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#86868b] pointer-events-none" />
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Username Input */}
              <div className="relative">
                <i className="fa-solid fa-at absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#86868b]" />
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
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#86868b]" />
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#86868b] hover:text-white transition-colors duration-200 cursor-pointer p-1"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>

              {/* Submit CTA Button */}
              <Motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={prefersReducedMotion || isSubmitting ? undefined : { scale: 1.01 }}
                whileTap={prefersReducedMotion || isSubmitting ? undefined : { scale: 0.99 }}
                transition={{ duration: 0.2 }}
                className="w-full py-3.5 px-6 rounded-full font-semibold text-sm sm:text-base tracking-tight text-[#120924] border border-white/80 shadow-[0_4px_22px_rgba(192,132,252,0.32),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_8px_30px_rgba(192,132,252,0.48),inset_0_1px_0_#ffffff] transition-all duration-300 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
                style={{
                  background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 42%, #d8b4fe 100%)',
                }}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2.5">
                    <Spinner size="sm" color="text-[#120924]" />
                    <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </span>
                ) : (
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </Motion.button>
            </form>

            {/* Quick Switch Link */}
            <div className="text-center mt-6 text-xs sm:text-sm text-[#86868b]">
              <span>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsLogin(!isLogin);
                    closeSnackbar();
                  }}
                  className="text-purple-300 hover:text-purple-200 font-medium ml-1.5 transition-colors duration-200 hover:underline cursor-pointer disabled:cursor-not-allowed"
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
