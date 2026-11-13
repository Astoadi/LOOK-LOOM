import { createAsyncThunk } from "@reduxjs/toolkit";
import client_server from "../../../config/client_server.js";

//getting own profile
export const getProfile=createAsyncThunk(
    'profile',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.get('/profile',{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//making profile public
export const ChangePublicVisibilityToPublic=createAsyncThunk(
    'profile/visi_pu',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.put('/profile/visi_pu',{},{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

export const ChangePublicVisibilityToPrivate=createAsyncThunk(
    'profile/visi_pr',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.put('/profile/visi_pr',{},{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)