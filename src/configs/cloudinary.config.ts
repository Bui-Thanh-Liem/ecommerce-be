import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';

const isProd = process.env.NODE_ENV === 'production';
dotenv.config({ path: isProd ? '.env' : '.env.dev' });

const cloudinaryConfig = cloudinary.config({
  secure: true,
  api_key: process.env.CLOUDINARY_API_KEY,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default registerAs('cloudinary', () => cloudinaryConfig as typeof cloudinary);
