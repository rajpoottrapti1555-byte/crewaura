import React from "react";
export default function CTA({ onOpenModal }) {
  return (
    <section className="cta" id="about">
      <h2>Your Event Deserves the Right Crew.</h2>
      <p>Find skilled and verified event professionals with CrewAura.</p>
      <button onClick={() => onOpenModal("signup")}>Get Started</button>
    </section>
  );
}
