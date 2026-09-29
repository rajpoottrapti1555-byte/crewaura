import express from "express";
import db from "../db.js";

const router = express.Router();

// ==========================================
// GET ALL SERVICES
// GET /api/profile/services/all
// ==========================================

router.get("/services/all", async (req, res) => {
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

// ==========================================
// GET COMPLETE USER PROFILE
// GET /api/profile/:userId
// ==========================================

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get basic user information
    const [users] = await db.execute(
      `SELECT id, name, email, role, created_at
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];

    // ==========================================
    // PROFESSIONAL
    // ==========================================

    if (user.role === "professional") {
      const [profiles] = await db.execute(
        `SELECT
          id,
          user_id,
          phone,
          skills,
          experience_years,
          city,
          latitude,
          longitude,
          availability,
          bio,
          rating,
          created_at,
          previous_job,
          job_title,
          event_experience,
          certifications,
          languages,
          expected_rate
         FROM professional_profiles
         WHERE user_id = ?`,
        [userId],
      );

      if (profiles.length === 0) {
        return res.json({
          user,
          profile: null,
          services: [],
        });
      }

      const professionalProfile = profiles[0];

      const [services] = await db.execute(
        `SELECT
          ps.id,
          ps.service_id,
          sc.service_name,
          ps.is_primary,
          ps.specialization,
          ps.experience_years,
          ps.description,
          ps.other_service_name
         FROM professional_services ps
         JOIN service_categories sc
           ON ps.service_id = sc.id
         WHERE ps.professional_id = ?
         ORDER BY ps.is_primary DESC, sc.service_name ASC`,
        [professionalProfile.id],
      );

      return res.json({
        user,
        profile: professionalProfile,
        services,
      });
    }

    // ==========================================
    // ORGANIZER
    // ==========================================

    if (user.role === "organizer") {
      const [profiles] = await db.execute(
        `SELECT
          id,
          user_id,
          organization_name,
          phone,
          city,
          address,
          description,
          status,
          created_at,
          organization_type,
          experience_years,
          website,
          events_organized
         FROM organizer_profiles
         WHERE user_id = ?`,
        [userId],
      );

      if (profiles.length === 0) {
        return res.json({
          user,
          profile: null,
          services: [],
        });
      }

      const organizerProfile = profiles[0];

      const [services] = await db.execute(
        `SELECT
          os.id,
          os.service_id,
          sc.service_name,
          os.is_primary,
          os.specialization,
          os.experience_years,
          os.description,
          os.other_service_name
         FROM organizer_services os
         JOIN service_categories sc
           ON os.service_id = sc.id
         WHERE os.organizer_id = ?
         ORDER BY os.is_primary DESC, sc.service_name ASC`,
        [organizerProfile.id],
      );

      return res.json({
        user,
        profile: organizerProfile,
        services,
      });
    }

    // ==========================================
    // ADMIN
    // ==========================================

    return res.json({
      user,
      profile: null,
      services: [],
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    res.status(500).json({
      message: "Unable to fetch profile",
    });
  }
});

// ==========================================
// CREATE / UPDATE PROFESSIONAL PROFILE
// POST /api/profile/professional
// ==========================================

router.post("/professional", async (req, res) => {
  try {
    const {
      user_id,
      phone,
      skills,
      experience_years,
      city,
      latitude,
      longitude,
      availability,
      bio,
      previous_job,
      job_title,
      event_experience,
      certifications,
      languages,
      expected_rate,
      services,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id is required",
      });
    }

    // Check user
    const [users] = await db.execute(
      `SELECT id, role FROM users WHERE id = ?`,
      [user_id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (users[0].role !== "professional") {
      return res.status(400).json({
        message: "User is not a professional",
      });
    }

    // Check whether profile already exists
    const [existingProfile] = await db.execute(
      `SELECT id
       FROM professional_profiles
       WHERE user_id = ?`,
      [user_id],
    );

    let professionalId;

    if (existingProfile.length === 0) {
      // CREATE PROFILE
      const [result] = await db.execute(
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
          bio,
          previous_job,
          job_title,
          event_experience,
          certifications,
          languages,
          expected_rate
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          phone || null,
          skills || null,
          experience_years || 0,
          city || null,
          latitude || null,
          longitude || null,
          availability || "available",
          bio || null,
          previous_job || null,
          job_title || null,
          event_experience || null,
          certifications || null,
          languages || null,
          expected_rate || null,
        ],
      );

      professionalId = result.insertId;
    } else {
      // UPDATE PROFILE
      professionalId = existingProfile[0].id;

      await db.execute(
        `UPDATE professional_profiles
         SET
           phone = ?,
           skills = ?,
           experience_years = ?,
           city = ?,
           latitude = ?,
           longitude = ?,
           availability = ?,
           bio = ?,
           previous_job = ?,
           job_title = ?,
           event_experience = ?,
           certifications = ?,
           languages = ?,
           expected_rate = ?
         WHERE user_id = ?`,
        [
          phone || null,
          skills || null,
          experience_years || 0,
          city || null,
          latitude || null,
          longitude || null,
          availability || "available",
          bio || null,
          previous_job || null,
          job_title || null,
          event_experience || null,
          certifications || null,
          languages || null,
          expected_rate || null,
          user_id,
        ],
      );
    }

    // Save services
    if (Array.isArray(services)) {
      // Remove previous services
      await db.execute(
        `DELETE FROM professional_services
         WHERE professional_id = ?`,
        [professionalId],
      );

      // Add selected services
      for (const service of services) {
        if (!service.service_id) {
          continue;
        }

        await db.execute(
          `INSERT INTO professional_services
          (
            professional_id,
            service_id,
            is_primary,
            specialization,
            experience_years,
            description,
            other_service_name
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            professionalId,
            service.service_id,
            service.is_primary ? 1 : 0,
            service.specialization || null,
            service.experience_years || 0,
            service.description || null,
            service.other_service_name || null,
          ],
        );
      }
    }

    res.json({
      message: "Professional profile saved successfully",
      professional_id: professionalId,
    });
  } catch (error) {
    console.error("Save Professional Profile Error:", error);

    res.status(500).json({
      message: "Unable to save professional profile",
    });
  }
});

// ==========================================
// CREATE / UPDATE ORGANIZER PROFILE
// POST /api/profile/organizer
// ==========================================

router.post("/organizer", async (req, res) => {
  try {
    const {
      user_id,
      organization_name,
      phone,
      city,
      address,
      description,
      organization_type,
      experience_years,
      website,
      events_organized,
      services,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id is required",
      });
    }

    // Check user
    const [users] = await db.execute(
      `SELECT id, role FROM users WHERE id = ?`,
      [user_id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (users[0].role !== "organizer") {
      return res.status(400).json({
        message: "User is not an organizer",
      });
    }

    // Check whether organizer profile already exists
    const [existingProfile] = await db.execute(
      `SELECT id
       FROM organizer_profiles
       WHERE user_id = ?`,
      [user_id],
    );

    let organizerId;

    if (existingProfile.length === 0) {
      // CREATE PROFILE
      const [result] = await db.execute(
        `INSERT INTO organizer_profiles
        (
          user_id,
          organization_name,
          phone,
          city,
          address,
          description,
          organization_type,
          experience_years,
          website,
          events_organized
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          organization_name || null,
          phone || null,
          city || null,
          address || null,
          description || null,
          organization_type || null,
          experience_years || 0,
          website || null,
          events_organized || 0,
        ],
      );

      organizerId = result.insertId;
    } else {
      // UPDATE PROFILE
      organizerId = existingProfile[0].id;

      await db.execute(
        `UPDATE organizer_profiles
         SET
           organization_name = ?,
           phone = ?,
           city = ?,
           address = ?,
           description = ?,
           organization_type = ?,
           experience_years = ?,
           website = ?,
           events_organized = ?
         WHERE user_id = ?`,
        [
          organization_name || null,
          phone || null,
          city || null,
          address || null,
          description || null,
          organization_type || null,
          experience_years || 0,
          website || null,
          events_organized || 0,
          user_id,
        ],
      );
    }

    // Save organizer services
    if (Array.isArray(services)) {
      // Remove previous services
      await db.execute(
        `DELETE FROM organizer_services
         WHERE organizer_id = ?`,
        [organizerId],
      );

      // Add selected services
      for (const service of services) {
        if (!service.service_id) {
          continue;
        }

        await db.execute(
          `INSERT INTO organizer_services
          (
            organizer_id,
            service_id,
            is_primary,
            specialization,
            experience_years,
            description,
            other_service_name
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            organizerId,
            service.service_id,
            service.is_primary ? 1 : 0,
            service.specialization || null,
            service.experience_years || 0,
            service.description || null,
            service.other_service_name || null,
          ],
        );
      }
    }

    res.json({
      message: "Organizer profile saved successfully",
      organizer_id: organizerId,
    });
  } catch (error) {
    console.error("Save Organizer Profile Error:", error);

    res.status(500).json({
      message: "Unable to save organizer profile",
    });
  }
});
export default router;
