import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import CTA from "../components/CTA";
import AuthModal from "../components/AuthModal";

function Home() {
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  return (
  <>
    <Navbar />

    <div className="crewaura-page">
      <Hero onOpenModal={openModal} />

      <Features />

      <HowItWorks />

      <CTA onOpenModal={openModal} />

      <AuthModal
        type={modalType}
        onClose={closeModal}
      />
    </div>
  </>
);
}

export default Home;