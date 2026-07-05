import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

const isProd = process.env.NODE_ENV === 'production';
dotenv.config({ path: isProd ? '.env' : '.env.dev' });

const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || '';
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || '';

if (!cloudinaryApiKey || !cloudinaryCloudName || !cloudinaryApiSecret) {
  throw new InternalServerErrorException(
    'Thiếu CLOUDINARY_API_KEY hoặc CLOUDINARY_CLOUD_NAME hoặc CLOUDINARY_API_SECRET',
  );
}

const cloudinaryConfig = cloudinary.config({
  secure: true,
  api_key: cloudinaryApiKey,
  cloud_name: cloudinaryCloudName,
  api_secret: cloudinaryApiSecret,
});

export default registerAs('cloudinary', () => cloudinaryConfig as typeof cloudinary);
