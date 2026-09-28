import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "professional"
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5500/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful!");

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setMessage(data.message);
      }

    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        <h1>Create Account</h1>
        <p>Join CrewAura</p>

        <form onSubmit={handleSubmit}>

          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Account Type</label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="professional">
              Event Professional
            </option>

            <option value="organizer">
              Event Organizer
            </option>
          </select>

          <button
            type="submit"
            className="auth-btn"
          >
            Register
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-link">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;