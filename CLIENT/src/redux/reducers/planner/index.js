import { createSlice } from "@reduxjs/toolkit"
import { delete_plan, get_future_plans, get_history_plans, get_today_plan, make_plan, update_plan_date } from "../../actions/planner";
const initialState={
    today_plans:[],
    future_plans:[],
    past_plans:[],
    message:""
}

const planner=createSlice({
    name:"planner",
    initialState,
    reducers:{
        emptyMessage:(state,_)=>{
            state.message=""
        }
    },
    extraReducers:((builder)=>{
        builder//making plan
        .addCase(make_plan.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
        })
        .addCase(make_plan.rejected,(state,action)=>{
            state.message=action.payload?.message;
        })//get_today_plan
        .addCase(get_today_plan.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
            state.today_plans=action.payload?.today_plans;
        })
        .addCase(get_today_plan.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.today_plans=[];
        })//get_future_plans
        .addCase(get_future_plans.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
            state.future_plans=action.payload?.future_plans;
        })
        .addCase(get_future_plans.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.future_plans=[];
        })//get_history_plans
        .addCase(get_history_plans.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
            state.past_plans=action.payload?.history_plans;
        })
        .addCase(get_history_plans.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.past_plans=[];
        })//update_plan_date
        .addCase(update_plan_date.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
        })
        .addCase(update_plan_date.rejected,(state,action)=>{
            state.message=action.payload?.message;
        })//delete_plan
        .addCase(delete_plan.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
        })
        .addCase(delete_plan.rejected,(state,action)=>{
            state.message=action.payload?.message;
        })
    })
});

export const {emptyMessage}=planner.actions;
export default planner.reducer;