import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import jobRoutes from "./routes/jobs";
import contactRoutes from "./routes/contact";
import jobSitesRoutes from "./routes/jobSites";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/job-sites", jobSitesRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "JobPilot Intelligent Server is running",
    features: [
      "AI-powered job matching",
      "Intelligent keyword optimization", 
      "Personalized recommendations",
      "Market trend analysis",
      "MCP (Model Context Protocol) integration"
    ],
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 JobPilot Intelligent Server running on port ${PORT}`);
  console.log(`🤖 AI Features: Job matching, recommendations, trend analysis`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log(`📡 MCP Server: Starting intelligent capabilities...`);
});
