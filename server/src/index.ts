import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db";
import contactRoutes from "./routes/contact";
import jobSitesRoutes from "./routes/jobSites";
import jobSearchRoutes from "./routes/jobSearch";
import googleJobsRoutes from "./routes/googleJobs";
import personalizedJobsRoutes from "./routes/personalizedJobs";

// Load environment variables from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Connect to MongoDB (optional)
connectDB().then((connected) => {
  if (connected) {
    console.log('🎯 Server running with database connection');
  } else {
    console.log('🎯 Server running without database (limited functionality)');
  }
}).catch(console.error);

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/jobs", googleJobsRoutes); // Use Google search instead of complex scraping
app.use("/api/jobs", personalizedJobsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/job-sites", jobSitesRoutes);
app.use("/api/job-search", jobSearchRoutes);
app.use("/api/google-jobs", googleJobsRoutes); // Alternative endpoint

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "JobPilot Google Search Server is running",
    features: [
      "Google-powered job search",
      "Reliable job discovery", 
      "Multiple job site integration",
      "Clean and simple results",
      "No server crashes"
    ],
    searchType: "google",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 JobPilot Intelligent Server running on port ${PORT}`);
  console.log(`🤖 AI Features: Job matching, recommendations, trend analysis`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});
