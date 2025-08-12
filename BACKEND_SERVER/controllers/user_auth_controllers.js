import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from "../config/db_config.js";

//check whether logged or not

export const is_logged_in=async (req,res)=>{
    let data=req?.user;
    return res.status(200).json({status:true,message:"Active",data});
}

//register user controller
export const register=async (req,res)=>{
    //taking these parameters from the client side
    let {first_name,last_name,user_name,gender,password}=req.body;
    //if any field is empty return the request
    if(!first_name||!last_name||!user_name||!gender||!password){
        return res.status(400).json({message:"All inputs fields are required"})
    }
    //checking if this user_name already exists
    //query to check already_existing_user_name
    const check_existing_user_name_query="SELECT * FROM users WHERE user_name=$1";

    const query_values=[user_name];

    const already_existing_user_name=await pool.query(check_existing_user_name_query,query_values);

    if(already_existing_user_name.rowCount>0){
        return res.status(400).json({message:"User_name already exists in the database"});
    }
    //generating a hashed password 
    const hashed_password=await bcrypt.hash(password,10);
    
    //query for registering user to db
    const register_query="INSERT INTO users (first_name,last_name,user_name,gender,password) VALUES($1,$2,$3,$4,$5)";
    
    const register_query_values=[first_name,last_name,user_name,gender,hashed_password];

    const response=await pool.query(register_query,register_query_values);

    if(response.rowCount>0) return res.status(201).json({message:'User successfully registered'});
    else res.json({message:'Some unknown error occured during registering user'});

}

//user login controller
export const login=async(req,res)=>{
    const {user_name,password}=req.body;
    //returning request if any fields are empty
    if(!user_name || !password){
        return res.status(400).json({message:"All fields are required"});
    }
    //query to check if this user exists or not
    const if_user_name_exists_query="SELECT * FROM users WHERE user_name=$1";
    //query values
    const if_user_name_exists_query_vlaue=[user_name];
    const response=await pool.query(if_user_name_exists_query,if_user_name_exists_query_vlaue);
    if(response.rowCount===0){
        return res.json({message:"Username not found"});
    }
    const db_hashed_password=response.rows[0]["password"];
    //checking if the password is right or not
    let is_password_correct=await bcrypt.compare(password,db_hashed_password);
    
    if(!is_password_correct){
        return res.status(401).json({message:"Invalid username or password"});
    }

    const auth_token=await jwt.sign({ data:response.rows[0]["user_id"] },process.env.JWT_SECRET,{ expiresIn: '12h' });

    res.cookie('auth_token',auth_token,{
        maxAge:12*60*60*1000,
        httpOnly:true,
        secure: Number(process.env.IN_PROD)===0?false:true,//making it false for testing in localhost but make it true for production
        sameSite: Number(process.env.IN_PROD)===0?"Lax":"None",//for production make it none but for now make it lax for testing
    });
    res.json({auth_token,message:"login successfull"});
}

export const logout=async (req,res)=>{
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: Number(process.env.IN_PROD)===0?false:true,//change here too
        sameSite: Number(process.env.IN_PROD)===0?"Lax":"None"
    });
    
    res.json({ message: "Logout successful" });
}