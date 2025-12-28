import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import videoRoutes from "./routes/video.routes.js";

connectDB();

const app = express();

app.use(cors({
  origin: "*",
}));

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

// Health check (VERY IMPORTANT for Render)
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
