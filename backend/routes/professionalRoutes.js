import express from "express";
import db from "../db.js";

const router = express.Router();

/* =========================================================
   GET ALL PROFESSIONALS
========================================================= */

router.get("/", async (req, res) => {
  try {
    const [professionals] = await db.execute(
      `SELECT id, name, email, created_at
       FROM users
       WHERE role = 'professional'
       ORDER BY created_at DESC`
    );

    res.json(professionals);
  } catch (error) {
    console.error("Get Professionals Error:", error);

    res.status(500).json({
      message: "Unable to fetch professionals",
    });
  }
});

/* =========================================================
   GET PROFESSIONAL PROFILE
   GET /api/professionals/profile/:userId
========================================================= */

router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [profile] = await db.execute(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.created_at,
        pp.phone,
        pp.skills,
        pp.experience_years,
        pp.city,
        pp.latitude,
        pp.longitude,
        pp.availability,
        pp.bio,
        pp.rating
       FROM users u
       LEFT JOIN professional_profiles pp
         ON u.id = pp.user_id
       WHERE u.id = ?
       AND u.role = 'professional'`,
      [userId]
    );

    if (profile.length === 0) {
      return res.status(404).json({
        message: "Professional not found",
      });
    }

    res.json(profile[0]);
  } catch (error) {
    console.error("Get Professional Profile Error:", error);

    res.status(500).json({
      message: "Unable to fetch professional profile",
    });
  }
});

/* =========================================================
   UPDATE PROFESSIONAL PROFILE
   PUT /api/professionals/profile/:userId
========================================================= */

router.put("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      name,
      phone,
      skills,
      experience_years,
      city,
      latitude,
      longitude,
      availability,
      bio,
    } = req.body;

    if (name !== undefined) {
      await db.execute(
        `UPDATE users
         SET name = ?
         WHERE id = ?
         AND role = 'professional'`,
        [name, userId]
      );
    }

    await db.execute(
      `INSERT INTO professional_profiles
       (
         user_id,
         phone,
         skills,
         experience_years,
         city,
         latitude,
         longitude,
         availability,
         bio
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         phone = VALUES(phone),
         skills = VALUES(skills),
         experience_years = VALUES(experience_years),
         city = VALUES(city),
         latitude = VALUES(latitude),
         longitude = VALUES(longitude),
         availability = VALUES(availability),
         bio = VALUES(bio)`,
      [
        userId,
        phone || null,
        skills || null,
        experience_years || 0,
        city || null,
        latitude || null,
        longitude || null,
        availability || "available",
        bio || null,
      ]
    );

    res.json({
      message: "Professional profile updated successfully",
    });
  } catch (error) {
    console.error("Update Professional Profile Error:", error);

    res.status(500).json({
      message: "Unable to update professional profile",
    });
  }
});

/* =========================================================
   GET ALL ORGANIZERS
========================================================= */

router.get("/organizers", async (req, res) => {
  try {
    const [organizers] = await db.execute(
      `SELECT
        u.id,
        u.name,
        u.email,
        op.organization_name,
        op.phone,
        op.city,
        op.address,
        op.description,
        op.status
       FROM users u
       LEFT JOIN organizer_profiles op
         ON u.id = op.user_id
       WHERE u.role = 'organizer'
       ORDER BY u.created_at DESC`
    );

    res.json(organizers);
  } catch (error) {
    console.error("Get Organizers Error:", error);

    res.status(500).json({
      message: "Unable to fetch organizers",
    });
  }
});

/* =========================================================
   GET PROFESSIONAL'S CONNECTIONS
========================================================= */

router.get("/:userId/connections", async (req, res) => {
  try {
    const { userId } = req.params;

    const [connections] = await db.execute(
      `SELECT
        cr.id AS connection_id,
        cr.sender_id,
        cr.receiver_id,
        cr.status,
        cr.created_at,

        CASE
          WHEN cr.sender_id = ? THEN u_receiver.id
          ELSE u_sender.id
        END AS user_id,

        CASE
          WHEN cr.sender_id = ? THEN u_receiver.name
          ELSE u_sender.name
        END AS name,

        CASE
          WHEN cr.sender_id = ? THEN u_receiver.email
          ELSE u_sender.email
        END AS email,

        CASE
          WHEN cr.sender_id = ? THEN u_receiver.role
          ELSE u_sender.role
        END AS role

       FROM collaboration_requests cr

       JOIN users u_sender
         ON cr.sender_id = u_sender.id

       JOIN users u_receiver
         ON cr.receiver_id = u_receiver.id

       WHERE
         (cr.sender_id = ? OR cr.receiver_id = ?)
         AND cr.status = 'accepted'

       ORDER BY cr.created_at DESC`,
      [userId, userId, userId, userId, userId, userId]
    );

    res.json(connections);
  } catch (error) {
    console.error("Get Professional Connections Error:", error);

    res.status(500).json({
      message: "Unable to fetch connections",
    });
  }
});

/* =========================================================
   GET CONNECTION REQUESTS RECEIVED BY PROFESSIONAL
========================================================= */

router.get("/:userId/connection-requests", async (req, res) => {
  try {
    const { userId } = req.params;

    const [requests] = await db.execute(
      `SELECT
        cr.id,
        cr.sender_id,
        cr.receiver_id,
        cr.message,
        cr.status,
        cr.created_at,
        u.name AS sender_name,
        u.email AS sender_email,
        u.role AS sender_role
       FROM collaboration_requests cr

       JOIN users u
         ON cr.sender_id = u.id

       WHERE cr.receiver_id = ?
       AND cr.status = 'pending'

       ORDER BY cr.created_at DESC`,
      [userId]
    );

    res.json(requests);
  } catch (error) {
    console.error("Get Professional Connection Requests Error:", error);

    res.status(500).json({
      message: "Unable to fetch connection requests",
    });
  }
});

/* =========================================================
   GET PROFESSIONAL'S EVENT OFFERS

   IMPORTANT:
   event_staff.id is the unique offer ID.
========================================================= */

router.get("/:userId/event-offers", async (req, res) => {
  try {
    const { userId } = req.params;

    const [offers] = await db.execute(
      `SELECT
        es.id AS offer_id,
        es.id AS staff_id,

        es.event_id,
        es.professional_id,
        es.role AS professional_role,
        es.status AS offer_status,
        es.assigned_at,

        e.title,
        e.description,
        e.location,
        e.event_date,
        e.start_time,
        e.end_time,
        e.status AS event_status,

        u.id AS organizer_id,
        u.name AS organizer_name,
        u.email AS organizer_email,

        op.organization_name,
        op.phone AS organizer_phone,
        op.city AS organizer_city

       FROM event_staff es

       JOIN events e
         ON es.event_id = e.id

       JOIN users u
         ON e.organizer_id = u.id

       LEFT JOIN organizer_profiles op
         ON u.id = op.user_id

       WHERE es.professional_id = ?

       ORDER BY e.event_date ASC, es.id ASC`,
      [userId]
    );

    res.json(offers);
  } catch (error) {
    console.error("Get Event Offers Error:", error);

    res.status(500).json({
      message: "Unable to fetch event offers",
    });
  }
});

/* =========================================================
   ACCEPT EVENT OFFER

   PUT
   /api/professionals/event-offers/:staffId/accept
========================================================= */

router.put("/event-offers/:staffId/accept", async (req, res) => {
  try {
    const { staffId } = req.params;

    const [staffRows] = await db.execute(
      `SELECT
        id,
        event_id,
        professional_id,
        status
       FROM event_staff
       WHERE id = ?
       LIMIT 1`,
      [staffId]
    );

    if (staffRows.length === 0) {
      return res.status(404).json({
        message: "Event offer not found",
      });
    }

    const staff = staffRows[0];

    if (!["applied", "shortlisted"].includes(staff.status)) {
      return res.status(409).json({
        message: `Event offer is already ${staff.status}`,
      });
    }

    await db.execute(
      `UPDATE event_staff
       SET status = 'confirmed'
       WHERE id = ?
       AND status IN ('applied', 'shortlisted')`,
      [staffId]
    );

    res.json({
      message: "Event offer accepted successfully",
      event_id: staff.event_id,
      staff_id: staff.id,
    });
  } catch (error) {
    console.error("Accept Event Offer Error:", error);

    res.status(500).json({
      message: "Unable to accept event offer",
    });
  }
});

/* =========================================================
   REJECT EVENT OFFER

   PUT
   /api/professionals/event-offers/:staffId/reject
========================================================= */

router.put("/event-offers/:staffId/reject", async (req, res) => {
  try {
    const { staffId } = req.params;

    const [staffRows] = await db.execute(
      `SELECT
        id,
        event_id,
        professional_id,
        status
       FROM event_staff
       WHERE id = ?
       LIMIT 1`,
      [staffId]
    );

    if (staffRows.length === 0) {
      return res.status(404).json({
        message: "Event offer not found",
      });
    }

    const staff = staffRows[0];

    if (!["applied", "shortlisted"].includes(staff.status)) {
      return res.status(409).json({
        message: `Event offer is already ${staff.status}`,
      });
    }

    await db.execute(
      `UPDATE event_staff
       SET status = 'rejected'
       WHERE id = ?
       AND status IN ('applied', 'shortlisted')`,
      [staffId]
    );

    res.json({
      message: "Event offer rejected successfully",
      staff_id: staff.id,
    });
  } catch (error) {
    console.error("Reject Event Offer Error:", error);

    res.status(500).json({
      message: "Unable to reject event offer",
    });
  }
});

/* =========================================================
   GET PROFESSIONAL'S UPCOMING EVENTS
========================================================= */

router.get("/:userId/upcoming-events", async (req, res) => {
  try {
    const { userId } = req.params;

    const [events] = await db.execute(
      `SELECT
        es.id AS staff_id,
        e.id AS event_id,
        e.title,
        e.description,
        e.location,
        e.event_date,
        e.start_time,
        e.end_time,
        e.status AS event_status,

        es.role AS professional_role,
        es.status AS staff_status,

        u.id AS organizer_id,
        u.name AS organizer_name,
        u.email AS organizer_email

       FROM event_staff es

       JOIN events e
         ON es.event_id = e.id

       JOIN users u
         ON e.organizer_id = u.id

       WHERE es.professional_id = ?
       AND es.status = 'confirmed'
       AND e.event_date >= CURDATE()

       ORDER BY e.event_date ASC`,
      [userId]
    );

    res.json(events);
  } catch (error) {
    console.error("Get Upcoming Events Error:", error);

    res.status(500).json({
      message: "Unable to fetch upcoming events",
    });
  }
});

export default router;