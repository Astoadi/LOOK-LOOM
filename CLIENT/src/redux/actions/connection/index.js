import { createAsyncThunk } from "@reduxjs/toolkit";
import client_server from "../../../config/client_server.js";

//adding friend request
export const addFriend=createAsyncThunk(
    'connection',
    async (data,thunkAPI)=>{
        try{
            const response=await client_server.post('/connection',{
                connection_id:data.connection_id
            },{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//accept friend request
export const AcceptRequest=createAsyncThunk(
    'connection/acc_fr',
    async (data,thunkAPI)=>{
        try{
            const response=await client_server.put('/connection/acc_fr',{
                connection_id:data.connection_id
            },{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//remove friend or reject friend
export const RejectRequest=createAsyncThunk(
    'connection/rm_fr/:connection_id',
    async (data,thunkAPI)=>{
        try{
            const response=await client_server.delete(`/connection/rm_fr/${data.connection_id}`,{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//get people i follow
export const GetFollowing=createAsyncThunk(
    'connection/get_folong',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.get('/connection/get_folong',{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//get people that follows you

export const getFollowers=createAsyncThunk(
    'connection/get_folwr',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.get('/connection/get_folwr',{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//get pending requests
export const GetMyIncomingRequests=createAsyncThunk(
    'connection/get_pr',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.get('/connection/get_pr',{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//getting other's profile
export const getFriendorOtherProfile=createAsyncThunk(
    'connection/get_profile/:pId',
    async (data,thunkAPI)=>{
        try{
            const response=await client_server.get(`/connection/get_profile/${data.pId}`,{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//GetFriendByUserName
export const GetFriendByUserName=createAsyncThunk(
    'connection/get_frnd',
    async (data,thunkAPI)=>{
        try{
            const response=await client_server.get(`/connection/get_frnd`,{
                params:{
                    p_u_n:data.searchUserName
                },
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

export const checkPendingStatusOfOtherProfile=createAsyncThunk(
    'connection/checkPendingStatusOfOtherProfile',
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.get(`/connection/checkPendingStatusOfOtherProfile/${data.pId}`,{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)