import express from "express";
import db from "../db.js";

const router = express.Router();

// =====================================================
// SEND MESSAGE
// Organizer ↔ Selected Professional
// =====================================================

router.post("/", async (req, res) => {
  try {
    const { event_id, sender_id, receiver_id, message } = req.body;

    // Basic validation
    if (!event_id || !sender_id || !receiver_id || !message?.trim()) {
      return res.status(400).json({
        message: "Event, sender, receiver and message are required",
      });
    }

    // Cannot message yourself
    if (Number(sender_id) === Number(receiver_id)) {
      return res.status(400).json({
        message: "You cannot message yourself",
      });
    }

    // =================================================
    // 1. Get event organizer
    // =================================================

    const [events] = await db.execute(
      `SELECT organizer_id
       FROM events
       WHERE id = ?`,
      [event_id],
    );

    if (events.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const organizerId = Number(events[0].organizer_id);

    // =================================================
    // 2. Check professional assignment
    // =================================================

    const [assignment] = await db.execute(
      `SELECT professional_id
       FROM event_staff
       WHERE event_id = ?
       AND professional_id IN (?, ?)`,
      [event_id, sender_id, receiver_id],
    );

    // =================================================
    // 3. Determine whether this is a valid chat
    // =================================================

    const senderIsOrganizer = Number(sender_id) === organizerId;

    const receiverIsOrganizer = Number(receiver_id) === organizerId;

    // Organizer ↔ Professional

    if (senderIsOrganizer) {
      // Receiver must be assigned professional
      const receiverAssigned = assignment.some(
        (row) => Number(row.professional_id) === Number(receiver_id),
      );

      if (!receiverAssigned) {
        return res.status(403).json({
          message: "This professional is not assigned to this event",
        });
      }
    } else if (receiverIsOrganizer) {
      // Sender must be assigned professional
      const senderAssigned = assignment.some(
        (row) => Number(row.professional_id) === Number(sender_id),
      );

      if (!senderAssigned) {
        return res.status(403).json({
          message: "You are not assigned to this event",
        });
      }
    } else {
      // Professional ↔ Professional is not allowed
      return res.status(403).json({
        message:
          "Only the event organizer and selected professionals can communicate",
      });
    }

    // =================================================
    // 4. Save message
    // =================================================

    const [result] = await db.execute(
      `INSERT INTO messages
       (
         event_id,
         sender_id,
         receiver_id,
         message
       )
       VALUES (?, ?, ?, ?)`,
      [event_id, sender_id, receiver_id, message.trim()],
    );

    res.status(201).json({
      message: "Message sent successfully",

      data: {
        id: result.insertId,
        event_id,
        sender_id,
        receiver_id,
        message: message.trim(),
      },
    });
  } catch (error) {
    console.error("Send Message Error:", error);

    res.status(500).json({
      message: "Unable to send message",
    });
  }
});

// =====================================================
// GET CONVERSATION
// Organizer ↔ Professional for ONE EVENT
// =====================================================

router.get("/:eventId/:userId/:otherUserId", async (req, res) => {
  try {
    const { eventId, userId, otherUserId } = req.params;

    // =================================================
    // 1. Verify event exists
    // =================================================

    const [events] = await db.execute(
      `SELECT organizer_id
         FROM events
         WHERE id = ?`,
      [eventId],
    );

    if (events.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const organizerId = Number(events[0].organizer_id);

    // =================================================
    // 2. Verify conversation participants
    // =================================================

    const userIsOrganizer = Number(userId) === organizerId;

    const otherIsOrganizer = Number(otherUserId) === organizerId;

    if (!userIsOrganizer && !otherIsOrganizer) {
      return res.status(403).json({
        message:
          "Only organizer and selected professionals can access this chat",
      });
    }

    // =================================================
    // 3. Check professional assignment
    // =================================================

    const professionalId = userIsOrganizer
      ? Number(otherUserId)
      : Number(userId);

    const [assignment] = await db.execute(
      `SELECT id
         FROM event_staff
         WHERE event_id = ?
         AND professional_id = ?`,
      [eventId, professionalId],
    );

    if (assignment.length === 0) {
      return res.status(403).json({
        message: "Professional is not assigned to this event",
      });
    }

    // =================================================
    // 4. Get messages for THIS EVENT only
    // =================================================

    const [messages] = await db.execute(
      `SELECT
          m.id,
          m.event_id,
          m.sender_id,
          m.receiver_id,
          m.message,
          m.is_read,
          m.created_at,

          sender.name AS sender_name,
          receiver.name AS receiver_name

         FROM messages m

         JOIN users sender
           ON m.sender_id = sender.id

         JOIN users receiver
           ON m.receiver_id = receiver.id

         WHERE m.event_id = ?

         AND (
           (m.sender_id = ? AND m.receiver_id = ?)
           OR
           (m.sender_id = ? AND m.receiver_id = ?)
         )

         ORDER BY m.created_at ASC`,
      [eventId, userId, otherUserId, otherUserId, userId],
    );

    res.json(messages);
  } catch (error) {
    console.error("Get Conversation Error:", error);

    res.status(500).json({
      message: "Unable to fetch messages",
    });
  }
});

// =====================================================
// MARK MESSAGES AS READ
// =====================================================

router.put("/read/:eventId/:userId/:otherUserId", async (req, res) => {
  try {
    const { eventId, userId, otherUserId } = req.params;

    await db.execute(
      `UPDATE messages

         SET is_read = TRUE

         WHERE event_id = ?

         AND sender_id = ?

         AND receiver_id = ?`,
      [eventId, otherUserId, userId],
    );

    res.json({
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark Messages Read Error:", error);

    res.status(500).json({
      message: "Unable to update messages",
    });
  }
});

export default router;
