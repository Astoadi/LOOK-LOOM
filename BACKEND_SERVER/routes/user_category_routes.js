import express from 'express'
import authenticate_user from '../Middlewares/authenticate_user.js';
import async_func from '../utils/try_async_util_function.js';
import { change_favorite_status, create_category, delete_outfit_category, edit_outfit_category_name, get_favorite_user_categories, get_outfits_for_particular_category, get_user_categories } from '../controllers/user_category_controller.js';

const router=express.Router({mergeParams:true});

//get all user category
router
.get('/get_user_categories',authenticate_user,async_func(get_user_categories));

//get outfits for particular user and outfit category
router
.get('/get_outfits_for_particular_category/:outfit_category_id',authenticate_user,async_func(get_outfits_for_particular_category));

//get favorite categories
router
.get('/get_favorite_user_categories',authenticate_user,async_func(get_favorite_user_categories));

//add or remove category in favorite 
router
.put('/change_favorite_status',authenticate_user,async_func(change_favorite_status));

//create category 
router
.post('/create_category',authenticate_user,async_func(create_category));

//edit category name
router
.put('/edit_outfit_category_name',authenticate_user,async_func(edit_outfit_category_name));

//delete category
router
.delete('/delete_outfit_category/:outfit_category_id',authenticate_user,async_func(delete_outfit_category));

export default router;