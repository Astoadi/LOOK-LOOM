import authenticate_user from '../Middlewares/authenticate_user.js';
import is_outfit_category_owner from '../Middlewares/is_outfit_category_owner.js';
import { delete_plan, get_future_plans, get_history, get_today_plans, plan_outfit_category, update_plan_date } from '../controllers/user_outfit_category_planner_controller.js';
import async_func from '../utils/try_async_util_function.js';
import express from 'express';
const router=express.Router({mergeParams:true});

//make plan for outfit category
router
.post('/plan_outfit_category/:outfit_category_id',authenticate_user,is_outfit_category_owner,async_func(plan_outfit_category));

//get today's plan
router
.get('/get_today_plans',authenticate_user,async_func(get_today_plans));

//all future plans
router
.get('/get_future_plans',authenticate_user,async_func(get_future_plans));

//show history
router
.get('/get_history',authenticate_user,async_func(get_history));

//edit plan date
router
.put('/update_plan_date',authenticate_user,async_func(update_plan_date));

//delete plan
router
.delete('/delete_plan/:outfit_category_planner_id',authenticate_user,async_func(delete_plan));

export default router;