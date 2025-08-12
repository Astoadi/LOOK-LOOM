import { Router } from "express";
import {is_logged_in, login, logout, register} from '../controllers/user_auth_controllers.js';
import async_func from '../utils/try_async_util_function.js'
import authenticate_user from "../Middlewares/authenticate_user.js";

const router=Router({ mergeParams: true });

router
.get('/',authenticate_user,async_func(is_logged_in));

router
.post('/register',async_func(register));

router
.post('/login',async_func(login));

router
.post('/logout',async_func(logout));

export default router;