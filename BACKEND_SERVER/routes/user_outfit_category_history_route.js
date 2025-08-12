import express from 'express';
import authenticate_user from '../Middlewares/authenticate_user.js';
import async_func from '../utils/try_async_util_function.js'
import { get_today_dress, is_this_today_outfit, is_today_dress_chosen, remove_today_outfit_category, set_today_outfits_category, show_history, update_today_outfits_category } from '../controllers/user_outfit_category_history_controller.js';
import is_outfit_category_owner from '../Middlewares/is_outfit_category_owner.js';
const router=express.Router({mergeParams:true});

//marking the outfit category for today
router
.post('/set_today_outfits_category/:outfit_category_id',authenticate_user,is_outfit_category_owner,async_func(set_today_outfits_category))

// if exists then update todays outfit category
router
.put('/update_today_outfits_category/:outfit_category_id',authenticate_user,is_outfit_category_owner,async_func(update_today_outfits_category));

//check if there is already a chosen dress for today or not
router
.get('/is_today_dress_chosen',authenticate_user,async_func(is_today_dress_chosen));

//choose if this is today's outfit
router
.get('/is_this_today_outfit/:outfit_category_id',authenticate_user,is_outfit_category_owner,async_func(is_this_today_outfit));

//show history before today
router
.get('/show_history',authenticate_user,async_func(show_history));

//get my today chosed outfits
router
.get('/get_today_dress',authenticate_user,async_func(get_today_dress));

//remove today's outfit category
router
.delete('/remove_today_outfit_category',authenticate_user,async_func(remove_today_outfit_category));

export default router;

