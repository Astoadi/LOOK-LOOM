import React from 'react'
import Auth_Guard from '../utils/auth_guard'
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { useDispatch, useSelector } from 'react-redux';
import { ChangePublicVisibilityToPrivate, ChangePublicVisibilityToPublic, getProfile } from '../redux/actions/profile';
import MovingDots from '../components/dots';

function MyProfile() {
    const profileSelector=useSelector(state=>state.profile);
    const dispatch=useDispatch();

    const [userProfile,setUserProfile]=React.useState({});
    const [visibility,setVisibility]=React.useState(false);//true means public and false means private

    React.useEffect(()=>{
        dispatch(getProfile());
    },[])
    React.useEffect(()=>{
        if(profileSelector.user_profile){
            setUserProfile(profileSelector.user_profile);
            setVisibility(profileSelector.user_profile?.profile?.is_public)
        }else{
            setUserProfile({});
        }
    },[profileSelector.user_profile])
  return (
    <>
        <Navbar/>
        <div className='min-h-screen bg-gradient-to-r from-gray-900 to-black font-sans py-8 px-4 md:px-12'>
            {
                userProfile?
                    <div className='flex flex-col gap-8'>
                        <div className='details flex flex-col md:flex md:flex-row items-center md:justify-start gap-10 md:items-start justify-between'>
                            <div>
                                <img src={userProfile?.profile?.gender==="M"?'/images/male-avatar.jpg':userProfile?.profile?.gender==="F"?'/images/female-avatar.jpg':userProfile?.profile?.gender==="O"?'/images/other-avatar.png':'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxugcQweovWCBhSeA5fLo9dw5TNyc7OPbcyw&s'} alt="......" className='rounded-full min-h-40 h-50' />
                            </div>
                            <div className='flex flex-col'>
                                <div className='text-[#fff] text-4xl mb-2 md:mb-10'>{userProfile?.profile?.user_name} ( {visibility?'Public':'Private'} )</div>
                                <div className='text-[#fff]'>Name : {userProfile?.profile?.first_name} {userProfile?.profile?.last_name}</div>
                                <div className='text-[#fff]'>Total Outfits : {userProfile?.totalDresses?.count}</div>
                                <div className='text-[#fff]'>Total Dresses : {userProfile?.totalOutfits?.count}</div>
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            {
                                visibility?
                                <button className='min-w-60 w-80 cursor-pointer text-[#752a2a] border-2 p-2 rounded-2xl border-[#f00]' type="button" onClick={()=>{
                                    setVisibility(false);
                                    dispatch(ChangePublicVisibilityToPrivate());
                                }}>Change Visibility to Private </button>
                                :
                                <button className='min-w-60 w-80 cursor-pointer text-[#752a2a] border-2 p-2 rounded-2xl border-[#f00]'  type="button" onClick={()=>{
                                    setVisibility(true);
                                    dispatch(ChangePublicVisibilityToPublic());
                                }}>Change Visibility to Public</button>
                            }
                            <div className='text-[#5c5b59]'>Created At : {new Date(userProfile?.profile?.created_at).toLocaleDateString("en-IN")}</div>
                            {
                                userProfile?.profile?.updated_at?
                                <div className='text-[#5c5b59]'>Updated At : {new Date(userProfile?.profile?.created_at).toLocaleDateString("en-IN")}</div>
                                :
                                <div className='text-[#5c5b59]'>Updated At : Not Yet</div>
                            }
                        </div>
                    </div>
                :
                <MovingDots/>
            }
        </div>
        <Footer/>
    </>
  )
}

export default Auth_Guard(MyProfile);
