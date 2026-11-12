import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Auth_Guard from '../utils/auth_guard';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import Snackbar from '../components/snackbar';
import Spinner from '../components/spinner';
import { ScrollReveal } from '../components/motion/index.jsx';
import { get_dress_outfits } from '../redux/actions/dress';
import {
  get_today_dress,
  is_this_today_dress,
  is_today_dress_chosen,
  remove_today_dress,
  set_today_dress,
  update_today_dress,
} from '../redux/actions/outfit_category_actions';
import { make_plan } from '../redux/actions/planner';

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

function SDress() {
  const { outfit_category_id } = useParams();
  const dispatch = useDispatch();
  const dressSelector = useSelector((state) => state.dress);
  const navigate = useNavigate();

  const [pending, setPending] = React.useState(true);
  const [emptyMessage, setEmptyMessage] = React.useState('');

  const [hasGlobalTodayDress, setHasGlobalTodayDress] = React.useState(false);
  const [isThisTodayDress, setIsThisTodayDress] = React.useState(false);
  const [isUpdatingToday, setIsUpdatingToday] = React.useState(false);

  const [planNote, setPlanNote] = React.useState('');
  const [planDate, setPlanDate] = React.useState('');
  const [isPlanning, setIsPlanning] = React.useState(false);

  const [outfits, setOutfits] = React.useState([]);
  const [categoryName, setCategoryName] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  // Fetch Outfits for Category
  React.useEffect(() => {
    const fetchOutfits = async () => {
      setPending(true);
      try {
        await dispatch(get_dress_outfits({ outfit_category_id }));
      } catch (e) {
        console.error(e);
        setEmptyMessage('Failed to load category ensembles.');
      } finally {
        setPending(false);
      }
    };
    fetchOutfits();
  }, [dispatch, outfit_category_id]);

  // Check Today Dress Status
  React.useEffect(() => {
    async function checkStatus() {
      try {
        const res1 = await dispatch(is_today_dress_chosen()).unwrap();
        setHasGlobalTodayDress(Boolean(res1?.status));
        await dispatch(get_today_dress());

        const res2 = await dispatch(is_this_today_dress({ outfit_category_id })).unwrap();
        setIsThisTodayDress(Boolean(res2?.status));
      } catch (e) {
        console.error(e);
      }
    }
    checkStatus();
  }, [dispatch, outfit_category_id]);

  // Sync Outfits
  React.useEffect(() => {
    if (dressSelector.dress_outfits?.length > 0) {
      setOutfits(dressSelector.dress_outfits);
      setCategoryName(dressSelector.dress_outfits[0]?.category_name || 'Dress Category');
      setEmptyMessage('');
    } else {
      setOutfits([]);
      setEmptyMessage('No outfits associated with this category yet.');
    }
  }, [dressSelector.dress_outfits]);

  // Handle Event Planning
  const handleMakePlan = async (e) => {
    e?.preventDefault();
    if (!planNote.trim() || !planDate || isPlanning) return;

    try {
      setIsPlanning(true);
      closeSnackbar();
      const res = await dispatch(
        make_plan({ outfit_category_id, plan_date: planDate, notes: planNote.trim() })
      );
      if (!res.error) {
        setSnackbar({
          show: true,
          type: 'success',
          message: 'Event scheduled successfully! Check your Plans.',
        });
        setPlanDate('');
        setPlanNote('');
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to schedule event.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'Failed to schedule event.' });
    } finally {
      setIsPlanning(false);
    }
  };

  // Toggle Today's Dress
  const handleToggleTodayDress = async () => {
    if (isUpdatingToday) return;

    try {
      setIsUpdatingToday(true);
      closeSnackbar();

      if (isThisTodayDress) {
        // Remove as today dress
        await dispatch(remove_today_dress());
        setIsThisTodayDress(false);
        setHasGlobalTodayDress(false);
        setSnackbar({ show: true, type: 'info', message: "Removed from today's look." });
      } else if (hasGlobalTodayDress) {
        // Update today dress
        await dispatch(update_today_dress({ outfit_category_id }));
        setIsThisTodayDress(true);
        setSnackbar({ show: true, type: 'success', message: "Updated today's curated dress!" });
      } else {
        // Set as today dress
        await dispatch(set_today_dress({ outfit_category_id }));
        setIsThisTodayDress(true);
        setHasGlobalTodayDress(true);
        setSnackbar({ show: true, type: 'success', message: "Set as today's curated dress!" });
      }
      await dispatch(get_today_dress());
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'Failed to update today dress status.' });
    } finally {
      setIsUpdatingToday(false);
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

      {/* Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] max-w-[95vw] h-[350px] bg-purple-600/10 rounded-full blur-[130px]" />
      <div className="pointer-events-none absolute bottom-40 right-[-10%] w-[450px] h-[450px] bg-pink-600/5 rounded-full blur-[140px]" />

      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-6 sm:gap-8">
          {/* Back Navigation Button */}
          <ScrollReveal y={16} duration={0.4}>
            <button
              type="button"
              onClick={() => navigate('/dresses')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-[#a1a1a6] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer w-fit select-none active:scale-95"
            >
              <i className="fa-solid fa-arrow-left text-xs" />
              <span>Back to Dresses</span>
            </button>
          </ScrollReveal>

          {/* Top Bento Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* Category Overview & Today's Dress Action */}
            <ScrollReveal y={20} duration={0.5} className="lg:col-span-6">
              <div className="h-full rounded-3xl p-6 sm:p-8 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-purple-200 bg-purple-500/10 border border-purple-500/20">
                      <i className="fa-solid fa-layer-group text-xs text-purple-300" />
                      <span>Category Curation</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs text-[#a1a1a6] bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isThisTodayDress ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-white/30'
                        }`}
                      />
                      <span>{isThisTodayDress ? "Today's Active Look" : 'In Wardrobe'}</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                    {categoryName || 'Curated Category'}
                  </h1>

                  <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                    {outfits.length} ensemble{outfits.length === 1 ? '' : 's'} grouped in this look.
                    Toggle below to wear this collection today.
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    disabled={isUpdatingToday}
                    onClick={handleToggleTodayDress}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50 select-none shadow-md ${
                      isThisTodayDress
                        ? 'text-red-200 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30'
                        : 'text-white bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:opacity-95 shadow-purple-500/25'
                    }`}
                  >
                    {isUpdatingToday ? (
                      <>
                        <Spinner size="xs" color="currentColor" />
                        <span>Updating rotation...</span>
                      </>
                    ) : isThisTodayDress ? (
                      <>
                        <i className="fa-solid fa-xmark text-xs" />
                        <span>Remove as Today's Look</span>
                      </>
                    ) : hasGlobalTodayDress ? (
                      <>
                        <i className="fa-solid fa-arrows-rotate text-xs" />
                        <span>Switch to Today's Look</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-magic-sparkles text-xs" />
                        <span>Set as Today's Look</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Plan an Event Studio Card */}
            <ScrollReveal y={20} delay={0.08} duration={0.5} className="lg:col-span-6">
              <div className="h-full rounded-3xl p-6 sm:p-8 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-pink-300/90">
                    <i className="fa-regular fa-calendar-check text-pink-400" />
                    <span>Plan an Event</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Schedule This Look
                  </h2>
                  <p className="text-xs sm:text-sm text-[#86868b]">
                    Attach notes and schedule a target date on your calendar.
                  </p>
                </div>

                <form onSubmit={handleMakePlan} className="pt-4 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      disabled={isPlanning}
                      value={planNote}
                      onChange={(e) => setPlanNote(e.target.value)}
                      placeholder="Event note (e.g. Gala dinner)..."
                      className="rounded-xl bg-white/[0.04] border border-white/[0.1] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#6e6e73] outline-none focus:border-purple-400/50 disabled:opacity-50"
                      required
                    />

                    <input
                      type="date"
                      disabled={isPlanning}
                      value={planDate}
                      onChange={(e) => setPlanDate(e.target.value)}
                      className="rounded-xl bg-white/[0.04] border border-white/[0.1] px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-purple-400/50 disabled:opacity-50 cursor-pointer"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!planNote.trim() || !planDate || isPlanning}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-95 active:scale-95 shadow-md shadow-pink-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
                    >
                      {isPlanning ? (
                        <>
                          <Spinner size="xs" color="text-white" />
                          <span>Scheduling...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-regular fa-calendar-plus text-xs" />
                          <span>Schedule Event</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </ScrollReveal>
          </div>

          {/* Ensembles in Category */}
          <div className="pt-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-4">
              Category Ensembles ({outfits.length})
            </h2>

            {pending ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Spinner size="lg" color="text-purple-400" label="Loading category ensembles..." />
              </div>
            ) : outfits.length > 0 ? (
              <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {outfits.map((outfit, index) => {
                  const staggerDelay = Math.min((index % 4) * 0.08, 0.24);

                  return (
                    <ScrollReveal
                      key={outfit.outfit_id}
                      y={24}
                      delay={staggerDelay}
                      amount={0.15}
                      duration={0.5}
                    >
                      <div className="group rounded-2xl border border-white/[0.08] hover:border-purple-300/30 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between">
                        {/* Image Showcase with Lazy Loading */}
                        <div className="relative h-60 w-full overflow-hidden bg-black/40">
                          <LazyOutfitImage
                            src={outfit.image_url}
                            alt={outfit.body || 'Outfit'}
                            onClick={() => navigate(`/outfits/${outfit.outfit_id}`)}
                          />

                          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30 pointer-events-none" />

                          {outfit.is_favorite && (
                            <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center">
                              <i className="fa-solid fa-heart text-pink-500 text-xs" />
                            </span>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex flex-col gap-2.5">
                          <h3
                            onClick={() => navigate(`/outfits/${outfit.outfit_id}`)}
                            className="font-semibold text-base text-white hover:text-purple-200 transition-colors cursor-pointer truncate"
                            title={outfit.body}
                          >
                            {outfit.body || 'Untitled Look'}
                          </h3>

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
                              Inspect →
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
                  {emptyMessage || 'No outfits in this category'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/outfits')}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-purple-300/30 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-plus text-xs" />
                  <span>Assign Outfits from Wardrobe</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

const ProtectedSDress = Auth_Guard(SDress);
export default ProtectedSDress;
