import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  const [stats, setStats] = useState({
    professionals: 0,
    organizers: 0,
    events: 0,
    presentToday: 0,
  });

  const [admin, setAdmin] = useState({
    name: "Admin",
    email: "admin@crewaura.com",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        setAdmin({
          name: user.name || "Admin",
          email: user.email || "admin@crewaura.com",
        });
      } catch (error) {
        console.error("User data error:", error);
      }
    }

    fetchUsers();
    fetchEvents();

  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5500/api/admin/users"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      setUsers(data);

      const professionals = data.filter(
        (user) => user.role === "professional"
      ).length;

      const organizers = data.filter(
        (user) => user.role === "organizer"
      ).length;

      setStats((previous) => ({
        ...previous,
        professionals,
        organizers,
      }));
    } catch (error) {
      console.error("Admin dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5500/api/events/admin/all"
      );
  
      const data = await response.json();
  
      if (response.ok) {
        setEvents(data);
  
        setStats((previous) => ({
          ...previous,
          events: data.length,
        }));
      }
    } catch (error) {
      console.error("Fetch Admin Events Error:", error);
    }
  };
  

  const showSection = (section) => {
    setActiveSection(section);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  const viewDetails = (user) => {
    alert(
      `Name: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}`
    );
  };

  const renderDashboard = () => (
    <section className="dashboard-section active">
      <div className="section-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back to CrewAura Admin Panel.</p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchUsers}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon professionals-icon">
            👥
          </div>

          <div>
            <h3>Total Professionals</h3>
            <p className="stat-number">
              {stats.professionals}
            </p>
            <span className="stat-label">
              Registered professionals
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon organizers-icon">
            🏢
          </div>

          <div>
            <h3>Total Organizers</h3>
            <p className="stat-number">
              {stats.organizers}
            </p>
            <span className="stat-label">
              Registered organizers
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon events-icon">
            📅
          </div>

          <div>
            <h3>Total Events</h3>
            <p className="stat-number">
              {stats.events}
            </p>
            <span className="stat-label">
              Events created
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon attendance-icon">
            ✓
          </div>

          <div>
            <h3>Workers Present Today</h3>
            <p className="stat-number">
              {stats.presentToday}
            </p>
            <span className="stat-label">
              Today's attendance
            </span>
          </div>
        </div>

      </div>

      <div className="content-card">
        <div className="card-header">
          <div>
            <h2>Recent Users</h2>
            <p>Recently registered CrewAura users</p>
          </div>

          <button
            className="view-all-btn"
            onClick={() => showSection("professionals")}
          >
            View Users →
          </button>
        </div>

        {loading ? (
          <div className="loading">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            No users registered yet.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.slice(0, 5).map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span
                        className={`role-badge ${user.role}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      {user.created_at
                        ? new Date(
                            user.created_at
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <button
                        className="action-btn"
                        onClick={() =>
                          viewDetails(user)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );

  const renderProfessionals = () => {
    const professionals = users.filter(
      (user) => user.role === "professional"
    );

    return (
      <section className="dashboard-section active">
        <div className="section-header">
          <div>
            <h1>Professional Management</h1>
            <p>
              Manage CrewAura event professionals.
            </p>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <h2>Professionals</h2>
              <p>
                Total: {professionals.length}
              </p>
            </div>
          </div>

          {professionals.length === 0 ? (
            <div className="empty-state">
              No professionals registered.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {professionals.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span className="role-badge professional">
                          Professional
                        </span>
                      </td>

                      <td>
                        {user.created_at
                          ? new Date(
                              user.created_at
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        <button
                          className="action-btn"
                          onClick={() =>
                            viewDetails(user)
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderOrganizers = () => {
    const organizers = users.filter(
      (user) => user.role === "organizer"
    );

    return (
      <section className="dashboard-section active">
        <div className="section-header">
          <div>
            <h1>Organizer Management</h1>
            <p>
              Manage CrewAura event organizers.
            </p>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <h2>Organizers</h2>
              <p>
                Total: {organizers.length}
              </p>
            </div>
          </div>

          {organizers.length === 0 ? (
            <div className="empty-state">
              No organizers registered.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {organizers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span className="role-badge organizer">
                          Organizer
                        </span>
                      </td>

                      <td>
                        {user.created_at
                          ? new Date(
                              user.created_at
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        <button
                          className="action-btn"
                          onClick={() =>
                            viewDetails(user)
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderSimpleSection = (title, description) => (
    <section className="dashboard-section active">
      <div className="section-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <div className="content-card placeholder-card">
        <div className="placeholder-icon">⚙</div>
        <h2>{title}</h2>
        <p>
          This CrewAura module is ready for backend
          integration.
        </p>
      </div>
    </section>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "professionals":
        return renderProfessionals();

      case "organizers":
        return renderOrganizers();

     case "events":
  return (
    <section className="dashboard-section active">
      <div className="section-header">
        <div>
          <h1>Events</h1>
          <p>All events created by organizers.</p>
        </div>
      </div>

      <div className="content-card">
        {events.length === 0 ? (
          <div className="empty-state">
            No events created yet.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Location</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <strong>{event.title}</strong>
                    </td>
                    <td>{event.organizer_name}</td>
                    <td>{event.location}</td>
                    <td>{event.event_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );

      case "attendance":
        return renderSimpleSection(
          "Worker Attendance",
          "Monitor worker attendance and location verification."
        );

      case "settings":
        return renderSimpleSection(
          "Settings",
          "Manage CrewAura admin settings."
        );

      case "reports":
        return renderSimpleSection(
          "Reports",
          "View CrewAura platform reports and analytics."
        );

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">
            C
          </div>

          <div>
            <h2>CrewAura</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button
            className={
              activeSection === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              showSection("dashboard")
            }
          >
            <span>▣</span>
            Dashboard
          </button>

          <button
            className={
              activeSection === "professionals"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              showSection("professionals")
            }
          >
            <span>👥</span>
            Professional Management
          </button>

          <button
            className={
              activeSection === "organizers"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              showSection("organizers")
            }
          >
            <span>🏢</span>
            Organizer Management
          </button>

          <button
            className={
              activeSection === "events"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              showSection("events")
            }
          >
            <span>📅</span>
            Events
          </button>

          <button
            className={
              activeSection === "attendance"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              showSection("attendance")
            }
          >
            <span>✓</span>
            Worker Attendance
          </button>

          <div className="nav-divider"></div>

          <button
            className={
              activeSection === "settings"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              showSection("settings")
            }
          >
            <span>⚙</span>
            Settings
          </button>

          <button
            className={
              activeSection === "reports"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              showSection("reports")
            }
          >
            <span>📊</span>
            Reports
          </button>

        </nav>

        <div className="sidebar-bottom">
          <button
            className="logout-btn"
            onClick={logout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        <header className="topbar">

          <div className="mobile-title">
            <h2>CrewAura</h2>
          </div>

          <div className="admin-profile">

            <div className="admin-avatar">
              {admin.name.charAt(0).toUpperCase()}
            </div>

            <div className="admin-info">
              <strong>{admin.name}</strong>
              <span>{admin.email}</span>
            </div>

          </div>

        </header>

        <div className="page-content">
          {renderActiveSection()}
        </div>

      </main>

    </div>
  );




}
export default AdminDashboard;