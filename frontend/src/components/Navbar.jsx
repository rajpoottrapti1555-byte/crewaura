import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">CrewAura</Link>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <a href="#events">Events</a>
        <a href="#jobs">Find Jobs</a>
        <a href="#about">About</a>
      </div>

      <div className="nav-buttons">
        <Link to="/login">
          <button className="login-btn">Login</button>
        </Link>

        <Link to="/register">
          <button className="register-btn">Register</button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;