import { createSlice } from "@reduxjs/toolkit"
import { get_today_dress, is_this_today_dress, is_today_dress_chosen, remove_today_dress, set_today_dress, show__dresses_history, update_today_dress } from "../../actions/outfit_category_actions"
//deals with history path
const initialState={
    message:"",
    isSuccess:false,
    isError:false,
    isPending:false,
    today_dress_name:"",
    today_dress_set:false,
    today_dress_id:null,
    history:[]
}

const outfit_category_slice=createSlice({
    name:"outfit_category",
    initialState,
    reducers:{
        emptyMessage:(state,_)=>{
            state.message=""
        }
    },
    extraReducers:((builder)=>{
        builder
        //setting today outfit
        .addCase(set_today_dress.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(set_today_dress.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
            state.isSuccess=true;
            state.isError=false;
            state.isPending=false;
            state.today_dress_set=true;
        })
        .addCase(set_today_dress.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.isSuccess=false;
            state.isError=true;
            state.isPending=false;
            state.today_dress_set=false;
        })//update today dress
        .addCase(update_today_dress.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(update_today_dress.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
            state.isSuccess=true;
            state.isError=false;
            state.isPending=false;
            state.today_dress_set=true;
        })
        .addCase(update_today_dress.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.isSuccess=false;
            state.isError=true;
            state.isPending=false;
        })//checking if today dress is chosen or not
        .addCase(is_today_dress_chosen.fulfilled,(state,action)=>{
            state.today_dress_set=action.payload?.status;
            state.isPending=false;
        })
        .addCase(is_today_dress_chosen.pending,(state,_)=>{
            state.isPending=true;
        })//check if this is today chosen dress
        .addCase(is_this_today_dress.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(is_this_today_dress.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isError=false;
            state.isPending=true;
            state.today_dress_set=true;
            state.message=action.payload?.message;
        })//show__dresses_history
        .addCase(show__dresses_history.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(show__dresses_history.fulfilled,(state,action)=>{
            state.isError=false;
            state.isPending=false;
            state.isSuccess=true;
            state.history=action.payload?.outfit_category_history;
        })
        .addCase(show__dresses_history.rejected,(state,action)=>{
            state.isError=true;
            state.isPending=false;
            state.isSuccess=false;
            state.message=action.payload?.message;
            state.history=[];
        })//get today dress
        .addCase(get_today_dress.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.today_dress_name=action.payload?.category_name;
            state.today_dress_id=action.payload?.outfit_category_id;
            state.isPending=false;
        })
        .addCase(get_today_dress.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(get_today_dress.rejected,(state,action)=>{
            state.isError=true;
            state.message=action.payload?.message;
            state.isPending=false;
        })//remove_today_dress
        .addCase(remove_today_dress.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(remove_today_dress.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
            state.isSuccess=true;
            state.isError=false;
            state.isPending=false;
            state.today_dress_set=false;
            state.today_dress_name="";
            state.today_dress_id=null;
            state.message=action.payload?.message;
        })
        .addCase(remove_today_dress.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.isSuccess=false;
            state.isError=true;
            state.isPending=false;
        })
    })

})
export const {emptyMessage}=outfit_category_slice.actions;
export default outfit_category_slice.reducer