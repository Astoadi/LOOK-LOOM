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
import { get_today_dress, is_today_dress_chosen } from '../redux/actions/outfit_category_actions';
import { create_outfit } from '../redux/actions/outfits';

function Home_Page() {
  const authState = useSelector((state) => state.auth);
  const outfit_Category_state = useSelector((state) => state.outfit_category);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [outfit_body, set_outfit_body] = React.useState('');
  const [outfit_image, set_outfit_image] = React.useState(null);
  const [image_file, set_image_file] = React.useState(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isReadingImage, setIsReadingImage] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });

  const [todayDressStatus, setTodayDressStatus] = React.useState(false);
  const [todayEmptyDressMsg, setTodayEmptyDressMsg] = React.useState('');
  const [todayDress, setTodayDress] = React.useState('');
  const [tDressID, setTDressID] = React.useState(0);

  const fileInputRef = React.useRef(null);
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  // Today's dress status check
  React.useEffect(() => {
    async function checkingTodayDress() {
      try {
        const res1 = await dispatch(is_today_dress_chosen()).unwrap();
        setTodayDressStatus(res1.status);
        await dispatch(get_today_dress());
        if (outfit_Category_state.today_dress_name?.length > 0) {
          setTodayDress(outfit_Category_state.today_dress_name);
          setTDressID(outfit_Category_state.today_dress_id);
          setTodayEmptyDressMsg('');
        } else {
          setTodayDress('');
          setTodayEmptyDressMsg('Not Set Yet');
        }
      } catch (e) {
        console.error(e);
      }
    }
    checkingTodayDress();
  }, [
    dispatch,
    outfit_Category_state.today_dress_name,
    outfit_Category_state.today_dress_set,
    outfit_Category_state.today_dress_id,
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setIsReadingImage(true);
      set_outfit_image(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        set_image_file(reader.result);
        setIsReadingImage(false);
      };
      reader.onerror = () => {
        setIsReadingImage(false);
        setSnackbar({ show: true, type: 'error', message: 'Failed to read image file.' });
      };
      reader.readAsDataURL(file);
    } else {
      set_outfit_image(null);
      set_image_file(null);
      setSnackbar({ show: true, type: 'error', message: 'Please select a valid image (PNG, JPG, WEBP).' });
    }
  };

  const handleClearImage = () => {
    if (isCreating) return;
    set_outfit_image(null);
    set_image_file(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOutfitCreation = async (e) => {
    e?.preventDefault();
    if (isCreating) return;

    if (!outfit_body.trim() || !outfit_image) {
      setSnackbar({ show: true, type: 'error', message: 'Please provide both description and image.' });
      return;
    }

    try {
      setIsCreating(true);
      closeSnackbar();
      const result = await dispatch(create_outfit({ outfit_body, outfit_image }));
      const isSuccess = !result.error && (result.type?.endsWith('/fulfilled') ?? false);

      if (isSuccess) {
        setSnackbar({
          show: true,
          type: 'success',
          message: result.payload?.message || 'Outfit created successfully!',
        });
        set_outfit_body('');
        handleClearImage();
        setTimeout(() => navigate('/outfits'), 1000);
      } else {
        setSnackbar({
          show: true,
          type: 'error',
          message: result?.payload?.message || result?.error?.message || 'Failed to create outfit.',
        });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'A network error occurred. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  const isFormLocked = isCreating || isReadingImage;

  return (
    <div className="min-h-screen bg-[#060608] text-[#f5f5f7] relative overflow-hidden font-sans flex flex-col justify-between selection:bg-purple-400/30 selection:text-white">
      {/* Reusable Apple Feedback Snackbar */}
      <Snackbar
        show={snackbar.show}
        type={snackbar.type}
        message={snackbar.message}
        onClose={closeSnackbar}
      />

      {/* Subtle Ambient Lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] max-w-[95vw] h-[320px] bg-purple-600/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-40 right-[-10%] w-[450px] h-[450px] bg-pink-600/5 rounded-full blur-[140px]" />

      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
          {/* Top Bento Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* User Greeting Card */}
            <ScrollReveal y={20} duration={0.5}>
              <div className="h-full rounded-2xl p-6 sm:p-7 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-xl group hover:border-purple-300/25 transition-all">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-purple-300/80 tracking-wide uppercase">
                    Dashboard
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                    Hey @{authState?.user?.user_name || 'there'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                    Curate your daily rotation and manage your outfits.
                  </p>
                </div>

                <div className="pt-5 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/outfits')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-purple-300/30 transition-all cursor-pointer active:scale-95"
                  >
                    <i className="fa-solid fa-shirt text-xs text-purple-300" />
                    <span>View Wardrobe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/future_plans')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#a1a1a6] hover:text-white bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] transition-all cursor-pointer active:scale-95"
                  >
                    <i className="fa-regular fa-calendar text-xs" />
                    <span>Plans</span>
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Today's Dress Card */}
            <ScrollReveal y={20} delay={0.08} duration={0.5}>
              <div className="h-full rounded-2xl p-6 sm:p-7 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-xl group hover:border-pink-400/25 transition-all">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-pink-300/80 tracking-wide uppercase flex items-center gap-1.5">
                      <i className="fa-solid fa-sparkles text-pink-400 text-xs" />
                      <span>Today's Dress</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs text-[#a1a1a6] bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          todayDressStatus ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-amber-400'
                        }`}
                      />
                      <span>{todayDressStatus ? 'Active' : 'Not Set'}</span>
                    </span>
                  </div>

                  <div>
                    {outfit_Category_state.isPending ? (
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
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-pink-500 cursor-pointer hover:opacity-85 transition-opacity inline-flex items-center gap-2"
                      >
                        <span>{todayDress}</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-xs text-pink-400/70" />
                      </div>
                    ) : (
                      <span className="text-xl sm:text-2xl font-semibold text-white/90">
                        {todayEmptyDressMsg || 'Not Set Yet'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-5">
                  {todayDressStatus && todayDress ? (
                    <button
                      type="button"
                      onClick={() => {
                        const id = Number(tDressID);
                        if (Number.isInteger(id) && id > 0) {
                          navigate(`/dresses/${id}`);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/25 transition-all cursor-pointer active:scale-95"
                    >
                      <span>Explore Category</span>
                      <i className="fa-solid fa-arrow-right text-[10px]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/dresses')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-pink-300/30 transition-all cursor-pointer active:scale-95"
                    >
                      <i className="fa-solid fa-layer-group text-xs text-pink-300" />
                      <span>Choose Look</span>
                    </button>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Create Outfit Studio */}
          <ScrollReveal y={24} delay={0.12} duration={0.55}>
            <div className="rounded-2xl p-6 sm:p-8 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-xl flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                  Create New Outfit
                </h2>
                <p className="text-xs sm:text-sm text-[#86868b]">
                  Add styling details and an image to catalog your look.
                </p>
              </div>

              <form onSubmit={handleOutfitCreation} className="flex flex-col gap-5">
                {/* Description Input */}
                <input
                  disabled={isFormLocked}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.1] px-4 py-3 text-sm sm:text-base text-white placeholder:text-[#6e6e73] outline-none focus:border-purple-400/50 focus:bg-white/[0.06] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onChange={(e) => set_outfit_body(e.target.value)}
                  value={outfit_body}
                  type="text"
                  placeholder="Describe your outfit (e.g. Linen blazer with relaxed trousers)..."
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
                {!image_file ? (
                  <label
                    htmlFor={isFormLocked ? undefined : 'outfit-file-upload'}
                    className={`border-2 border-dashed border-white/[0.12] rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center gap-2 transition-all ${
                      isFormLocked
                        ? 'opacity-50 cursor-not-allowed bg-white/[0.01]'
                        : 'hover:border-purple-300/40 bg-white/[0.015] hover:bg-white/[0.03] cursor-pointer group'
                    }`}
                  >
                    {isReadingImage ? (
                      <Spinner size="md" color="text-purple-300" label="Processing image..." />
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up text-xl text-purple-300 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-sm font-medium text-white/90">
                          Upload Outfit Image
                        </span>
                        <span className="text-xs text-[#86868b]">
                          PNG, JPG, or WEBP
                        </span>
                      </>
                    )}
                  </label>
                ) : (
                  <div className="rounded-xl border border-white/[0.1] bg-white/[0.02] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/[0.15] shadow-md flex-shrink-0">
                        <img
                          src={image_file}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        {isReadingImage && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Spinner size="xs" color="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                          {outfit_image?.name || 'Outfit image'}
                        </span>
                        <span className="text-xs text-[#86868b]">
                          {outfit_image?.size ? `${(outfit_image.size / (1024 * 1024)).toFixed(2)} MB` : 'Image selected'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={isFormLocked ? undefined : 'outfit-file-upload'}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium text-white border transition-all ${
                          isFormLocked
                            ? 'opacity-40 cursor-not-allowed bg-white/[0.02] border-white/[0.05]'
                            : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.1] cursor-pointer'
                        }`}
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        disabled={isFormLocked}
                        onClick={handleClearImage}
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-red-300 hover:text-red-100 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex justify-start pt-1">
                  <button
                    type="submit"
                    disabled={isFormLocked}
                    className="px-7 py-3 rounded-full font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:opacity-95 active:scale-98 shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Spinner size="sm" color="text-white" />
                        <span>Curating Outfit...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus text-xs" />
                        <span>Create Outfit</span>
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
