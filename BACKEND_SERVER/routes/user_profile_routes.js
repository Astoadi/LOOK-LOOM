import express from "express";
import authenticate_user from '../Middlewares/authenticate_user.js';
import { ChangePublicVisibilityToPrivate, ChangePublicVisibilityToPublic, getProfile } from "../controllers/user_profile_controller.js";
import async_func from "../utils/try_async_util_function.js";
const router=express.Router();


router
.get("/profile",authenticate_user,async_func(getProfile));

router.put("/profile/visi_pu",authenticate_user,async_func(ChangePublicVisibilityToPublic));

router.put("/profile/visi_pr",authenticate_user,async_func(ChangePublicVisibilityToPrivate));

export default router;