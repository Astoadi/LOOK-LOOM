import express from 'express';
import multer from 'multer';

import { change_favorite_status, change_is_active_status, create_outfit , delete_outfit, get_favorite_outfits, get_outfit, get_outfit_by_body_name, get_outfit_by_id, update_outfit_body, update_outfit_image } from '../controllers/user_outfits_controller.js';
import async_func from '../utils/try_async_util_function.js'
import authenticate_user from '../Middlewares/authenticate_user.js';
import { storage } from '../config/cloud_config.js';

const parser=multer({storage:storage});

const router=express.Router({mergeParams:true});

//create outfits
router
.post('/create_outfit',authenticate_user,parser.single('outfit_image'),async_func(create_outfit));

//get user outfits
router
.get('/get_outfits',authenticate_user,async_func(get_outfit));

//get particular outfit
router
.get('/get_outfit/:outfit_id',authenticate_user,async_func(get_outfit_by_id));

//search by outfit name i.e. body-name
router
.get('/get_outfit_by_body_name',authenticate_user,async_func(get_outfit_by_body_name));

//get_favorite_outfits
router
.get('/get_favorite_outfits',authenticate_user,async_func(get_favorite_outfits));

//edit outfit 
//image
router.
put('/update_outfit_image',authenticate_user,parser.single('outfit_image'),async_func(update_outfit_image));

router
.put('/update_outfit_body',authenticate_user,async_func(update_outfit_body));

//delete outfit
router
.delete('/delete_outfit/:outfit_id',authenticate_user,async_func(delete_outfit));

//change change_favorite_status

router
.put('/change_favorite_status',authenticate_user,async_func(change_favorite_status));


//change is active status
router
.put('/change_is_active_status',authenticate_user,async_func(change_is_active_status));


export default router;