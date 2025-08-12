import pool from "../config/db_config.js";

//creating category
export const create_category=async(req,res)=>{
    const {category_name,outfits_ids}=req.body; //outfits_ids should be an array
    //check if the category name is empty if empty then return
    if(!category_name){
        return res.status(400).json({message:"Category name not provided"});
    }
    //check wheather outfits_id is array or not
    if(!Array.isArray(outfits_ids)){
        return res.status(400).json({message:"Outfits not an array"});
    }
    //check if the length of the outfit_ids array is zero or not
    if(outfits_ids.length===0){
        return res.status(400).json({message:"Outfits not provided"});
    }

    const user_id=req?.user?.user_id;
    //check the ownership of the outfit_ids
    const query1="SELECT outfit_id FROM outfits WHERE outfit_id = ANY($1::BIGINT[]) AND user_id = $2";
    const query1_values=[outfits_ids, user_id];
    const response1=await pool.query(query1,query1_values);
    //check if all outfits match or not
    if(response1.rowCount!==outfits_ids.length){
        return res.status(401).json({message:"Some outfits are not owned by you"});
    }
    //checking if the outfit category already exists or not
    const result=await pool.query('SELECT * FROM outfit_categories WHERE user_id=$1 AND category_name ILIKE $2',[user_id,category_name]);
    if(result.rowCount>0){
        return res.status(400).json({message:"Category name already exists"});
    }
    //make category by using name and user_id
    //query to make outfit categories
    //get category id from query
    const query2="INSERT INTO outfit_categories (category_name, user_id ) VALUES ($1,$2) RETURNING outfit_category_id";
    const query2_values=[category_name,user_id];
    const response2=await pool.query(query2,query2_values);

    if(response2.rowCount===0){
        return res.status(500).json({message:"Outfit category not created"});
    }
    let new_category_id=response2.rows[0]["outfit_category_id"];
    //insert into outfit_category_combo with help of loop
    //query for inserting outfits into outfit_category_combo
    const query3="INSERT INTO outfit_category_combo (outfit_category_id, outfit_id) VALUES ($1,$2)"
    for(const outfits_id of outfits_ids){
        await pool.query(query3,[new_category_id,outfits_id]);   
    }

    return res.status(200).json({message:"Dress Created Successfylly"});
}

//get all user category
export const get_user_categories=async (req,res)=>{
    const user_id=req?.user?.user_id
    //query to get all user categories=
    const query="SELECT * FROM outfit_categories WHERE user_id=$1";
    const query_values=[user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(404).json({message:"No category found Please Create one"});
    }
    return res.status(200).json({categories:response.rows});
}

//get favorite categories
export const get_favorite_user_categories=async (req,res)=>{
    const user_id=req?.user?.user_id
    //query to get all user categories=
    const query="SELECT * FROM outfit_categories WHERE user_id=$1 AND is_favorite=TRUE";
    const query_values=[user_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(404).json({message:"No dress found Please Create one"});
    }
    return res.status(200).json({categories:response.rows});
}

//add or remove category in favorite 
export const change_favorite_status=async (req,res)=>{
    const {is_fav_status,outfit_category_id}=req.body;
    //checking if all fields are provided or 
    const is_status_present='is_fav_status' in req.body;
    if(!is_status_present || !outfit_category_id){
        return res.status(400).json({message:"All Fields are required"});
    }
    const user_id=req?.user?.user_id;
    //query to change fav status
    const query="UPDATE outfit_categories SET is_favorite=$1 WHERE user_id=$2 AND outfit_category_id=$3";
    const query_values=[is_fav_status,user_id,outfit_category_id];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.status(400).json("Unmatched outfits category id status not updated");
    }
    return res.status(200).json({message:"Status Changed"});
}

//get particular user category

export const get_outfits_for_particular_category=async (req,res)=>{
    const {outfit_category_id}=req.params;
    if(!outfit_category_id){
        return res.status(400).json({message:"All fields are required"});
    }
    const user_id=req?.user?.user_id;
    //query 
    const query="SELECT o.outfit_id,o.image_url,o.user_id,o.body,o.is_active,o.is_favorite,o.created_at,o.updated_at,oc.category_name FROM outfits AS o JOIN outfit_category_combo AS occ ON o.outfit_id = occ.outfit_id JOIN outfit_categories AS oc ON occ.outfit_category_id = oc.outfit_category_id WHERE occ.outfit_category_id = $1 AND o.user_id = $2";

    const query_values=[outfit_category_id,user_id];

    const response=await pool.query(query,query_values);

    if(response.rowCount===0){
        return res.status(404).json({message:"No outfits found"});
    }
    return res.status(200).json({outfits:response.rows});
}

//edit category name
export const edit_outfit_category_name=async (req,res)=>{
    const {category_name,outfit_category_id}=req.body;
    if(!category_name || !outfit_category_id){
        return res.status(400).json({message:"All Fields are required"});
    }
    const user_id=req?.user?.user_id;
    //checking if the outfit_Category exists or not
    //query to check this
    const query1="SELECT 1 FROM outfit_categories WHERE outfit_category_id=$1 AND user_id=$2";
    const query1_values=[outfit_category_id,user_id];
    const result1=await pool.query(query1,query1_values);
    if(result1.rowCount===0){
        return res.status(404).json({message:"Request outfit category doesn't exist"});
    }
    //updating the name of the outfit category
    const query2="UPDATE outfit_categories SET category_name=$1,updated_at=CURRENT_DATE WHERE outfit_category_id=$2 AND user_id=$3";
    const query2_values=[category_name,outfit_category_id,user_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount===0){
        return res.status(500).json({message:"Something went wrong"});
    }
    return res.status(200).json({message:"Outfit category name changed"});
}

//delete category
export const delete_outfit_category=async(req,res)=>{
    const {outfit_category_id}=req.params;
    if(!outfit_category_id){
        return res.status(400).json({message:"All Fields are required"});
    }
    const user_id=req?.user?.user_id;
    //checking if this outfit category exists or not
    const query1="SELECT 1 FROM outfit_categories WHERE outfit_category_id=$1 AND user_id=$2";
    const query1_values=[outfit_category_id,user_id];
    const response=await pool.query(query1,query1_values);
    if(response.rowCount===0){
        return res.status(404).json({message:"Outfit category not found"});
    }
    //deleting outfit category
    const query2="DELETE FROM outfit_categories WHERE outfit_category_id=$1 AND user_id=$2";
    const query2_values=[outfit_category_id,user_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount===0){
        return res.status(500).json({message:"Something went wrong"});
    }
    return res.status(200).json({message:"Outfit category deleted successfully"});
}