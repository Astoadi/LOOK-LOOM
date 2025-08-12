import { deleteOutfitImage } from "../config/cloud_config.js";
import pool from "../config/db_config.js";

//create outfit
export const create_outfit=async (req,res)=>{
    //taking all the required fields
    const body=req.body?.body;
    const image_url=req.file?.path;
    const image_public_key=req.file?.filename;//media;
    const image_file_type=req.file?.mimetype.split('/')[1];
    const user_id=req?.user?.user_id;
    //query for saving the outfit to db

    if(!body || !req.file){
        return res.json({message:"All fields are required"});
    }
    
    const outfit_saving_query="INSERT INTO outfits (image_url, image_public_key, image_file_type, user_id, body )VALUES($1,$2,$3,$4,$5)";

    //values for outfit_saving_query
    const outfit_saving_query_values=[image_url,image_public_key,image_file_type,user_id,body];
    const response=await pool.query(outfit_saving_query,outfit_saving_query_values);

    if(response.rowCount>0) return res.status(201).json({message:'Outfit created successfully'});
    else res.json({message:'Some unknown error occured during creating outfit'});
    //res.json({body,image_url,image_file_type,image_public_key,user_id});
}

//get outfit for user
export const get_outfit=async(req,res)=>{
    const user_id=req?.user?.user_id;
    //query for getting outfits by user_id
    const get_outfits_query="SELECT * FROM outfits WHERE user_id=$1";
    const get_all_outfits_query_values=[user_id];

    const response=await pool.query(get_outfits_query,get_all_outfits_query_values);

    if(response.rowCount===0){
        return res.status(404).json({message:"No outfit created yet"});
    }
    return res.status(200).json({outfits:response.rows});
}


//get individual outfit
export const get_outfit_by_id=async(req,res)=>{
    const {outfit_id}=req.params;
    //query for getting particular id
    const outfit_by_id_query="SELECT * FROM outfits WHERE outfit_id=$1 AND user_id=$2";
    const outfit_by_id_query_values=[outfit_id,req.user?.user_id];

    const response=await pool.query(outfit_by_id_query,outfit_by_id_query_values);
    
    if(response.rowCount===0){
        return res.status(404).json({message:"Outfit not found"});
    }
    return res.status(200).json({outfit:response.rows[0]});
}

//search outfit
export const get_outfit_by_body_name=async (req,res)=>{
    const {body}=req.query;
    const user_id=req?.user?.user_id;
    if(!body){
        return res.status(400).json({message:"All Fields are required"});
    }
    //getting outfit by body name
    const name=`%${body}%`;
    const query="SELECT * FROM outfits WHERE user_id = $1 AND body ILIKE $2";
    const query_values=[user_id,name];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(404).json({message:"No matching outfit"});
    }
    return res.status(200).json({outfits:response.rows});
}

//update outfit
//image
export const update_outfit_image=async (req,res)=>{
    const user_id=req?.user?.user_id;
    const {outfit_id}=req.body;

    if(!req.file || !outfit_id){
        return res.status(400).json({message:"Outfit image not provided"});
    }
    const image_url=req.file?.path;
    const image_public_key=req.file?.filename;//media;
    const image_file_type=req.file?.mimetype.split('/')[1];
    //query to get the outfit by its id
    const query1="SELECT * FROM outfits WHERE outfit_id=$1 AND user_id=$2";
    const query1_values=[outfit_id,user_id];
    const response1=await pool.query(query1,query1_values);
    if(response1.rowCount===0){
        return res.status(404).json({message:"Outfit not found"});
    }
    //deleting old image from cloudinary
    let oldPublicId=response1.rows[0]?.image_public_key;
    await deleteOutfitImage(oldPublicId);
    //updating new image in db
    const query2="UPDATE outfits SET image_url=$1, image_public_key=$2, image_file_type=$3,updated_at=CURRENT_DATE WHERE user_id=$4 AND outfit_id=$5";
    const query2_values=[image_url,image_public_key,image_file_type,user_id,outfit_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount>0){
        return res.json({message:"Outfit image updated"});
    }else{
        return res.status(500).json({message:"Problem occured while updating image"});
    }
}

//update outfit
//body
export const update_outfit_body=async (req,res)=>{
    const {outfit_id,body}=req.body;
    if(!outfit_id || !body){
        return res.status(400).json({message:"All Fields are required"});
    }
    const user_id=req?.user?.user_id;
    //query to update outfit body
    const query="UPDATE outfits SET body=$1, updated_at=CURRENT_DATE WHERE outfit_id=$2 AND user_id=$3";
    const query_values=[body,outfit_id,user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount>0){
        return res.json({message:"Outfit body updated"});
    }else{
        return res.status(500).json({message:"Not updated"});
    }   
}


//delete outfit
export const delete_outfit=async (req,res)=>{
    const {outfit_id}=req.params;
    if(!outfit_id){
        return res.status(404).json({message:"All fields are required"});
    }
    const user_id=req?.user?.user_id;
    //getting outfit to delete image from cloud
    const query1="SELECT * FROM outfits WHERE outfit_id=$1 AND user_id=$2";
    const query1_values=[outfit_id,user_id];
    const response1=await pool.query(query1,query1_values);
    if(response1.rowCount===0){
        return res.status(404).json({message:"Outfit not found"});
    }
    let oldPublicId=response1.rows[0]?.image_public_key;
    await deleteOutfitImage(oldPublicId);
    //query to delete outfit
    const query2="DELETE FROM outfits WHERE outfit_id=$1 AND user_id=$2";
    const query2_values=[outfit_id,user_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount>0){
        return res.status(200).json({message:"Outfit deleted"});
    }else{
        return res.status(500).json({message:"Outfit not deleted"});
    }
}

//ADD OR REMOVE FAVORITE

export const change_favorite_status=async (req,res)=>{
    const {is_fav_status,outfit_id}=req.body;
    const user_id=req?.user?.user_id;
    const is_status_present='is_fav_status' in req.body;
    if(!is_status_present || !outfit_id){
        return res.status(400).json({message:"Provide a valid status or outfit id"});
    }
    //query to set is_fav_status
    const query="UPDATE outfits SET is_favorite=$1 WHERE outfit_id=$2 AND user_id=$3";
    const query_values=[is_fav_status,outfit_id,user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount>0){
        return res.status(200).json({message:"Is favorite status changed"});
    }else{
        return res.status(500).json({message:"Status not changed"});
    }
} 

//CHANGE IS ACTIVE STATUS i.e. mark for cleaning
export const change_is_active_status=async (req,res)=>{
    const {is_active_status,outfit_id}=req.body;
    const user_id=req?.user?.user_id;
    const is_status_present='is_active_status' in req.body;
    if(!is_status_present || !outfit_id){
        return res.status(400).json({message:"Provide a valid status"});
    }
    //query to set is_active_status
    const query="UPDATE outfits SET is_active=$1 WHERE outfit_id=$2 AND user_id=$3";
    const query_values=[is_active_status,outfit_id,user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount>0){
        return res.status(200).json({message:"Is active status changed"});
    }else{
        return res.status(500).json({message:"Status not changed"});
    }
}

//get favorite outfits
export const get_favorite_outfits=async (req,res)=>{
    const user_id=req?.user?.user_id;
    //query to get favorite outfits
    const query="SELECT * FROM outfits WHERE user_id=$1 AND is_favorite=TRUE";
    const query_values=[user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(404).json({message:"No outfits found"});
    }
    return res.status(200).json({favorite_outfits:response.rows});
}