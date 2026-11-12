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

  // Inline Rename
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

  // Toggle Favorite
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

  // Delete Category
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
    <div className="min-h-screen bg-[#060608] text-[#f5f5f7] relative overflow-hidden font-sans flex flex-col justify-between selection:bg-purple-400/30 selection:text-white">
      {/* Reusable Feedback Snackbar */}
      <Snackbar
        show={snackbar.show}
        type={snackbar.type}
        message={snackbar.message}
        onClose={closeSnackbar}
      />

      {/* Ambient Lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] max-w-[95vw] h-[350px] bg-purple-600/10 rounded-full blur-[130px]" />
      <div className="pointer-events-none absolute bottom-40 right-[-10%] w-[450px] h-[450px] bg-pink-600/5 rounded-full blur-[140px]" />

      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-6 sm:gap-8">
          {/* Header & Controls Bar */}
          <ScrollReveal y={16} duration={0.5}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                  Dress Categories
                </h1>
                <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">
                  Organize, curate, and schedule looks for events and daily rotations.
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => navigate('/outfits')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 transition-all cursor-pointer w-fit active:scale-95 shadow-sm"
              >
                <i className="fa-solid fa-plus text-xs text-purple-300" />
                <span>Create New Category</span>
              </button>
            </div>
          </ScrollReveal>

          {/* Segmented Tab Filter */}
          <ScrollReveal y={18} delay={0.08} duration={0.5}>
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setSelectedView(0)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                    selectedView === 0
                      ? 'bg-white/[0.12] text-white border border-purple-300/35 shadow-[0_2px_12px_rgba(168,85,247,0.18)]'
                      : 'text-[#a1a1a6] hover:text-white border border-transparent'
                  }`}
                >
                  All Categories ({userDresses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView(1)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                    selectedView === 1
                      ? 'bg-white/[0.12] text-white border border-purple-300/35 shadow-[0_2px_12px_rgba(168,85,247,0.18)]'
                      : 'text-[#a1a1a6] hover:text-white border border-transparent'
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
              <Spinner size="lg" color="text-purple-400" label="Curating dress categories..." />
            </div>
          ) : displayDresses.length > 0 ? (
            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayDresses.map((dress, index) => {
                const isEditing = editingDressId === dress.outfit_category_id;
                const isDeleting = deletingId === dress.outfit_category_id;
                const isTogglingFav = togglingFavId === dress.outfit_category_id;
                const staggerDelay = Math.min((index % 4) * 0.08, 0.24);

                return (
                  <ScrollReveal
                    key={dress.outfit_category_id}
                    y={24}
                    delay={staggerDelay}
                    amount={0.15}
                    duration={0.5}
                  >
                    <div className="group rounded-2xl border border-white/[0.08] hover:border-purple-300/35 bg-white/[0.03] backdrop-blur-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-5 relative overflow-hidden">
                      {/* Top Row: Icon Badge & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300 shadow-sm">
                          <i className="fa-solid fa-layer-group text-sm" />
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Favorite Button */}
                          <button
                            type="button"
                            disabled={isTogglingFav}
                            onClick={() => handleToggleFavorite(dress)}
                            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                            title={dress.is_favorite ? 'Favorited' : 'Add to favorites'}
                          >
                            {isTogglingFav ? (
                              <Spinner size="xs" color="text-pink-400" />
                            ) : dress.is_favorite ? (
                              <i className="fa-solid fa-heart text-pink-500 text-xs shadow-sm" />
                            ) : (
                              <i className="fa-regular fa-heart text-white/60 hover:text-white text-xs" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteCategory(dress.outfit_category_id)}
                            className="p-2 rounded-full text-[#86868b] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-40"
                            title="Delete category"
                          >
                            {isDeleting ? (
                              <Spinner size="xs" color="text-red-400" />
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
                              className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.15] px-3 py-1.5 text-sm text-white placeholder:text-[#6e6e73] outline-none focus:border-purple-400/50"
                              autoFocus
                            />
                            <button
                              type="button"
                              disabled={isRenaming}
                              onClick={() => handleSaveRename(dress.outfit_category_id)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-50 cursor-pointer"
                            >
                              {isRenaming ? <Spinner size="xs" color="text-white" /> : '✓'}
                            </button>
                            <button
                              type="button"
                              disabled={isRenaming}
                              onClick={handleCancelRename}
                              className="px-2 py-1.5 rounded-xl text-xs text-[#a1a1a6] hover:text-white bg-white/10 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <h2
                              onClick={() => navigate(`/dresses/${dress.outfit_category_id}`)}
                              className="text-lg sm:text-xl font-bold tracking-tight text-white hover:text-purple-200 transition-colors cursor-pointer truncate flex-1"
                              title={dress.category_name}
                            >
                              {dress.category_name}
                            </h2>
                            <button
                              type="button"
                              onClick={() => handleStartRename(dress)}
                              className="p-1 rounded-full text-[#86868b] hover:text-white transition-colors cursor-pointer"
                              title="Rename category"
                            >
                              <i className="fa-solid fa-pen text-[11px]" />
                            </button>
                          </div>
                        )}

                        <span className="text-[11px] text-[#86868b]">
                          Created on{' '}
                          {dress.created_at
                            ? new Date(dress.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recently'}
                        </span>
                      </div>

                      {/* Bottom Link Action */}
                      <button
                        type="button"
                        onClick={() => navigate(`/dresses/${dress.outfit_category_id}`)}
                        className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-purple-300/30 transition-all cursor-pointer group/link"
                      >
                        <span>Explore Ensembles</span>
                        <i className="fa-solid fa-arrow-right text-xs text-purple-300 group-hover/link:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl p-12 bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center text-center gap-3">
              <i className="fa-solid fa-layer-group text-3xl text-purple-300/40" />
              <p className="text-base font-semibold text-white/90">
                {emptyMessage || 'No categories created yet'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/outfits')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-purple-300/30 transition-all cursor-pointer"
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
