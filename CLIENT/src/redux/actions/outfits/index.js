import { createAsyncThunk } from "@reduxjs/toolkit";
import client_server from "../../../config/client_server.js";


//creating outfit
export const create_outfit=createAsyncThunk(
    'outfits/create_outfit',
    async(outfit_data,thunkAPI)=>{
        try{
            const formData=new FormData();
            formData.append("body",outfit_data.outfit_body);
            formData.append("outfit_image",outfit_data.outfit_image);
            const response=await client_server.post('/outfits/create_outfit',formData,{
                headers:{
                    "Content-Type":"multipart/form-data"
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


//getting the outfits
export const get_outfit=createAsyncThunk(
    'outfits/get_outfits',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.get('/outfits/get_outfits',{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)


//getting favorite outfits
export const get_favorite_outfits=createAsyncThunk(
    'outfits/get_favorite_outfits',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.get('/outfits/get_favorite_outfits',{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//searching the outfit by its body name
export const get_outfit_by_body_name=createAsyncThunk(
    'outfits/get_outfit_by_body_name',
    async (search_data,thunkAPI)=>{
        try{
            const response=await client_server.get('/outfits/get_outfit_by_body_name',{
                params:{
                    body:search_data.body
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

//changing the favorite status
export const change_favorite_status=createAsyncThunk(
    'outfits/change_favorite_status',
    async (status_change_data,thunkAPI)=>{
        try{
            const response=await client_server.put('/outfits/change_favorite_status',{
                is_fav_status:status_change_data.status,
                outfit_id:status_change_data.outfit_id
            },
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

//getting particular outfit
export const get_outfit_by_id=createAsyncThunk(
    'outfits/get_outfit/:outfit_id',
    async (data,thunkAPI)=>{
        try{
            const response=await client_server.get(`/outfits/get_outfit/${data.outfit_id}`,{
                withCredentials:true
            })
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//for deleting the outfit
export const delete_outfit=createAsyncThunk(
    'outfits/delete_outfit/:outfit_id',
    async (outfit_delete_data,thunkAPI)=>{
        try{
            const response=await client_server.delete(`/outfits/delete_outfit/${outfit_delete_data.outfit_id}`,{
                withCredentials:true
            })
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//update outfit image
export const update_outfit_image=createAsyncThunk(
    "outfits/update_outfit_image",
    async(data,thunkAPI)=>{
        try{
            const formData = new FormData();
            formData.append("outfit_image", data.outfit_image);
            formData.append("outfit_id", data.outfit_id);
            const response=await client_server.put('/outfits/update_outfit_image',formData,{
                headers:{
                    "Content-Type":"multipart/form-data"
                },
                withCredentials:true
            })
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

export const update_outfit_body=createAsyncThunk(
    "outfits/update_outfit_body",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.put("/outfits/update_outfit_body",{
                outfit_id:data.outfit_id,
                body:data.body
            },{
                withCredentials:true
            })
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

export const change_is_active_status=createAsyncThunk(
    "outfits/change_is_active_status",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.put("/outfits/change_is_active_status",{
                is_active_status:data.is_active_status,
                outfit_id:data.outfit_id
            },{
                withCredentials:true
            })
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)