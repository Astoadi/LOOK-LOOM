import pool from "../config/db_config.js";

const is_outfit_category_owner=async (req,res,next)=>{
    try{
        const {outfit_category_id}=req?.params;
        if(!outfit_category_id){
            return res.status(400).json({message:"all fields are required"});
        }
        const query="SELECT * FROM outfit_categories WHERE outfit_category_id=$1 AND user_id=$2";
        const query_values=[outfit_category_id,req?.user?.user_id];
        const response=await pool.query(query,query_values);
        if(response.rowCount===0){
            return res.json({message:"Unauthorized : no outfit category found for this outfit"});
        }
        next();
    }catch(e){
        console.log(e);
        return res.status(500).json({message:"some problem occured"});
    }
}
export default is_outfit_category_owner;