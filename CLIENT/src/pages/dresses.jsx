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
  change_favorite_status,
  delete_dress,
  edit_dress_name,
  get_favorite_user_categories,
  get_user_dress,
} from '../redux/actions/dress';

const PASTEL_BADGES = [
  'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/60',
  'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
  'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60',
  'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
  'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
];

function Dresses() {
  const dispatch = useDispatch();
  const dressSelector = useSelector((state) => state.dress);
  const navigate = useNavigate();

  const [selectedView, setSelectedView] = React.useState(0);
  const [userDresses, setUserDresses] = React.useState([]);
  const [favUserDresses, setFavUserDresses] = React.useState([]);
  const [displayDresses, setDisplayDresses] = React.useState([]);

  const [loading, setLoading] = React.useState(true);
  const [emptyMessage, setEmptyMessage] = React.useState('');

  const [editingDressId, setEditingDressId] = React.useState(null);
  const [newDressName, setNewDressName] = React.useState('');
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState(null);
  const [togglingFavId, setTogglingFavId] = React.useState(null);

  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  // Initial Fetch
  React.useEffect(() => {
    const fetchDresses = async () => {
      try {
        setLoading(true);
        await dispatch(get_user_dress());
        await dispatch(get_favorite_user_categories());
      } catch (e) {
        console.error('Error fetching dresses:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDresses();
  }, [dispatch]);

  // Sync Redux Data
  React.useEffect(() => {
    setUserDresses(dressSelector.user_dress || []);
    setFavUserDresses(dressSelector.favorite_dress || []);
  }, [dressSelector.user_dress, dressSelector.favorite_dress]);

  // View Filtering
  React.useEffect(() => {
    if (selectedView === 0) {
      if (userDresses.length > 0) {
        setDisplayDresses(userDresses);
        setEmptyMessage('');
      } else {
        setDisplayDresses([]);
        setEmptyMessage(dressSelector.message || 'No dresses found.');
      }
    } else {
      if (favUserDresses.length > 0) {
        setDisplayDresses(favUserDresses);
        setEmptyMessage('');
      } else {
        setDisplayDresses([]);
        setEmptyMessage('No favorite dresses found.');
      }
    }
  }, [selectedView, userDresses, favUserDresses, dressSelector.message]);

  const handleStartRename = (dress) => {
    setEditingDressId(dress.outfit_category_id);
    setNewDressName(dress.category_name);
  };

  const handleCancelRename = () => {
    setEditingDressId(null);
    setNewDressName('');
  };

  const handleSaveRename = async (dressId) => {
    if (!newDressName.trim() || isRenaming) return;

    try {
      setIsRenaming(true);
      closeSnackbar();
      const res = await dispatch(
        edit_dress_name({ outfit_category_id: dressId, category_name: newDressName.trim() })
      );
      if (!res.error) {
        const updateList = (list) =>
          list.map((d) =>
            d.outfit_category_id === dressId ? { ...d, category_name: newDressName.trim() } : d
          );
        setUserDresses(updateList);
        setDisplayDresses(updateList);
        setSnackbar({ show: true, type: 'success', message: 'Category renamed successfully.' });
        handleCancelRename();
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to rename category.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleToggleFavorite = async (dress) => {
    if (togglingFavId) return;

    const newStatus = !dress.is_favorite;
    try {
      setTogglingFavId(dress.outfit_category_id);
      const res = await dispatch(
        change_favorite_status({ outfit_category_id: dress.outfit_category_id, status: newStatus })
      );
      if (!res.error) {
        const updated = userDresses.map((d) =>
          d.outfit_category_id === dress.outfit_category_id ? { ...d, is_favorite: newStatus } : d
        );
        setUserDresses(updated);
        setFavUserDresses(updated.filter((d) => d.is_favorite));
        setDisplayDresses(
          selectedView === 0 ? updated : updated.filter((d) => d.is_favorite)
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingFavId(null);
    }
  };

  const handleDeleteCategory = async (dressId) => {
    if (deletingId) return;

    try {
      setDeletingId(dressId);
      closeSnackbar();
      const res = await dispatch(delete_dress({ outfit_category_id: dressId }));
      if (!res.error) {
        setUserDresses((prev) => prev.filter((d) => d.outfit_category_id !== dressId));
        setFavUserDresses((prev) => prev.filter((d) => d.outfit_category_id !== dressId));
        setDisplayDresses((prev) => prev.filter((d) => d.outfit_category_id !== dressId));
        setSnackbar({ show: true, type: 'success', message: 'Category removed successfully.' });
        await dispatch(get_user_dress());
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to delete category.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'Failed to delete category.' });
    } finally {
      setDeletingId(null);
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
          {/* Header & Controls Bar */}
          <ScrollReveal y={12} duration={0.4}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 mb-2">
                  <i className="fa-solid fa-layer-group text-[10px]" />
                  <span>Curated Looks</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Dress Categories
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Organize and group outfits into curated looks for occasions and rotations.
                </p>
              </div>

              {/* Action Button with Contrast Highlight */}
              <button
                type="button"
                onClick={() => navigate('/outfits')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer w-fit active:scale-95"
              >
                <i className="fa-solid fa-plus text-xs" />
                <span>Create New Category</span>
              </button>
            </div>
          </ScrollReveal>

          {/* Segmented Tab Filter */}
          <ScrollReveal y={12} delay={0.05} duration={0.4}>
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedView(0)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                    selectedView === 0
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300'
                  }`}
                >
                  All Categories ({userDresses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView(1)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                    selectedView === 1
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300'
                  }`}
                >
                  Favorites ({favUserDresses.length})
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Dresses Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="text-violet-600 dark:text-violet-400" label="Loading categories..." />
            </div>
          ) : displayDresses.length > 0 ? (
            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayDresses.map((dress, index) => {
                const isEditing = editingDressId === dress.outfit_category_id;
                const isDeleting = deletingId === dress.outfit_category_id;
                const isTogglingFav = togglingFavId === dress.outfit_category_id;
                const staggerDelay = Math.min((index % 4) * 0.05, 0.2);
                const badgeColorClass = PASTEL_BADGES[index % PASTEL_BADGES.length];

                return (
                  <ScrollReveal
                    key={dress.outfit_category_id}
                    y={16}
                    delay={staggerDelay}
                    amount={0.1}
                    duration={0.4}
                  >
                    <div className="group rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-violet-200 dark:hover:border-violet-800 bg-white dark:bg-[#161619] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-200 flex flex-col justify-between gap-5 relative overflow-hidden">
                      {/* Top Row: Icon Badge & Actions */}
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm ${badgeColorClass}`}>
                          <i className="fa-solid fa-layer-group text-sm" />
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Favorite Button with Coral / Rose Accent */}
                          <button
                            type="button"
                            disabled={isTogglingFav}
                            onClick={() => handleToggleFavorite(dress)}
                            className="p-2 rounded-full text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
                            title={dress.is_favorite ? 'Favorited' : 'Add to favorites'}
                          >
                            {isTogglingFav ? (
                              <Spinner size="xs" color="text-rose-500" />
                            ) : dress.is_favorite ? (
                              <i className="fa-solid fa-heart text-rose-500 text-xs shadow-sm" />
                            ) : (
                              <i className="fa-regular fa-heart text-zinc-400 dark:text-zinc-500 text-xs" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteCategory(dress.outfit_category_id)}
                            className="p-2 rounded-full text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-40"
                            title="Delete category"
                          >
                            {isDeleting ? (
                              <Spinner size="xs" color="text-rose-500" />
                            ) : (
                              <i className="fa-solid fa-trash-can text-xs" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Middle: Title & Rename */}
                      <div className="flex flex-col gap-1.5">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newDressName}
                              disabled={isRenaming}
                              onChange={(e) => setNewDressName(e.target.value)}
                              className="flex-1 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-violet-400 dark:focus:border-violet-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              disabled={isRenaming}
                              onClick={() => handleSaveRename(dress.outfit_category_id)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              {isRenaming ? <Spinner size="xs" color="currentColor" /> : '✓'}
                            </button>
                            <button
                              type="button"
                              disabled={isRenaming}
                              onClick={handleCancelRename}
                              className="px-2 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <h2
                              onClick={() => navigate(`/dresses/${dress.outfit_category_id}`)}
                              className="text-base sm:text-lg font-medium text-zinc-900 dark:text-zinc-100 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer truncate flex-1"
                              title={dress.category_name}
                            >
                              {dress.category_name}
                            </h2>
                            <button
                              type="button"
                              onClick={() => handleStartRename(dress)}
                              className="p-1 rounded-full text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
                              title="Rename category"
                            >
                              <i className="fa-solid fa-pen text-[11px]" />
                            </button>
                          </div>
                        )}

                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Created{' '}
                          {dress.created_at
                            ? new Date(dress.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Recently'}
                        </span>
                      </div>

                      {/* Bottom Link Action */}
                      <button
                        type="button"
                        onClick={() => navigate(`/dresses/${dress.outfit_category_id}`)}
                        className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 hover:bg-violet-50/60 dark:bg-zinc-900/60 dark:hover:bg-violet-950/30 border border-zinc-200/80 dark:border-zinc-800 transition-all cursor-pointer group/link"
                      >
                        <span>Explore Ensembles</span>
                        <i className="fa-solid fa-arrow-right text-xs text-zinc-400 group-hover/link:text-violet-600 dark:group-hover/link:text-violet-400 group-hover/link:translate-x-0.5 transition-all" />
                      </button>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl p-12 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 flex items-center justify-center text-xl">
                <i className="fa-solid fa-layer-group" />
              </div>
              <p className="text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300">
                {emptyMessage || 'No categories created yet'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/outfits')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-shirt text-xs" />
                <span>Go to Wardrobe to Create</span>
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

const ProtectedDresses = Auth_Guard(Dresses);
export default ProtectedDresses;
