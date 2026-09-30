import express from "express";
import db from "../db.js";

const router = express.Router();

/* =========================================================
   CREATE MOCK PAYMENT
========================================================= */

router.post("/", async (req, res) => {
  try {
    const {
      sender_id,
      receiver_id,
      amount,
      purpose,
    } = req.body;

    if (!sender_id || !receiver_id || !amount) {
      return res.status(400).json({
        message:
          "Sender, receiver and amount are required.",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0.",
      });
    }

    if (Number(sender_id) === Number(receiver_id)) {
      return res.status(400).json({
        message: "You cannot pay yourself.",
      });
    }

    const [sender] = await db.execute(
      `SELECT id, name, email, role
       FROM users
       WHERE id = ?`,
      [sender_id]
    );

    if (sender.length === 0) {
      return res.status(404).json({
        message: "Sender not found.",
      });
    }

    const [receiver] = await db.execute(
      `SELECT id, name, email, role
       FROM users
       WHERE id = ?`,
      [receiver_id]
    );

    if (receiver.length === 0) {
      return res.status(404).json({
        message: "Receiver not found.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO payments
       (
         sender_id,
         receiver_id,
         amount,
         purpose,
         status
       )
       VALUES (?, ?, ?, ?, 'paid')`,
      [
        sender_id,
        receiver_id,
        amount,
        purpose || "EventSaathi Payment",
      ]
    );

    const [payment] = await db.execute(
      `SELECT
         p.id,
         p.sender_id,
         sender.name AS sender_name,
         p.receiver_id,
         receiver.name AS receiver_name,
         p.amount,
         p.purpose,
         p.status,
         p.created_at
       FROM payments p
       JOIN users sender
         ON p.sender_id = sender.id
       JOIN users receiver
         ON p.receiver_id = receiver.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Payment successful.",
      payment: payment[0],
    });
  } catch (error) {
    console.error(
      "Create Payment Error:",
      error
    );

    res.status(500).json({
      message: "Unable to process payment.",
    });
  }
});

/* =========================================================
   GET SENT PAYMENTS
========================================================= */

router.get("/sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [payments] = await db.execute(
      `SELECT
         p.id,
         p.amount,
         p.purpose,
         p.status,
         p.created_at,
         u.name AS receiver_name,
         u.email AS receiver_email,
         u.role AS receiver_role
       FROM payments p
       JOIN users u
         ON p.receiver_id = u.id
       WHERE p.sender_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json(payments);
  } catch (error) {
    console.error(
      "Sent Payments Error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch sent payments.",
    });
  }
});

/* =========================================================
   GET RECEIVED PAYMENTS
========================================================= */

router.get(
  "/received/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      const [payments] = await db.execute(
        `SELECT
           p.id,
           p.amount,
           p.purpose,
           p.status,
           p.created_at,
           u.name AS sender_name,
           u.email AS sender_email,
           u.role AS sender_role
         FROM payments p
         JOIN users u
           ON p.sender_id = u.id
         WHERE p.receiver_id = ?
         ORDER BY p.created_at DESC`,
        [userId]
      );

      res.json(payments);
    } catch (error) {
      console.error(
        "Received Payments Error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch received payments.",
      });
    }
  }
);

export default router;