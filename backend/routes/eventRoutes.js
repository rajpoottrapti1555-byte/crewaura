import express from "express";
import db from "../db.js";

const router = express.Router();

// =====================================================
// CREATE EVENT
// =====================================================
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
       (
         organizer_id,
         title,
         description,
         location,
         latitude,
         longitude,
         event_date,
         start_time,
         end_time
       )
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
        latitude,
        longitude,
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

// =====================================================
// GET EVENTS OF ORGANIZER
// =====================================================
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

// =====================================================
// ASSIGN PROFESSIONALS TO EVENT
// =====================================================
router.post("/:eventId/professionals", async (req, res) => {
  try {
    const { eventId } = req.params;

    const [professionals] = await db.execute(
      `SELECT
        ep.id,
        ep.event_id,
        ep.professional_id,
        u.name,
        u.email
       FROM event_professionals ep
       JOIN users u
         ON ep.professional_id = u.id
       WHERE ep.event_id = ?
       ORDER BY u.name ASC`,
      [eventId],
    );

    res.json(professionals);

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
    console.error("Get selected Professionals Error:", error);

    res.status(500).json({
      message: "Unable to fetch selected professionals",
    });
  }
});

// =====================================================
// GET ATTENDANCE FOR AN EVENT
// =====================================================
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
        ea.check_in_latitude,
        ea.check_in_longitude,
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

// GET EVENTS ASSIGNED TO A PROFESSIONAL
router.get("/professional/:professionalId", async (req, res) => {
  try {
    const { professionalId } = req.params;

    const [events] = await db.execute(
      `SELECT
          e.id,
          e.title,
          e.description,
          e.location,
          e.latitude,
          e.longitude,
          e.event_date,
          e.start_time,
          e.end_time,
          ea.status AS attendance_status,
          ea.check_in,
          ea.check_out
         FROM event_professionals ep
         JOIN events e
           ON ep.event_id = e.id
         LEFT JOIN event_attendance ea
           ON ea.event_id = e.id
           AND ea.professional_id = ep.professional_id
         WHERE ep.professional_id = ?
         ORDER BY e.event_date DESC`,
      [professionalId],
    );

    res.json(events);
  } catch (error) {
    console.error("Get Professional Events Error:", error);

    res.status(500).json({
      message: "Unable to fetch assigned events",
    });
  }
});
// =====================================================

// UPDATE PROFESSIONAL ATTENDANCE
// =====================================================
router.put("/:eventId/attendance/:professionalId", async (req, res) => {
  try {
    console.log("ATTENDANCE API HIT:", req.params, req.body);
    const { eventId, professionalId } = req.params;
    const { status, latitude, longitude } = req.body;

    // -------------------------------------------------
    // Validate status
    // -------------------------------------------------
    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance status",
      });
    }

    // -------------------------------------------------
    // Check event + professional assignment
    // -------------------------------------------------
    const [eventRows] = await db.execute(
      `SELECT
        e.id,
        e.title,
        e.event_date,
        e.latitude AS event_latitude,
        e.longitude AS event_longitude,
        es.status AS staff_status
       FROM events e
       JOIN event_staff es
         ON e.id = es.event_id
       WHERE e.id = ?
       AND es.professional_id = ?
       LIMIT 1`,
      [eventId, professionalId],
    );

    if (eventRows.length === 0) {
      return res.status(404).json({
        message: "Event or professional assignment not found",
      });
    }

    const event = eventRows[0];

    // -------------------------------------------------
    // Professional must be confirmed
    // -------------------------------------------------
    if (event.staff_status !== "confirmed") {
      return res.status(403).json({
        message: "Professional is not confirmed for this event",
      });
    }

    // =================================================
    // PRESENT ATTENDANCE
    // =================================================
    if (status === "present") {
      // ------------------------------------------------
      // Attendance only on event day
      // ------------------------------------------------
      const [dateRows] = await db.execute(
        `SELECT
          DATE(?) AS event_day,
          CURDATE() AS today`,
        [event.event_date],
      );

      if (dateRows[0].event_day !== dateRows[0].today) {
        return res.status(403).json({
          message: `Attendance can only be marked on the event date (${event.event_date})`,
        });
      }

      // ------------------------------------------------
      // Event coordinates required
      // ------------------------------------------------
      if (event.event_latitude === null || event.event_longitude === null) {
        return res.status(400).json({
          message: "Event location coordinates are not available",
        });
      }

      // ------------------------------------------------
      // Validate user's GPS coordinates
      // ------------------------------------------------
      const currentLatitude = Number(latitude);
      const currentLongitude = Number(longitude);

      if (
        !Number.isFinite(currentLatitude) ||
        !Number.isFinite(currentLongitude) ||
        currentLatitude < -90 ||
        currentLatitude > 90 ||
        currentLongitude < -180 ||
        currentLongitude > 180
      ) {
        return res.status(400).json({
          message: "Valid GPS coordinates are required",
        });
      }

      // ------------------------------------------------
      // Haversine distance calculation
      // ------------------------------------------------
      const toRadians = (value) => {
        return (value * Math.PI) / 180;
      };

      const earthRadius = 6371000;

      const eventLatitude = Number(event.event_latitude);
      const eventLongitude = Number(event.event_longitude);

      const dLatitude = toRadians(currentLatitude - eventLatitude);

      const dLongitude = toRadians(currentLongitude - eventLongitude);

      const a =
        Math.sin(dLatitude / 2) ** 2 +
        Math.cos(toRadians(eventLatitude)) *
          Math.cos(toRadians(currentLatitude)) *
          Math.sin(dLongitude / 2) ** 2;

      const distance =
        2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      // ------------------------------------------------
      // Maximum allowed distance = 200 meters
      // ------------------------------------------------
      const ATTENDANCE_RADIUS = 200;

      if (distance > ATTENDANCE_RADIUS) {
        return res.status(403).json({
          message: "You are too far from the event location to mark attendance",
          distance: Math.round(distance),
          allowedRadius: ATTENDANCE_RADIUS,
        });
      }

      // ------------------------------------------------
      // INSERT OR UPDATE ATTENDANCE
      // ------------------------------------------------
      await db.execute(
        `INSERT INTO event_attendance
        (
          event_id,
          professional_id,
          status,
          check_in,
          check_in_latitude,
          check_in_longitude
        )
        VALUES (?, ?, 'present', NOW(), ?, ?)
        ON DUPLICATE KEY UPDATE
          status = 'present',
          check_in = NOW(),
          check_in_latitude = VALUES(check_in_latitude),
          check_in_longitude = VALUES(check_in_longitude)`,
        [eventId, professionalId, currentLatitude, currentLongitude],
      );

      // ------------------------------------------------
      // Get saved attendance
      // ------------------------------------------------
      const [attendanceRows] = await db.execute(
        `SELECT
          event_id,
          professional_id,
          status,
          check_in,
          check_in_latitude,
          check_in_longitude
         FROM event_attendance
         WHERE event_id = ?
         AND professional_id = ?`,
        [eventId, professionalId],
      );

      return res.json({
        message: "Attendance marked successfully",
        distance: Math.round(distance),
        attendance: attendanceRows[0],
      });
    }

    // =================================================
    // ABSENT ATTENDANCE
    // =================================================

    await db.execute(
      `INSERT INTO event_attendance
      (
        event_id,
        professional_id,
        status,
        check_in,
        check_out,
        check_in_latitude,
        check_in_longitude
      )
      VALUES (?, ?, 'absent', NULL, NULL, NULL, NULL)
      ON DUPLICATE KEY UPDATE
        status = 'absent',
        check_in = NULL,
        check_out = NULL,
        check_in_latitude = NULL,
        check_in_longitude = NULL`,
      [eventId, professionalId],
    );

    return res.json({
      message: "Attendance marked as absent",
    });
  } catch (error) {
    console.error("Update Attendance Error:", error);

    res.status(500).json({
      message: "Unable to update attendance",
    });
  }
});

// MARK ATTENDANCE USING GPS LOCATION
router.post("/:eventId/attendance/check-in", async (req, res) => {
  try {
    const { eventId } = req.params;

    const { professional_id, latitude, longitude } = req.body;

    // Check required data
    if (!professional_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Professional ID, latitude and longitude are required",
        status: "absent",
      });
    }

    // Check professional is assigned to this event
    const [assignment] = await db.execute(
      `SELECT id
       FROM event_professionals
       WHERE event_id = ?
       AND professional_id = ?`,
      [eventId, professional_id],
    );

    if (assignment.length === 0) {
      return res.status(403).json({
        message: "You are not assigned to this event",
        status: "absent",
      });
    }

    // Get event location and event timing
    const [events] = await db.execute(
      `SELECT latitude, longitude, event_date, start_time, end_time
       FROM events
       WHERE id = ?`,
      [eventId],
    );

    if (events.length === 0) {
      return res.status(404).json({
        message: "Event not found",
        status: "absent",
      });
    }

    const event = events[0];

    const eventLatitude = Number(event.latitude);
    const eventLongitude = Number(event.longitude);

    // Check event location
    if (!Number.isFinite(eventLatitude) || !Number.isFinite(eventLongitude)) {
      return res.status(400).json({
        message: "Event location is not configured",
        status: "absent",
      });
    }

    const professionalLatitude = Number(latitude);
    const professionalLongitude = Number(longitude);

    // Validate professional coordinates
    if (
      !Number.isFinite(professionalLatitude) ||
      !Number.isFinite(professionalLongitude)
    ) {
      return res.status(400).json({
        message: "Invalid location received",
        status: "absent",
      });
    }

    // Haversine distance calculation
    const toRadians = (value) => {
      return (value * Math.PI) / 180;
    };

    const earthRadius = 6371000;

    const latDifference = toRadians(professionalLatitude - eventLatitude);

    const lonDifference = toRadians(professionalLongitude - eventLongitude);

    const a =
      Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
      Math.cos(toRadians(eventLatitude)) *
        Math.cos(toRadians(professionalLatitude)) *
        Math.sin(lonDifference / 2) *
        Math.sin(lonDifference / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadius * c;

    // Allowed radius = 200 meters
    const allowedRadius = 200;

    // Outside event location
    if (distance > allowedRadius) {
      // Make attendance absent
      await db.execute(
        `UPDATE event_attendance
         SET status = 'absent',
             check_in = NULL,
             check_out = NULL
         WHERE event_id = ?
         AND professional_id = ?`,
        [eventId, professional_id],
      );

      return res.status(403).json({
        message: "Attendance rejected. You are outside the event location.",
        status: "absent",
        distance: Math.round(distance),
        allowed_radius: allowedRadius,
      });
    }

    // Location is valid → mark PRESENT
    await db.execute(
      `UPDATE event_attendance
       SET status = 'present',
           check_in = NOW()
       WHERE event_id = ?
       AND professional_id = ?`,
      [eventId, professional_id],
    );

    // Get saved attendance timestamp
    const [attendance] = await db.execute(
      `SELECT status, check_in, check_out
       FROM event_attendance
       WHERE event_id = ?
       AND professional_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [eventId, professional_id],
    );

    res.json({
      message: "Attendance marked successfully",
      status: "present",
      distance: Math.round(distance),
      check_in: attendance.length > 0 ? attendance[0].check_in : null,
    });
  } catch (error) {
    console.error("GPS Attendance Error:", error);

    res.status(500).json({
      message: "Unable to mark attendance",
      status: "absent",
    });
  }
});

// =====================================================
// GET EVENTS ASSIGNED TO PROFESSIONAL
// =====================================================
router.get("/professional/:professionalId", async (req, res) => {
  try {
    const { professionalId } = req.params;

    const [events] = await db.execute(
      `SELECT
        es.id AS staff_id,
        e.id AS event_id,
        e.title,
        e.description,
        e.location,
        e.latitude,
        e.longitude,
        e.event_date,
        e.start_time,
        e.end_time,
        e.status AS event_status,

        es.role AS professional_role,
        es.status AS staff_status,

        u.id AS organizer_id,
        u.name AS organizer_name,
        u.email AS organizer_email,

        ea.status AS attendance_status,
        ea.check_in AS attendance_check_in,
        ea.check_out AS attendance_check_out,
        ea.check_in_latitude,
        ea.check_in_longitude

       FROM event_staff es

       JOIN events e
         ON es.event_id = e.id

       JOIN users u
         ON e.organizer_id = u.id

       LEFT JOIN event_attendance ea
         ON ea.event_id = e.id
         AND ea.professional_id = es.professional_id

       WHERE es.professional_id = ?

       ORDER BY e.event_date ASC`,
      [professionalId],
    );

    res.json(events);
  } catch (error) {
    console.error("Get Professional Events Error:", error);

    res.status(500).json({
      message: "Unable to fetch professional events",
    });
  }
});

export default router;
