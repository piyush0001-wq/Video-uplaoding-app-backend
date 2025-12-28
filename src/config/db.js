import mongoose from "mongoose";
import "dotenv/config";

export let gfsBucket;

export const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  gfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
    bucketName: "videos"
  });
  console.log("MongoDB connected with GridFS");
};
export default connectDB;