import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'
import { addFriend, checkPendingStatusOfOtherProfile, getFriendorOtherProfile } from '../redux/actions/connection';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

export default function ProfileId() {
    const pId=useParams().pId;

    const dispatch=useDispatch();
    const connSelector=useSelector(state=>state.connection);
    const [clickedPending,setClickedPending]=React.useState();
    const [loading,setLoading]=React.useState(false);
    const [userProfile,setUserProfile]=React.useState([]);
    const [message,setMessage]=React.useState("");

    React.useEffect(()=>{
        async function fetchProfile(){
            setLoading(true);
            try{
                await dispatch(getFriendorOtherProfile({pId})).unwrap();
            }catch(e){
                return ;
            }finally{
                setLoading(false);
            }
        }
        fetchProfile();
    },[pId]);
    React.useEffect(()=>{
        async function fetch(){
            const res=await dispatch(checkPendingStatusOfOtherProfile({pId})).unwrap();
            setClickedPending(res?.status);
        }
        fetch();
    },[]);
    React.useEffect(()=>{
        if(connSelector.otherPersonProfile?.length>0){
            setUserProfile(connSelector.otherPersonProfile);
            setMessage("");
        }else{
            setUserProfile([]);
            
            setMessage("Profile Locked - Follow First");
        }
    },[connSelector.otherPersonProfile]);
  return(
    <>
        <Navbar/>
        <div className='min-h-screen bg-gradient-to-r from-gray-900 to-black font-sans px-8 py-12'>
            {
                userProfile.length>0 ?
                <div className='flex flex-col gap-2'>
                    <div className='profileDetails flex flex-col md:flex md:flex-row items-center md:justify-start gap-10 md:items-start justify-between'>
                        <img src={userProfile[0]?.ProfileDetails?.gender==="M"?'/images/male-avatar.jpg':userProfile[0]?.ProfileDetails?.gender==="F"?'/images/female-avatar.jpg':userProfile[0]?.profile?.gender==="O"?'/images/other-avatar.png':'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxugcQweovWCBhSeA5fLo9dw5TNyc7OPbcyw&s'} alt="......" className='rounded-full min-h-40 h-50' />
                        <div className='flex flex-col'>
                                <div className='text-[#fff] text-4xl mb-2 md:mb-10'>{userProfile[0]?.ProfileDetails?.user_name} ( {userProfile[0]?.ProfileDetails?.is_public?'Public':'Private'} )</div>
                                <div className='text-[#fff]'>Name : {userProfile[0]?.ProfileDetails?.first_name} {userProfile[0]?.ProfileDetails?.last_name}</div>
                                <div className='text-[#fff]'>Total Dress : {userProfile[0]?.TotalOutfits}</div>
                                <div className='text-[#fff]'>Total Dresses : {userProfile[0]?.TotalDresses}</div>
                        </div>
                    </div>
                    {userProfile[0]?.isFriend ? <div className='text-center text-[#0f0] border border-[#0f0] p-2'>Following</div>:!clickedPending?<div className='cursor-pointer text-center text-[#fff] border border-[#fff] p-2' onClick={()=>{
                        setClickedPending(true);
                        dispatch(addFriend({connection_id:Number(pId)}));
                    }}>Follow+</div>:<div className='text-center text-[#fff] border border-[#fff] p-2'>Pending</div>}
                    {
                        userProfile[0]?.TodayDressId!==null?
                            <div>
                                <div className='text-4xl py-4 text-white'>Today Dress Name : {userProfile[0]?.TodayDressName}</div>
                                <div className='Dresses flex-wrap grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                                {
                                    userProfile[0]?.TodayDresses?.map((user_outfit, index) => (
                                        <div
                                            key={index}
                                            className="bg-zinc-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                        >
                                            <img
                                            className="h-56 w-full object-cover"
                                            src={user_outfit?.image_url}
                                            alt="outfit"
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
                                    ))                                                
                                }
                                </div>
                            </div>
                            :
                            <div className='text-white text-3xl'>Today Dress Not Set</div>
                    }
                </div>
                :
                <div>
                    <div className='text-white text-3xl text-center mb-2'>{message}</div>
                    {!clickedPending?<div className='cursor-pointer text-center text-[#fff] border border-[#fff] p-2' onClick={()=>{
                        setClickedPending(true);
                        dispatch(addFriend({connection_id:Number(pId)}));
                    }}>Follow+</div>:<div className='text-center text-[#fff] border border-[#fff] p-2'>Pending</div>}
                </div>
            }
        </div>
        <Footer/>
    </>
  )
}
