import { createSlice } from "@reduxjs/toolkit"
import { change_favorite_status, create_category, delete_dress, edit_dress_name, get_dress_outfits, get_favorite_user_categories, get_user_dress } from "../../actions/dress"

const initialState={
    isSuccess:false,
    isPending:false,
    isError:false,
    message:"",
    user_dress:[],
    favorite_dress:[],
    dress_outfits:[]
}

const dress=createSlice({
    name:"dress",
    initialState,
    reducers:{
        emptyMessage:(state,_)=>{
            state.message=""
        }
    },
    extraReducers:((builder)=>{
        builder//getting user dresses
        .addCase(get_user_dress.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.user_dress=action.payload?.categories;
        })
        .addCase(get_user_dress.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(get_user_dress.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload?.message;
        })//get outfits for particular dress
        .addCase(get_dress_outfits.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(get_dress_outfits.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload?.message;
        })
        .addCase(get_dress_outfits.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload?.message;
            state.dress_outfits=action.payload?.outfits;
        })//getting favorites dresses
        .addCase(get_favorite_user_categories.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(get_favorite_user_categories.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload?.message;
            state.favorite_dress=action.payload?.categories;
        })
        .addCase(get_favorite_user_categories.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload?.message;
        })//changing the favorite status
        .addCase(change_favorite_status.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(change_favorite_status.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload?.message;
        })
        .addCase(change_favorite_status.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload?.message;
        })//creating dress
        .addCase(create_category.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(create_category.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload?.message;
        })
        .addCase(create_category.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload?.message;
        })//edit_dress_name
        .addCase(edit_dress_name.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(edit_dress_name.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload?.message;
        })
        .addCase(edit_dress_name.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload?.message;
        })//delete dress
        .addCase(delete_dress.pending,(state,_)=>{
            state.isPending=true;
        })
        .addCase(delete_dress.fulfilled,(state,action)=>{
            state.isSuccess=true;
            state.isPending=false;
            state.isError=false;
            state.message=action.payload?.message;
        })
        .addCase(delete_dress.rejected,(state,action)=>{
            state.isSuccess=false;
            state.isPending=false;
            state.isError=true;
            state.message=action.payload?.message;
        })
    })
})

export const {emptyMessage}=dress.actions;
export default dress.reducer;