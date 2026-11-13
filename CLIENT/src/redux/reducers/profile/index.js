import { createSlice } from "@reduxjs/toolkit"
import { ChangePublicVisibilityToPrivate, ChangePublicVisibilityToPublic, getProfile } from "../../actions/profile/index.js";

const initialState={
    user_profile:{},
    message:""
}

const profile=createSlice({
    name:"profile",
    initialState,
    reducers:{
        emptyMessage:(state,_)=>{
            state.message=""
        }
    },
    extraReducers:((builder)=>{
        builder
        .addCase(getProfile.fulfilled,(state,action)=>{
            state.user_profile=action.payload;
        })
        .addCase(getProfile.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.user_profile={};
        })//to public account
        .addCase(ChangePublicVisibilityToPublic.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
        })
        .addCase(ChangePublicVisibilityToPublic.rejected,(state,action)=>{
            state.message=action.payload?.message;
        })// to private account
        .addCase(ChangePublicVisibilityToPrivate.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
        })
        .addCase(ChangePublicVisibilityToPrivate.rejected,(state,action)=>{
            state.message=action.payload?.message;
        })

    })
});



export const {emptyMessage}=profile.actions;
export default profile.reducer;