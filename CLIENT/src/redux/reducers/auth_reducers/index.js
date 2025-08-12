import { createSlice } from "@reduxjs/toolkit";
import { isLoggedIn, login, logout, register } from "../../actions/auth_actions";

const initialState={
    user:null,
    message:"",
    loggedIn:false,
    isSuccess:false,
    isError:false,
    isPending:false
}
const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        reset:()=>initialState,
        emptyMessage:(state,_)=>{
            state.message=""
        }
    },
    extraReducers:((builder)=>{
        builder
        .addCase(isLoggedIn.fulfilled,(state,action)=>{
            state.loggedIn=action?.payload?.status;
            state.isSuccess=true;
            // state.message=action?.payload?.message;
            state.user=action?.payload?.data;
        })
        .addCase(isLoggedIn.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(isLoggedIn.rejected,(state,action)=>{
            // state.message=action?.payload?.message;
            state.isError=true;
            state.loggedIn=action?.payload?.status;
        })//login
        .addCase(login.fulfilled,(state,action)=>{
            state.loggedIn=true;
            state.message=action.payload?.message;
            state.isSuccess=true;
        })
        .addCase(login.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(login.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.isError=true;
        })//logout
        .addCase(logout.fulfilled,(state,action)=>{
            state.loggedIn=false;
            state.user=null;
            state.isSuccess=true;
            state.message=action.payload?.message;
        })
        .addCase(logout.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(logout.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.isError=true;
        })//register
        .addCase(register.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.message=action.payload?.message;
        })
        .addCase(register.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(register.rejected,(state,action)=>{
            state.isError=true;
            state.message=action.payload?.message;
        })
    })
});
export const {reset,emptyMessage}=authSlice.actions;
export default authSlice.reducer;

