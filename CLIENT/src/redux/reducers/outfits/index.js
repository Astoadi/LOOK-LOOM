import { createSlice } from "@reduxjs/toolkit"
import { change_favorite_status, change_is_active_status, create_outfit, delete_outfit, get_favorite_outfits, get_outfit, get_outfit_by_body_name, get_outfit_by_id, update_outfit_body, update_outfit_image } from "../../actions/outfits"

const initialState={
    outfit:{},
    isSuccess:false,
    isPending:false,
    isError:false,
    message:"",
    user_outfits:[],
    favorite_outfits:[]
}

const outfit=createSlice({
    name:"outfit",
    initialState,
    reducers:{
        emptyMessage:(state,_)=>{
            state.message=""
        }
    },
    extraReducers:((builder)=>{
        builder//all user outfits
        .addCase(get_outfit.fulfilled,(state,action)=>{
            state.user_outfits=action.payload?.outfits;
            state.isPending=false;
            state.isSuccess=true;
        })
        .addCase(get_outfit.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(get_outfit.rejected,(state,action)=>{
            state.message=action.payload?.message;
            state.isError=true;
            state.isSuccess=false;
            state.isPending=false;
        })//all favorite user outfits
        .addCase(get_favorite_outfits.fulfilled,(state,action)=>{
            state.favorite_outfits=action.payload?.favorite_outfits;
            state.isError=false;
            state.isPending=false;
            state.isSuccess=true;
        })
        .addCase(get_favorite_outfits.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(get_favorite_outfits.rejected,(state,action)=>{
            state.isError=true;
            state.isPending=false;
            state.isSuccess=false;
            state.message=action.payload?.message;
        })//searching the outfit
        .addCase(get_outfit_by_body_name.fulfilled,(state,_)=>{
            state.isError=false;
            state.isSuccess=true;
            state.isPending=false;
        })//making an outfit
        .addCase(create_outfit.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload.message;
        })
        .addCase(create_outfit.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(create_outfit.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload.message;
        })//changing the favorite status
        .addCase(change_favorite_status.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(change_favorite_status.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload.message;
        })
        .addCase(change_favorite_status.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload.message;
        })//deleting the outfit
        .addCase(delete_outfit.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(delete_outfit.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload.message;
        })
        .addCase(delete_outfit.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload.message;
        })//getting particular outfit
        .addCase(get_outfit_by_id.pending,(state,_)=>{
            state.isPending=false;
        })
        .addCase(get_outfit_by_id.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload?.message;
            state.outfit=action.payload?.outfit;
        })
        .addCase(get_outfit_by_id.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload.message;
        })//updating outfit image
        .addCase(update_outfit_image.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(update_outfit_image.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload.message;
        })
        .addCase(update_outfit_image.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload.message;
        })//updating the body of the outfit
        .addCase(update_outfit_body.pending,(state,_)=>{
            state.isPending=false;
        })
        .addCase(update_outfit_body.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload.message;
        })
        .addCase(update_outfit_body.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload.message;
        })//changing the like status 
        .addCase(change_is_active_status.pending,(state,_)=>{
            state.isPending=false;
        })
        .addCase(change_is_active_status.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload.message;
        })
        .addCase(change_is_active_status.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload.message;
        })
    })
})

export const {emptyMessage}=outfit.actions;
export default outfit.reducer;