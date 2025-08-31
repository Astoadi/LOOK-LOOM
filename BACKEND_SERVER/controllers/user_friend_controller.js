import pool from "../config/db_config.js";

export const addFriend=async (req,res)=>{
    //validate the input
    //user-id self , connection-id friend
    const {connection_id}=req.body || {};
    if(!connection_id || typeof connection_id !== "number" ){
        return res.status(400).json({message:"Wrong input body"});
    }
    const user_id=req?.user?.user_id;
    //check first wheather this request already exists or not if yes return
    const query1="SELECT user_id FROM connections WHERE connection_id=$1 AND user_id=$2";
    const query1_values=[connection_id,user_id];
    const response1=await pool.query(query1,query1_values);
    if (response1.rowCount>0){
        return res.status(400).json({message:"Request Already Sent"});
    }
    //make a entry in db 
    const query2="INSERT INTO connections (user_id,connection_id) VALUES ($1,$2)";
    const query2_values=[user_id,connection_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount>0) return res.status(201).json({message:'Request Sent'});
    else res.json({message:'Request Not Sent Try Again'});

}
//accepting the request
export const AcceptRequest=async (req,res)=>{
    const {connection_id}=req.body || {};
    if(!connection_id || typeof connection_id !== "number" ){
        return res.status(400).json({message:"Wrong input body"});
    }
    const user_id=req?.user?.user_id;
    //check first wheather this request already exists or not if yes return
    const query1="SELECT user_id FROM connections WHERE connection_id=$1 AND user_id=$2";
    const query1_values=[user_id,connection_id];
    const response1=await pool.query(query1,query1_values);
    if (response1.rowCount===0){
        return res.status(400).json({message:"No matching request found"});
    }
    //update a entry in db 
    const query2="UPDATE connections SET status='A' WHERE connection_id=$1 AND user_id=$2";
    const query2_values=[user_id,connection_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount>0) return res.status(200).json({message:'Request Accepted'});
    else res.json({message:'Request Not Sent Try Again'});
}

//reject request
export const RejectRequest=async (req,res)=>{
    const {connection_id}=req.params || {};
    if(!connection_id){
        return res.status(400).json({message:"Wrong input body"});
    }
    const user_id=req?.user?.user_id;
    //check first wheather this request already exists or not if yes return
    const query1="SELECT user_id FROM connections WHERE connection_id=$1 AND user_id=$2";
    const query1_values=[user_id,connection_id];
    const response1=await pool.query(query1,query1_values);
    if (response1.rowCount===0){
        return res.status(400).json({message:"No matching request found"});
    }
    //update a entry in db 
    const query2="DELETE FROM connections WHERE connection_id=$1 AND user_id=$2";
    const query2_values=[user_id,connection_id];
    const response2=await pool.query(query2,query2_values);
    if(response2.rowCount>0) return res.status(204).json({message:'Removed'});
    else res.json({message:'Request Not Sent Try Again'});
}

//get my following list

export const GetFollowing=async (req,res)=>{
    const user_id=req?.user?.user_id;
    const query1="SELECT u.user_id, u.user_name, u.gender FROM connections c INNER JOIN users u ON u.user_id = c.connection_id WHERE c.user_id = $1 AND c.status = 'A'";
    const query1_values=[user_id];
    const response1=await pool.query(query1,query1_values);
    if (response1.rowCount===0){
        return res.status(404).json({message:"No following",following:[]});
    }
    if(response1.rowCount>0){
        return res.status(200).json({message:"Following List",following:response1.rows});
    }

    return res.status(500).json({message:"Internal Server error"});
}

//get people that follows you
export const getFollowers=async(req,res)=>{
    const user_id=req?.user?.user_id;
    const query1="SELECT u.user_id, u.user_name, u.gender FROM connections c INNER JOIN users u ON u.user_id = c.user_id WHERE c.connection_id = $1 AND c.status = 'A'";
    const query1_values=[user_id];
    const response1=await pool.query(query1,query1_values);
    if (response1.rowCount===0){
        return res.status(404).json({message:"No following",followers:[]});
    }
    if(response1.rowCount>0){
        return res.status(200).json({message:"Following List",followers:response1.rows});
    }
    return res.status(500).json({message:"Internal Server error"});
}

//get my incoming requests
export const GetMyIncomingRequests=async (req,res)=>{
    const user_id=req?.user?.user_id;
    const query1="SELECT u.user_id, u.user_name, u.gender FROM users u INNER JOIN connections c ON u.user_id = c.user_id WHERE c.connection_id = $1 AND c.status = 'P'";
    const query1_values=[user_id];
    const response1=await pool.query(query1,query1_values);
    if (response1.rowCount===0){
        return res.status(404).json({message:"No Request",requests:[]});
    }
    if(response1.rowCount>0){
        return res.status(200).json({message:"Request List",requests:response1.rows});
    }

    return res.status(500).json({message:"Internal Server error"});
}

//GetFriendByUserName
export const GetFriendByUserName=async(req,res)=>{
    const {p_u_n}=req.query;
    const username=`%${p_u_n}%`;
    const query="SELECT user_id,user_name,gender FROM users WHERE user_name ILIKE $1 LIMIT 5";
    const query_values=[username];
    const response=await pool.query(query,query_values);
    return res.json({SearchResults:response.rows});
}

//getting other's profile
export const getFriendorOtherProfile = async (req, res) => {
    const user_id = req?.user?.user_id;
    const pId = Number(req.params.pId);
    if (!pId || isNaN(pId)) {
      return res.status(400).json({ message: "Invalid pId" });
    }
  
    const totalData = {};
  
    // check if user exists
    const response1 = await pool.query(
      "SELECT is_public FROM users WHERE user_id=$1",
      [pId]
    );
    if (response1.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // check privacy
    let isFriend = false;
    if (!response1.rows[0].is_public) {
      const response2 = await pool.query(
        "select 1 from connections where connection_id=$1 and user_id=$2 and status='A'",
        [pId, user_id]
      );
      if (response2.rowCount === 0) {
        return res.status(403).json({ message: "Profile Locked - Follow First" });
      }
      isFriend = true;
    }
    totalData["isFriend"] = isFriend;
  
    // today's outfit
    const response3 = await pool.query(
      "SELECT outfit_category_id FROM outfit_category_history WHERE user_id=$1 AND last_used_at = CURRENT_DATE",
      [pId]
    );
    if (response3.rowCount === 0) {
      totalData["TodayDressName"] = "Not Set";
      totalData["TodayDressId"] = null;
      totalData["TodayDresses"] = [];
    } else {
      const outfit_category_id = response3.rows[0].outfit_category_id;
  
      const response4 = await pool.query(
        "SELECT category_name FROM outfit_categories WHERE user_id=$1 AND outfit_category_id=$2",
        [pId, outfit_category_id]
      );
  
      totalData["TodayDressName"] = response4.rowCount
        ? response4.rows[0].category_name
        : "Not Set";
      totalData["TodayDressId"] = outfit_category_id;
  
      const response5 = await pool.query(
        "SELECT o.outfit_id,o.image_url,o.user_id,o.body,o.is_active,o.is_favorite,o.created_at,o.updated_at,oc.category_name FROM outfits AS o JOIN outfit_category_combo AS occ ON o.outfit_id = occ.outfit_id JOIN outfit_categories AS oc ON occ.outfit_category_id = oc.outfit_category_id WHERE occ.outfit_category_id = $1 AND o.user_id = $2",
        [outfit_category_id, pId]
      );
      totalData["TodayDresses"] = response5.rows;
    }
  
    // profile details
    const result6 = await pool.query(
      "SELECT first_name,last_name,user_name,gender,is_active,is_public,created_at,updated_at FROM users WHERE user_id=$1",
      [pId]
    );
    totalData["ProfileDetails"] = result6.rowCount ? result6.rows[0] : null;
  
    // stats
    const result7 = await pool.query("SELECT COUNT(*) FROM outfits WHERE user_id=$1", [pId]);
    totalData["TotalOutfits"] = parseInt(result7.rows[0].count, 10);
  
    const result8 = await pool.query("SELECT COUNT(*) FROM outfit_categories WHERE user_id=$1", [pId]);
    totalData["TotalDresses"] = parseInt(result8.rows[0].count, 10);
  
    return res.json([totalData]);
  };
  

export const checkPendingStatusOfOtherProfile=async(req,res)=>{
    const {pId}=req.params;
    if(!pId) return res.json({message:"All fields are required"});
    const query="select * from connections where user_id=$1 and connection_id=$2 and status='P';"
    const query_values=[req?.user?.user_id,pId];
    const response=await pool.query(query,query_values);
    if(response.rowCount===0){
        return res.json({status:false});
    }
    return res.json({status:true});
}
