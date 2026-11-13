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
          message: 'Event scheduled successfully. Check your Event Schedule.',
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
        await dispatch(remove_today_dress());
        setIsThisTodayDress(false);
        setHasGlobalTodayDress(false);
        setSnackbar({ show: true, type: 'info', message: "Removed from today's look." });
      } else if (hasGlobalTodayDress) {
        await dispatch(update_today_dress({ outfit_category_id }));
        setIsThisTodayDress(true);
        setSnackbar({ show: true, type: 'success', message: "Updated today's active look." });
      } else {
        await dispatch(set_today_dress({ outfit_category_id }));
        setIsThisTodayDress(true);
        setHasGlobalTodayDress(true);
        setSnackbar({ show: true, type: 'success', message: "Set as today's active look." });
      }
      await dispatch(get_today_dress());
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'Failed to update today dress status.' });
    } finally {
      setIsUpdatingToday(false);
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
          {/* Back Navigation Button */}
          <ScrollReveal y={12} duration={0.35}>
            <button
              type="button"
              onClick={() => navigate('/dresses')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer w-fit select-none active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <i className="fa-solid fa-arrow-left text-xs text-violet-500" />
              <span>Back to Dresses</span>
            </button>
          </ScrollReveal>

          {/* Top Bento Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* Category Overview & Today's Dress Action with Pastel Lavender Wash */}
            <ScrollReveal y={16} duration={0.4} className="lg:col-span-6">
              <div className="h-full rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-violet-500/[0.08] via-white to-white dark:from-violet-500/[0.12] dark:via-[#161619] dark:to-[#161619] border border-violet-200/70 dark:border-violet-900/40 relative overflow-hidden flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/60">
                      <i className="fa-solid fa-layer-group text-xs" />
                      <span>Category Curation</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800/80 px-2.5 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-700">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isThisTodayDress ? 'bg-emerald-500' : 'bg-zinc-400'
                        }`}
                      />
                      <span>{isThisTodayDress ? "Today's Active Look" : 'In Wardrobe'}</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {categoryName || 'Curated Category'}
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {outfits.length} ensemble{outfits.length === 1 ? '' : 's'} cataloged in this look.
                    Wear this curated ensemble today or plan it for an upcoming date.
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    disabled={isUpdatingToday}
                    onClick={handleToggleTodayDress}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95 disabled:opacity-50 select-none shadow-sm ${
                      isThisTodayDress
                        ? 'text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40'
                        : 'text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25'
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

            {/* Plan an Event Studio Card with Pastel Rose / Blush Wash */}
            <ScrollReveal y={16} delay={0.05} duration={0.4} className="lg:col-span-6">
              <div className="h-full rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-rose-500/[0.08] via-white to-white dark:from-rose-500/[0.12] dark:via-[#161619] dark:to-[#161619] border border-rose-200/70 dark:border-rose-900/40 relative overflow-hidden flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 w-fit">
                    <i className="fa-regular fa-calendar-check text-xs" />
                    <span>Plan an Event</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Schedule This Look
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    Add styling notes and pick a date on your schedule calendar.
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
                      className="rounded-xl bg-white dark:bg-zinc-900 border border-rose-200/80 dark:border-rose-800/60 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-rose-400 dark:focus:border-rose-500 disabled:opacity-50"
                      required
                    />

                    <input
                      type="date"
                      disabled={isPlanning}
                      value={planDate}
                      onChange={(e) => setPlanDate(e.target.value)}
                      className="rounded-xl bg-white dark:bg-zinc-900 border border-rose-200/80 dark:border-rose-800/60 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-400 dark:focus:border-rose-500 disabled:opacity-50 cursor-pointer"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!planNote.trim() || !planDate || isPlanning}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
                    >
                      {isPlanning ? (
                        <>
                          <Spinner size="xs" color="currentColor" />
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
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              Category Ensembles ({outfits.length})
            </h2>

            {pending ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Spinner size="lg" color="text-violet-600 dark:text-violet-400" label="Loading category ensembles..." />
              </div>
            ) : outfits.length > 0 ? (
              <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {outfits.map((outfit, index) => {
                  const staggerDelay = Math.min((index % 4) * 0.05, 0.2);

                  return (
                    <ScrollReveal
                      key={outfit.outfit_id}
                      y={16}
                      delay={staggerDelay}
                      amount={0.1}
                      duration={0.4}
                    >
                      <div className="group rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-violet-200 dark:hover:border-violet-800 bg-white dark:bg-[#161619] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-200 flex flex-col justify-between">
                        {/* Image Showcase */}
                        <div className="relative h-60 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                          <LazyOutfitImage
                            src={outfit.image_url}
                            alt={outfit.body || 'Outfit'}
                            onClick={() => navigate(`/outfits/${outfit.outfit_id}`)}
                          />

                          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 pointer-events-none" />

                          {outfit.is_favorite && (
                            <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-rose-50/90 dark:bg-rose-950/60 backdrop-blur-md border border-rose-200/80 flex items-center justify-center shadow-sm">
                              <i className="fa-solid fa-heart text-rose-500 text-xs" />
                            </span>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex flex-col gap-2.5">
                          <h3
                            onClick={() => navigate(`/outfits/${outfit.outfit_id}`)}
                            className="font-medium text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer truncate"
                            title={outfit.body}
                          >
                            {outfit.body || 'Untitled Look'}
                          </h3>

                          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
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
              <div className="rounded-3xl p-12 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center justify-center text-center gap-3">
                <i className="fa-solid fa-shirt text-3xl text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300">
                  {emptyMessage || 'No outfits in this category'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/outfits')}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/25 transition-all cursor-pointer"
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
