import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Auth_Guard from '../utils/auth_guard';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import Snackbar from '../components/snackbar';
import Spinner from '../components/spinner';
import { ScrollReveal } from '../components/motion/index.jsx';
import {
  ChangePublicVisibilityToPrivate,
  ChangePublicVisibilityToPublic,
  getProfile,
} from '../redux/actions/profile';

function MyProfile() {
  const profileSelector = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = React.useState(null);
  const [visibility, setVisibility] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [isChangingVisibility, setIsChangingVisibility] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  // Fetch own profile
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        await dispatch(getProfile());
      } catch (e) {
        console.error('Error fetching profile:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [dispatch]);

  // Sync Redux profile
  React.useEffect(() => {
    if (profileSelector.user_profile) {
      setUserProfile(profileSelector.user_profile);
      setVisibility(Boolean(profileSelector.user_profile?.profile?.is_public));
    }
  }, [profileSelector.user_profile]);

  const handleToggleVisibility = async () => {
    if (isChangingVisibility) return;

    try {
      setIsChangingVisibility(true);
      closeSnackbar();
      const targetPublic = !visibility;
      const action = targetPublic
        ? ChangePublicVisibilityToPublic()
        : ChangePublicVisibilityToPrivate();
      const res = await dispatch(action);

      if (!res.error) {
        setVisibility(targetPublic);
        setSnackbar({
          show: true,
          type: 'success',
          message: targetPublic
            ? 'Profile visibility updated to Public.'
            : 'Profile visibility updated to Private.',
        });
        await dispatch(getProfile());
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to update visibility.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsChangingVisibility(false);
    }
  };

  const avatarSrc =
    userProfile?.profile?.gender === 'M'
      ? '/images/male-avatar.jpg'
      : userProfile?.profile?.gender === 'F'
      ? '/images/female-avatar.jpg'
      : userProfile?.profile?.gender === 'O'
      ? '/images/other-avatar.png'
      : '/images/male-avatar.jpg';

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 font-sans flex flex-col justify-between transition-colors duration-200">
      <Snackbar
        show={snackbar.show}
        type={snackbar.type}
        message={snackbar.message}
        onClose={closeSnackbar}
      />

      <div>
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-6 sm:gap-8">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="text-violet-600 dark:text-violet-400" label="Loading profile studio..." />
            </div>
          ) : userProfile?.profile ? (
            <>
              {/* Profile Hero Bento Card with Pastel Lavender Gradient */}
              <ScrollReveal y={16} duration={0.4}>
                <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-violet-500/[0.08] via-white to-white dark:from-violet-500/[0.12] dark:via-[#161619] dark:to-[#161619] border border-violet-200/70 dark:border-violet-900/40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
                  {/* Avatar */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-violet-300 dark:border-violet-700 p-1 flex-shrink-0 bg-violet-50 dark:bg-violet-950/40 shadow-sm">
                    <img
                      src={avatarSrc}
                      alt={userProfile?.profile?.user_name || 'Profile Avatar'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2 min-w-0">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                        @{userProfile.profile.user_name}
                      </h1>

                      {/* Visibility Pill Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium border select-none ${
                          visibility
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            visibility ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                          }`}
                        />
                        <span>{visibility ? 'Public Profile' : 'Private Profile'}</span>
                      </span>
                    </div>

                    <p className="text-base text-zinc-700 dark:text-zinc-300 font-medium">
                      {userProfile.profile.first_name} {userProfile.profile.last_name}
                    </p>

                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg mt-0.5">
                      Member of LookLoom wardrobe studio since{' '}
                      {userProfile.profile.created_at
                        ? new Date(userProfile.profile.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'recently'}
                      .
                    </p>

                    {/* Quick Navigation Pills with Pastel Accents */}
                    <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/outfits')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-violet-700 dark:text-violet-300 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 border border-violet-200/80 dark:border-violet-800/50 transition-all cursor-pointer active:scale-95 shadow-sm"
                      >
                        <i className="fa-solid fa-shirt text-xs" />
                        <span>Outfits</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/dresses')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-800/50 transition-all cursor-pointer active:scale-95 shadow-sm"
                      >
                        <i className="fa-solid fa-layer-group text-xs" />
                        <span>Dresses</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/connections')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/50 transition-all cursor-pointer active:scale-95 shadow-sm"
                      >
                        <i className="fa-solid fa-user-group text-xs" />
                        <span>Friends</span>
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Stats Bento Tiles with Distinct Pastel Washes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {/* Outfits Count Tile with Pastel Lavender Gradient */}
                <ScrollReveal y={16} delay={0.05} duration={0.4}>
                  <div
                    onClick={() => navigate('/outfits')}
                    className="group rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-violet-500/[0.07] via-white to-white dark:from-violet-500/[0.12] dark:via-[#161619] dark:to-[#161619] border border-violet-200/70 dark:border-violet-900/40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-300 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                        <i className="fa-solid fa-shirt text-lg" />
                      </div>
                      <span className="text-xs text-violet-600 dark:text-violet-400 group-hover:underline transition-colors flex items-center gap-1 font-medium">
                        <span>View All</span>
                        <i className="fa-solid fa-arrow-right text-[10px]" />
                      </span>
                    </div>

                    <div>
                      <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {userProfile.totalOutfits?.count ?? 0}
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Cataloged wardrobe outfits
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Dresses Count Tile with Pastel Rose Gradient */}
                <ScrollReveal y={16} delay={0.08} duration={0.4}>
                  <div
                    onClick={() => navigate('/dresses')}
                    className="group rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-rose-500/[0.07] via-white to-white dark:from-rose-500/[0.12] dark:via-[#161619] dark:to-[#161619] border border-rose-200/70 dark:border-rose-900/40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-300 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                        <i className="fa-solid fa-layer-group text-lg" />
                      </div>
                      <span className="text-xs text-rose-600 dark:text-rose-400 group-hover:underline transition-colors flex items-center gap-1 font-medium">
                        <span>View All</span>
                        <i className="fa-solid fa-arrow-right text-[10px]" />
                      </span>
                    </div>

                    <div>
                      <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {userProfile.totalDresses?.count ?? 0}
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Curated dress collections
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Privacy & Visibility Studio Card */}
              <ScrollReveal y={16} delay={0.1} duration={0.4}>
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors ${
                    visibility
                      ? 'bg-gradient-to-br from-emerald-500/[0.06] via-white to-white dark:from-emerald-500/[0.1] dark:via-[#161619] dark:to-[#161619] border-emerald-200/70 dark:border-emerald-900/40'
                      : 'bg-gradient-to-br from-amber-500/[0.06] via-white to-white dark:from-amber-500/[0.1] dark:via-[#161619] dark:to-[#161619] border-amber-200/70 dark:border-amber-900/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                        visibility
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200/80 text-emerald-600 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 border-amber-200/80 text-amber-600 dark:text-amber-300'
                      }`}
                    >
                      <i className="fa-solid fa-shield-halved text-base" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-base sm:text-lg font-medium text-zinc-900 dark:text-zinc-100">
                        Wardrobe Visibility
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed">
                        {visibility
                          ? 'Your wardrobe is currently Public. Friends and fellow style curators can view your cataloged looks and dress collections.'
                          : 'Your wardrobe is currently Private. Only you can view your pieces, outfits, and scheduled looks.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isChangingVisibility}
                    onClick={handleToggleVisibility}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95 disabled:opacity-50 select-none shadow-sm flex-shrink-0 ${
                      visibility
                        ? 'text-amber-800 dark:text-amber-200 bg-amber-100/80 hover:bg-amber-200/80 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-300/80 dark:border-amber-800/60'
                        : 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    }`}
                  >
                    {isChangingVisibility ? (
                      <>
                        <Spinner size="xs" color="currentColor" />
                        <span>Updating visibility...</span>
                      </>
                    ) : visibility ? (
                      <>
                        <i className="fa-solid fa-lock text-xs" />
                        <span>Make Private</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-globe text-xs" />
                        <span>Make Public</span>
                      </>
                    )}
                  </button>
                </div>
              </ScrollReveal>
            </>
          ) : (
            <div className="rounded-3xl p-12 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center justify-center text-center gap-3">
              <i className="fa-solid fa-user-xmark text-3xl text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300">
                Unable to load user profile
              </p>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="mt-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

const ProtectedMyProfile = Auth_Guard(MyProfile);
export default ProtectedMyProfile;
