import { createAsyncThunk } from "@reduxjs/toolkit";
import client_server from '../../../config/client_server.js';

//getting user dresses
export const get_user_dress=createAsyncThunk(
    'category/get_user_categories',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.get('/category/get_user_categories',{withCredentials:true});
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//get outfits for particular dress
export const get_dress_outfits=createAsyncThunk(
    "category/get_outfits_for_particular_category/:outfit_category_id",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.get(`/category/get_outfits_for_particular_category/${data.outfit_category_id}`,{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//getting fav dresses
export const get_favorite_user_categories=createAsyncThunk(
    'category/get_favorite_user_categories',
    async (_,thunkAPI)=>{
        try{
            const response=await client_server.get('/category/get_favorite_user_categories',{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

export const change_favorite_status=createAsyncThunk(
    "category/change_favorite_status",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.put("/category/change_favorite_status",{
                is_fav_status:data.status,
                outfit_category_id:data.outfit_category_id
            },{
                withCredentials:true
            })
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//creating dresses
export const create_category=createAsyncThunk(
    'category/create_category',
    async (dress_data,thunkAPI)=>{
        try{
            const response=await client_server.post('/category/create_category',{
                category_name:dress_data.dressName,
                outfits_ids:dress_data.outfit_ids
            },{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//edit dress name
export const edit_dress_name=createAsyncThunk(
    "category/edit_outfit_category_name",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.put("/category/edit_outfit_category_name",{
                category_name:data.category_name,
                outfit_category_id:data.outfit_category_id
            },{
                withCredentials:true
            })
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//delete dress
export const delete_dress=createAsyncThunk(
    "category/delete_outfit_category/:outfit_category_id",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.delete(`/category/delete_outfit_category/${data.outfit_category_id}`,{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)