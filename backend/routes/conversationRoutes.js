import express from "express";
import db from "../db.js";

const router = express.Router();

/* =====================================================
   CREATE / GET PERSONAL CHAT
   Organizer ↔ Organizer
   Organizer ↔ Professional
===================================================== */

router.post("/personal", async (req, res) => {
  try {
    const { user1_id, user2_id } = req.body;

    if (!user1_id || !user2_id) {
      return res.status(400).json({
        message: "Both user IDs are required",
      });
    }

    if (Number(user1_id) === Number(user2_id)) {
      return res.status(400).json({
        message: "You cannot create a chat with yourself",
      });
    }

    // Check whether conversation already exists
    const [existing] = await db.execute(
      `SELECT cc.id
       FROM chat_conversations cc
       JOIN conversation_members cm1
         ON cc.id = cm1.conversation_id
       JOIN conversation_members cm2
         ON cc.id = cm2.conversation_id
       WHERE cc.type = 'personal'
       AND cm1.user_id = ?
       AND cm2.user_id = ?
       LIMIT 1`,
      [user1_id, user2_id],
    );

    if (existing.length > 0) {
      return res.json({
        conversation_id: existing[0].id,
      });
    }

    // Create conversation
    const [conversation] = await db.execute(
      `INSERT INTO chat_conversations
       (type, event_id, created_by)
       VALUES ('personal', NULL, ?)`,
      [user1_id],
    );

    const conversationId = conversation.insertId;

    // Add both users
    await db.execute(
      `INSERT INTO conversation_members
       (conversation_id, user_id)
       VALUES (?, ?), (?, ?)`,
      [
        conversationId,
        user1_id,
        conversationId,
        user2_id,
      ],
    );

    res.status(201).json({
      message: "Personal conversation created",
      conversation_id: conversationId,
    });
  } catch (error) {
    console.error("Create Personal Chat Error:", error);

    res.status(500).json({
      message: "Unable to create personal conversation",
    });
  }
});


/* =====================================================
   CREATE / GET EVENT TEAM CHAT
===================================================== */

router.post("/event", async (req, res) => {
  try {
    const { event_id, organizer_id } = req.body;

    if (!event_id || !organizer_id) {
      return res.status(400).json({
        message: "Event ID and organizer ID are required",
      });
    }

    // Verify event and organizer
    const [events] = await db.execute(
      `SELECT id, organizer_id
       FROM events
       WHERE id = ?`,
      [event_id],
    );

    if (events.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (
      Number(events[0].organizer_id) !==
      Number(organizer_id)
    ) {
      return res.status(403).json({
        message: "You are not the organizer of this event",
      });
    }

    // Check existing event conversation
    const [existing] = await db.execute(
      `SELECT id
       FROM chat_conversations
       WHERE type = 'event'
       AND event_id = ?
       LIMIT 1`,
      [event_id],
    );

    let conversationId;

    if (existing.length > 0) {
      conversationId = existing[0].id;
    } else {
      const [conversation] = await db.execute(
        `INSERT INTO chat_conversations
         (type, event_id, created_by)
         VALUES ('event', ?, ?)`,
        [event_id, organizer_id],
      );

      conversationId = conversation.insertId;
    }

    // Add organizer
    await db.execute(
      `INSERT IGNORE INTO conversation_members
       (conversation_id, user_id)
       VALUES (?, ?)`,
      [conversationId, organizer_id],
    );

    // Get assigned professionals
    const [professionals] = await db.execute(
      `SELECT professional_id
       FROM event_professionals
       WHERE event_id = ?`,
      [event_id],
    );

    // Add professionals
    for (const professional of professionals) {
      await db.execute(
        `INSERT IGNORE INTO conversation_members
         (conversation_id, user_id)
         VALUES (?, ?)`,
        [
          conversationId,
          professional.professional_id,
        ],
      );
    }

    res.status(201).json({
      message: "Event team conversation ready",
      conversation_id: conversationId,
    });
  } catch (error) {
    console.error("Create Event Chat Error:", error);

    res.status(500).json({
      message: "Unable to create event team conversation",
    });
  }
});


/* =====================================================
   GET USER CONVERSATIONS
===================================================== */

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [conversations] = await db.execute(
      `SELECT
        cc.id,
        cc.type,
        cc.event_id,
        cc.created_by,
        cc.created_at,
        e.title AS event_title

       FROM chat_conversations cc

       JOIN conversation_members cm
         ON cc.id = cm.conversation_id

       LEFT JOIN events e
         ON cc.event_id = e.id

       WHERE cm.user_id = ?

       ORDER BY cc.created_at DESC`,
      [userId],
    );

    res.json(conversations);
  } catch (error) {
    console.error("Get User Conversations Error:", error);

    res.status(500).json({
      message: "Unable to fetch conversations",
    });
  }
});


/* =====================================================
   GET CONVERSATION MEMBERS
===================================================== */

router.get("/:conversationId/members", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const [members] = await db.execute(
      `SELECT
        cm.user_id,
        u.name,
        u.email

       FROM conversation_members cm

       JOIN users u
         ON cm.user_id = u.id

       WHERE cm.conversation_id = ?

       ORDER BY u.name ASC`,
      [conversationId],
    );

    res.json(members);
  } catch (error) {
    console.error("Get Conversation Members Error:", error);

    res.status(500).json({
      message: "Unable to fetch conversation members",
    });
  }
});


/* =====================================================
   SEND MESSAGE
===================================================== */

router.post("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { sender_id, message } = req.body;

    if (!sender_id || !message?.trim()) {
      return res.status(400).json({
        message: "Sender and message are required",
      });
    }

    // Verify sender belongs to conversation
    const [member] = await db.execute(
      `SELECT id
       FROM conversation_members
       WHERE conversation_id = ?
       AND user_id = ?`,
      [conversationId, sender_id],
    );

    if (member.length === 0) {
      return res.status(403).json({
        message: "You are not a member of this conversation",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO conversation_messages
       (
         conversation_id,
         sender_id,
         message
       )
       VALUES (?, ?, ?)`,
      [
        conversationId,
        sender_id,
        message.trim(),
      ],
    );

    res.status(201).json({
      message: "Message sent successfully",

      data: {
        id: result.insertId,
        conversation_id: Number(conversationId),
        sender_id: Number(sender_id),
        message: message.trim(),
      },
    });
  } catch (error) {
    console.error("Send Conversation Message Error:", error);

    res.status(500).json({
      message: "Unable to send message",
    });
  }
});


/* =====================================================
   GET MESSAGES
===================================================== */

router.get("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    // Verify member
    const [member] = await db.execute(
      `SELECT id
       FROM conversation_members
       WHERE conversation_id = ?
       AND user_id = ?`,
      [conversationId, userId],
    );

    if (member.length === 0) {
      return res.status(403).json({
        message: "You are not a member of this conversation",
      });
    }

    const [messages] = await db.execute(
      `SELECT
        cm.id,
        cm.conversation_id,
        cm.sender_id,
        cm.message,
        cm.is_read,
        cm.created_at,
        u.name AS sender_name

       FROM conversation_messages cm

       JOIN users u
         ON cm.sender_id = u.id

       WHERE cm.conversation_id = ?

       ORDER BY cm.created_at ASC`,
      [conversationId],
    );

    // Mark received messages as read
    await db.execute(
      `UPDATE conversation_messages
       SET is_read = TRUE
       WHERE conversation_id = ?
       AND sender_id != ?`,
      [conversationId, userId],
    );

    res.json(messages);
  } catch (error) {
    console.error("Get Conversation Messages Error:", error);

    res.status(500).json({
      message: "Unable to fetch conversation messages",
    });
  }
});


export default router;