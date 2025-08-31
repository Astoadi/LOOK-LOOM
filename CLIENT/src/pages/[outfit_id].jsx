import React from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { useDispatch, useSelector } from 'react-redux';
import { change_favorite_status, change_is_active_status, get_favorite_outfits, get_outfit, get_outfit_by_id, update_outfit_body, update_outfit_image } from '../redux/actions/outfits';
import MovingDots from '../components/dots';
import Auth_Guard from '../utils/auth_guard';

function SOutfit() {
    const outfit_id=useParams().outfit_id;
    const dispatch=useDispatch();
    const [currOutfit,setCurrOutfit]=React.useState({});
    const [emptyMessage,setEmptyMessage]=React.useState("");
    const [Pending,setPending]=React.useState(false);
    const outfitState=useSelector(state=>state.outfit);

    const [like,setLike]=React.useState(false);
    const [wearable,setWearable]=React.useState(true);
    const [outfitBody,setoutfitBody]=React.useState("");
    const [outfitImage,setOutfitImage]=React.useState("");
    const [newoutfitImage,setNewOutfitImage]=React.useState(null);
    const [inEditMode,setEditMode]=React.useState(false);
    const [newOutfitBody,setNewOutfitBody]=React.useState("");

    React.useEffect(()=>{
        const fetchOutfit = async () => {
            setPending(true);
            try {
                await dispatch(get_outfit_by_id({ outfit_id }));
            } catch (e) {
                console.error(e);
                setEmptyMessage("Failed to load outfit.");
            } finally {
                setPending(false);
            }
        };
        fetchOutfit();
    },[])
    React.useEffect(()=>{
        if(outfitState.outfit){
            setCurrOutfit(outfitState.outfit);
            setLike(outfitState.outfit.is_favorite);
            setWearable(outfitState.outfit.is_active);
            setOutfitImage(outfitState.outfit.image_url);
            setoutfitBody(outfitState.outfit.body);
        }else{
            setCurrOutfit({});
            setEmptyMessage(outfitState.message);
        }
    },[outfitState.outfit])

    const handleOutfitImageUpdation=()=>{
      if (!newoutfitImage) return;
      dispatch(update_outfit_image({outfit_id:outfit_id,outfit_image:newoutfitImage}));
      const imageUrl=URL.createObjectURL(newoutfitImage);
      setOutfitImage(imageUrl);
      setNewOutfitImage(null);
    }
    const handleOutfitBodyUpdation=()=>{
      if(newOutfitBody.length===0){
        setEditMode(false);
        return;
      }
      setoutfitBody(newOutfitBody);
      dispatch(update_outfit_body({outfit_id,body:newOutfitBody}))
      setEditMode(false);
      setNewOutfitBody("");
    }

  return (
    <>
        <Navbar/>
        <div className='min-h-screen bg-gradient-to-r from-gray-900 to-black font-sans py-8 px-4 md:px-12 flex items-top justify-center'>
            {Pending?(<MovingDots/>):
            currOutfit?(
            <div className='card'>
              { !newoutfitImage?
                <label className='relative bg-black p-1 rounded-full top-8 left-2 opacity-50 hover:opacity-100' htmlFor="outfit_img">
                <i className="fa-solid fa-pen text-[#f00]"></i>
                </label>
                :
                <div className='relative top-25 left-2'>
                  <img src={`${URL.createObjectURL(newoutfitImage)}`} alt="new Image" className='w-10' />
                  <button onClick={handleOutfitImageUpdation} className='opacity-50 hover:opacity-100 text-[#f00] text-sm'>Done</button>
                </div>
              }
                <input onChange={(e)=>{
                  setNewOutfitImage(e.target?.files[0]);
                  }} type="file" accept='image/*' id='outfit_img' hidden/>
                <img
                    className="h-auto min-w-50 w-80 object-cover"
                    src={outfitImage||currOutfit.image_url}
                    alt="outfit"
                  />
                <div className="p-4 text-white space-y-2 border border-t-0">
                  <div className='flex items-center justify-between'>
                    {!inEditMode?<h1 className="text-2xl">{outfitBody}</h1>
                    :<input onChange={(e)=>setNewOutfitBody(e.target.value)} value={newOutfitBody} type='text' className="min-w-40 w-50 text-[#fff] text-2xl p-1 border border-white" placeholder={outfitBody} />}
                    {!inEditMode?<i className="fa-solid fa-pen text-[#f00] cursor-pointer" onClick={()=>setEditMode(true)}></i>
                    :<button onClick={handleOutfitBodyUpdation} className='px-4 py-2 border cursor-pointer' type='button'>{newOutfitBody.length>0?"Done":"Cancel"}</button>}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {like ? (
                        <i className="fa-solid fa-heart text-red-500 cursor-pointer" onClick={async()=>{
                          setLike(!like)
                          await dispatch(change_favorite_status({status:!like,outfit_id:outfit_id}));
                          await dispatch(get_outfit());
                          dispatch(get_favorite_outfits());
                        }}/>
                      ) : (
                        <i className="fa-regular fa-heart text-gray-400 cursor-pointer" onClick={async()=>{
                          setLike(!like);
                          await dispatch(change_favorite_status({status:!like,outfit_id:outfit_id}));
                          await dispatch(get_outfit());
                          await dispatch(get_favorite_outfits());
                        }} />
                      )}
                    </span>
                    <div className="text-sm text-gray-400">
                    Created: {new Date(currOutfit?.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                  </div>
                  <div className='options flex items-center justify-between'>
                    <div>Wearable : {wearable?<i className="fa-solid fa-check"></i>:<i className="fa-solid fa-xmark"></i>}</div>
                    <button onClick={()=>{
                      setWearable(!wearable);
                      dispatch(change_is_active_status({outfit_id:outfit_id,is_active_status:!wearable}));
                    }} type='button' className='border px-4 py-2'>{wearable?"Mark as Dirty":"Mark as Clean"}</button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {currOutfit?.updated_at 
                    ? new Date(currOutfit.updated_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    }) 
                    : "Not Updated Yet"}
                  </div>
                </div>
            </div>
            )
            :(
            <div>
                {emptyMessage}
            </div>
            )}
        </div>
        <Footer/>
    </>
  )
}

export default Auth_Guard(SOutfit);