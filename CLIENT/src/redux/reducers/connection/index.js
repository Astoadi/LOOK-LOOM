import { createSlice } from "@reduxjs/toolkit"
import { AcceptRequest, GetFollowing, GetMyIncomingRequests, RejectRequest, addFriend, getFollowers, getFriendorOtherProfile } from "../../actions/connection/index.js";

const initialState={
    following:[],
    followers:[],
    pendingRequests:[],
    otherPersonProfile:[],
    message:""
}

const connection=createSlice({
    name:"connection",
    initialState,
    reducers:{
        emptyMessage:(state,_)=>{
            state.message=""
        }
    },
    extraReducers:((builder)=>{
        builder//adding friend request
        .addCase(addFriend.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
        })
        .addCase(addFriend.rejected,(state,action)=>{
            state.message=action.payload?.message;
        })//accept friend request
        .addCase(AcceptRequest.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
        })
        .addCase(AcceptRequest.rejected,(state,action)=>{
            state.message=action.payload?.message;
        })//remove friend or reject friend
        .addCase(RejectRequest.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
        })
        .addCase(RejectRequest.rejected,(state,action)=>{
            state.message=action.payload?.message;
        })//get people i follow
        .addCase(GetFollowing.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
            state.following=action.payload?.following;
        })
        .addCase(GetFollowing.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.following=[];
        })//get people that follows you
        .addCase(getFollowers.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
            state.followers=action.payload?.followers;
        })
        .addCase(getFollowers.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.followers=[];
        })//get my incoming requests
        .addCase(GetMyIncomingRequests.fulfilled,(state,action)=>{
            state.message=action.payload?.message;
            state.pendingRequests=action.payload?.requests;
        })
        .addCase(GetMyIncomingRequests.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.pendingRequests=[];
        })//getting other's profile
        .addCase(getFriendorOtherProfile.fulfilled,(state,action)=>{
            state.message="User Profile"
            state.otherPersonProfile=action.payload;
        })
        .addCase(getFriendorOtherProfile.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.otherPersonProfile=[];
        })//GetFriendByUserName
    })
});



export const {emptyMessage}=connection.actions;
export default connection.reducer;