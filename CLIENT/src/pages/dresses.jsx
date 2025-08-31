import React from 'react'
import Auth_Guard from '../utils/auth_guard'
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { useDispatch, useSelector } from 'react-redux';
import { change_favorite_status, delete_dress, edit_dress_name, get_favorite_user_categories, get_user_dress } from '../redux/actions/dress';
import { useNavigate } from 'react-router-dom';

function Dresses() {
  const dispatch=useDispatch();
  const dressSelector=useSelector(state=>state.dress);
  const navigate=useNavigate();

  const [selectedView,setSelectedView]=React.useState(0);
  const [userDresses,setUserDresses]=React.useState([]);
  const [favUserDresses,setFavUserDresses]=React.useState([]);
  const [display_dresses,set_display_dresses]=React.useState([]);
  const [loading,setLoading]=React.useState(false);
  const [emptyMessage,setEmptyMessage]=React.useState("");


  const [editingDressId,setEditingDressId]=React.useState(null);
  const [newDressName,setNewDressName]=React.useState("");

  React.useEffect(()=>{
    const get_dress_func=async ()=>{
      try{
        setLoading(true);
        await dispatch(get_user_dress());
        await dispatch(get_favorite_user_categories());
      }catch(e){
        console.log("error fetching the data");
      }finally{
        setLoading(false);
      }
    }
    get_dress_func();
  },[])

  React.useEffect(()=>{
    setUserDresses(dressSelector.user_dress);
    setFavUserDresses(dressSelector.favorite_dress);
    
  },[dressSelector.user_dress,dressSelector.favorite_dress])

  React.useEffect(() => {
    if(selectedView === 0){
      if(userDresses.length>0){
        set_display_dresses(userDresses);
        setEmptyMessage("");
      }else{
        set_display_dresses([]);
        setEmptyMessage(dressSelector.message || "No Dress Found");
      }
    }
    else{
      if(favUserDresses.length>0){
        set_display_dresses(favUserDresses);
      }else{
        set_display_dresses([]);
        setEmptyMessage("No Favorite Dress Found");
      }
    }
  },[selectedView,userDresses,favUserDresses]);

  return (
    <>
        <Navbar/>
        <div className='min-h-screen bg-gradient-to-r from-gray-900 to-black font-sans px-8 py-12'>
          {/* <div className='text-end text-[#fff] text-md underline'>History</div> */}
          <div className='flex text-white gap-4 pb-4 mt-4'>
            <button onClick={()=>{
              setSelectedView(0);
            }} className={`px-4 py-1 outline-none cursor-pointer border ${selectedView===0?'bg-white text-black' : 'text-white'}`}>All</button>
            <button onClick={()=>{
              setSelectedView(1);
            }} className={`px-4 py-1 outline-none cursor-pointer border ${selectedView===1?'bg-white text-black' : 'text-white'}`}>Favorites</button>
          </div>
          {loading&&<></>}
        {display_dresses?.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {display_dresses?.map((user_dress, index) => (
              <div
                key={index}
                className="bg-zinc-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-4 text-white space-y-2">
                  <div className='flex items-center justify-between'>
                    {
                      editingDressId === user_dress.outfit_category_id ?
                      <div>
                        <input type="text" value={newDressName} onChange={(e)=>setNewDressName(e.target.value)} />
                        {newDressName.length>0?<i className="fa-solid fa-check" onClick={()=>{
                          setUserDresses((prev)=>prev.map((dress)=>dress.outfit_category_id===user_dress.outfit_category_id?{...dress,category_name:newDressName}:dress));
                          dispatch(edit_dress_name({outfit_category_id:editingDressId,category_name:newDressName}));
                          setEditingDressId(null);
                          setNewDressName("");
                        }}></i>
                        :
                        <i className="fa-solid fa-xmark" onClick={()=>setEditingDressId(null)}></i>}
                      </div>
                      :
                      <div className='flex items-center gap-2' >
                        <i className="fa-solid fa-pen" onClick={()=>setEditingDressId(user_dress.outfit_category_id)}></i>
                        <p onClick={()=>navigate(`/dresses/${user_dress.outfit_category_id}`)} className="text-xl cursor-pointer">{user_dress?.category_name}</p>
                      </div>
                    }
                    <i className="fa-solid fa-trash text-red-900 cursor-pointer" onClick={()=>{
                      setUserDresses((prev)=>prev.filter((dress)=>dress.outfit_category_id!==user_dress.outfit_category_id));
                      dispatch(delete_dress({outfit_category_id:user_dress.outfit_category_id}));
                    }}></i>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {user_dress?.is_favorite ? (
                        <i className="fa-solid fa-heart text-red-500" onClick={()=>{
                          const updatedDress=userDresses.map((cate)=>cate.outfit_category_id===user_dress.outfit_category_id?{...cate,is_favorite:false}:cate)
                          setUserDresses(updatedDress);
                          setFavUserDresses(updatedDress.filter(dress => dress.is_favorite));
                          dispatch(change_favorite_status({outfit_category_id:user_dress.outfit_category_id,status:false}))
                        }} />
                      ) : (
                        <i className="fa-regular fa-heart text-gray-400" onClick={()=>{
                          const updatedDress=userDresses.map((cate)=>cate.outfit_category_id===user_dress.outfit_category_id?{...cate,is_favorite:true}:cate)
                          setUserDresses(updatedDress);
                          setFavUserDresses(updatedDress.filter(dress => dress.is_favorite));
                          dispatch(change_favorite_status({outfit_category_id:user_dress.outfit_category_id,status:true}));
                        }}/>
                      )}
                    </span>
                    <div className="text-sm text-gray-400">
                    Created: {new Date(user_dress?.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {user_dress?.updated_at 
                    ? new Date(user_dress.updated_at).toLocaleString('en-IN', {
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

export default Auth_Guard(Dresses);
