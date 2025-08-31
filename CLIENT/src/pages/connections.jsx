import React from 'react'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import Auth_Guard from '../utils/auth_guard'
import { useDispatch, useSelector } from 'react-redux'
import { AcceptRequest, GetFollowing, GetFriendByUserName, GetMyIncomingRequests, RejectRequest, getFollowers } from '../redux/actions/connection'
import MovingDots from '../components/dots'
import { useNavigate } from 'react-router-dom'

function Connections() {

    const connSelector=useSelector(state=>state.connection);
    const dispatch=useDispatch();
    const navigate=useNavigate();

    const [following,setFollowing]=React.useState([]);
    const [followers,setFollowers]=React.useState([]);
    const [pendingRequests,setPendingRequests]=React.useState([]);
    const [search_params,set_search_params]=React.useState("");
    const [EmptyMessage,SetEmptyMessage]=React.useState("");
    const [searchPeople,setSearchPeople]=React.useState([]);
    const [showList,setShowList]=React.useState([]);
    const [selectedView,setSelectedView]=React.useState(0);
    const [loading,setLoading]=React.useState(false);
    const [clickedId,setClickedId]=React.useState(0);

    React.useEffect(()=>{
        async function fetchData(){
            try {
                setLoading(true);
                await Promise.all([
                    dispatch(GetFollowing()).unwrap(),
                    dispatch(getFollowers()).unwrap(),
                    dispatch(GetMyIncomingRequests()).unwrap()
                ]);
            } catch (e) {
                console.error("Error fetching connections:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    },[]);

    React.useEffect(()=>{
        if(connSelector.followers?.length>0){
            setFollowers(connSelector.followers)
        }else{
            setFollowers([]);
        }
        if(connSelector.following?.length>0){
            setFollowing(connSelector.following)
        }else{
            setFollowing([]);
        }
        if(connSelector.pendingRequests?.length>0){
            setPendingRequests(connSelector.pendingRequests);
        }else{
            setPendingRequests([]);
        }
    },[connSelector.followers,connSelector.following,connSelector.pendingRequests]);

    React.useEffect((()=>{
        let view=selectedView;
        if(view === 0){
            if(searchPeople.length>0) setShowList(searchPeople)
            else{
                setShowList([])
                SetEmptyMessage("0 Found")
            };
        }else if(view===1){
            if(followers.length>0) setShowList(followers);
            else{
                setShowList([])
                SetEmptyMessage("0 Followers")
            };
        }else if(view===2){
            if(following.length>0) setShowList(following);
            else{
                setShowList([])
                SetEmptyMessage("0 Following")
            };
        }else if(view===3){
            if(pendingRequests.length>0) setShowList(pendingRequests);
            else{
                setShowList([])
                SetEmptyMessage("0 Requests")
            };
        }else{
            return;
        }
    }),[selectedView,pendingRequests,followers,following,searchPeople]);
const handleSearch=async ()=>{
    if (!search_params.trim()) return;
    try{
        setLoading(true);
        const result=await dispatch(GetFriendByUserName({searchUserName:search_params.trim()})).unwrap();
        if(result.SearchResults.length>0){
            setSelectedView(0);
            setSearchPeople(result.SearchResults);
        }else{
            setSearchPeople([]);
        };
    }catch(e){
        return;
    }finally{
        setLoading(false);
    }
}

  return (
    <>
        <Navbar/>
        <div className='min-h-screen bg-gradient-to-r from-gray-900 to-black font-sans px-8 py-12'>
            <div className='flex flex-wrap items-center justify-center gap-4'>
                <input type="text" value={search_params} onChange={(e)=>set_search_params(e.target.value)} required  placeholder='Search by username' className='bg-zinc-800 text-gray-100 py-2 px-2 text-xl min-w-[220px] w-[30%] outline-none text-center rounded'/>
                {search_params.length>0 && <button onClick={handleSearch} className='border cursor-pointer px-4 py-1 rounded text-white'>Search</button>}
                {showList.length>0 && selectedView === 0 && <button className='border cursor-pointer px-4 py-1 rounded text-white' onClick={()=>{
                    set_search_params("");
                    setShowList([]);
                    SetEmptyMessage("0 Found");
                }}>Clear</button>}
            </div>
            <div className='flex flex-wrap text-white gap-4 pb-4 mt-4'>
                <button onClick={()=>{
                setSelectedView(0);
                
                }} className={`px-4 py-1 outline-none cursor-pointer border ${selectedView===0?'bg-white text-black' : 'text-white'}`}>Search</button>
                <button onClick={()=>{
                setSelectedView(1);
                
                }} className={`px-4 py-1 outline-none cursor-pointer border ${selectedView===1?'bg-white text-black' : 'text-white'}`}>Followers</button>
                <button onClick={()=>{
                setSelectedView(2);
              
                }} className={`px-4 py-1 outline-none cursor-pointer border ${selectedView===2?'bg-white text-black' : 'text-white'}`}>Following</button>
                <button onClick={()=>{
                setSelectedView(3);
            
                }} className={`px-4 py-1 outline-none cursor-pointer border ${selectedView===3?'bg-white text-black' : 'text-white'}`}>Requests</button>
            </div>
            {loading&&<MovingDots/>}
            {
                showList.length>0?
                <div className='flex flex-wrap gap-2'>
                    {
                        showList.map((items,key)=>{
                        return (
                            <div key={key} className='border border-white flex flex-row size-fit p-4 gap-4'>
                                <img src={items.gender==="M"?'/images/male-avatar.jpg':items?.gender==="F"?'/images/female-avatar.jpg':items?.gender==="O"?'/images/other-avatar.png':'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxugcQweovWCBhSeA5fLo9dw5TNyc7OPbcyw&s'} alt="......" className='rounded-full min-h-10 h-12' />
                                <div className='flex flex-col gap-2'>
                                    <div className='text-[#fff] text-2xl'>{items.user_name}</div>
                                        { selectedView !== 3 ?

                                        <div className='flex gap-1'>
                                            <button className='p-2 cursor-pointer border border-[#fff] text-[#fff]' onClick={()=>navigate(`/user/${items.user_id}`)}>View Profile</button>
                                        </div>
                                        :
                                        <div className='flex gap-1'>
                                            <button className='p-2 cursor-pointer border border-[#0f0] text-[#0f0]' onClick={()=>{
                                                setPendingRequests((prev)=>{
                                                    const updated = prev.filter(
                                                        (item) => item.user_id !== items.user_id
                                                      );
                                                    setShowList(updated); // update showList with new pendingRequests
                                                    return updated;
                                                });
                                                setFollowers((prev) => [...prev, items]);
                                                dispatch(AcceptRequest({connection_id:Number(items.user_id)}));
                                            }}>Accept Request</button>
                                            <button className='p-2 cursor-pointer border border-[#f00] text-[#f00]' onClick={()=>{
                                                setPendingRequests((prev)=>{
                                                    const updated = prev.filter(
                                                        (item) => item.user_id !== items.user_id
                                                      );
                                                    setShowList(updated); // update showList with new pendingRequests
                                                    return updated;
                                                });
                                                dispatch(RejectRequest({connection_id:items.user_id}));
                                            }}>Reject Request</button>
                                        </div>
                                        }
                                </div>
                            </div>
                        )
                    })}
                </div>
                :
                <div className='text-[#fff]'>{EmptyMessage}</div>
            }
        </div>
        <Footer/>
    </>
  )
}

export default Auth_Guard(Connections);