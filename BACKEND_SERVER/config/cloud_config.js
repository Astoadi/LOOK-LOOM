import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v4 as uuidv4 } from 'uuid';

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:async (req,file)=> ({
      folder: 'look_loom_outfits',
      allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'heic', 'avif'], // supports promises as well
      public_id:uuidv4(),
    }),
});

const deleteOutfitImage=async (public_id)=>{
    try{
        const result= await cloudinary.uploader.destroy(public_id);
        return result;
    }catch(e){
        console.log(e);
        throw e;
    }
}

export { storage , deleteOutfitImage };