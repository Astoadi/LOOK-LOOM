export default function async_func(input_func){
    return async (req,res,next)=>{
            try{
                await input_func(req,res,next)
            }catch(err){
                console.log(err);
                next(err);
            }
        }
}