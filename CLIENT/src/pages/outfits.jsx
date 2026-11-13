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
  delete_outfit,
  get_favorite_outfits,
  get_outfit,
  get_outfit_by_body_name,
  change_favorite_status,
} from '../redux/actions/outfits';
import { create_category } from '../redux/actions/dress';

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

function Outfits() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const outfitSelector = useSelector((state) => state.outfit);

  const [outfitListTab, setOutfitListTab] = React.useState('all');
  const [userOutfits, setUserOutfits] = React.useState([]);
  const [favUserOutfits, setFavUserOutfits] = React.useState([]);
  const [displayOutfits, setDisplayOutfits] = React.useState([]);

  const [loading, setLoading] = React.useState(true);
  const [emptyMessage, setEmptyMessage] = React.useState('');
  const [inCDMode, setInCDMode] = React.useState(false);

  const [searchParams, setSearchParams] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const debouncedSearch = useDebounce(searchParams, 350);

  const [dressName, setDressName] = React.useState('');
  const [outfitIds, setOutfitIds] = React.useState([]);
  const [isCreatingDress, setIsCreatingDress] = React.useState(false);

  const [deletingId, setDeletingId] = React.useState(null);
  const [togglingFavId, setTogglingFavId] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  // Initial Fetch
  React.useEffect(() => {
    const fetchOutfits = async () => {
      try {
        setLoading(true);
        await dispatch(get_outfit());
        await dispatch(get_favorite_outfits());
      } catch (e) {
        console.error('Error fetching outfits:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOutfits();
  }, [dispatch]);

  // Sync Redux Outfits
  React.useEffect(() => {
    setUserOutfits(outfitSelector.user_outfits || []);
    setFavUserOutfits(outfitSelector.favorite_outfits || []);
  }, [outfitSelector.user_outfits, outfitSelector.favorite_outfits]);

  // Tab Filtering & Empty State
  React.useEffect(() => {
    if (searchParams.trim()) return;
    if (outfitListTab === 'all') {
      if (userOutfits.length > 0) {
        setDisplayOutfits(userOutfits);
        setEmptyMessage('');
      } else {
        setDisplayOutfits([]);
        setEmptyMessage(outfitSelector.message || 'No outfits yet.');
      }
    } else {
      if (favUserOutfits.length > 0) {
        setDisplayOutfits(favUserOutfits);
        setEmptyMessage('');
      } else {
        setDisplayOutfits([]);
        setEmptyMessage('No favorite outfits saved yet.');
      }
    }
  }, [outfitListTab, favUserOutfits, userOutfits, searchParams, outfitSelector.message]);

  // Real-time Debounced Search Handler
  React.useEffect(() => {
    if (!debouncedSearch.trim()) {
      return;
    }

    let isCurrent = true;
    const performSearch = async () => {
      try {
        setIsSearching(true);
        const res = await dispatch(get_outfit_by_body_name({ body: debouncedSearch.trim() }));
        if (!isCurrent) return;
        if (res.payload?.outfits?.length > 0) {
          setDisplayOutfits(res.payload.outfits);
          setEmptyMessage('');
        } else {
          setDisplayOutfits([]);
          setEmptyMessage('No outfits found matching your search.');
        }
      } catch {
        if (isCurrent) setEmptyMessage('Search failed. Please try again.');
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    };

    performSearch();
    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, dispatch]);

  const handleClearSearch = () => {
    setSearchParams('');
    setDisplayOutfits(outfitListTab === 'all' ? userOutfits : favUserOutfits);
    setEmptyMessage('');
  };

  const handleCheckboxChange = (outfitId) => {
    setOutfitIds((prev) =>
      prev.includes(outfitId) ? prev.filter((id) => id !== outfitId) : [...prev, outfitId]
    );
  };

  const handleDressCreation = async () => {
    if (!dressName.trim() || outfitIds.length === 0 || isCreatingDress) return;

    try {
      setIsCreatingDress(true);
      closeSnackbar();
      const res = await dispatch(create_category({ dressName: dressName.trim(), outfit_ids: outfitIds }));
      const isSuccess = !res.error && (res.type?.endsWith('/fulfilled') ?? false);

      if (isSuccess) {
        setSnackbar({
          show: true,
          type: 'success',
          message: res.payload?.message || 'Dress category created successfully.',
        });
        setInCDMode(false);
        setOutfitIds([]);
        setDressName('');
        setTimeout(() => navigate('/dresses'), 900);
      } else {
        setSnackbar({
          show: true,
          type: 'error',
          message: res.payload?.message || 'Failed to create dress category.',
        });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsCreatingDress(false);
    }
  };

  const handleDeleteOutfit = async (outfitId) => {
    if (deletingId) return;

    try {
      setDeletingId(outfitId);
      closeSnackbar();
      const res = await dispatch(delete_outfit({ outfit_id: outfitId }));
      const isSuccess = !res.error && (res.type?.endsWith('/fulfilled') ?? false);

      if (isSuccess) {
        setSnackbar({ show: true, type: 'success', message: 'Outfit removed successfully.' });
        setUserOutfits((prev) => prev.filter((uo) => uo.outfit_id !== outfitId));
        setFavUserOutfits((prev) => prev.filter((uo) => uo.outfit_id !== outfitId));
        setDisplayOutfits((prev) => prev.filter((uo) => uo.outfit_id !== outfitId));
        await dispatch(get_outfit());
        await dispatch(get_favorite_outfits());
      } else {
        setSnackbar({
          show: true,
          type: 'error',
          message: res.payload?.message || 'Failed to delete outfit.',
        });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'Failed to delete outfit.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFavorite = async (outfit) => {
    if (togglingFavId) return;

    const newFavStatus = !outfit.is_favorite;
    try {
      setTogglingFavId(outfit.outfit_id);
      const res = await dispatch(
        change_favorite_status({ status: newFavStatus, outfit_id: outfit.outfit_id })
      );
      if (!res.error) {
        const updateOutfitList = (list) =>
          list.map((item) =>
            item.outfit_id === outfit.outfit_id ? { ...item, is_favorite: newFavStatus } : item
          );
        setUserOutfits(updateOutfitList);
        setDisplayOutfits(updateOutfitList);
        await dispatch(get_favorite_outfits());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingFavId(null);
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
          {/* Header & Search */}
          <ScrollReveal y={12} duration={0.4}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/60 mb-2">
                  <i className="fa-solid fa-shirt text-[10px]" />
                  <span>Wardrobe Collection</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Wardrobe Outfits
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Browse, filter, and organize your personal look collection.
                </p>
              </div>

              {/* Debounced Search Bar with Pastel Accent */}
              <div className="relative w-full md:w-72 sm:w-80">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={searchParams}
                  onChange={(e) => setSearchParams(e.target.value)}
                  placeholder="Search by outfit name..."
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
            <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              {/* Segmented Switcher */}
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setOutfitListTab('all')}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                    outfitListTab === 'all'
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300'
                  }`}
                >
                  All Outfits ({userOutfits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOutfitListTab('fav')}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                    outfitListTab === 'fav'
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300'
                  }`}
                >
                  Favorites ({favUserOutfits.length})
                </button>
              </div>

              {/* Mode Toggle Button with Pastel Accent */}
              <div className="flex items-center gap-2">
                {!inCDMode ? (
                  <button
                    type="button"
                    onClick={() => setInCDMode(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/50 transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    <i className="fa-solid fa-layer-group text-xs text-amber-500" />
                    <span>Create Dress</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setInCDMode(false);
                      setOutfitIds([]);
                      setDressName('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                    <span>Exit Selection</span>
                  </button>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Create Dress Drawer Banner with Pastel Amber Tint */}
          {inCDMode && (
            <ScrollReveal y={12} duration={0.35}>
              <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.04] to-transparent dark:from-amber-500/[0.12] dark:via-amber-500/[0.06] dark:to-transparent border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {outfitIds.length} Selected
                  </span>
                  <input
                    type="text"
                    disabled={isCreatingDress}
                    placeholder="Enter dress category name..."
                    value={dressName}
                    onChange={(e) => setDressName(e.target.value)}
                    className="flex-1 max-w-sm rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <button
                  type="button"
                  disabled={!dressName.trim() || outfitIds.length === 0 || isCreatingDress}
                  onClick={handleDressCreation}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 shadow-sm shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
                >
                  {isCreatingDress ? (
                    <>
                      <Spinner size="xs" color="currentColor" />
                      <span>Creating Category...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check text-xs" />
                      <span>Confirm Category</span>
                    </>
                  )}
                </button>
              </div>
            </ScrollReveal>
          )}

          {/* Outfits Grid or Loading/Empty State */}
          {loading || isSearching ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="text-violet-600 dark:text-violet-400" label="Curating wardrobe..." />
            </div>
          ) : displayOutfits.length > 0 ? (
            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayOutfits.map((outfit, index) => {
                const isSelected = outfitIds.includes(outfit.outfit_id);
                const isDeleting = deletingId === outfit.outfit_id;
                const isTogglingFav = togglingFavId === outfit.outfit_id;
                const staggerDelay = Math.min((index % 4) * 0.05, 0.2);

                return (
                  <ScrollReveal key={outfit.outfit_id} y={16} delay={staggerDelay} amount={0.1} duration={0.4}>
                    <div
                      className={`group rounded-2xl border bg-white dark:bg-[#161619] overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'border-violet-500 ring-2 ring-violet-500/20 bg-violet-50/20 dark:bg-violet-950/20'
                          : 'border-black/[0.06] dark:border-white/[0.08] hover:border-violet-200 dark:hover:border-violet-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none'
                      }`}
                    >
                      {/* Image Container with Progressive Lazy Loading */}
                      <div className="relative h-64 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <LazyOutfitImage
                          src={outfit.image_url}
                          alt={outfit.body || 'Outfit'}
                          onClick={() => {
                            if (inCDMode) {
                              handleCheckboxChange(outfit.outfit_id);
                            } else {
                              navigate(`/outfits/${outfit.outfit_id}`);
                            }
                          }}
                        />

                        {/* Top Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 pointer-events-none" />

                        {/* Selection Checkbox (In CD Mode) */}
                        {inCDMode && (
                          <button
                            type="button"
                            onClick={() => handleCheckboxChange(outfit.outfit_id)}
                            className={`absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                              isSelected
                                ? 'bg-violet-600 text-white border border-white/60'
                                : 'bg-black/40 border border-white/40 text-transparent hover:border-white/70'
                            }`}
                          >
                            <i className="fa-solid fa-check text-[10px]" />
                          </button>
                        )}

                        {/* Favorite Button with Coral / Rose Pastel Accent */}
                        <button
                          type="button"
                          disabled={isTogglingFav}
                          onClick={() => handleToggleFavorite(outfit)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                          title={outfit.is_favorite ? 'Favorited' : 'Add to favorites'}
                        >
                          {isTogglingFav ? (
                            <Spinner size="xs" color="text-rose-400" />
                          ) : outfit.is_favorite ? (
                            <i className="fa-solid fa-heart text-rose-500 text-xs shadow-sm" />
                          ) : (
                            <i className="fa-regular fa-heart text-white/80 hover:text-white text-xs" />
                          )}
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            onClick={() => navigate(`/outfits/${outfit.outfit_id}`)}
                            className="font-medium text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer truncate flex-1"
                            title={outfit.body}
                          >
                            {outfit.body || 'Untitled Look'}
                          </h3>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteOutfit(outfit.outfit_id)}
                            className="text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-40"
                            title="Remove outfit"
                          >
                            {isDeleting ? (
                              <Spinner size="xs" color="text-rose-500" />
                            ) : (
                              <i className="fa-solid fa-trash-can text-xs" />
                            )}
                          </button>
                        </div>

                        {/* Metadata Footer with Contrast Violet Accent */}
                        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                          <span>
                            {outfit.created_at
                              ? new Date(outfit.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Cataloged'}
                          </span>
                          <span
                            onClick={() => navigate(`/outfits/${outfit.outfit_id}`)}
                            className="text-violet-600 dark:text-violet-400 hover:underline cursor-pointer font-medium"
                          >
                            Inspect Look →
                          </span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl p-12 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 flex items-center justify-center text-xl">
                <i className="fa-solid fa-shirt" />
              </div>
              <p className="text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300">
                {emptyMessage || 'No outfits found'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-plus text-xs" />
                <span>Create an Outfit</span>
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

const ProtectedOutfits = Auth_Guard(Outfits);
export default ProtectedOutfits;
