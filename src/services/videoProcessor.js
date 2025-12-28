import Video from "../models/Video.js";
import analyze from "./sensitivityAnalyzer.js";
import { io } from "../server.js";

export default async function processVideo(videoId) {
  const video = await Video.findById(videoId);
  video.status = "processing";
  await video.save();

  for (let i = 10; i <= 100; i += 10) {
    await new Promise(r => setTimeout(r, 500));
    video.progress = i;
    await video.save();
    io.emit(`progress-${videoId}`, i);
  }

  video.status = analyze() ? "flagged" : "safe";
  await video.save();
}
