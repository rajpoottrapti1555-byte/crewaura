import React from "react";
const features = [
  ["🔎", "Find the Right Crew", "Search workers based on skills, experience, location, availability and event requirements."],
  ["✓", "Verified Professionals", "View verified profiles, skills, experience, ratings and previous event work before hiring."],
  ["📅", "Workforce Management", "Manage event staff, assignments, schedules and attendance from one dashboard."],
  ["📍", "Smart Attendance", "Track event staff attendance using QR-based check-in and location verification."],
  ["💳", "Secure Payments", "Manage worker payments and milestones through a transparent payment workflow."],
  ["⭐", "Ratings & Reviews", "Build trust through worker ratings, reviews and professional portfolios."]
];

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="section-title">
        <h2>Everything You Need to Manage Your Crew</h2>
        <p>
          From finding the right professionals to managing attendance and
          payments, CrewAura simplifies the complete event workforce process.
        </p>
      </div>

      <div className="features">
        {features.map(([icon, title, description]) => (
          <div className="feature-card" key={title}>
            <div className="feature-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
