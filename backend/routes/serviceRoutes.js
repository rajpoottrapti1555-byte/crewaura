import express from "express";
import db from "../db.js";

const router = express.Router();

// GET ALL SERVICES
router.get("/", async (req, res) => {
  try {
    const [services] = await db.execute(
      `SELECT id, service_name
       FROM service_categories
       ORDER BY service_name ASC`,
    );

    res.json(services);
  } catch (error) {
    console.error("Get Services Error:", error);

    res.status(500).json({
      message: "Unable to fetch services",
    });
  }
});

export default router;
