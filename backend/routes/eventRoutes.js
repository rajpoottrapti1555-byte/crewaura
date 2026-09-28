import express from "express";
import db from "../db.js";

const router = express.Router();

// CREATE EVENT
router.post("/", async (req, res) => {
  try {
    const {
      organizer_id,
      title,
      description,
      location,
      latitude,
      longitude,
      event_date,
      start_time,
      end_time,
    } = req.body;

    if (!organizer_id || !title || !event_date) {
      return res.status(400).json({
        message: "Organizer ID, title and event date are required",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO events
       (organizer_id, title, description, location,
        latitude, longitude, event_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organizer_id,
        title,
        description || null,
        location || null,
        latitude || null,
        longitude || null,
        event_date,
        start_time || null,
        end_time || null,
      ],
    );

    res.status(201).json({
      message: "Event created successfully",
      event: {
        id: result.insertId,
        organizer_id,
        title,
        description,
        location,
        event_date,
        start_time,
        end_time,
      },
    });
  } catch (error) {
    console.error("Create Event Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// GET EVENTS OF ORGANIZER
router.get("/organizer/:organizerId", async (req, res) => {
  try {
    const { organizerId } = req.params;

    const [events] = await db.execute(
      `SELECT *
       FROM events
       WHERE organizer_id = ?
       ORDER BY event_date DESC`,
      [organizerId],
    );

    res.json(events);
  } catch (error) {
    console.error("Get Organizer Events Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ASSIGN PROFESSIONALS TO EVENT
router.post("/:eventId/professionals", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { professional_ids } = req.body;

    if (!Array.isArray(professional_ids) || professional_ids.length === 0) {
      return res.status(400).json({
        message: "At least one professional is required",
      });
    }

    for (const professionalId of professional_ids) {
      await db.execute(
        `INSERT INTO event_professionals
         (event_id, professional_id)
         VALUES (?, ?)`,
        [eventId, professionalId],
      );
    }

    res.status(201).json({
      message: "Professionals assigned to event successfully",
    });
  } catch (error) {
    console.error("Assign Professionals Error:", error);

    res.status(500).json({
      message: "Unable to assign professionals",
    });
  }
});

// GET ATTENDANCE FOR AN EVENT
router.get("/:eventId/attendance", async (req, res) => {
  try {
    const { eventId } = req.params;

    const [attendance] = await db.execute(
      `SELECT
        ea.id,
        ea.event_id,
        ea.professional_id,
        ea.status,
        ea.check_in,
        ea.check_out,
        u.name,
        u.email
       FROM event_attendance ea
       JOIN users u
         ON ea.professional_id = u.id
       WHERE ea.event_id = ?
       ORDER BY u.name ASC`,
      [eventId],
    );

    res.json(attendance);
  } catch (error) {
    console.error("Get Attendance Error:", error);

    res.status(500).json({
      message: "Unable to fetch attendance",
    });
  }
});

// UPDATE PROFESSIONAL ATTENDANCE
router.put("/:eventId/attendance/:professionalId", async (req, res) => {
  try {
    const { eventId, professionalId } = req.params;
    const { status } = req.body;

    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance status",
      });
    }

    if (status === "present") {
      await db.execute(
        `UPDATE event_attendance
           SET status = 'present',
               check_in = COALESCE(check_in, NOW())
           WHERE event_id = ?
           AND professional_id = ?`,
        [eventId, professionalId],
      );
    } else {
      await db.execute(
        `UPDATE event_attendance
           SET status = 'absent',
               check_in = NULL,
               check_out = NULL
           WHERE event_id = ?
           AND professional_id = ?`,
        [eventId, professionalId],
      );
    }

    res.json({
      message: "Attendance updated successfully",
    });
  } catch (error) {
    console.error("Update Attendance Error:", error);

    res.status(500).json({
      message: "Unable to update attendance",
    });
  }
});

export default router;
