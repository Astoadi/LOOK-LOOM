import { createAsyncThunk } from "@reduxjs/toolkit";
import client_server from "../../../config/client_server.js";

//set as today dress
export const set_today_dress=createAsyncThunk(
    "outfit_category_history/set_today_outfits_category/:outfit_category_id",
    async (data,thunkAPI)=>{
        try{
            const response=await client_server.post(`/outfit_category_history/set_today_outfits_category/${data.outfit_category_id}`
            ,{},{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//update today chosen dress
export const update_today_dress=createAsyncThunk(
    "outfit_category_history/update_today_outfits_category/:outfit_category_id",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.put(`/outfit_category_history/update_today_outfits_category/${data.outfit_category_id}`,
            {},{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//checking if today dress is chosen or not
export const is_today_dress_chosen=createAsyncThunk(
    'outfit_category_history/is_today_dress_chosen',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.get('/outfit_category_history/is_today_dress_chosen',{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//check if this is today chosen dress
export const is_this_today_dress=createAsyncThunk(
    "outfit_category_history/is_this_today_outfit/:outfit_category_id",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.get(`/outfit_category_history/is_this_today_outfit/${data.outfit_category_id}`,
            {
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//show history of dresses
export const show__dresses_history=createAsyncThunk(
    "outfit_category_history/show_history",
    async(_,thunkAPI)=>{
        try{
            const response=await client_server.get("/outfit_category_history/show_history",{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//get today dress
export const get_today_dress=createAsyncThunk(
    'outfit_category_history/get_today_dress',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.get('/outfit_category_history/get_today_dress',{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

export const remove_today_dress=createAsyncThunk(
    "outfit_category_history/remove_today_outfit_category",
    async(_,thunkAPI)=>{
        try{
            const response=await client_server.delete("/outfit_category_history/remove_today_outfit_category",{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)