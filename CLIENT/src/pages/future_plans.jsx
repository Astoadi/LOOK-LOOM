import React from 'react'
import Auth_Guard from '../utils/auth_guard'
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { delete_plan, get_future_plans, get_history_plans, get_today_plan, update_plan_date } from '../redux/actions/planner';
import MovingDots from '../components/dots';

function Future_Plans() {

  const navigate=useNavigate();
  const planSelector=useSelector(state=>state.planner);
  const dispatch=useDispatch();

  const [pastPlans,setPastPlans]=React.useState([]);
  const [todayPlans,setTodayPlans]=React.useState([]);
  const [futurePlans,setFuturePlans]=React.useState([]);
  const [emptyPlansMsg,setEmptyPlansMsg]=React.useState("");
  const [loading,setLoading]=React.useState(false);

  const [displayMode,setDisplayMode]=React.useState(0);
  const [displayPlans,setDisplayPlans]=React.useState([]);

  const [inEditMode,setInEditMode]=React.useState(false);
  const [editingPlanId,setEditingPlanId]=React.useState(null);
  const [newPlanDate,setNewPlanDate]=React.useState("");

  React.useEffect(()=>{
    setLoading(true);
    const fetchPlans=async()=>{
      await dispatch(get_today_plan()).unwrap();
      await dispatch(get_future_plans()).unwrap();
      await dispatch(get_history_plans()).unwrap();
    }
    fetchPlans();
    setLoading(false);
  },[]);

  React.useEffect(()=>{
    if(planSelector.today_plans?.length>0){
      setTodayPlans(planSelector.today_plans);
    }else{
      setEmptyPlansMsg("No Plans");
    }
    if(planSelector.future_plans?.length>0){
      setFuturePlans(planSelector.future_plans);
    }else{
      setEmptyPlansMsg("No Plans");
    }
    if(planSelector.past_plans?.length>0){
      setPastPlans(planSelector.past_plans);
    }else{
      setEmptyPlansMsg("No Plans")
    }
  },[planSelector.today_plans,planSelector.future_plans,planSelector.past_plans]);

  React.useEffect(()=>{
    if(displayMode===0){
      if(todayPlans.length>0){
        setDisplayPlans(todayPlans);
      }else{
        setDisplayPlans([]);
      }
    }else if(displayMode===1){
      if(futurePlans.length>0){
        setDisplayPlans(futurePlans);
      }else{
        setDisplayPlans([]);
      }
    }else{
      if(pastPlans.length>0){
        setDisplayPlans(pastPlans);
      }else{
        setDisplayPlans([]);
      }
    }
  },[displayMode,pastPlans,futurePlans,todayPlans]);

  return (
    <>
        <Navbar/>
        <div className='min-h-screen bg-gradient-to-r from-gray-900 to-black font-sans py-8 px-4 md:px-12'>
          <div className='flex items-center justify-start gap-4 text-white'>
            <button onClick={()=>setDisplayMode(0)} className={`border border-white p-2 cursor-pointer ${displayMode===0?"bg-white text-black":"bg-black text-white"}`}>Today Plans</button>
            <button onClick={()=>setDisplayMode(1)} className={`border border-white p-2 cursor-pointer ${displayMode===1?"bg-white text-black":"bg-black text-white"}`}>Future Plans</button>
            <button onClick={()=>setDisplayMode(2)} className={`border border-white p-2 cursor-pointer ${displayMode===2  ?"bg-white text-black":"bg-black text-white"}`}>Past Plans</button>
          </div>
          {loading && <MovingDots/>}
          {
            displayPlans.length>0 ?
              <div className='flex flex-wrap py-4 gap-4'>
                { displayPlans.map((dp,index)=>(
                <div key={index} className='p-4 text-white flex flex-col gap-2 justify-center items-start bg-zinc-900 rounded-xl'>
                  <div className='flex items-center justify-between w-full'>
                    <p className='text-4xl'>{dp.notes}</p>
                    { !inEditMode ?
                      <i onClick={()=>{
                        setEditingPlanId(dp.outfit_category_planner_id);
                        setInEditMode(true)
                      }} className="fa-solid fa-pen cursor-pointer"></i>
                      :
                      editingPlanId===dp.outfit_category_planner_id ? <i onClick={()=>{
                        setEditingPlanId(null);
                        setInEditMode(false)
                      }} className="fa-solid fa-xmark cursor-pointer"></i>
                      :
                      <i onClick={()=>{
                        setEditingPlanId(dp.outfit_category_planner_id);
                        setInEditMode(true)
                      }} className="fa-solid fa-pen cursor-pointer"></i>
                    }
                  </div>
                  { inEditMode && editingPlanId===dp.outfit_category_planner_id &&
                    <div className='flex gap-2 items-center justify-between'>
                    <input onChange={(e)=>setNewPlanDate(e.target?.value)} type="date" className='rounded w-40 bg-zinc-700 p-2' />
                    <button
                      type="submit"
                      disabled={newPlanDate.length === 0}
                      onClick={() => {
                        if(displayMode===0){
                          //today
                          setTodayPlans((prev)=>prev.map(p=>p.outfit_category_planner_id===dp.outfit_category_planner_id?{...p,plan_date: new Date(newPlanDate).toLocaleString('en-US', { dateStyle: 'medium',timeStyle: 'short',})}:p));
                          dispatch(update_plan_date({outfit_category_planner_id:dp.outfit_category_planner_id,new_plan_date:newPlanDate}))
                        }else if(displayMode===1){
                          //future
                          setFuturePlans((prev)=>prev.map(p=>p.outfit_category_planner_id===dp.outfit_category_planner_id?{...p,plan_date:new Date(newPlanDate).toLocaleString('en-US', { dateStyle: 'medium',timeStyle: 'short',})}:p));
                          dispatch(update_plan_date({outfit_category_planner_id:dp.outfit_category_planner_id,new_plan_date:newPlanDate}))
                        }else{
                          //past
                          setPastPlans((prev)=>prev.map(p=>p.outfit_category_planner_id===dp.outfit_category_planner_id?{...p,plan_date:new Date(newPlanDate).toLocaleString('en-US', { dateStyle: 'medium',timeStyle: 'short',})}:p));
                          dispatch(update_plan_date({outfit_category_planner_id:dp.outfit_category_planner_id,new_plan_date:newPlanDate}))
                        }
                        setNewPlanDate("");
                        setEditingPlanId(null);
                        setInEditMode(false);
                      }}
                      className={`border border-white p-2 
                        ${newPlanDate.length === 0 
                          ? "opacity-50 cursor-not-allowed bg-gray-500 text-white" 
                          : "cursor-pointer bg-black text-white"}`}
                    >
                      Edit Date
                    </button>
                  </div>}
                  <div className='flex gap-4 items-center justify-between w-full'>
                    <p className='text-md'><span className={`cursor-pointer underline ${
                      !Number.isInteger(Number(dp?.outfit_category_id)) && 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      const id = Number(dp?.outfit_category_id);
                      if (Number.isInteger(id)) {
                        navigate(`/dresses/${id}`);
                      }
                    }}>See Dress
                  </span></p>
                    <i className="fa-solid fa-trash text-xl text-[#f00] cursor-pointer" onClick={()=>{
                      if(displayMode===0){
                        //today
                        setTodayPlans((prev)=>prev.filter(p=>p.outfit_category_planner_id!==dp.outfit_category_planner_id));
                        dispatch(delete_plan({outfit_category_planner_id:dp.outfit_category_planner_id}));
                      }else if(displayMode===1){
                        //future
                        setFuturePlans((prev)=>prev.filter(p=>p.outfit_category_planner_id!==dp.outfit_category_planner_id));
                        dispatch(delete_plan({outfit_category_planner_id:dp.outfit_category_planner_id}));
                      }else{
                        //past
                        setPastPlans((prev)=>prev.filter(p=>p.outfit_category_planner_id!==dp.outfit_category_planner_id));
                        dispatch(delete_plan({outfit_category_planner_id:dp.outfit_category_planner_id}));
                      }
                    }}></i>
                  </div>
                  <div className="text-sm text-gray-400">
                    Plan Date : {new Date(dp?.plan_date).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                  <div className="text-sm text-gray-400">
                    Created At : {new Date(dp?.created_at).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              ))}
              </div>
              :
              <div className='text-white'>{emptyPlansMsg}</div>
          }
        </div>
        <Footer/>
    </>
  )
}

export default Auth_Guard(Future_Plans);
