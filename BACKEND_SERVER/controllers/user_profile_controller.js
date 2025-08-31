//viewing own profile
import pool from "../config/db_config.js";

//to public account
export const ChangePublicVisibilityToPublic=async (req,res)=>{
    const query1="UPDATE users SET is_public=true WHERE user_id=$1";
    const query1_values=[req?.user?.user_id];
    const response1=await pool.query(query1,query1_values);
    if (response1.rowCount===0){
        return res.status(500).json({message:"Internal server error"});
    }
    return res.status(200).json({message:"Visibility Changed to Public"});
}

// to private account
export const ChangePublicVisibilityToPrivate=async (req,res)=>{
    const query1="UPDATE users SET is_public=false WHERE user_id=$1";
    const query1_values=[req?.user?.user_id];
    const response1=await pool.query(query1,query1_values);
    if (response1.rowCount===0){
        return res.status(500).json({message:"Internal server error"});
    }
    return res.status(200).json({message:"Visibility Changed to Private"});
}

export const getProfile=async(req,res)=>{
    const user_id=req?.user?.user_id;
    const query1="SELECT first_name,last_name,user_name,gender,is_active,is_public,created_at,updated_at FROM users WHERE user_id=$1";
    const query1_values=[user_id];
    const result1=await pool.query(query1,query1_values);
    if (result1.rowCount===0){
        return res.status(404).json({message:"User not found"});
    }
    const query2="SELECT COUNT(*) FROM outfits WHERE user_id=$1"
    const result2=await pool.query(query2,[user_id]);

    const query3="SELECT COUNT(*) FROM outfit_categories WHERE user_id=$1"
    const result3=await pool.query(query3,[user_id]);
    
    return res.status(200).json({
        profile:result1.rows[0],
        totalOutfits:result2.rows[0],
        totalDresses:result3.rows[0]
    });
}