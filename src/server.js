import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import videoRoutes from "./routes/video.routes.js";

/* ================== SETUP ================== */
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

/* ================== API ROUTES ================== */
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

/* ================== STATIC FRONTEND ================== */
// Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve React build (build folder must be inside backend)
app.use(express.static(path.join(__dirname, "build")));

// React fallback (important)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

/* ================== SOCKET ================== */
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "*" },
});

/* ================== START SERVER ================*/

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on ${PORT}`)
);
