import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // GridFS ID
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "uploaded" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Video", videoSchema);
