import pool from '../config/db_config.js';

//make plan for outfit category
export const plan_outfit_category=async (req,res)=>{
    const {outfit_category_id}=req.params;
    const {plan_date,notes}=req.body;
    if(!outfit_category_id || !plan_date || !notes){
        return res.status(400).json({message:"all fields are required"});
    }
    const query="INSERT INTO outfit_category_planner (user_id, outfit_category_id, plan_date, notes) VALUES ($1, $2, $3, $4)";
    const query_values=[req?.user?.user_id,outfit_category_id,plan_date,notes];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(500).json({message:"internal server error"});
    }
    return res.status(201).json({message:"plan created"});
}

//get today's plan
export const get_today_plans=async (req,res)=>{
    const query="SELECT * FROM outfit_category_planner WHERE user_id=$1 AND plan_date=CURRENT_DATE";
    const query_values=[req?.user?.user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.json({message:"No plans for today"});
    }
    return res.json({today_plans:response.rows});
}

//all future plans
export const get_future_plans=async (req,res)=>{
    const query="SELECT * FROM outfit_category_planner WHERE user_id=$1 AND plan_date > CURRENT_DATE";
    const query_values=[req?.user?.user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.json({message:"No future plan set"});
    }
    return res.json({future_plans:response.rows});
}

//show history
export const get_history=async (req,res)=>{
    const query="SELECT * FROM outfit_category_planner WHERE user_id=$1 AND plan_date < CURRENT_DATE";
    const query_values=[req?.user?.user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.json({message:"No history plan found"});
    }
    return res.json({history_plans:response.rows});
}

//edit plan date
export const update_plan_date=async (req,res)=>{
    const  {outfit_category_planner_id,new_plan_date}=req.body;
    if(!outfit_category_planner_id || !new_plan_date){
        return res.status(400).json({message:"all fields are required"});
    }
    //check even if the plan exists or not for this user
    const query="SELECT * FROM outfit_category_planner WHERE  outfit_category_planner_id=$1 AND user_id=$2";
    const query_values=[outfit_category_planner_id,req?.user?.user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(404).json({message:"No plan found"});
    }
    //update query
    const query2="UPDATE outfit_category_planner SET plan_date=$1 WHERE outfit_category_planner_id=$2 AND user_id=$3";
    const query2_values=[new_plan_date,outfit_category_planner_id,req?.user?.user_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount===0){
        return res.status(500).json({message:"error updating the plan date"});
    }
    return res.status(200).json({message:"updated plan date"});
}

//delete plan
export const delete_plan=async (req,res)=>{
    const {outfit_category_planner_id}=req.params;
    if(!outfit_category_planner_id){
        return res.status(400).json({message:"all fields are required"});
    }
    //check even if the plan exists or not for this user
    const query="SELECT * FROM outfit_category_planner WHERE  outfit_category_planner_id=$1 AND user_id=$2 AND plan_date>CURRENT_DATE";
    const query_values=[outfit_category_planner_id,req?.user?.user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(404).json({message:"No plan found"});
    }
    //DELETING IT NOW
    const query2="DELETE FROM outfit_category_planner WHERE outfit_category_planner_id=$1 AND user_id=$2";
    const query2_values=[outfit_category_planner_id,req?.user?.user_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount===0){
        return res.status(500).json({message:"something went wrong"});
    }
    return res.status(200).json({message:"Plan deleted"})
}