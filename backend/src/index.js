import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import notificationRoutes from "./routes/notification.route.js";
import statusRoutes from "./routes/status.route.js";
import chatRequestRoutes from "./routes/chatRequest.route.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import bodyParser from "body-parser";
import cors from "cors";
import { app, server } from "../src/lib/socket.js";
import path from "path";
dotenv.config();

const PORT = process.env.PORT;

const __dirname = path.resolve();

// Middleware to increase the size limit for JSON and URL-encoded requests
app.use(bodyParser.json({ limit: "10mb" })); // Set the JSON size limit to 10MB
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true })); // Set the URL-encoded size limit to 10MB

app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow localhost and any IP on typical dev ports
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.match(/^https?:\/\/\d+\.\d+\.\d+\.\d+/) ||
        origin.includes("5173")
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/chat-requests", chatRequestRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server is Running on  : " + PORT);
  connectDB();
});
