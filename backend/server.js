import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import OrganizerRoutes from "./routes/OrganizerRoutes.js";
import professionalRoutes from "./routes/professionalRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// AUTHENTICATION ROUTES
// ===============================
app.use("/api/auth", authRoutes);

// ===============================
// EVENT ROUTES
// ===============================
app.use("/api/events", eventRoutes);

// ===============================
// ADMIN ROUTES
// ===============================
app.use("/api/admin", adminRoutes);

// ===============================
// ORGANIZER ROUTES
// ===============================
app.use("/api/organizers", OrganizerRoutes);

// ===============================
// PROFESSIONAL ROUTES
// ===============================
app.use("/api/professionals", professionalRoutes);

// ===============================
// CONNECTION ROUTES
// ===============================
app.use("/api/connections", connectionRoutes);

<<<<<<< HEAD
//for message routes
app.use("/api/messages", messageRoutes);

// Home route

=======
// ===============================
// HOME ROUTE
// ===============================
>>>>>>> f55030000c660fad2f2d46c642e67a117f8d662e
app.get("/", (req, res) => {
  res.send("EventSaathi Backend is Running");
});

// ===============================
// SERVER
// ===============================
const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});