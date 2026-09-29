import express from "express";
import db from "../db.js";

const router = express.Router();

/* =========================================================
   CREATE EVENT
========================================================= */

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

/* =========================================================
   GET EVENTS OF ORGANIZER
========================================================= */

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

/* =========================================================
   GET PROFESSIONALS ASSIGNED TO EVENT
========================================================= */

router.get("/:eventId/professionals", async (req, res) => {
  try {
    const { eventId } = req.params;

    const [professionals] = await db.execute(
      `
      SELECT
        es.id AS staff_id,
        es.event_id,
        es.professional_id,
        es.role,
        es.status,
        u.name,
        u.email
      FROM event_staff es
      JOIN users u
        ON es.professional_id = u.id
      WHERE es.event_id = ?
        AND es.status = 'confirmed'
      ORDER BY u.name ASC
      `,
      [eventId],
    );

    res.json(professionals);
  } catch (error) {
    console.error("Get Event Professionals Error:", error);

    res.status(500).json({
      message: "Unable to fetch event professionals",
    });
  }
});

/* =========================================================
   ASSIGN PROFESSIONALS TO EVENT
========================================================= */

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
      const [existing] = await db.execute(
        `SELECT id
         FROM event_professionals
         WHERE event_id = ?
         AND professional_id = ?
         LIMIT 1`,
        [eventId, professionalId],
      );

      if (existing.length === 0) {
        await db.execute(
          `INSERT INTO event_professionals
           (event_id, professional_id)
           VALUES (?, ?)`,
          [eventId, professionalId],
        );
      }
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

/* =========================================================
   GET ATTENDANCE FOR AN EVENT
========================================================= */

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

/* =========================================================
   GET EVENTS ASSIGNED TO PROFESSIONAL
   MY EVENTS

   IMPORTANT:
   Only confirmed event_staff records are returned.
========================================================= */

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
         ON ea.event_id = es.event_id
         AND ea.professional_id = es.professional_id

       WHERE es.professional_id = ?
       AND es.status = 'confirmed'

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

/* =========================================================
   UPDATE PROFESSIONAL ATTENDANCE
   EXISTING ATTENDANCE LOGIC
========================================================= */

router.put("/:eventId/attendance/:professionalId", async (req, res) => {
  try {
    console.log("ATTENDANCE API HIT:", req.params, req.body);

    const { eventId, professionalId } = req.params;
    const { status, latitude, longitude } = req.body;

    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance status",
      });
    }

    const [eventRows] = await db.execute(
      `SELECT
        e.id,
        e.title,
        DATE_FORMAT(e.event_date, '%Y-%m-%d') AS event_date,
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

    if (event.staff_status !== "confirmed") {
      return res.status(403).json({
        message: "Professional is not confirmed for this event",
      });
    }

    const [existingAttendance] = await db.execute(
      `SELECT status
       FROM event_attendance
       WHERE event_id = ?
       AND professional_id = ?`,
      [eventId, professionalId],
    );

    if (existingAttendance.length > 0) {
      return res.status(409).json({
        message: `Attendance is already marked as ${existingAttendance[0].status}`,
        status: existingAttendance[0].status,
      });
    }

    if (status === "present") {
      const [dateRows] = await db.execute(
        `SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today`,
      );

      const eventDate = String(event.event_date);
      const todayDate = String(dateRows[0].today);

      console.log("EVENT DATE:", eventDate);
      console.log("TODAY DATE:", todayDate);

      if (eventDate !== todayDate) {
        return res.status(403).json({
          message: `Attendance can only be marked on the event date (${eventDate})`,
        });
      }

      if (event.event_latitude === null || event.event_longitude === null) {
        return res.status(400).json({
          message: "Event location coordinates are not available",
        });
      }

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

      const ATTENDANCE_RADIUS = 200;

      if (distance > ATTENDANCE_RADIUS) {
        return res.status(403).json({
          message: "You are too far from the event location to mark attendance",
          distance: Math.round(distance),
          allowedRadius: ATTENDANCE_RADIUS,
        });
      }

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
        VALUES (?, ?, 'present', NOW(), ?, ?)`,
        [eventId, professionalId, currentLatitude, currentLongitude],
      );

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
      VALUES (?, ?, 'absent', NULL, NULL, NULL, NULL)`,
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

/* =========================================================
   MARK ATTENDANCE USING GPS LOCATION
========================================================= */

router.post("/:eventId/attendance/check-in", async (req, res) => {
  try {
    const { eventId } = req.params;

    const { professional_id, latitude, longitude } = req.body;

    if (!professional_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Professional ID, latitude and longitude are required",
        status: "absent",
      });
    }

    /*
      IMPORTANT FIX:
      Accepted professionals are stored in event_staff
      with status = confirmed.
    */

    const [assignment] = await db.execute(
      `SELECT id
       FROM event_staff
       WHERE event_id = ?
       AND professional_id = ?
       AND status = 'confirmed'
       LIMIT 1`,
      [eventId, professional_id],
    );

    if (assignment.length === 0) {
      return res.status(403).json({
        message: "You are not assigned to this event",
        status: "absent",
      });
    }

    const [events] = await db.execute(
      `SELECT
        latitude,
        longitude,
        event_date,
        start_time,
        end_time
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

    if (!Number.isFinite(eventLatitude) || !Number.isFinite(eventLongitude)) {
      return res.status(400).json({
        message: "Event location is not configured",
        status: "absent",
      });
    }

    const professionalLatitude = Number(latitude);
    const professionalLongitude = Number(longitude);

    if (
      !Number.isFinite(professionalLatitude) ||
      !Number.isFinite(professionalLongitude)
    ) {
      return res.status(400).json({
        message: "Invalid location received",
        status: "absent",
      });
    }

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

    const allowedRadius = 200;

    if (distance > allowedRadius) {
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

    await db.execute(
      `UPDATE event_attendance
       SET status = 'present',
           check_in = NOW()
       WHERE event_id = ?
       AND professional_id = ?`,
      [eventId, professional_id],
    );

    const [attendance] = await db.execute(
      `SELECT
        status,
        check_in,
        check_out
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

/* =========================================================
   SEND EVENT REQUEST TO PROFESSIONAL
========================================================= */

router.post("/:eventId/request-professional", async (req, res) => {
  try {
    const { eventId } = req.params;

    const { organizer_id, professional_id, message } = req.body;

    if (!organizer_id || !professional_id) {
      return res.status(400).json({
        message: "Organizer ID and Professional ID are required",
      });
    }

    const [events] = await db.execute(
      `SELECT id, title
       FROM events
       WHERE id = ?
       AND organizer_id = ?`,
      [eventId, organizer_id],
    );

    if (events.length === 0) {
      return res.status(404).json({
        message: "Event not found or does not belong to this organizer",
      });
    }

    const [existingRequest] = await db.execute(
      `SELECT id, status
       FROM event_requests
       WHERE event_id = ?
       AND professional_id = ?
       LIMIT 1`,
      [eventId, professional_id],
    );

    if (existingRequest.length > 0) {
      return res.status(409).json({
        message: `Event request already exists with status: ${existingRequest[0].status}`,
      });
    }

    const [result] = await db.execute(
      `INSERT INTO event_requests
       (
         event_id,
         organizer_id,
         professional_id,
         message,
         status
       )
       VALUES (?, ?, ?, ?, 'pending')`,
      [
        eventId,
        organizer_id,
        professional_id,
        message || "You have received an event request.",
      ],
    );

    res.status(201).json({
      message: "Event request sent successfully",
      request_id: result.insertId,
    });
  } catch (error) {
    console.error("Send Event Request Error:", error);

    res.status(500).json({
      message: "Unable to send event request",
    });
  }
});

/* =========================================================
   GET EVENT REQUESTS FOR PROFESSIONAL
========================================================= */

router.get("/professional/:professionalId/event-requests", async (req, res) => {
  try {
    const { professionalId } = req.params;

    const [requests] = await db.execute(
      `SELECT
          er.id AS request_id,
          er.event_id,
          er.organizer_id,
          er.professional_id,
          er.message,
          er.status,
          er.created_at,

          e.title AS event_title,
          e.description AS event_description,
          e.location AS event_location,
          e.event_date,
          e.start_time,
          e.end_time,

          u.name AS organizer_name,
          u.email AS organizer_email

         FROM event_requests er

         JOIN events e
           ON er.event_id = e.id

         JOIN users u
           ON er.organizer_id = u.id

         WHERE er.professional_id = ?

         ORDER BY er.created_at DESC`,
      [professionalId],
    );

    res.json(requests);
  } catch (error) {
    console.error("Get Event Requests Error:", error);

    res.status(500).json({
      message: "Unable to fetch event requests",
    });
  }
});

/* =========================================================
   ACCEPT EVENT REQUEST
========================================================= */

router.put("/event-requests/:requestId/accept", async (req, res) => {
  try {
    const { requestId } = req.params;

    const [requests] = await db.execute(
      `SELECT
          id,
          event_id,
          organizer_id,
          professional_id,
          status
         FROM event_requests
         WHERE id = ?
         LIMIT 1`,
      [requestId],
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Event request not found",
      });
    }

    const request = requests[0];

    if (request.status !== "pending") {
      return res.status(409).json({
        message: `Request is already ${request.status}`,
      });
    }

    await db.execute(
      `UPDATE event_requests
         SET status = 'accepted'
         WHERE id = ?`,
      [requestId],
    );

    /*
        Avoid duplicate event_staff assignment.
      */

    const [existingStaff] = await db.execute(
      `SELECT id
         FROM event_staff
         WHERE event_id = ?
         AND professional_id = ?
         LIMIT 1`,
      [request.event_id, request.professional_id],
    );

    if (existingStaff.length === 0) {
      await db.execute(
        `INSERT INTO event_staff
           (
             event_id,
             professional_id,
             role,
             status
           )
           VALUES (?, ?, 'Event Staff', 'confirmed')`,
        [request.event_id, request.professional_id],
      );
    } else {
      await db.execute(
        `UPDATE event_staff
           SET status = 'confirmed'
           WHERE id = ?`,
        [existingStaff[0].id],
      );
    }

    res.json({
      message: "Event request accepted successfully",
      event_id: request.event_id,
    });
  } catch (error) {
    console.error("Accept Event Request Error:", error);

    res.status(500).json({
      message: "Unable to accept event request",
    });
  }
});

/* =========================================================
   REJECT EVENT REQUEST
========================================================= */

router.put("/event-requests/:requestId/reject", async (req, res) => {
  try {
    const { requestId } = req.params;

    const [requests] = await db.execute(
      `SELECT id, status
         FROM event_requests
         WHERE id = ?
         LIMIT 1`,
      [requestId],
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Event request not found",
      });
    }

    if (requests[0].status !== "pending") {
      return res.status(409).json({
        message: `Request is already ${requests[0].status}`,
      });
    }

    await db.execute(
      `UPDATE event_requests
         SET status = 'rejected'
         WHERE id = ?`,
      [requestId],
    );

    res.json({
      message: "Event request rejected successfully",
    });
  } catch (error) {
    console.error("Reject Event Request Error:", error);

    res.status(500).json({
      message: "Unable to reject event request",
    });
  }
});

router.get("/admin/all", async (req, res) => {
  try {
    const [events] = await db.execute(`
      SELECT
        e.id,
        e.title,
        e.description,
        e.location,
        e.event_date,
        e.start_time,
        e.end_time,
        u.name AS organizer_name
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      ORDER BY e.event_date DESC
    `);

    res.json(events);
  } catch (error) {
    console.error("Admin Events Error:", error);
    res.status(500).json({
      message: "Unable to fetch events",
    });
  }
});

export default router;
