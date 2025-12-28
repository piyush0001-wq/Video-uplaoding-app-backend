import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === "video/mp4" || ext === ".mp4") cb(null, true);
    else cb(new Error("Only MP4 videos allowed, getting " + file.mimetype));
  }
});

export default upload;
