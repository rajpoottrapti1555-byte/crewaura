import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [organizers] = await db.execute(
      `SELECT id, name, email, created_at
       FROM users
       WHERE role = 'organizer'
       ORDER BY created_at DESC`,
    );

    res.json(organizers);
  } catch (error) {
    console.error("Get Organizers Error:", error);

    res.status(500).json({
      message: "Unable to fetch organizers",
    });
  }
});

export default router;
