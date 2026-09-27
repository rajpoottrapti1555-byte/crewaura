import express from "express";
import db from "../db.js";

const router = express.Router();

// SEND CONNECTION REQUEST
router.post("/request", async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;

    console.log("Connection Request:", {
      sender_id,
      receiver_id,
      message,
    });

    if (!sender_id || !receiver_id) {
      return res.status(400).json({
        message: "Sender ID and Receiver ID are required",
      });
    }

    if (sender_id === receiver_id) {
      return res.status(400).json({
        message: "You cannot connect with yourself",
      });
    }

    const [existing] = await db.execute(
      `SELECT id, status
       FROM collaboration_requests
       WHERE sender_id = ?
       AND receiver_id = ?`,
      [sender_id, receiver_id],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Connection request already exists",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO collaboration_requests
       (sender_id, receiver_id, message, status)
       VALUES (?, ?, ?, 'pending')`,
      [sender_id, receiver_id, message || null],
    );

    res.status(201).json({
      message: "Connection request sent successfully",
      request_id: result.insertId,
    });
  } catch (error) {
    console.error("Connection Request Error:", error);

    res.status(500).json({
      message: "Unable to send connection request",
    });
  }
});

// GET PENDING CONNECTION REQUESTS
router.get("/requests/:userId", async (req, res) => {
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
        u.email AS sender_email
       FROM collaboration_requests cr
       JOIN users u ON cr.sender_id = u.id
       WHERE cr.receiver_id = ?
       AND cr.status = 'pending'
       ORDER BY cr.created_at DESC`,
      [userId],
    );

    res.json(requests);
  } catch (error) {
    console.error("Get Connection Requests Error:", error);

    res.status(500).json({
      message: "Unable to fetch connection requests",
    });
  }
});

// ACCEPT CONNECTION REQUEST
router.put("/:requestId/accept", async (req, res) => {
  try {
    const { requestId } = req.params;

    const [result] = await db.execute(
      `UPDATE collaboration_requests
       SET status = 'accepted'
       WHERE id = ?
       AND status = 'pending'`,
      [requestId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Pending connection request not found",
      });
    }

    res.json({
      message: "Connection request accepted successfully",
    });
  } catch (error) {
    console.error("Accept Request Error:", error);

    res.status(500).json({
      message: "Unable to accept connection request",
    });
  }
});

// REJECT CONNECTION REQUEST
router.put("/:requestId/reject", async (req, res) => {
  try {
    const { requestId } = req.params;

    const [result] = await db.execute(
      `UPDATE collaboration_requests
       SET status = 'rejected'
       WHERE id = ?
       AND status = 'pending'`,
      [requestId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Pending connection request not found",
      });
    }

    res.json({
      message: "Connection request rejected successfully",
    });
  } catch (error) {
    console.error("Reject Request Error:", error);

    res.status(500).json({
      message: "Unable to reject connection request",
    });
  }
});

// GET MY CONNECTIONS
router.get("/:userId", async (req, res) => {
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
        END AS email
       FROM collaboration_requests cr
       JOIN users u_sender
         ON cr.sender_id = u_sender.id
       JOIN users u_receiver
         ON cr.receiver_id = u_receiver.id
       WHERE
         (cr.sender_id = ? OR cr.receiver_id = ?)
         AND cr.status = 'accepted'
       ORDER BY cr.created_at DESC`,
      [userId, userId, userId, userId, userId],
    );

    res.json(connections);
  } catch (error) {
    console.error("Get My Connections Error:", error);

    res.status(500).json({
      message: "Unable to fetch connections",
    });
  }
});

export default router;
