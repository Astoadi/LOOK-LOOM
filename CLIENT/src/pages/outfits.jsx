import React from 'react'
import Auth_Guard from '../utils/auth_guard'
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { delete_outfit, get_favorite_outfits, get_outfit, get_outfit_by_body_name } from '../redux/actions/outfits';
import { useDispatch, useSelector } from 'react-redux';
import { create_category } from '../redux/actions/dress';
import { useNavigate } from 'react-router-dom';
function Outfits() {
  const dispatch=useDispatch();
  const outfitSelector=useSelector(state=>state.outfit);
  const navigate=useNavigate();

  const [outfit_list,set_outfit_list]=React.useState("all");
  const [userOutfits,setUserOutfits]=React.useState([]);
  const [favUserOutfits,setFavUserOutfits]=React.useState([]);
  const [display_outfits,set_display_outfits]=React.useState([]);
  const [loading,setLoading]=React.useState(false);
  const [emptyMessage,setEmptyMessage]=React.useState("");
  const [inCDMode,setInCDMode]=React.useState(false);

  const [search_params,set_search_params]=React.useState("");

  const [dressName,setDressName]=React.useState("");
  const [outfit_ids,setOutfit_ids]=React.useState([]);

  React.useEffect(()=>{
    const get_outfit_func=async ()=>{
      try{
        setLoading(true);
        await dispatch(get_outfit());
        await dispatch(get_favorite_outfits());
      }catch(e){
        console.log("error fetching the data");
      }finally{
        setLoading(false);
      }
    }
    get_outfit_func();
  },[])
  
  React.useEffect(()=>{
      setUserOutfits(outfitSelector.user_outfits);
      setFavUserOutfits(outfitSelector.favorite_outfits)
  },[outfitSelector.user_outfits,outfitSelector.favorite_outfits])

  React.useEffect(() => {
    if(outfit_list === "all"){
      if(userOutfits.length>0){
        set_display_outfits(userOutfits);
      }else{
        set_display_outfits([]);
        setEmptyMessage(outfitSelector.message || "No Outfits");
      }
    }else{
      if(favUserOutfits.length>0){
        set_display_outfits(favUserOutfits);
      }else{
        set_display_outfits([]);
        setEmptyMessage(outfitSelector.message || "No Outfits") ;
      }
    }
  },[outfit_list,favUserOutfits,userOutfits]);
  
  const handleAllClickBtn=()=>{
    set_outfit_list("all");
  }
  const handleFavClickBtn=()=>{
    set_outfit_list("fav");
  }

  const handleSearch=()=>{
    if (!search_params.trim()) return;
    dispatch(get_outfit_by_body_name({body:search_params})).then((data)=>{
      if(data.payload?.outfits?.length > 0){
        set_display_outfits(data.payload.outfits);
        setEmptyMessage("");
      }else{
        set_display_outfits([]);
        setEmptyMessage("No outfits found with that name.");
      }
    });
  }

  const handleCheckboxChange=(e)=>{
    const {value,checked}=e.target;
    if(checked){
      setOutfit_ids((prev)=>[...prev,value]);
    }else{
      setOutfit_ids((prev)=>prev.filter((ids)=>ids!==value));
    }
  }

  const handleDressCreation=async ()=>{
    if(outfit_ids.length===0){
      return;
    }
    await dispatch(create_category({dressName,outfit_ids}));
    navigate('/dresses');
  }

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black font-sans py-8 px-4 md:px-12">
        <div className='flex items-center justify-center gap-4'>
          <input type="text" onChange={(e)=>set_search_params(e.target.value)} required  placeholder='Search by body name' className='bg-zinc-800 text-gray-100 py-2 px-2 text-xl min-w-[220px] w-[30%] outline-none text-center rounded'/>
          {search_params.length>0 && <button onClick={handleSearch} className='border cursor-pointer px-4 py-1 rounded text-white'>Search</button>}
        </div>
        <div className='flex text-white gap-4 pb-4 mt-4'>
          <button onClick={handleAllClickBtn} className={`px-4 py-1 outline-none cursor-pointer border ${outfit_list==="all"?'bg-white text-black' : 'text-white'}`}>All</button>
          <button onClick={handleFavClickBtn} className={`px-4 py-1 outline-none cursor-pointer border ${outfit_list==="fav"?'bg-white text-black' : 'text-white'}`}>Favorites</button>
          <button className={`px-4 py-1 outline-none cursor-pointer border ${inCDMode?'bg-white text-black' : 'text-white'}`} onClick={()=>setInCDMode(true)}>Create Dress</button>
          {inCDMode?<button className='bg-[#ff0342] px-4 text-white' type="button" onClick={()=>{
            setInCDMode(false);
            setOutfit_ids([]);
            setDressName("");
            }}>Cancel</button>:<></>}
        </div>
        {inCDMode?
        <div className='flex gap-4 mb-4'>
          <input placeholder='Enter dress name' value={dressName} onChange={(e)=>setDressName(e.target?.value)} className='bg-zinc-800 text-gray-100 py-2 px-2 text-xl w-[25%] outline-none text-center rounded' type="text"  />
          {(dressName.length>0 && outfit_ids.length>0) &&<button onClick={handleDressCreation} className='border cursor-pointer px-4 py-1 rounded text-white'>Create Dress</button>}
        </div>
        :<></>}
        {loading&&<></>}
        {display_outfits?.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {display_outfits?.map((user_outfit, index) => (
              <div
                key={index}
                className="bg-zinc-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {inCDMode?<input value={user_outfit?.outfit_id} onChange={handleCheckboxChange} className="relative top-0 left-2 bg-white appearance-none w-5 h-5 rounded-sm checked:bg-blue-600 checked:border-blue-600 checked:after:content-['✔'] checked:after:text-white checked:after:text-xs checked:after:flex checked:after:items-center checked:after:justify-center" type="checkbox"/>
                :<></>}
                <img
                  className="h-56 w-full object-cover"
                  src={user_outfit?.image_url}
                  alt="outfit"
                  onClick={()=>navigate(`/outfits/${user_outfit.outfit_id}`)}
                />
                <div className="p-4 text-white space-y-2">
                  <div className='flex items-center justify-between'>
                    <p className="text-2xl">{user_outfit?.body}</p>
                    <i className="fa-solid fa-trash text-[#f00] cursor-pointer" onClick={async()=>{
                      setUserOutfits((prev)=>prev.filter((uo)=>uo.outfit_id!==user_outfit.outfit_id));
                      await dispatch(delete_outfit({outfit_id:user_outfit.outfit_id}));
                      await dispatch(get_outfit());
                      dispatch(get_favorite_outfits());
                    }}></i>
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
          </div>)
          :<div className='text-white text-xl'>{emptyMessage}</div>
        }
      </div>
      <Footer/>
    </>
  )
}
export default Auth_Guard(Outfits);