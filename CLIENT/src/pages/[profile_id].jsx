import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  addFriend,
  checkPendingStatusOfOtherProfile,
  getFriendorOtherProfile,
} from '../redux/actions/connection';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import Snackbar from '../components/snackbar';
import Spinner from '../components/spinner';
import { ScrollReveal } from '../components/motion/index.jsx';

function LazyOutfitImage({ src, alt, onClick }) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-violet-100/40 via-zinc-100 to-violet-100/40 dark:from-violet-950/20 dark:via-zinc-800/40 dark:to-violet-950/20 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        className={`h-full w-full object-cover group-hover:scale-105 transition-all duration-500 cursor-pointer ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
        }`}
      />
    </div>
  );
}

export default function ProfileId() {
  const { pId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const connSelector = useSelector((state) => state.connection);

  const [clickedPending, setClickedPending] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [userProfile, setUserProfile] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  // Fetch target profile
  React.useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        await dispatch(getFriendorOtherProfile({ pId })).unwrap();
      } catch {
        setMessage('Unable to load profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [dispatch, pId]);

  // Check pending status
  React.useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await dispatch(checkPendingStatusOfOtherProfile({ pId })).unwrap();
        setClickedPending(Boolean(res?.status));
      } catch (e) {
        console.error(e);
      }
    }
    fetchStatus();
  }, [dispatch, pId]);

  // Sync profile data
  React.useEffect(() => {
    if (connSelector.otherPersonProfile?.length > 0) {
      setUserProfile(connSelector.otherPersonProfile);
      setMessage('');
    } else {
      setUserProfile([]);
      setMessage('Profile is locked or private. Connect to view curated looks.');
    }
  }, [connSelector.otherPersonProfile]);

  // Handle Follow / Connect
  const handleFollow = async () => {
    if (isFollowing || clickedPending) return;

    try {
      setIsFollowing(true);
      closeSnackbar();
      const res = await dispatch(addFriend({ connection_id: Number(pId) }));
      if (!res.error) {
        setClickedPending(true);
        setSnackbar({ show: true, type: 'success', message: 'Connection request sent.' });
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to send request.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'Failed to connect. Please try again.' });
    } finally {
      setIsFollowing(false);
    }
  };

  const profileData = userProfile[0]?.ProfileDetails;
  const isFriend = userProfile[0]?.isFriend;
  const todayDressName = userProfile[0]?.TodayDressName;
  const todayDresses = userProfile[0]?.TodayDresses;

  const avatarSrc =
    profileData?.gender === 'M'
      ? '/images/male-avatar.jpg'
      : profileData?.gender === 'F'
      ? '/images/female-avatar.jpg'
      : profileData?.gender === 'O'
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

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-6 sm:gap-8">
          {/* Back Navigation Button */}
          <ScrollReveal y={12} duration={0.35}>
            <button
              type="button"
              onClick={() => navigate('/connections')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer w-fit select-none active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <i className="fa-solid fa-arrow-left text-xs text-violet-500" />
              <span>Back to Friends</span>
            </button>
          </ScrollReveal>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="text-violet-600 dark:text-violet-400" label="Loading curator profile..." />
            </div>
          ) : userProfile.length > 0 && profileData ? (
            <div className="flex flex-col gap-6 sm:gap-8">
              {/* Profile Bento Hero with Pastel Lavender Gradient */}
              <ScrollReveal y={16} duration={0.4}>
                <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-violet-500/[0.08] via-white to-white dark:from-violet-500/[0.12] dark:via-[#161619] dark:to-[#161619] border border-violet-200/70 dark:border-violet-900/40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left min-w-0">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-violet-300 dark:border-violet-700 p-1 flex-shrink-0 bg-violet-50 dark:bg-violet-950/40 shadow-sm">
                      <img
                        src={avatarSrc}
                        alt={profileData?.user_name || 'Avatar'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                          @{profileData?.user_name}
                        </h1>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium border select-none ${
                            profileData?.is_public
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              profileData?.is_public ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{profileData?.is_public ? 'Public' : 'Private'}</span>
                        </span>
                      </div>

                      <p className="text-base text-zinc-700 dark:text-zinc-300 font-medium">
                        {profileData?.first_name} {profileData?.last_name}
                      </p>

                      <div className="pt-2 flex items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                        <span>
                          <strong className="text-zinc-900 dark:text-zinc-100">{userProfile[0]?.TotalOutfits ?? 0}</strong> Outfits
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="text-zinc-900 dark:text-zinc-100">{userProfile[0]?.TotalDresses ?? 0}</strong> Dresses
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Connect / Following Action with Contrast Violet Highlight */}
                  <div className="flex-shrink-0">
                    {isFriend ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 select-none">
                        <i className="fa-solid fa-check text-xs" />
                        <span>Connected</span>
                      </span>
                    ) : clickedPending ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 select-none">
                        <i className="fa-solid fa-clock text-xs" />
                        <span>Request Pending</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isFollowing}
                        onClick={handleFollow}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 select-none"
                      >
                        {isFollowing ? (
                          <>
                            <Spinner size="xs" color="currentColor" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-user-plus text-xs" />
                            <span>Connect</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              {/* Today's Look Section with Pastel Rose Accent */}
              {userProfile[0]?.TodayDressId ? (
                <ScrollReveal y={16} delay={0.08} duration={0.4}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Today's Look: <span className="text-rose-600 dark:text-rose-400">{todayDressName}</span>
                      </h2>
                    </div>

                    {todayDresses?.length > 0 ? (
                      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {todayDresses.map((outfit, index) => {
                          const staggerDelay = Math.min((index % 4) * 0.05, 0.2);

                          return (
                            <ScrollReveal
                              key={outfit.outfit_id || index}
                              y={16}
                              delay={staggerDelay}
                              amount={0.1}
                              duration={0.4}
                            >
                              <div className="group rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-violet-200 dark:hover:border-violet-800 bg-white dark:bg-[#161619] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-200 flex flex-col justify-between">
                                <div className="relative h-60 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                  <LazyOutfitImage
                                    src={outfit.image_url}
                                    alt={outfit.body || 'Outfit'}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 pointer-events-none" />
                                </div>
                                <div className="p-4 flex flex-col gap-1.5">
                                  <h3 className="font-medium text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                                    {outfit.body || 'Untitled Look'}
                                  </h3>
                                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {outfit.created_at
                                      ? new Date(outfit.created_at).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                        })
                                      : 'Cataloged'}
                                  </span>
                                </div>
                              </div>
                            </ScrollReveal>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">No pieces cataloged in today's dress.</p>
                    )}
                  </div>
                </ScrollReveal>
              ) : (
                <div className="rounded-2xl p-6 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] text-center text-zinc-500 dark:text-zinc-400 text-sm">
                  This curator has not selected an active dress for today.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl p-12 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center justify-center text-center gap-4 max-w-lg mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 flex items-center justify-center text-lg">
                <i className="fa-solid fa-lock" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {message || 'Profile Locked'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                This profile is private or requires a connection. Send a request to connect and view their wardrobe.
              </p>

              {!clickedPending ? (
                <button
                  type="button"
                  disabled={isFollowing}
                  onClick={handleFollow}
                  className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isFollowing ? (
                    <>
                      <Spinner size="xs" color="currentColor" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-user-plus text-xs" />
                      <span>Send Connection Request</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 select-none mt-2">
                  <i className="fa-solid fa-clock text-xs" />
                  <span>Request Pending Approval</span>
                </span>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
