import React from "react";
const steps = [
  ["1", "Create Event", "Add your event details, date, location and required workforce."],
  ["2", "Find Workers", "Discover professionals matching your event requirements."],
  ["3", "Hire Crew", "Review profiles and confirm the professionals you need."],
  ["4", "Manage Event", "Track attendance, assignments, payments and performance."]
];

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="section-title">
        <h2>How CrewAura Works</h2>
        <p>Hiring event professionals becomes simple in four easy steps.</p>
      </div>

      <div className="steps">
        {steps.map(([number, title, description]) => (
          <div className="step" key={number}>
            <div className="step-number">{number}</div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
