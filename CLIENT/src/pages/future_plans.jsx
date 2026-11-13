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
  delete_plan,
  get_future_plans,
  get_history_plans,
  get_today_plan,
  update_plan_date,
} from '../redux/actions/planner';

function Future_Plans() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const planSelector = useSelector((state) => state.planner);

  const [todayPlans, setTodayPlans] = React.useState([]);
  const [futurePlans, setFuturePlans] = React.useState([]);
  const [pastPlans, setPastPlans] = React.useState([]);
  const [displayPlans, setDisplayPlans] = React.useState([]);

  const [displayMode, setDisplayMode] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [emptyPlansMsg, setEmptyPlansMsg] = React.useState('');

  const [editingPlanId, setEditingPlanId] = React.useState(null);
  const [newPlanDate, setNewPlanDate] = React.useState('');
  const [isUpdatingDate, setIsUpdatingDate] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState(null);

  const [snackbar, setSnackbar] = React.useState({ show: false, type: 'success', message: '' });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, show: false }));

  // Fetch all plans
  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(get_today_plan()).unwrap(),
          dispatch(get_future_plans()).unwrap(),
          dispatch(get_history_plans()).unwrap(),
        ]);
      } catch (e) {
        console.error('Error fetching plans:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [dispatch]);

  // Sync Redux plans
  React.useEffect(() => {
    setTodayPlans(planSelector.today_plans || []);
    setFuturePlans(planSelector.future_plans || []);
    setPastPlans(planSelector.past_plans || []);
  }, [planSelector.today_plans, planSelector.future_plans, planSelector.past_plans]);

  // Tab filtering
  React.useEffect(() => {
    if (displayMode === 0) {
      setDisplayPlans(todayPlans);
      setEmptyPlansMsg(todayPlans.length === 0 ? 'No events scheduled for today.' : '');
    } else if (displayMode === 1) {
      setDisplayPlans(futurePlans);
      setEmptyPlansMsg(futurePlans.length === 0 ? 'No upcoming events planned.' : '');
    } else {
      setDisplayPlans(pastPlans);
      setEmptyPlansMsg(pastPlans.length === 0 ? 'No past event history.' : '');
    }
  }, [displayMode, todayPlans, futurePlans, pastPlans]);

  const handleUpdateDate = async (planId) => {
    if (!newPlanDate || isUpdatingDate) return;

    try {
      setIsUpdatingDate(true);
      closeSnackbar();
      const res = await dispatch(
        update_plan_date({ outfit_category_planner_id: planId, new_plan_date: newPlanDate })
      );

      if (!res.error) {
        const updatePlanList = (list) =>
          list.map((p) =>
            p.outfit_category_planner_id === planId ? { ...p, plan_date: newPlanDate } : p
          );
        setTodayPlans(updatePlanList);
        setFuturePlans(updatePlanList);
        setPastPlans(updatePlanList);
        setSnackbar({ show: true, type: 'success', message: 'Event schedule date updated.' });
        setEditingPlanId(null);
        setNewPlanDate('');
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to update schedule date.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsUpdatingDate(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (deletingId) return;

    try {
      setDeletingId(planId);
      closeSnackbar();
      const res = await dispatch(delete_plan({ outfit_category_planner_id: planId }));

      if (!res.error) {
        const removePlan = (list) =>
          list.filter((p) => p.outfit_category_planner_id !== planId);
        setTodayPlans(removePlan);
        setFuturePlans(removePlan);
        setPastPlans(removePlan);
        setSnackbar({ show: true, type: 'success', message: 'Event removed from schedule.' });
      } else {
        setSnackbar({ show: true, type: 'error', message: 'Failed to delete plan.' });
      }
    } catch {
      setSnackbar({ show: true, type: 'error', message: 'Failed to delete plan.' });
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
          {/* Header Bar */}
          <ScrollReveal y={12} duration={0.4}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 mb-2">
                  <i className="fa-regular fa-calendar-check text-[10px]" />
                  <span>Look Schedule</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Event Schedule
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Plan your dress ensembles and calendar dates for upcoming events.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/dresses')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 shadow-sm shadow-sky-500/25 transition-all cursor-pointer w-fit active:scale-95"
              >
                <i className="fa-solid fa-calendar-plus text-xs" />
                <span>Schedule a Look</span>
              </button>
            </div>
          </ScrollReveal>

          {/* Segmented Switcher with Contrast Sky Highlight */}
          <ScrollReveal y={12} delay={0.05} duration={0.4}>
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setDisplayMode(0)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                    displayMode === 0
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-300'
                  }`}
                >
                  Today ({todayPlans.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode(1)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                    displayMode === 1
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-300'
                  }`}
                >
                  Upcoming ({futurePlans.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode(2)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                    displayMode === 2
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-300'
                  }`}
                >
                  Archive ({pastPlans.length})
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Plans Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="text-sky-600 dark:text-sky-400" label="Loading event calendar..." />
            </div>
          ) : displayPlans.length > 0 ? (
            <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {displayPlans.map((dp, index) => {
                const isEditing = editingPlanId === dp.outfit_category_planner_id;
                const isDeleting = deletingId === dp.outfit_category_planner_id;
                const staggerDelay = Math.min((index % 3) * 0.05, 0.2);

                return (
                  <ScrollReveal
                    key={dp.outfit_category_planner_id}
                    y={16}
                    delay={staggerDelay}
                    amount={0.1}
                    duration={0.4}
                  >
                    <div className="group rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-sky-200 dark:hover:border-sky-800 bg-white dark:bg-[#161619] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-200 flex flex-col justify-between gap-4">
                      {/* Top Row: Event Header & Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-300 flex-shrink-0 shadow-sm">
                            <i className="fa-regular fa-calendar-check text-sm" />
                          </div>
                          <h2
                            className="font-medium text-base text-zinc-900 dark:text-zinc-100 truncate"
                            title={dp.notes}
                          >
                            {dp.notes || 'Scheduled Event'}
                          </h2>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                setEditingPlanId(null);
                                setNewPlanDate('');
                              } else {
                                setEditingPlanId(dp.outfit_category_planner_id);
                              }
                            }}
                            className="p-1.5 rounded-full text-zinc-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors cursor-pointer"
                            title={isEditing ? 'Cancel edit' : 'Change date'}
                          >
                            <i
                              className={`fa-solid ${
                                isEditing ? 'fa-xmark text-xs' : 'fa-pen text-[11px]'
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeletePlan(dp.outfit_category_planner_id)}
                            className="p-1.5 rounded-full text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-40"
                            title="Delete event"
                          >
                            {isDeleting ? (
                              <Spinner size="xs" color="text-rose-500" />
                            ) : (
                              <i className="fa-solid fa-trash-can text-xs" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Date Badge / Date Edit Form with Pastel Sky Tint */}
                      <div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="date"
                              disabled={isUpdatingDate}
                              onChange={(e) => setNewPlanDate(e.target.value)}
                              className="flex-1 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-sky-200 dark:border-sky-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-sky-400 dark:focus:border-sky-500 cursor-pointer"
                            />
                            <button
                              type="button"
                              disabled={!newPlanDate || isUpdatingDate}
                              onClick={() => handleUpdateDate(dp.outfit_category_planner_id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1"
                            >
                              {isUpdatingDate ? <Spinner size="xs" color="currentColor" /> : 'Save'}
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60">
                            <i className="fa-regular fa-clock text-[10px]" />
                            <span>
                              {dp?.plan_date
                                ? new Date(dp.plan_date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Date not set'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions & Metadata */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Created{' '}
                          {dp?.created_at
                            ? new Date(dp.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'recently'}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const id = Number(dp?.outfit_category_id);
                            if (Number.isInteger(id)) {
                              navigate(`/dresses/${id}`);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer transition-colors"
                        >
                          <span>View Look</span>
                          <i className="fa-solid fa-arrow-right text-[10px]" />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl p-12 bg-white dark:bg-[#161619] border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 flex items-center justify-center text-xl">
                <i className="fa-regular fa-calendar-xmark" />
              </div>
              <p className="text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300">
                {emptyPlansMsg || 'No events found'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/dresses')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 shadow-sm shadow-sky-500/25 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-plus text-xs" />
                <span>Schedule a Look from Dresses</span>
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

const ProtectedFuturePlans = Auth_Guard(Future_Plans);
export default ProtectedFuturePlans;
