import express from "express";
import db from "../db.js";
console.log("FACE ROUTES FILE LOADED");
const router = express.Router();

/* =========================================================
   SAVE / UPDATE PROFESSIONAL FACE
========================================================= */

router.post("/register", async (req, res) => {
  try {
    const { professional_id, face_descriptor } = req.body;

    if (!professional_id || !Array.isArray(face_descriptor)) {
      return res.status(400).json({
        message: "Professional ID and face descriptor are required",
      });
    }

    if (face_descriptor.length !== 128) {
      return res.status(400).json({
        message: "Invalid face descriptor",
      });
    }

    const [user] = await db.execute(
      `SELECT id
       FROM users
       WHERE id = ?
       AND role = 'professional'
       LIMIT 1`,
      [professional_id]
    );

    if (user.length === 0) {
      return res.status(404).json({
        message: "Professional not found",
      });
    }

    await db.execute(
      `INSERT INTO professional_faces
       (
         professional_id,
         face_descriptor
       )
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         face_descriptor = VALUES(face_descriptor),
         updated_at = CURRENT_TIMESTAMP`,
      [
        professional_id,
        JSON.stringify(face_descriptor),
      ]
    );

    res.json({
      message: "Face registered successfully",
    });
  } catch (error) {
    console.error("Face Registration Error:", error);

    res.status(500).json({
      message: "Unable to register face",
    });
  }
});

/* =========================================================
   CHECK WHETHER PROFESSIONAL HAS REGISTERED FACE
========================================================= */

router.get("/:professionalId", async (req, res) => {
  try {
    const { professionalId } = req.params;

    const [rows] = await db.execute(
      `SELECT id, professional_id, created_at, updated_at
       FROM professional_faces
       WHERE professional_id = ?
       LIMIT 1`,
      [professionalId]
    );

    res.json({
      registered: rows.length > 0,
    });
  } catch (error) {
    console.error("Face Status Error:", error);

    res.status(500).json({
      message: "Unable to check face registration",
    });
  }
});

export default router;