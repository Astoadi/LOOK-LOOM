import React from 'react'
import {useSelector,useDispatch} from 'react-redux'
import { isLoggedIn, logout } from '../redux/actions/auth_actions';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/footer';

export default function Landing_Page() {

    const authState=useSelector((state)=>state.auth);
    const authDispatch=useDispatch();

    const navigate=useNavigate();

    React.useEffect(()=>{
        const checking=async()=>{
            await authDispatch(isLoggedIn());
        }
        checking();
    },[authState.loggedIn])

    const featuresCard=[
        {
            heading:"Outfit Posting",
            body:"Upload your daily outfits and keep track of your style journey."
        },
        {
            heading:"Mix & Match",
            body:"Combine individual pieces to create stunning outfits for any occasion."
        },
        {
            heading:"Event Planning",
            body:"Plan and schedule your looks ahead of events, trips, or important days."
        },
        {
            heading:"Favorites & Search",
            body:"Mark your favorite outfits and search instantly through your wardrobe."
        },
        {
            heading:"Smart Modifications",
            body:"Edit and manage your wardrobe on the go with intelligent outfit tools."
        },
        {
            heading:"Community Inspired",
            body:"Share, explore and get inspired by others outfit ideas and styles."
        }
    ]

  return (
    <div className='landing_page_container text-white'>
        <div className='landing_page_navbar bg-black sticky top-0 z-50 min-h-[6rem] md:h-[5rem] w-full flex justify-between items-center px-6'>
            <div className='text-xl md:text-4xl font-bold'>
                Look Loom
            </div>
            <div className='flex gap-5 text-sm md:text-base items-center gap-5 text-nowrap'>
                {
                    authState.loggedIn === false ?
                    <><div onClick={()=>navigate('/auth')} className="login_btn cursor-pointer hover:text-purple-400 transition">
                        <i className="fa-solid fa-arrow-right-to-bracket"></i> LOGIN
                    </div>
                    <div onClick={()=>navigate('/auth')} className="sign_up cursor-pointer hover:text-purple-400 transition">
                        <i className="fa-solid fa-user-plus"></i> SIGN UP
                    </div></>
                    :<></>
                }
                {
                    authState.loggedIn===true ?
                    <div onClick={async()=>await authDispatch(logout())} className="logout cursor-pointer hover:text-purple-400 transition">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> LOGOUT
                    </div>
                    :<></>
                }
            </div>
        </div>
        <div className='main_body'>
            <div className="hero_container text-center flex items-center justify-center h-screen w-full bg-gradient-to-r from-gray-900 to-black font-sans px-4">
                <div className='flex flex-col justify-center items-center w-full max-w-4xl gap-6'>
                    <div className='hero_heading text-4xl md:text-6xl font-[800] bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600'>
                        Simplify Your Style with Look Loom
                    </div>
                    <div className="hero_para text-sm md:text-xl text-gray-300">
                        Tired of spending hours searching for the perfect outfit? Look Loom is your ultimate
                        outfit planning partner. Create, combine, and organize your wardrobe effortlessly.
                        Plan your looks for events, save favorites, and enjoy total control over your fashion game
                    </div>
                    <button onClick={()=>navigate('/home')} className='bg-purple-400 text-black text-lg px-10 py-4 rounded-md hover:bg-purple-500 transition'>
                        Get Started
                    </button>
                </div>
            </div>
            <div className='hero_lower_container bg-[#232323] py-20 px-15'>
                <div className='text-4xl font-[700] text-center'>
                    Features You'll Love
                </div>
                <div className='flex justify-center flex-wrap text-center gap-6 pt-10'>
                    {
                        featuresCard.map((card,index)=>(
                            <div key={index} className="card p-6 bg-zinc-900 h-auto rounded-xl w-4/5 sm:w-[45%] md:w-[30%]">
                                <div className="cardHead text-purple-400 text-xl font-base">
                                    {card.heading}
                                </div>
                                <div className="card_body text-gray-400">
                                    {card.body}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <Footer/>
        </div>
    </div>
  )
}
