import { gfsBucket } from "../config/db.js";
import Video from "../models/Video.js";
import mongoose from "mongoose";

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file received" });
    }

    console.log("Uploading:", req.file.originalname);

    const uploadStream = gfsBucket.openUploadStream(
      req.file.originalname,
      { contentType: req.file.mimetype }
    );

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", async () => {
      console.log("Stored in GridFS:", uploadStream.id);

      const video = await Video.create({
        title: req.file.originalname,
        fileId: uploadStream.id,
        uploadedBy: req.user._id
      });

      res.status(201).json({ message: "Uploaded", video });
    });

    uploadStream.on("error", (err) => {
      console.error("GridFS error:", err);
      res.status(500).json({ error: err.message });
    });

  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: err.message });
  }
};


export const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const fileId = new mongoose.Types.ObjectId(video.fileId);

    // Get file info
    const files = await gfsBucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found in GridFS" });
    }

    const file = files[0];
    const fileSize = file.length;
    const range = req.headers.range;

    if (!range) {
      return res.status(416).send("Requires Range header");
    }

    // Parse Range
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4"
    });

    // Stream video chunk
    gfsBucket
      .openDownloadStream(fileId, { start, end: end + 1 })
      .pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};