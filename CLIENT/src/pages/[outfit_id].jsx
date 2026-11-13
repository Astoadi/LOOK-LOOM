import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Auth_Guard from '../utils/auth_guard';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import Snackbar from '../components/snackbar';
import Spinner from '../components/spinner';
import { ScrollReveal } from '../components/motion/index.jsx';
import {
  change_favorite_status,
  change_is_active_status,
  get_favorite_outfits,
  get_outfit,
  get_outfit_by_id,
  update_outfit_body,
  update_outfit_image,
} from '../redux/actions/outfits';

function SOutfit() {
  const { outfit_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const outfitState = useSelector((state) => state.outfit);

  const [currOutfit, setCurrOutfit] = React.useState(null);
  const [emptyMessage, setEmptyMessage] = React.useState('');
  const [pending, setPending] = React.useState(true);

  const [like, setLike] = React.useState(false);
  const [wearable, setWearable] = React.useState(true);
  const [outfitBody, setOutfitBody] = React.useState('');
  const [outfitImage, setOutfitImage] = React.useState('');
  const [newOutfitImage, setNewOutfitImage] = React.useState(null);
  const [newImagePreview, setNewImagePreview] = React.useState(null);

  const [inEditMode, setEditMode] = React.useState(false);
  const [newOutfitBody, setNewOutfitBody] = React.useState('');

  const [isUpdatingImage, setIsUpdatingImage] = React.useState(false);
  const [isUpdatingBody, setIsUpdatingBody] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });

  const imageInputRef = React.useRef(null);
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  // Fetch Outfit
  React.useEffect(() => {
    const fetchOutfit = async () => {
      try {
        setPending(true);
        await dispatch(get_outfit_by_id({ outfit_id }));
      } catch (e) {
        console.error(e);
        setEmptyMessage('Failed to load outfit details.');
      } finally {
        setPending(false);
      }
    };
    fetchOutfit();
  }, [dispatch, outfit_id]);

  // Sync outfit state
  React.useEffect(() => {
    if (outfitState.outfit) {
      setCurrOutfit(outfitState.outfit);
      setLike(outfitState.outfit.is_favorite);
      setWearable(outfitState.outfit.is_active);
      setOutfitImage(outfitState.outfit.image_url);
      setOutfitBody(outfitState.outfit.body);
    } else if (outfitState.message) {
      setEmptyMessage(outfitState.message);
    }
  }, [outfitState.outfit, outfitState.message]);

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setNewOutfitImage(file);
      const previewUrl = URL.createObjectURL(file);
      setNewImagePreview(previewUrl);
    } else {
      setSnackbar({ show: true, type: 'error', message: 'Please select a valid image file.' });
    }
  };

  const handleCancelNewImage = () => {
    setNewOutfitImage(null);
    setNewImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleOutfitImageUpdation = async () => {
    if (!newOutfitImage || isUpdatingImage) return;

    try {
      setIsUpdatingImage(true);
      closeSnackbar();
      const res = await dispatch(update_outfit_image({ outfit_id, outfit_image: newOutfitImage }));
      if (!res.error) {
        setOutfitImage(newImagePreview);
        handleCancelNewImage();
        setSnackbar({ show: true, type: 'success', message: 'Outfit image updated successfully.' });
        await dispatch(get_outfit());
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to update image.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleOutfitBodyUpdation = async () => {
    if (isUpdatingBody) return;
    if (!newOutfitBody.trim()) {
      setEditMode(false);
      return;
    }

    try {
      setIsUpdatingBody(true);
      closeSnackbar();
      const res = await dispatch(update_outfit_body({ outfit_id, body: newOutfitBody.trim() }));
      if (!res.error) {
        setOutfitBody(newOutfitBody.trim());
        setEditMode(false);
        setNewOutfitBody('');
        setSnackbar({ show: true, type: 'success', message: 'Styling notes updated.' });
        await dispatch(get_outfit());
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to update description.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'Failed to update description.' });
    } finally {
      setIsUpdatingBody(false);
    }
  };

  const handleToggleFavorite = async () => {
    const newStatus = !like;
    try {
      setLike(newStatus);
      await dispatch(change_favorite_status({ status: newStatus, outfit_id }));
      await dispatch(get_outfit());
      await dispatch(get_favorite_outfits());
    } catch (e) {
      console.error(e);
      setLike(!newStatus);
    }
  };

  const handleToggleWearable = async () => {
    if (isUpdatingStatus) return;
    const newWearable = !wearable;

    try {
      setIsUpdatingStatus(true);
      setWearable(newWearable);
      await dispatch(change_is_active_status({ outfit_id, is_active_status: newWearable }));
      setSnackbar({
        show: true,
        type: 'info',
        message: newWearable ? 'Marked as clean and ready to wear.' : 'Marked as dirty for laundry.',
      });
      await dispatch(get_outfit());
    } catch {
      setWearable(!newWearable);
      setSnackbar({ show: true, type: 'error', message: 'Failed to update wearable status.' });
    } finally {
      setIsUpdatingStatus(false);
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

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-6">
          {/* Back Navigation Button */}
          <ScrollReveal y={12} duration={0.35}>
            <button
              type="button"
              onClick={() => navigate('/outfits')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer w-fit select-none active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <i className="fa-solid fa-arrow-left text-xs text-violet-500" />
              <span>Back to Wardrobe</span>
            </button>
          </ScrollReveal>

          {/* Loading / Content / Empty State */}
          {pending ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="text-violet-600 dark:text-violet-400" label="Loading outfit details..." />
            </div>
          ) : currOutfit ? (
            <ScrollReveal y={16} duration={0.45}>
              <div className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#161619] overflow-hidden shadow-sm flex flex-col md:flex-row">
                {/* Left: Image Showcase */}
                <div className="relative md:w-1/2 min-h-[340px] bg-zinc-100 dark:bg-zinc-900 overflow-hidden group">
                  <img
                    className="w-full h-full min-h-[340px] max-h-[520px] object-cover transition-transform duration-500"
                    src={newImagePreview || outfitImage || currOutfit.image_url}
                    alt={outfitBody || 'Outfit'}
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

                  {/* Hidden File Input */}
                  <input
                    ref={imageInputRef}
                    onChange={handleImageFileSelect}
                    type="file"
                    accept="image/*"
                    id="outfit-image-change"
                    className="hidden"
                    disabled={isUpdatingImage}
                  />

                  {/* Edit Image Action Button with Pastel Accent */}
                  {!newOutfitImage ? (
                    <label
                      htmlFor="outfit-image-change"
                      className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-md cursor-pointer transition-all shadow-sm active:scale-95"
                      title="Change photo"
                    >
                      <i className="fa-solid fa-camera text-xs text-violet-300" />
                      <span>Update Photo</span>
                    </label>
                  ) : (
                    <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-zinc-900/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 flex items-center justify-between gap-2 shadow-xl">
                      <span className="text-xs text-white font-medium truncate">
                        Confirm photo update?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isUpdatingImage}
                          onClick={handleOutfitImageUpdation}
                          className="px-3.5 py-1 rounded-full text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                        >
                          {isUpdatingImage ? (
                            <Spinner size="xs" color="currentColor" />
                          ) : (
                            <i className="fa-solid fa-check text-[10px]" />
                          )}
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          disabled={isUpdatingImage}
                          onClick={handleCancelNewImage}
                          className="px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white bg-white/10 hover:bg-white/20 cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Outfit Information & Controls */}
                <div className="p-6 sm:p-8 md:w-1/2 flex flex-col justify-between gap-6">
                  <div className="flex flex-col gap-5">
                    {/* Title & Edit Row */}
                    <div className="flex items-start justify-between gap-3">
                      {!inEditMode ? (
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                            {outfitBody || 'Untitled Outfit'}
                          </h1>
                          <button
                            type="button"
                            onClick={() => {
                              setNewOutfitBody(outfitBody);
                              setEditMode(true);
                            }}
                            className="p-1.5 rounded-full text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors cursor-pointer"
                            title="Edit notes"
                          >
                            <i className="fa-solid fa-pen text-xs" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={newOutfitBody}
                            onChange={(e) => setNewOutfitBody(e.target.value)}
                            disabled={isUpdatingBody}
                            placeholder="Describe your outfit..."
                            className="flex-1 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-violet-400 dark:focus:border-violet-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            disabled={isUpdatingBody}
                            onClick={handleOutfitBodyUpdation}
                            className="px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1"
                          >
                            {isUpdatingBody ? <Spinner size="xs" color="currentColor" /> : 'Save'}
                          </button>
                          <button
                            type="button"
                            disabled={isUpdatingBody}
                            onClick={() => setEditMode(false)}
                            className="px-2.5 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Favorite Button with Coral / Rose Pastel Accent */}
                      <button
                        type="button"
                        onClick={handleToggleFavorite}
                        className="w-9 h-9 rounded-full bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-800/50 flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 flex-shrink-0"
                        title={like ? 'Favorited' : 'Add to favorites'}
                      >
                        {like ? (
                          <i className="fa-solid fa-heart text-rose-500 text-sm shadow-sm" />
                        ) : (
                          <i className="fa-regular fa-heart text-rose-400 dark:text-rose-400 hover:text-rose-600 text-sm" />
                        )}
                      </button>
                    </div>

                    {/* Wearable / Laundry Status Card with Pastel Tints */}
                    <div
                      className={`rounded-2xl p-4 border flex items-center justify-between gap-3 ${
                        wearable
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/40'
                          : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            wearable ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <div className="flex flex-col">
                          <span
                            className={`text-xs sm:text-sm font-semibold ${
                              wearable
                                ? 'text-emerald-900 dark:text-emerald-200'
                                : 'text-amber-900 dark:text-amber-200'
                            }`}
                          >
                            {wearable ? 'Clean & Ready to Wear' : 'Needs Laundry'}
                          </span>
                          <span
                            className={`text-xs ${
                              wearable
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {wearable ? 'Available in your rotation' : 'Marked as dirty'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={handleToggleWearable}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer active:scale-95 disabled:opacity-50 select-none shadow-sm ${
                          wearable
                            ? 'text-amber-800 dark:text-amber-200 bg-white hover:bg-amber-50 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 border-amber-300 dark:border-amber-700'
                            : 'text-emerald-800 dark:text-emerald-200 bg-white hover:bg-emerald-50 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700'
                        }`}
                      >
                        {isUpdatingStatus ? (
                          <Spinner size="xs" color="currentColor" />
                        ) : wearable ? (
                          'Mark Dirty'
                        ) : (
                          'Mark Clean'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadata Timestamps */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span>Created</span>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {currOutfit?.created_at
                          ? new Date(currOutfit.created_at).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </span>
                    </div>
                    {currOutfit?.updated_at && (
                      <div className="flex items-center justify-between">
                        <span>Last Updated</span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {new Date(currOutfit.updated_at).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ) : (
            <div className="rounded-2xl p-12 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center justify-center text-center gap-3">
              <i className="fa-solid fa-shirt text-3xl text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300">
                {emptyMessage || 'Outfit not found'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/outfits')}
                className="mt-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer"
              >
                Back to Outfits
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

const ProtectedSOutfit = Auth_Guard(SOutfit);
export default ProtectedSOutfit;
