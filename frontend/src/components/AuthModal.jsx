import { useEffect } from "react";

export default function AuthModal({ type, onClose }) {
  const isLogin = type === "login";
  const isOpen = Boolean(type);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Welcome to CrewAura! Your account action has been submitted.");
    onClose();
  };

  return (
    <div className="modal" style={{ display: "flex" }} onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <span className="close" onClick={onClose}>×</span>

        <h2>{isLogin ? "Welcome Back" : "Create Your Account"}</h2>

        <p>
          {isLogin
            ? "Login to your CrewAura organizer account."
            : "Join CrewAura and start managing your event workforce."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group" id="roleGroup">
              <label>Account Type</label>
              <select defaultValue="Event Organizer">
                <option>Event Organizer</option>
                <option>Event Professional</option>
              </select>
            </div>
          )}

          <button className="submit-btn" type="submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
