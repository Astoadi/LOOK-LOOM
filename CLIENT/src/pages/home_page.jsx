import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Auth_Guard from '../utils/auth_guard';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import Snackbar from '../components/snackbar';
import Spinner from '../components/spinner';
import MovingDots from '../components/dots';
import { ScrollReveal } from '../components/motion/index.jsx';
import { create_outfit, get_outfit } from '../redux/actions/outfits';
import { get_today_dress, is_today_dress_chosen } from '../redux/actions/outfit_category_actions';

function Home_Page() {
  const outfitCategoryState = useSelector((state) => state.outfit_category) || {};
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [outfitBody, setOutfitBody] = React.useState('');
  const [outfitImage, setOutfitImage] = React.useState(null);
  const [imageFile, setImageFile] = React.useState(null);
  const [isReadingImage, setIsReadingImage] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  const [todayDressStatus, setTodayDressStatus] = React.useState(false);
  const [todayDress, setTodayDress] = React.useState('');
  const [todayEmptyDressMsg, setTodayEmptyDressMsg] = React.useState('');
  const [tDressID, setTDressID] = React.useState(null);

  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });
  const fileInputRef = React.useRef(null);

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  // Check today's dress on mount
  React.useEffect(() => {
    async function checkTodayDress() {
      try {
        const res = await dispatch(is_today_dress_chosen()).unwrap();
        setTodayDressStatus(Boolean(res?.status));
        await dispatch(get_today_dress());
      } catch (e) {
        console.error('Error checking today dress:', e);
      }
    }
    checkTodayDress();
  }, [dispatch]);

  // Sync today's dress from Redux state
  React.useEffect(() => {
    if (outfitCategoryState?.today_dress_set !== undefined) {
      setTodayDressStatus(Boolean(outfitCategoryState.today_dress_set));
    }
    if (outfitCategoryState?.today_dress_name) {
      setTodayDress(outfitCategoryState.today_dress_name);
      setTDressID(outfitCategoryState.today_dress_id);
      setTodayEmptyDressMsg('');
    } else {
      setTodayDress('');
      setTDressID(null);
      setTodayEmptyDressMsg(outfitCategoryState?.message || '');
    }
  }, [
    outfitCategoryState?.today_dress_set,
    outfitCategoryState?.today_dress_name,
    outfitCategoryState?.today_dress_id,
    outfitCategoryState?.message,
  ]);

  // Handle local image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setIsReadingImage(true);
      setOutfitImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageFile(reader.result);
        setIsReadingImage(false);
      };
      reader.onerror = () => {
        setIsReadingImage(false);
        setSnackbar({ show: true, type: 'error', message: 'Failed to read image file.' });
      };
      reader.readAsDataURL(file);
    } else {
      setSnackbar({ show: true, type: 'error', message: 'Please select a valid image file.' });
    }
  };

  const handleClearImage = () => {
    setOutfitImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit outfit creation
  const handleOutfitCreation = async (e) => {
    e.preventDefault();
    if (!outfitBody.trim() || !outfitImage || isCreating) return;

    try {
      setIsCreating(true);
      closeSnackbar();

      const res = await dispatch(create_outfit({ body: outfitBody.trim(), outfit_image: outfitImage }));
      const isSuccess = !res.error && (res.type?.endsWith('/fulfilled') ?? false);

      if (isSuccess) {
        setSnackbar({
          show: true,
          type: 'success',
          message: res.payload?.message || 'Look cataloged successfully!',
        });
        setOutfitBody('');
        handleClearImage();
        await dispatch(get_outfit());
      } else {
        setSnackbar({
          show: true,
          type: 'error',
          message: res.payload?.message || 'Failed to create outfit.',
        });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsCreating(false);
    }
  };

  const isFormLocked = isCreating || isReadingImage;

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
          {/* Top Bento Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Welcome Greeting with Pastel Lavender Gradient */}
            <ScrollReveal y={12} duration={0.4}>
              <div className="h-full rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-violet-500/[0.08] via-white to-white dark:from-violet-500/[0.12] dark:via-[#161619] dark:to-[#161619] border border-violet-200/70 dark:border-violet-900/40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/60 w-fit">
                    <i className="fa-solid fa-sparkles text-[10px]" />
                    <span>Studio Dashboard</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Hey, @{authState?.user?.user_name || 'Curator'}
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Welcome to your personal style laboratory. Catalog pieces, design ensembles, and rotate your signature looks.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/outfits')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer select-none active:scale-95"
                  >
                    <i className="fa-solid fa-shirt text-xs" />
                    <span>Browse Wardrobe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/future_plans')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer select-none active:scale-95"
                  >
                    <i className="fa-regular fa-calendar text-xs" />
                    <span>Event Schedule</span>
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Today's Look Card with Pastel Mint / Emerald Gradient */}
            <ScrollReveal y={12} delay={0.06} duration={0.4}>
              <div
                className={`h-full rounded-3xl p-6 sm:p-7 bg-gradient-to-br shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4 border transition-colors ${
                  todayDressStatus && todayDress
                    ? 'from-emerald-500/[0.08] via-white to-white dark:from-emerald-500/[0.14] dark:via-[#161619] dark:to-[#161619] border-emerald-200/80 dark:border-emerald-900/50'
                    : 'from-amber-500/[0.06] via-white to-white dark:from-amber-500/[0.1] dark:via-[#161619] dark:to-[#161619] border-amber-200/70 dark:border-amber-900/40'
                }`}
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        todayDressStatus && todayDress
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60'
                          : 'text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60'
                      }`}
                    >
                      <i className="fa-solid fa-wand-magic-sparkles text-[10px]" />
                      <span>Today's Rotation</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                        todayDressStatus
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                          : 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          todayDressStatus ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                        }`}
                      />
                      <span>{todayDressStatus ? 'Active Look' : 'Unassigned'}</span>
                    </span>
                  </div>

                  <div>
                    {outfitCategoryState?.isPending ? (
                      <div className="py-2">
                        <MovingDots />
                      </div>
                    ) : todayDressStatus && todayDress ? (
                      <div
                        onClick={() => {
                          const id = Number(tDressID);
                          if (Number.isInteger(id) && id > 0) {
                            navigate(`/dresses/${id}`);
                          }
                        }}
                        className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors inline-flex items-center gap-2"
                      >
                        <span>{todayDress}</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-xs text-emerald-500" />
                      </div>
                    ) : (
                      <span className="text-base sm:text-lg font-medium text-zinc-500 dark:text-zinc-400">
                        {todayEmptyDressMsg || 'No dress assigned for today yet'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  {todayDressStatus && todayDress ? (
                    <button
                      type="button"
                      onClick={() => {
                        const id = Number(tDressID);
                        if (Number.isInteger(id) && id > 0) {
                          navigate(`/dresses/${id}`);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200 bg-emerald-100/80 hover:bg-emerald-200/80 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300/80 dark:border-emerald-800/60 transition-colors cursor-pointer select-none active:scale-95"
                    >
                      <span>Explore Look Ensembles</span>
                      <i className="fa-solid fa-arrow-right text-[10px]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/dresses')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 shadow-sm shadow-amber-500/20 transition-colors cursor-pointer select-none active:scale-95"
                    >
                      <i className="fa-solid fa-layer-group text-xs" />
                      <span>Choose Look for Today</span>
                    </button>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Create Outfit Studio */}
          <ScrollReveal y={16} delay={0.1} duration={0.4}>
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-800/50 flex items-center justify-center text-violet-600 dark:text-violet-300">
                  <i className="fa-solid fa-plus text-sm" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Catalog a New Outfit
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    Snap or upload a photo, attach styling tags, and save it to your collection.
                  </p>
                </div>
              </div>

              <form onSubmit={handleOutfitCreation} className="flex flex-col gap-4">
                {/* Description Input */}
                <input
                  disabled={isFormLocked}
                  className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onChange={(e) => setOutfitBody(e.target.value)}
                  value={outfitBody}
                  type="text"
                  placeholder="Describe your outfit (e.g. Navy tailored linen blazer with cream chinos)..."
                  required
                />

                {/* File Upload Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={isFormLocked}
                  onChange={handleImageChange}
                  className="hidden"
                  id="outfit-file-upload"
                />

                {/* Dropzone or Preview */}
                {!imageFile ? (
                  <label
                    htmlFor={isFormLocked ? undefined : 'outfit-file-upload'}
                    className={`border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-2 transition-all ${
                      isFormLocked
                        ? 'opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40'
                        : 'bg-zinc-50/50 hover:bg-violet-50/30 dark:bg-zinc-900/30 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700 cursor-pointer group'
                    }`}
                  >
                    {isReadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="sm" color="text-violet-600" />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Processing image...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                          <i className="fa-solid fa-cloud-arrow-up" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Upload Outfit Photo
                        </span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          PNG, JPG, or WEBP up to 10MB
                        </span>
                      </>
                    )}
                  </label>
                ) : (
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
                        <img
                          src={imageFile}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {outfitImage?.name || 'Selected outfit image'}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          {outfitImage?.size ? `${(outfitImage.size / (1024 * 1024)).toFixed(2)} MB • Ready` : 'Ready'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <label
                        htmlFor={isFormLocked ? undefined : 'outfit-file-upload'}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isFormLocked
                            ? 'opacity-40 cursor-not-allowed bg-transparent border-transparent'
                            : 'bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 cursor-pointer text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        disabled={isFormLocked}
                        onClick={handleClearImage}
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 cursor-pointer transition-colors disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Action with Contrast Violet Highlight */}
                <div className="flex justify-start pt-1">
                  <button
                    type="submit"
                    disabled={isFormLocked}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium text-xs sm:text-sm text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isCreating ? (
                      <>
                        <Spinner size="xs" color="currentColor" />
                        <span>Cataloging Look...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus text-xs" />
                        <span>Save to Wardrobe</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </ScrollReveal>
        </main>
      </div>

      <Footer />
    </div>
  );
}

const ProtectedHomePage = Auth_Guard(Home_Page);
export default ProtectedHomePage;
