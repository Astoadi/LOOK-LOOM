import jwt  from "jsonwebtoken";
import pool from "../config/db_config.js";

const authenticate_user=async (req,res,next)=>{
    try{
        const {auth_token}=req.cookies;
        if(!auth_token){
            return res.status(401).json({status:false,message:'Unauthorized: No token provided'});
        }
        const decoded_user_data=jwt.verify(auth_token,process.env.JWT_SECRET);
        //setting this up in req for later use
        let user_id=decoded_user_data?.data;

        //verifying user int db
        //query to check if this user exists for decoded_user_data
        const find_user_query="SELECT * FROM users WHERE user_id=$1";
        const find_user_query_value=[decoded_user_data.data];
        const response=await pool.query(find_user_query,find_user_query_value);

        if(response.rowCount===0){
            return res.status(404).json({status:false,message:'user not found for token'});
        }
        let user_name=response.rows[0]["user_name"];
        req.user={ user_id,user_name }
        next();
    }catch(e){
        console.log(e)
        return res.status(401).json({status:false, message: 'Unauthorized: Invalid or expired token' });
    }
}

export default authenticate_user;