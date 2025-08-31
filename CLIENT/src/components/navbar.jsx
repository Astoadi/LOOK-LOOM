import React from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { logout } from '../redux/actions/auth_actions';

export default function Navbar() {
    const navigate=useNavigate();
    const authDispatch=useDispatch();

    const handleLogout=async ()=>{
        await authDispatch(logout());
        navigate('/auth',{replace:true});
    }
  return (
    <div className='bg-black/95 sticky top-0 text-[#fff] flex flex-col items-center md:flex-row md:flex md:justify-between md:items-center md:h-auto p-4 gap-4'>
        <div onClick={()=>navigate('/')} className="title text-3xl font-[750] cursor-pointer">
            Look Loom
        </div>
        <div className="options flex flex-wrap gap-4">
            <div onClick={()=>navigate('/home')} className="outfit_option border px-4 py-1 flex flex-col justify-center cursor-pointer">
                <div className="home_logo">
                    <i className="fa-solid fa-grip"></i>
                </div>
                <div className="">Dashboard</div>
            </div>
            <div onClick={()=>navigate('/outfits')} className="outfit_option border px-4 py-1 flex flex-col justify-center cursor-pointer">
                <div className="outfit_logo">
                    <i className="fa-solid fa-shirt"></i>
                </div>
                <div className="">Outfits</div>
            </div>
            <div onClick={()=>navigate('/dresses')} className="dress_option border px-4 py-1 flex flex-col justify-center cursor-pointer">
                <div className="dresses_logo">
                    <i className="fa-solid fa-grip"></i>
                </div>
                <div className="">Dresses</div>
            </div>
            <div onClick={()=>navigate('/future_plans')} className="future_plans border px-4 py-1 flex flex-col justify-center cursor-pointer">
                <div className="futureplans_logo">
                    <i className="fa-regular fa-calendar"></i>
                </div>
                <div className="">Plans</div>
            </div>
            <div onClick={()=>navigate('/connections')} className='ProfileLogo border px-4 py-1 flex flex-col justify-center cursor-pointer'>
                <div>
                    <i className="fa-solid fa-magnifying-glass"></i>
                </div>
                <div className='wrap-anywhere'>Friends</div>
            </div>
            <div onClick={()=>navigate('/myProfile')} className='ProfileLogo border px-4 py-1 flex flex-col justify-center cursor-pointer'>
                <div>
                    <i className="fa-regular fa-user"></i>
                </div>
                <div>Profile</div>
            </div>
            <div onClick={handleLogout} className="logout_option flex flex-col justify-center cursor-pointer">
                <div className="logout_logo">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </div>
                <div className="">Logout</div>
            </div>
        </div>
    </div>
  )
}
