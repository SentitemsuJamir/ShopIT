import cloudinary from "cloudinary"
import dotenv from 'dotenv'

dotenv.config({path: 'backend/config/config.env'})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


export const upload_file= (file,folder)=>{
    return new Promise((reslove, reject)=>{
    cloudinary.uploader.upload(
        file, 
        (result)=>{
            reslove({
                public_id: result.public_id,
                url: result.url,
            });
        },
        {
            resource_type: "auto",
            folder,
        }
        );
    });
};

export const delete_file = (public_id) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.destroy(public_id, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.result === "ok") {
                    resolve(true);
                } else {
                    reject(new Error(`Failed to delete file: ${result.result}`));
                }
            }
        });
    });
};
