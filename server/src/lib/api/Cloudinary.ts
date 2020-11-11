import cloudinary from 'cloudinary';
const { env } = process;

export const Cloudinary = {
  upload: async (image: string) => 
  {
    const res = await cloudinary.v2.uploader.upload(image, {
      api_key: env.CLOUDINARY_KEY,
      api_secret: env.CLOUDINARY_SECRET,
      cloud_name: env.CLOUDINARY_NAME,
      folder: "TH_Assets/",      
    });

    return res.secure_url;
  },
};