import { createAsyncThunk } from "@reduxjs/toolkit";
import client_server from "../../../config/client_server";

//making future plans
export const make_plan=createAsyncThunk(
    "outfit_category_history_planner/plan_outfit_category",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.post(`/outfit_category_history_planner/plan_outfit_category/${data.outfit_category_id}`,{
                plan_date:data.plan_date,
                notes:data.notes
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

//getting today plan
export const get_today_plan=createAsyncThunk(
    "outfit_category_history_planner/get_today_plans",
    async(_,thunkAPI)=>{
        try{
            const response=await client_server.get("/outfit_category_history_planner/get_today_plans",{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//get_future_plans
export const get_future_plans=createAsyncThunk(
    "outfit_category_history_planner/get_future_plans",
    async(_,thunkAPI)=>{
        try{
            const response=await client_server.get("/outfit_category_history_planner/get_future_plans",{
                withCredentials:true
            })
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//get_history
export const get_history_plans=createAsyncThunk(
    "outfit_category_history_planner/get_history",
    async(_,thunkAPI)=>{
        try{    
            const response=await client_server.get("/outfit_category_history_planner/get_history",{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//update plan
export const update_plan_date=createAsyncThunk(
    "outfit_category_history_planner/update_plan_date",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.put("/outfit_category_history_planner/update_plan_date",{
                outfit_category_planner_id:data.outfit_category_planner_id,
                new_plan_date:data.new_plan_date
            },{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)

//delete plan
export const delete_plan=createAsyncThunk(
    "outfit_category_history_planner/delete_plan/:outfit_category_planner_id",
    async(data,thunkAPI)=>{
        try{
            const response=await client_server.delete(`/outfit_category_history_planner/delete_plan/${data.outfit_category_planner_id}`,{
                withCredentials:true
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(e){
            // console.log(e.response.data);
            return thunkAPI.rejectWithValue(e.response.data);
        }
    }
)