import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { isLoggedIn } from "../redux/actions/auth_actions/index.js";
import { useNavigate } from "react-router-dom";
import LoadingCursor from "./loading_cursor.jsx";

const Auth_Guard = (Input_Comp) => {
  const WrappedAuthFunc = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [checkingAuth, setCheckingAuth] = useState(true); // ✅ start as true

    useEffect(() => {

        dispatch(isLoggedIn()).then((data)=>{
          if(!data.payload.status){
            navigate('/auth')
          }
          setCheckingAuth(false);
        });
        
    },[])
    if(checkingAuth) return <LoadingCursor/>
    return <Input_Comp {...props} />;
};
  return WrappedAuthFunc;
};

export default Auth_Guard;
