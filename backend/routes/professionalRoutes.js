import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [professionals] = await db.execute(
      `SELECT id, name, email, created_at
       FROM users
       WHERE role = 'professional'
       ORDER BY created_at DESC`,
    );

    res.json(professionals);
  } catch (error) {
    console.error("Get Professionals Error:", error);

    res.status(500).json({
      message: "Unable to fetch professionals",
    });
  }
});

export default router;
