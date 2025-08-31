import pool from '../config/db_config.js'
//marking the outfit for today

export const set_today_outfits_category=async (req,res)=>{
    const {outfit_category_id}=req.params;
    if(!outfit_category_id){
        return res.status(400).json({message:"All fields are required"});
    }
    const user_id=req?.user?.user_id;
    //first check if there already a entry for this outfit_category_id if yes return
    const query="SELECT outfit_category_id FROM outfit_category_history WHERE user_id=$1 AND last_used_at=CURRENT_DATE";
    const query_values=[user_id]
    const response=await pool.query(query,query_values);
    if(response.rowCount>0){
        return res.status(400).json({message:"Today wearing already set try updating it"})
    }
    //now insert the outfit_category_id for that user_id and today date
    const query2="INSERT INTO outfit_category_history (user_id, outfit_category_id, last_used_at) VALUES ($1, $2, CURRENT_DATE)";
    const query2_values=[user_id,outfit_category_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount===0){
        return res.status(500).json({message:"internal server error"}); 
    }
    return res.status(200).json({message:"Today wearing set"});
}

//update todays outfit category
export const update_today_outfits_category=async (req,res)=>{
    const {outfit_category_id}=req.params;
    if(!outfit_category_id){
        return res.status(400).json({message:"All fields are required"});
    }
    //check if this entry exists for today outfit category
    const query="SELECT outfit_category_id FROM outfit_category_history WHERE user_id=$1 AND last_used_at=CURRENT_DATE";
    const query_values=[req?.user?.user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(400).json({message:"Please first set today's outfit wearing"})
    }
    const query2="UPDATE outfit_category_history SET outfit_category_id=$1 WHERE user_id=$2 AND last_used_at=CURRENT_DATE";
    const query2_values=[outfit_category_id,req?.user?.user_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount===0){
        return res.status(500).json({message:"internal server error"});
    }
    return res.status(200).json({message:"Today wearing outfit updated"});
}

//check if there is already a chosen dress for today or not
export const is_today_dress_chosen=async (req,res)=>{
    const query="SELECT outfit_category_id FROM outfit_category_history WHERE user_id=$1 AND last_used_at=CURRENT_DATE";
    const query_values=[req?.user?.user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.json({status:false});
    }
    return res.json({status:true});
}

//show history before today
export const show_history=async (req,res)=>{
    const query="SELECT oc.category_name, oc.outfit_category_id, och.last_used_at FROM outfit_categories oc INNER JOIN outfit_category_history och ON oc.outfit_category_id = och.outfit_category_id AND oc.user_id = och.user_id WHERE och.user_id = $1 AND och.last_used_at < CURRENT_DATE";
    const query_values=[req?.user?.user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(404).json({message:"No history found"});
    }
    return res.status(200).json({outfit_category_history:response.rows});
}

//choose if this is today's outfit for current user
export const is_this_today_outfit=async (req,res)=>{
    const {outfit_category_id}=req.params;
    if(!outfit_category_id){
        return res.status(400).json({message:"all fields are required"});
    }
    const query="SELECT * FROM outfit_category_history WHERE outfit_category_id=$1 AND user_id=$2 AND last_used_at=CURRENT_DATE";
    const query_values=[outfit_category_id,req?.user?.user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.json({status:false});
    }
    return res.json({status:true});
}

//get my today chosed outfits category
export const get_today_dress=async(req,res)=>{
    const query="SELECT outfit_category_id FROM outfit_category_history WHERE user_id=$1 AND last_used_at = CURRENT_DATE";
    const query_values=[req?.user?.user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(404).json({message:"No dress found for today please set one first"});
    }
    const query2="SELECT category_name FROM outfit_categories WHERE user_id=$1 AND outfit_category_id=$2";
    const query2_values=[req?.user?.user_id,response.rows[0]?.outfit_category_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount===0){
        return res.status(404).json({message:"No dress found for today"});
    }
    return res.status(200).json({category_name:response2.rows[0]?.category_name,outfit_category_id:response.rows[0]?.outfit_category_id});
}

//remove today's outfit category
export const remove_today_outfit_category=async(req,res)=>{
    const query1="SELECT outfit_category_id FROM outfit_category_history WHERE user_id=$1 AND last_used_at = CURRENT_DATE";
    const query1_values=[req?.user?.user_id];
    const response1=await pool.query(query1,query1_values);
    if(response1.rowCount===0){
        return res.status(404).json({message:"No outfit set for today. Please set one first."});
    }
    let selected_id=response1.rows[0]?.outfit_category_id;
    const query2="DELETE FROM outfit_category_history WHERE user_id=$1 AND last_used_at=CURRENT_DATE AND outfit_category_id=$2";
    const query2_values=[req?.user?.user_id,selected_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount===0){
        return res.status(500).json({message:"internal server error"});
    }
    return res.status(200).json({message:"Removed dress for today"});
}