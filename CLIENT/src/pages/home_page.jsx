import React from 'react';
import Auth_Guard from '../utils/auth_guard';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/navbar';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import { get_today_dress, is_today_dress_chosen } from '../redux/actions/outfit_category_actions';
import MovingDots from '../components/dots';
import { create_outfit } from '../redux/actions/outfits';

function Home_Page() {
  const authState = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const outfit_state=useSelector(state=>state.outfit);
  const outfit_Category_state = useSelector(state => state.outfit_category);

  const [today_status_msg, set_today_status_msg] = React.useState('');
  const [outfit_body, set_outfit_body] = React.useState('');
  const [outfit_image, set_outfit_image] = React.useState(null);
  const [image_file, set_image_file] = React.useState(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [createMessage, setCreateMessage] = React.useState('');

  const [todayDressStatus,setTodayDressStatus]=React.useState(false);
  const [todayEmptyDressMsg,setTodayEmptyDressMsg]=React.useState("");
  const [todayDress,setTodayDress]=React.useState("");
  const [tDressID,setTDressID]=React.useState(0);

  // Outfit creation
  const handleOutfitCreation = async () => {
    if (!outfit_body || !outfit_image) {
      setCreateMessage("Please provide both description and image.");
      return;
    }

    try {
      setIsCreating(true);
      setCreateMessage("");
      const result = await dispatch(create_outfit({ outfit_body, outfit_image }));
      if (result?.payload?.message) {
        setCreateMessage(result?.payload?.message);
        // Reset form
        set_outfit_body("");
        set_outfit_image(null);
        set_image_file(null);
      } else {
        setCreateMessage(result?.payload?.message);
      }
    } catch (e) {
      console.error(e);
      setCreateMessage("Something went wrong.");
    } finally {
      setIsCreating(false);
      set_outfit_body("");
      set_outfit_image(null);
      set_image_file(null);
      navigate("/outfits")
    }
  };

  // Image Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    set_outfit_image(file);

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        set_image_file(reader.result); // base64 image string
      };
      reader.readAsDataURL(file);
    } else {
      set_image_file(null);
      setCreateMessage("Please select a valid image.");
    }
    e.target.files=[];
  };

  // Today's dress status
  React.useEffect(() => {
    async function checkingTodayDress(){
      try{
        const res1=await dispatch(is_today_dress_chosen()).unwrap();
        setTodayDressStatus(res1.status);
        await dispatch(get_today_dress());
        if(outfit_Category_state.today_dress_name?.length>0){
          setTodayDress(outfit_Category_state.today_dress_name);
          setTDressID(outfit_Category_state.today_dress_id)
          setTodayEmptyDressMsg("");
        }else{
          setTodayDress("");
          setTodayEmptyDressMsg("Not Set Yet");
        }
      }catch(e){
        console.log(e);
      }
    }
    checkingTodayDress();
  }, [outfit_Category_state.today_dress_name,outfit_Category_state.today_dress_set,outfit_Category_state.today_dress_id]);

  return (
    <div className='bg-gradient-to-r from-gray-900 to-black font-sans'>
      <Navbar />

      <div className='text-white px-8 py-12 flex flex-col gap-4'>

        {/* TOP SECTION */}
        <div className='flex flex-col md:flex-row gap-4'>
          {/* User Info */}
          <div className='bg-zinc-900 w-full md:w-1/2 p-6 rounded flex flex-col gap-4'>
            <div className="text-[#da9dfa] text-3xl">
              Hey @{authState?.user?.user_name}, great to see you again!
            </div>
          </div>

          {/* Plan an Event (Placeholder) */}
          <div className="bg-zinc-900 w-full md:w-1/2 p-6 rounded flex flex-row gap-4 items-center">
            <div className='text-[#f748ce] text-2xl'>Today Dress :</div>
            <div className=''>
              {outfit_Category_state.isPending ? (
                <MovingDots />
              ) : (
                todayDressStatus ? (
                  <p className='text-4xl'><span
                  className={`cursor-pointer font-[800] bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 ${
                    !Number.isInteger(Number(outfit_Category_state?.outfit_category_id)) && 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    const id = Number(tDressID);
                    if (Number.isInteger(id)) {
                      navigate(`/dresses/${id}`);
                    }
                  }}
                >{todayDress}
                </span></p>
                ) : (
                  <p className='text-2xl text-center'>{todayEmptyDressMsg}</p>
                )
              )}
            </div>
          </div>
        </div>

        {/* CREATE OUTFIT */}
        <div className="bg-zinc-900 w-full p-6 rounded flex flex-col gap-4">
          <div className='text-3xl text-[#2df769]'>Create New Outfit</div>
          <div className='flex flex-col gap-2'>
            <input
              className='bg-zinc-800 rounded text-lg outline-none px-4 py-2 mb-4'
              onChange={(e) => set_outfit_body(e.target.value)}
              value={outfit_body}
              type="text"
              placeholder='Describe your outfit...'
              required
            />
            {/* Image Upload */}
            <div className='flex flex-col items-center justify-center border-2 border-dashed border-zinc-600 rounded-lg p-6'>
              <p className="text-gray-400 mb-2 text-center">Upload Outfit Image</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-white w-60 text-center"
              />
              {image_file && (
                <img
                  src={image_file}
                  alt="Selected"
                  className="w-40 h-40 object-cover rounded-md mt-4"
                />
              )}
            </div>

            {/* Submission Message */}
            {createMessage && (
              <p className='text-sm text-yellow-400 text-center mt-2'>{createMessage}</p>
            )}

            <button
              className='py-2 px-6 bg-[#2df769] text-xl cursor-pointer mt-4'
              type="submit"
              onClick={handleOutfitCreation}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Outfit"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Auth_Guard(Home_Page);
