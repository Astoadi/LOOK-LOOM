import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../redux/actions/auth_actions';
import {emptyMessage} from '../redux/reducers/auth_reducers/index.js'

export default function Auth_Page() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [msg,set_msg]=React.useState("");

  const [first_name,set_first_name]=React.useState("");
  const [last_name,set_last_name]=React.useState("");
  const [gender,set_gender]=React.useState("");
  const [user_name,set_user_name]=React.useState("");
  const [password,set_password]=React.useState("");

  const authState=useSelector(state=>state.auth);
  const authDispatch=useDispatch();
  const navigate=useNavigate();

  const handle_user_auth=async (e)=>{
    e.preventDefault();
    if(isLogin){
      //call login action
      const res=await authDispatch(login({user_name,password}));
      set_msg(res.payload?.message);
    }else{
      //call register action
      const res=await authDispatch(register({first_name,last_name,user_name,gender,password}));
      set_msg(res.payload?.message);
    }
    set_first_name("");
    set_last_name("");
    set_user_name("");
    set_gender("");
    set_password("");
  }

  React.useEffect(()=>{
    if(authState.loggedIn){
      navigate('/home');
    }
  },[authState.loggedIn])

  React.useEffect(() => {
    const timer = setTimeout(() => {
        set_msg("");
        authDispatch(emptyMessage());
    }, 2000);

    return () => clearTimeout(timer); // Cleanup function
  }, [authState.message]);

  return (
    <div className='h-auto md:h-screen w-screen bg-black flex justify-center items-center py-10'>
      
      
      <div className='bg-zinc-900 flex flex-col md:flex-row h-full md:h-[80%] w-[90%] md:w-[80%] rounded-xl overflow-hidden shadow-lg'>

       
        <div className='h-60 md:h-full md:w-1/2 bg-[url("/images/photo-1513569771920-c9e1d31714af.jpeg")] bg-center bg-cover'>
        <i className="cursor-pointer relative top-2 left-2 text-[#ffffff] fa-solid fa-angle-left" onClick={()=>navigate('/')}></i>
        </div>

        <div className='h-full w-full md:w-1/2 flex justify-center items-center text-white p-6'>
     
          <div className='w-full max-w-md'>

            <h2 className='text-3xl font-bold text-center mb-6'>
              {isLogin ? 'Login to Look Loom' : 'Sign Up for Look Loom'}
            </h2>

            {msg?.length>0 ?<p className='text-center p-2'>{msg}</p>:<></>}

            <form className='space-y-4' onSubmit={handle_user_auth}>
              
              {!isLogin && (
                <>
                  <div className='flex gap-4'>
                    <input
                      type='text'
                      placeholder='First Name'
                      className='w-1/2 p-3 rounded bg-zinc-800 text-white focus:outline-purple-500'
                      required
                      value={first_name}
                      onChange={(e)=>set_first_name(e.target.value)}
                    />
                    <input
                      type='text'
                      placeholder='Last Name'
                      className='w-1/2 p-3 rounded bg-zinc-800 text-white focus:outline-purple-500'
                      required
                      value={last_name}
                      onChange={(e)=>set_last_name(e.target.value)}
                    />
                  </div>

                 
                  <select
                    className='w-full p-3 rounded bg-zinc-800 text-white focus:outline-purple-500'
                    required
                    value={gender}
                    onChange={(e)=>set_gender(e.target.value)}
                  >
                    <option value=''>Select Gender</option>
                    <option value='M'>Male</option>
                    <option value='F'>Female</option>
                    <option value='O'>Other</option>
                  </select>
                </>
              )}

           
              <input
                type='text'
                placeholder='Username'
                className='w-full p-3 rounded bg-zinc-800 text-white focus:outline-purple-500'
                required
                value={user_name}
                onChange={(e)=>set_user_name(e.target.value)}
              />
              <input
                type='password'
                placeholder='Password'
                className='w-full p-3 rounded bg-zinc-800 text-white focus:outline-purple-500'
                required
                value={password}
                onChange={(e)=>set_password(e.target.value)}
              />

              
              <button
                type='submit'
                className='w-full bg-purple-600 hover:bg-purple-700 transition p-3 rounded font-semibold'
              >
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>

       
            <div className='text-center mt-4'>
              <span>
                {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className='text-purple-400 hover:underline'
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
