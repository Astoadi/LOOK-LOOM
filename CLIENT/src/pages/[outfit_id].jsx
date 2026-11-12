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

  // Handle Image Selection
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

  // Update Outfit Image
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

  // Update Outfit Body Description
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

  // Toggle Favorite Status
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

  // Toggle Wearable / Laundry Status
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
    <div className="min-h-screen bg-[#060608] text-[#f5f5f7] relative overflow-hidden font-sans flex flex-col justify-between selection:bg-purple-400/30 selection:text-white">
      {/* Reusable Feedback Snackbar */}
      <Snackbar
        show={snackbar.show}
        type={snackbar.type}
        message={snackbar.message}
        onClose={closeSnackbar}
      />

      {/* Ambient Radial Lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] max-w-[95vw] h-[350px] bg-purple-600/10 rounded-full blur-[130px]" />
      <div className="pointer-events-none absolute bottom-40 right-[-10%] w-[450px] h-[450px] bg-pink-600/5 rounded-full blur-[140px]" />

      <div>
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-6">
          {/* Back Navigation Button */}
          <ScrollReveal y={16} duration={0.4}>
            <button
              type="button"
              onClick={() => navigate('/outfits')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-[#a1a1a6] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer w-fit select-none active:scale-95"
            >
              <i className="fa-solid fa-arrow-left text-xs" />
              <span>Back to Wardrobe</span>
            </button>
          </ScrollReveal>

          {/* Loading / Content / Empty State */}
          {pending ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="text-purple-400" label="Loading outfit details..." />
            </div>
          ) : currOutfit ? (
            <ScrollReveal y={20} duration={0.5}>
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                {/* Left: Image Showcase */}
                <div className="relative md:w-1/2 min-h-[380px] bg-black/40 overflow-hidden group">
                  <img
                    className="w-full h-full min-h-[380px] max-h-[550px] object-cover transition-transform duration-500"
                    src={newImagePreview || outfitImage || currOutfit.image_url}
                    alt={outfitBody || 'Outfit'}
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Top Gradient & Edit Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

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

                  {/* Edit Image Action Button */}
                  {!newOutfitImage ? (
                    <label
                      htmlFor="outfit-image-change"
                      className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-black/60 hover:bg-black/80 border border-white/20 hover:border-purple-300/40 backdrop-blur-md cursor-pointer transition-all shadow-md active:scale-95"
                      title="Change photo"
                    >
                      <i className="fa-solid fa-camera text-xs text-purple-300" />
                      <span>Update Photo</span>
                    </label>
                  ) : (
                    <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 flex items-center justify-between gap-2 shadow-2xl">
                      <span className="text-xs text-purple-200 font-medium truncate">
                        Confirm photo update?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isUpdatingImage}
                          onClick={handleOutfitImageUpdation}
                          className="px-3.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                        >
                          {isUpdatingImage ? (
                            <Spinner size="xs" color="text-white" />
                          ) : (
                            <i className="fa-solid fa-check text-[10px]" />
                          )}
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          disabled={isUpdatingImage}
                          onClick={handleCancelNewImage}
                          className="px-3 py-1 rounded-full text-xs font-medium text-[#a1a1a6] hover:text-white bg-white/10 hover:bg-white/20 cursor-pointer disabled:opacity-50"
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
                          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white truncate">
                            {outfitBody || 'Untitled Outfit'}
                          </h1>
                          <button
                            type="button"
                            onClick={() => {
                              setNewOutfitBody(outfitBody);
                              setEditMode(true);
                            }}
                            className="p-1.5 rounded-full text-[#86868b] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                            className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.15] px-3.5 py-2 text-sm text-white placeholder:text-[#6e6e73] outline-none focus:border-purple-400/50"
                            autoFocus
                          />
                          <button
                            type="button"
                            disabled={isUpdatingBody}
                            onClick={handleOutfitBodyUpdation}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                          >
                            {isUpdatingBody ? <Spinner size="xs" color="text-white" /> : 'Save'}
                          </button>
                          <button
                            type="button"
                            disabled={isUpdatingBody}
                            onClick={() => setEditMode(false)}
                            className="px-2.5 py-2 rounded-xl text-xs text-[#a1a1a6] hover:text-white bg-white/10 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={handleToggleFavorite}
                        className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 flex-shrink-0"
                        title={like ? 'Favorited' : 'Add to favorites'}
                      >
                        {like ? (
                          <i className="fa-solid fa-heart text-pink-500 text-sm shadow-sm" />
                        ) : (
                          <i className="fa-regular fa-heart text-white/60 hover:text-white text-sm" />
                        )}
                      </button>
                    </div>

                    {/* Wearable / Laundry Status Card */}
                    <div className="rounded-2xl p-4 bg-white/[0.025] border border-white/[0.06] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            wearable ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                          }`}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-semibold text-white">
                            {wearable ? 'Clean & Wearable' : 'Needs Laundry'}
                          </span>
                          <span className="text-[11px] text-[#86868b]">
                            {wearable ? 'Ready for your daily rotation' : 'Marked as dirty'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={handleToggleWearable}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer active:scale-95 disabled:opacity-50 select-none ${
                          wearable
                            ? 'text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20'
                            : 'text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20'
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
                  <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-1.5 text-xs text-[#86868b]">
                    <div className="flex items-center justify-between">
                      <span>Created</span>
                      <span className="text-white/80">
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
                        <span className="text-white/80">
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
            <div className="rounded-2xl p-12 bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center text-center gap-3">
              <i className="fa-solid fa-shirt text-3xl text-purple-300/40" />
              <p className="text-base font-semibold text-white/90">
                {emptyMessage || 'Outfit not found'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/outfits')}
                className="mt-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-all cursor-pointer"
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
