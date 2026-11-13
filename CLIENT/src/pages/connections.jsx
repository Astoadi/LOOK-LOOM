import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Auth_Guard from '../utils/auth_guard';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import Snackbar from '../components/snackbar';
import Spinner from '../components/spinner';
import { ScrollReveal } from '../components/motion/index.jsx';
import { useDebounce } from '../hooks/useDebounce';
import {
  AcceptRequest,
  GetFollowing,
  GetFriendByUserName,
  GetMyIncomingRequests,
  RejectRequest,
  getFollowers,
} from '../redux/actions/connection';

const AVATAR_RINGS = [
  'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/40',
  'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40',
  'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40',
  'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40',
  'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40',
];

function Connections() {
  const connSelector = useSelector((state) => state.connection);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [followers, setFollowers] = React.useState([]);
  const [following, setFollowing] = React.useState([]);
  const [pendingRequests, setPendingRequests] = React.useState([]);

  const [searchParams, setSearchParams] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchPeople, setSearchPeople] = React.useState([]);

  const [selectedView, setSelectedView] = React.useState(1);
  const [showList, setShowList] = React.useState([]);
  const [emptyMessage, setEmptyMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  const [processingId, setProcessingId] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });

  const debouncedSearch = useDebounce(searchParams, 350);
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  // Initial Data Fetch
  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(GetFollowing()).unwrap(),
          dispatch(getFollowers()).unwrap(),
          dispatch(GetMyIncomingRequests()).unwrap(),
        ]);
      } catch (e) {
        console.error('Error fetching connections:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dispatch]);

  // Sync Redux connection states
  React.useEffect(() => {
    setFollowers(connSelector.followers || []);
    setFollowing(connSelector.following || []);
    setPendingRequests(connSelector.pendingRequests || []);
  }, [connSelector.followers, connSelector.following, connSelector.pendingRequests]);

  // Real-time Debounced Search Handler
  React.useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchPeople([]);
      if (selectedView === 0) {
        setShowList([]);
        setEmptyMessage('Type a username above to discover curators.');
      }
      return;
    }

    let isCurrent = true;
    const performSearch = async () => {
      try {
        setIsSearching(true);
        setSelectedView(0);
        const result = await dispatch(
          GetFriendByUserName({ searchUserName: debouncedSearch.trim() })
        ).unwrap();

        if (!isCurrent) return;
        if (result?.SearchResults?.length > 0) {
          setSearchPeople(result.SearchResults);
          setShowList(result.SearchResults);
          setEmptyMessage('');
        } else {
          setSearchPeople([]);
          setShowList([]);
          setEmptyMessage('No users found matching that username.');
        }
      } catch {
        if (isCurrent) {
          setSearchPeople([]);
          setShowList([]);
          setEmptyMessage('Search failed. Please try again.');
        }
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    };

    performSearch();
    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, dispatch, selectedView]);

  // Switch display list based on tab
  React.useEffect(() => {
    if (selectedView === 0) {
      setShowList(searchPeople);
      setEmptyMessage(
        searchPeople.length > 0
          ? ''
          : searchParams.trim()
          ? 'No users found matching that username.'
          : 'Type a username above to discover curators.'
      );
    } else if (selectedView === 1) {
      setShowList(followers);
      setEmptyMessage(followers.length > 0 ? '' : 'You do not have any followers yet.');
    } else if (selectedView === 2) {
      setShowList(following);
      setEmptyMessage(following.length > 0 ? '' : 'You are not following any curators yet.');
    } else if (selectedView === 3) {
      setShowList(pendingRequests);
      setEmptyMessage(
        pendingRequests.length > 0 ? '' : 'No pending connection requests right now.'
      );
    }
  }, [selectedView, searchPeople, followers, following, pendingRequests, searchParams]);

  const handleClearSearch = () => {
    setSearchParams('');
    setSearchPeople([]);
    setSelectedView(1);
  };

  const handleAcceptRequest = async (item) => {
    if (processingId) return;

    try {
      setProcessingId(item.user_id);
      closeSnackbar();
      const res = await dispatch(AcceptRequest({ connection_id: Number(item.user_id) }));
      if (!res.error) {
        setPendingRequests((prev) => prev.filter((p) => p.user_id !== item.user_id));
        setFollowers((prev) => [...prev, item]);
        setSnackbar({ show: true, type: 'success', message: `Connected with @${item.user_name}.` });
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to accept request.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'Failed to accept request.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (item) => {
    if (processingId) return;

    try {
      setProcessingId(item.user_id);
      closeSnackbar();
      const res = await dispatch(RejectRequest({ connection_id: item.user_id }));
      if (!res.error) {
        setPendingRequests((prev) => prev.filter((p) => p.user_id !== item.user_id));
        setSnackbar({ show: true, type: 'info', message: 'Connection request declined.' });
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to decline request.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'Failed to decline request.' });
    } finally {
      setProcessingId(null);
    }
  };

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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-6 sm:gap-8">
          {/* Header & Debounced Search Bar */}
          <ScrollReveal y={12} duration={0.4}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/60 mb-2">
                  <i className="fa-solid fa-user-group text-[10px]" />
                  <span>Style Network</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Community & Friends
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Connect with fellow wardrobe curators and share styling inspiration.
                </p>
              </div>

              {/* Real-time Debounced Search Bar with Pastel Accent */}
              <div className="relative w-full sm:w-80">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={searchParams}
                  onChange={(e) => setSearchParams(e.target.value)}
                  placeholder="Search curators by username..."
                  className="w-full pl-9 pr-8 py-2 rounded-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-400/10 transition-all"
                />
                {isSearching ? (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Spinner size="xs" color="text-violet-600 dark:text-violet-400" />
                  </span>
                ) : searchParams ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                ) : null}
              </div>
            </div>
          </ScrollReveal>

          {/* Segmented Filter Bar with Contrast Active State */}
          <ScrollReveal y={12} delay={0.05} duration={0.4}>
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-x-auto no-scrollbar">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                {searchParams && (
                  <button
                    type="button"
                    onClick={() => setSelectedView(0)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                      selectedView === 0
                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300'
                    }`}
                  >
                    Search Results ({searchPeople.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedView(1)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                    selectedView === 1
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300'
                  }`}
                >
                  Followers ({followers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView(2)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                    selectedView === 2
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300'
                  }`}
                >
                  Following ({following.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView(3)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                    selectedView === 3
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300'
                  }`}
                >
                  Requests ({pendingRequests.length})
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Members / Connections Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="text-violet-600 dark:text-violet-400" label="Connecting with community..." />
            </div>
          ) : showList.length > 0 ? (
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {showList.map((item, index) => {
                const isProcessing = processingId === item.user_id;
                const staggerDelay = Math.min((index % 4) * 0.05, 0.2);
                const ringClass = AVATAR_RINGS[index % AVATAR_RINGS.length];

                const avatarSrc =
                  item.gender === 'M'
                    ? '/images/male-avatar.jpg'
                    : item.gender === 'F'
                    ? '/images/female-avatar.jpg'
                    : item.gender === 'O'
                    ? '/images/other-avatar.png'
                    : '/images/male-avatar.jpg';

                return (
                  <ScrollReveal
                    key={item.user_id || index}
                    y={16}
                    delay={staggerDelay}
                    amount={0.1}
                    duration={0.4}
                  >
                    <div className="group rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-violet-200 dark:hover:border-violet-800 bg-white dark:bg-[#161619] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-200 flex flex-col justify-between gap-4">
                      {/* User Info Row */}
                      <div className="flex items-center gap-3.5">
                        <div className={`relative w-12 h-12 rounded-full border-2 p-0.5 flex-shrink-0 shadow-sm ${ringClass}`}>
                          <img
                            src={avatarSrc}
                            alt={item.user_name || 'Curator'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <h3
                            onClick={() => navigate(`/user/${item.user_id}`)}
                            className="font-medium text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer truncate"
                          >
                            @{item.user_name}
                          </h3>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {item.first_name && item.last_name
                              ? `${item.first_name} ${item.last_name}`
                              : 'Style Curator'}
                          </span>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                        {selectedView !== 3 ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/user/${item.user_id}`)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 hover:bg-violet-50/70 hover:text-violet-700 dark:bg-zinc-900/60 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 border border-zinc-200/80 dark:border-zinc-800 transition-all cursor-pointer active:scale-95"
                          >
                            <span>Inspect Profile</span>
                            <i className="fa-solid fa-arrow-right text-[10px]" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleAcceptRequest(item)}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Spinner size="xs" color="currentColor" />
                              ) : (
                                <>
                                  <i className="fa-solid fa-check text-[10px]" />
                                  <span>Accept</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleRejectRequest(item)}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-zinc-200/80 dark:border-zinc-800 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <span>Decline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl p-12 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 flex items-center justify-center text-xl">
                <i className="fa-solid fa-user-group" />
              </div>
              <p className="text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300">
                {emptyMessage || 'No connections in this view'}
              </p>
              {selectedView !== 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedView(0)}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-magnifying-glass text-xs" />
                  <span>Discover Curators</span>
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

const ProtectedConnections = Auth_Guard(Connections);
export default ProtectedConnections;
