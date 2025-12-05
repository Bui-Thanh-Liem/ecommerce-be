import * as fs from 'fs';
import * as multer from 'multer';

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads', { recursive: true });
      }
    } catch (error) {
      console.error('Error creating directory:', error);
    }
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;
    cb(null, uniqueSuffix);
  },
});
