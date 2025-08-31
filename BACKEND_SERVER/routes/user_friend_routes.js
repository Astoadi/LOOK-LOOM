import express from 'express'
import authenticate_user from '../Middlewares/authenticate_user.js';
import { AcceptRequest, GetFollowing, GetFriendByUserName, GetMyIncomingRequests, RejectRequest, addFriend, checkPendingStatusOfOtherProfile, getFollowers, getFriendorOtherProfile } from '../controllers/user_friend_controller.js';
import async_func from '../utils/try_async_util_function.js';
const router=express.Router({mergeParams:true});

//add friend request
router.post("/",authenticate_user,async_func(addFriend))

//accept friend request
router.put("/acc_fr",authenticate_user,async_func(AcceptRequest));

//remove friend or reject friend
router.delete("/rm_fr/:connection_id",authenticate_user,async_func(RejectRequest));

//get people i follow
router.get('/get_folong',authenticate_user,async_func(GetFollowing));

//get people that follows you
router.get('/get_folwr',authenticate_user,async_func(getFollowers));

//get pending requests
router.get("/get_pr",authenticate_user,async_func(GetMyIncomingRequests));

//search friend
router.get("/get_frnd",authenticate_user,async_func(GetFriendByUserName));
//getting other's profile
router.get("/get_profile/:pId",authenticate_user,async_func(getFriendorOtherProfile));

router.get('/checkPendingStatusOfOtherProfile/:pId',authenticate_user,async_func(checkPendingStatusOfOtherProfile));

export default router;