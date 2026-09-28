import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import db from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import OrganizerRoutes from "./routes/OrganizerRoutes.js";
import professionalRoutes from "./routes/professionalRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Event routes
app.use("/api/events", eventRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

//organizer routes
app.use("/api/organizers", OrganizerRoutes);

//professional routes
app.use("/api/professionals", professionalRoutes);

//connectionroutes
app.use("/api/connections", connectionRoutes);

// Home route

app.get("/", (req, res) => {
  res.send("EventSaathi Backend is Running");
});

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
