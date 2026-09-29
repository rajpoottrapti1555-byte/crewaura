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

/* =========================================================
   AUTH
========================================================= */

app.use("/api/auth", authRoutes);

/* =========================================================
   EVENTS
========================================================= */

app.use("/api/events", eventRoutes);

/* =========================================================
   ADMIN
========================================================= */

app.use("/api/admin", adminRoutes);

/* =========================================================
   ORGANIZERS
========================================================= */

app.use("/api/organizers", OrganizerRoutes);

/* =========================================================
   PROFESSIONALS
========================================================= */

app.use("/api/professionals", professionalRoutes);

/* =========================================================
   CONNECTIONS
========================================================= */

app.use("/api/connections", connectionRoutes);

/* =========================================================
   MESSAGES
========================================================= */

app.use("/api/messages", messageRoutes);

/* =========================================================
   HOME
========================================================= */

app.get("/", (req, res) => {
  res.send("EventSaathi Backend is Running");
});

/* =========================================================
   SERVER
========================================================= */

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}`
  );
});