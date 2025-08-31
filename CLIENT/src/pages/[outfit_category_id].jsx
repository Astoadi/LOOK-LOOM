import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import Auth_Guard from '../utils/auth_guard';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { get_dress_outfits } from '../redux/actions/dress';
import MovingDots from '../components/dots';
import { get_today_dress, is_this_today_dress, is_today_dress_chosen, remove_today_dress, set_today_dress, update_today_dress } from '../redux/actions/outfit_category_actions';
import { make_plan } from '../redux/actions/planner';

function SDress() {
    const outfit_category_id=useParams().outfit_category_id;
    const dispatch=useDispatch();
    const categorySelector=useSelector(state=>state.outfit_category);
    const dressSelector=useSelector(state=>state.dress);
    const navigate=useNavigate();

    const [Pending,setPending]=React.useState(false);
    const [emptyMessage,setEmptyMessage]=React.useState("");

    
    const [todayDressStatus,setTodayDressStatus]=React.useState(false);
    const [todayEmptyDressMsg,setTodayEmptyDressMsg]=React.useState("");
    const [isThisTodayDress,setIsThisTodayDress]=React.useState(false);

    const [planNote,setPlanNote]=React.useState("");
    const [planDate,setPlanDate]=React.useState("");

    const [outfits,setOutfits]=React.useState([])

    React.useEffect(()=>{
        const fetchOutfits = async () => {
            setPending(true);
            try {
                await dispatch(get_dress_outfits({ outfit_category_id }));
            } catch (e) {
                console.error(e);
                setEmptyMessage("Failed to load outfit.");
            } finally {
                setPending(false);
            }
        };
        fetchOutfits();
    },[dispatch,outfit_category_id]);

    React.useEffect(() => {
      async function checkingTodayDress(){
        try{
          const res1=await dispatch(is_today_dress_chosen()).unwrap();
          setTodayDressStatus(res1.status);
          await dispatch(get_today_dress());
          if(categorySelector.today_dress_name.length>0){
            setTodayDressStatus(categorySelector.today_dress_name);
          }else{
            setTodayEmptyDressMsg("Not Set Yet");
          }
        }catch(e){
          console.log(e);
        }
      }
      checkingTodayDress();
    }, []);
    
    React.useEffect(() => {
      async function isThisTodayDress(){
        const result=await dispatch(is_this_today_dress({ outfit_category_id })).unwrap();
        setIsThisTodayDress(result?.status);
      }
      isThisTodayDress();
    }, []);
    

    React.useEffect(()=>{
        if(dressSelector.dress_outfits.length>0){
            setOutfits(dressSelector.dress_outfits)
            setEmptyMessage("");
        }else{
            setOutfits([]);
            setEmptyMessage("No outfits found");
        }
    },[dressSelector.dress_outfits])
  return (
    <>
        <Navbar/>
        <div className=' text-white min-h-screen bg-gradient-to-r from-gray-900 to-black font-sans py-8 px-4 md:px-12'>
        <div className='flex flex-col md:flex-row items-center justify-top md:justify-between gap-4 border-b border-dashed  py-4'>
          <div className='text-4xl font-[700]'>{outfits[0]?.category_name}</div>
          <div className="bg-zinc-900 p-6 justify-center items-center rounded flex flex-col gap-4">
            <div className='text-[#f748ce] text-4xl'>Plan an Event</div>
            <div className='flex md:flex-row flex-col gap-4 items-center'>
              <input className='rounded border px-2 py-1' value={planNote} onChange={(e)=>setPlanNote(e.target.value)} placeholder='Enter Note' type='text' required />
              <input className='rounded w-40 bg-zinc-700 p-2' value={planDate} onChange={(e)=>setPlanDate(e.target.value)} type="date" required />
            </div>
            {
              planDate.length>0 && planNote.length>0 &&
              <button className='border p-2 w-full' type='submit' onClick={()=>{
                dispatch(make_plan({outfit_category_id:outfit_category_id,plan_date:planDate,notes:planNote}))
                setPlanDate("");
                setPlanNote("");
              }}>PLAN</button>}
          </div>
        </div>
        <div className='flex justify-center items-center py-4'>
          {
            todayDressStatus?
              isThisTodayDress ?
                <button type="button" className='border cursor-pointer rounded p-2' onClick={()=>{
                  setTodayDressStatus(false);
                  setIsThisTodayDress(false);
                  dispatch(remove_today_dress());
                }}>Remove As Today Dress</button>
                :
                <button type="button" className='border cursor-pointer rounded p-2' onClick={()=>{
                  setTodayDressStatus(true);
                  setIsThisTodayDress(true);
                  dispatch(update_today_dress({outfit_category_id}));
                }}>Update Today Dress</button>
              :
              <button type="button" onClick={()=>{
                setTodayDressStatus(true);
                setIsThisTodayDress(true);
                dispatch(set_today_dress({outfit_category_id}));
              }} className='border cursor-pointer rounded p-2'>Set As Today Dress</button>
           }
        </div>
        {Pending&&<MovingDots/>}
        {
        outfits.length>0?(
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {outfits?.map((user_outfit, index) => (
              <div
                key={index}
                className="bg-zinc-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  className="h-56 w-full object-cover"
                  src={user_outfit?.image_url}
                  alt="outfit"
                  onClick={()=>navigate(`/outfits/${user_outfit.outfit_id}`)}
                />
                <div className="p-4 text-white space-y-2">
                  <div className='flex items-center justify-between'>
                    <p className="text-2xl">{user_outfit?.body}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {user_outfit?.is_favorite ? (
                        <i className="fa-solid fa-heart text-red-500"/>
                      ) : (
                        <i className="fa-regular fa-heart text-gray-400"/>
                      )}
                    </span>
                    <div className="text-sm text-gray-400">
                    Created: {new Date(user_outfit?.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {user_outfit?.updated_at 
                    ? new Date(user_outfit.updated_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    }) 
                    : "Not Updated Yet"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          ):(
                <div className='text-white text-xl'>{emptyMessage}</div>
            )
        }
        </div>
        <Footer/>
    </>
  )
}

export default Auth_Guard(SDress);
