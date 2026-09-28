import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
        "http://localhost:5500/api/auth/login",
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
        // Save JWT token
        localStorage.setItem("token", data.token);

        // Save user information
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage("Login successful!");
        if (data.user.role === "admin") {
          navigate("/admin");
        }
       
         else if (data.user.role === "organizer") {
          navigate("/organizer");
        }

        // Redirect according to role
        setTimeout(() => {
          if (data.user.role === "admin") {
            navigate("/admin");
          } else if (data.user.role === "organizer") {
            navigate("/organizer");
          } else {
            navigate("/professional");
          }
        }, 500);

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

        <h1>Welcome Back</h1>
        <p>Login to your CrewAura account</p>

        <form onSubmit={handleSubmit}>

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
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="auth-btn"
          >
            Login
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-link">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;