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
    <div className="relative h-full w-full overflow-hidden bg-white/[0.02]">
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] animate-pulse" />
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
  const debouncedSearch = useDebounce(searchParams, 1250);

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
    if (searchParams.trim()) return; // Don't override if actively searching
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

  // Checkbox toggle for Create Dress Mode
  const handleCheckboxChange = (outfitId) => {
    setOutfitIds((prev) =>
      prev.includes(outfitId) ? prev.filter((id) => id !== outfitId) : [...prev, outfitId]
    );
  };

  // Create Dress Category
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
          message: res.payload?.message || 'Dress category created successfully!',
        });
        setInCDMode(false);
        setOutfitIds([]);
        setDressName('');
        setTimeout(() => navigate('/dresses'), 1000);
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

  // Delete Outfit
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

  // Toggle Favorite
  const handleToggleFavorite = async (outfit) => {
    if (togglingFavId) return;

    const newFavStatus = !outfit.is_favorite;
    try {
      setTogglingFavId(outfit.outfit_id);
      const res = await dispatch(
        change_favorite_status({ status: newFavStatus, outfit_id: outfit.outfit_id })
      );
      if (!res.error) {
        // Optimistic update
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
    <div className="min-h-screen bg-[#060608] text-[#f5f5f7] relative overflow-hidden font-sans flex flex-col justify-between selection:bg-purple-400/30 selection:text-white">
      {/* Reusable Apple Feedback Snackbar */}
      <Snackbar
        show={snackbar.show}
        type={snackbar.type}
        message={snackbar.message}
        onClose={closeSnackbar}
      />

      {/* Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] max-w-[95vw] h-[350px] bg-purple-600/10 rounded-full blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-[450px] h-[450px] bg-pink-600/5 rounded-full blur-[140px]" />

      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-6 sm:gap-8">
          {/* Header & Controls Bar */}
          <ScrollReveal y={16} duration={0.5}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                  Wardrobe Outfits
                </h1>
                <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">
                  Browse, filter, and curate looks for your collection.
                </p>
              </div>

              {/* Debounced Search Bar */}
              <div className="relative w-full md:w-72 sm:w-80">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#86868b]" />
                <input
                  type="text"
                  value={searchParams}
                  onChange={(e) => setSearchParams(e.target.value)}
                  placeholder="Search by outfit name..."
                  className="w-full pl-9 pr-8 py-2 rounded-full bg-white/[0.04] border border-white/[0.1] focus:border-purple-300/50 focus:bg-white/[0.06] text-xs sm:text-sm text-white placeholder:text-[#6e6e73] outline-none transition-all"
                />
                {isSearching ? (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Spinner size="xs" color="text-purple-300" />
                  </span>
                ) : searchParams ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#86868b] hover:text-white p-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                ) : null}
              </div>
            </div>
          </ScrollReveal>

          {/* Filter Segmented Bar & Actions */}
          <ScrollReveal y={18} delay={0.08} duration={0.5}>
            <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl">
              {/* Segmented Switcher */}
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setOutfitListTab('all')}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                    outfitListTab === 'all'
                      ? 'bg-white/[0.12] text-white border border-purple-300/35 shadow-[0_2px_12px_rgba(168,85,247,0.18)]'
                      : 'text-[#a1a1a6] hover:text-white border border-transparent'
                  }`}
                >
                  All Outfits ({userOutfits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOutfitListTab('fav')}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                    outfitListTab === 'fav'
                      ? 'bg-white/[0.12] text-white border border-purple-300/35 shadow-[0_2px_12px_rgba(168,85,247,0.18)]'
                      : 'text-[#a1a1a6] hover:text-white border border-transparent'
                  }`}
                >
                  Favorites ({favUserOutfits.length})
                </button>
              </div>

              {/* Mode Toggle Button */}
              <div className="flex items-center gap-2">
                {!inCDMode ? (
                  <button
                    type="button"
                    onClick={() => setInCDMode(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-white bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 transition-all cursor-pointer active:scale-95"
                  >
                    <i className="fa-solid fa-layer-group text-xs text-purple-300" />
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-red-300 hover:text-red-100 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                    <span>Exit Selection</span>
                  </button>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Create Dress Drawer Banner (When in CD Mode) */}
          {inCDMode && (
            <ScrollReveal y={16} duration={0.4}>
              <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-purple-950/20 via-pink-950/15 to-purple-950/20 border border-purple-400/25 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    {outfitIds.length} Selected
                  </span>
                  <input
                    type="text"
                    disabled={isCreatingDress}
                    placeholder="Enter dress category name..."
                    value={dressName}
                    onChange={(e) => setDressName(e.target.value)}
                    className="flex-1 max-w-sm rounded-xl bg-white/[0.04] border border-white/[0.12] px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-[#6e6e73] outline-none focus:border-purple-400/50 transition-colors disabled:opacity-50"
                  />
                </div>

                <button
                  type="button"
                  disabled={!dressName.trim() || outfitIds.length === 0 || isCreatingDress}
                  onClick={handleDressCreation}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 active:scale-95 shadow-md shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
                >
                  {isCreatingDress ? (
                    <>
                      <Spinner size="xs" color="text-white" />
                      <span>Creating Dress...</span>
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

          {/* Outfits Grid or Empty/Loading State */}
          {loading || isSearching ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="text-purple-400" label="Curating wardrobe..." />
            </div>
          ) : displayOutfits.length > 0 ? (
            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayOutfits.map((outfit, index) => {
                const isSelected = outfitIds.includes(outfit.outfit_id);
                const isDeleting = deletingId === outfit.outfit_id;
                const isTogglingFav = togglingFavId === outfit.outfit_id;
                const staggerDelay = Math.min((index % 4) * 0.08, 0.24);

                return (
                  <ScrollReveal key={outfit.outfit_id} y={24} delay={staggerDelay} amount={0.15} duration={0.5}>
                    <div
                      className={`group rounded-2xl border bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? 'border-purple-400/60 ring-2 ring-purple-400/20 bg-purple-500/[0.05]'
                          : 'border-white/[0.08] hover:border-purple-300/30'
                      }`}
                    >
                      {/* Image Container with Progressive Lazy Loading */}
                      <div className="relative h-64 w-full overflow-hidden bg-black/40">
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
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40 pointer-events-none" />

                        {/* Selection Checkbox (In CD Mode) */}
                        {inCDMode && (
                          <button
                            type="button"
                            onClick={() => handleCheckboxChange(outfit.outfit_id)}
                            className={`absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                              isSelected
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-white/60'
                                : 'bg-black/50 border border-white/30 text-transparent hover:border-white/60'
                            }`}
                          >
                            <i className="fa-solid fa-check text-[10px]" />
                          </button>
                        )}

                        {/* Favorite Button (Floating Top Right) */}
                        <button
                          type="button"
                          disabled={isTogglingFav}
                          onClick={() => handleToggleFavorite(outfit)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                          title={outfit.is_favorite ? 'Favorited' : 'Add to favorites'}
                        >
                          {isTogglingFav ? (
                            <Spinner size="xs" color="text-pink-400" />
                          ) : outfit.is_favorite ? (
                            <i className="fa-solid fa-heart text-pink-500 text-xs shadow-sm" />
                          ) : (
                            <i className="fa-regular fa-heart text-white/70 hover:text-white text-xs" />
                          )}
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            onClick={() => navigate(`/outfits/${outfit.outfit_id}`)}
                            className="font-semibold text-base text-white hover:text-purple-200 transition-colors cursor-pointer truncate flex-1"
                            title={outfit.body}
                          >
                            {outfit.body || 'Untitled Look'}
                          </h3>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteOutfit(outfit.outfit_id)}
                            className="text-[#86868b] hover:text-red-400 p-1 rounded-full hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-40"
                            title="Remove outfit"
                          >
                            {isDeleting ? (
                              <Spinner size="xs" color="text-red-400" />
                            ) : (
                              <i className="fa-solid fa-trash-can text-xs" />
                            )}
                          </button>
                        </div>

                        {/* Metadata Footer */}
                        <div className="flex items-center justify-between text-[11px] text-[#86868b] pt-1 border-t border-white/[0.05]">
                          <span>
                            {outfit.created_at
                              ? new Date(outfit.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Cataloged'}
                          </span>
                          <span
                            onClick={() => navigate(`/outfits/${outfit.outfit_id}`)}
                            className="text-purple-300 hover:text-purple-200 cursor-pointer font-medium"
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
            <div className="rounded-2xl p-12 bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center text-center gap-3">
              <i className="fa-solid fa-shirt text-3xl text-purple-300/40" />
              <p className="text-base font-semibold text-white/90">
                {emptyMessage || 'No outfits found'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-purple-300/30 transition-all cursor-pointer"
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
