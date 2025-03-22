import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
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
    origin: "http://localhost:5173", // Allow your frontend to access
    credentials: true, // Allow cookies to be sent with requests
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

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
