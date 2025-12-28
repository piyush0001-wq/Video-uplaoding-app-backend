import express from "express";
import Video from "../models/Video.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { uploadVideo,streamVideo } from "../controller/videoController.js";
import { gfsBucket } from "../config/db.js";
import mongoose from "mongoose";
import adminOnly from "../middleware/adminOnly.js";


const router = express.Router();

router.get("/stream/:id", (req, res, next) => {
  if (req.query.token && req.query.token !== "null" && req.query.token !== "undefined") {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
}, auth, streamVideo);



router.post("/upload", auth, upload.single("video"), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded. Please ensure the form-data key is 'video'." });
  }
  next();
}, uploadVideo);



// GET /api/videos
router.get("/", auth, async (req, res) => {
  try {
    // Optional: Only return videos for this user
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // 1️⃣ Delete file from GridFS
    if (video.fileId) {
      await gfsBucket.delete(new mongoose.Types.ObjectId(video.fileId));
    }

    // 2️⃣ Delete video document
    await Video.findByIdAndDelete(id);

    res.json({ message: "Video deleted successfully" });

  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ message: "Failed to delete video" });
  }
});

export default router;
