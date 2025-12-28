import { GridFsStorage } from "multer-gridfs-storage";
import multer from "multer";

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    if (!file.mimetype.startsWith("video/")) {
      return null;
    }
    return {
      filename: file.originalname,
      bucketName: "videos"
    };
  }
});

export const upload = multer({ storage });
