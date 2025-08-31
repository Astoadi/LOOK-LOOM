import { createAsyncThunk } from '@reduxjs/toolkit';
import client_server from '../../../config/client_server.js';

export const isLoggedIn=createAsyncThunk(
    "/auth/",
    async(_,thunkAPI)=>{
        try{
            const response=await client_server.get('/auth/',{withCredentials:true});
            return thunkAPI.fulfillWithValue(response?.data);
        }catch(e){
            // console.log(e?.response?.data);
            return thunkAPI.rejectWithValue(e?.response?.data);
        }
    }
)

export const login=createAsyncThunk(
    "/auth/login",
    async(login_data,thunkAPI)=>{
        try{
            const response=await client_server.post('/auth/login',{
                    user_name:login_data?.user_name,
                    password:login_data?.password
                },{
                    withCredentials: true,
                })
            return thunkAPI.fulfillWithValue(response.data)
        }catch(e){
            // console.log(e?.response?.data);
            return thunkAPI.rejectWithValue(e?.response?.data);
        }
    }
)

export const register=createAsyncThunk(
    "/auth/register",
    async(register_data,thunkAPI)=>{
        try{
            const response=await client_server.post('/auth/register',{
                    first_name:register_data?.first_name,
                    last_name:register_data?.last_name,
                    gender:register_data?.gender,
                    user_name:register_data?.user_name,
                    password:register_data?.password
                });
            return thunkAPI.fulfillWithValue(response.data)
        }catch(e){
            // console.log(e?.response?.data);
            return thunkAPI.rejectWithValue(e?.response?.data);
        }
    }
)

export const logout=createAsyncThunk(
    "/auth/logout",
    async(_,thunkAPI)=>{
        try{
            const response=await client_server.post("/auth/logout",{},{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e?.response?.data);
            return thunkAPI.rejectWithValue(e?.response?.data);
        }
    }
)