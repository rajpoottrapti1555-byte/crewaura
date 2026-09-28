import { useEffect, useState } from "react";

function ProfessionalDashboard() {
 const user = JSON.parse(localStorage.getItem("user"));
 const [activeSection, setActiveSection] = useState("dashboard");
 const [assignedEvents, setAssignedEvents] = useState([]);
 const [attendanceMessage, setAttendanceMessage] = useState("");
 const [offers, setOffers] = useState([
    {
      id: 1,
      event: "Wedding Celebration",
      organizer: "Priya Events & Management",
      location: "Bhopal",
      date: "15 October 2026",
      role: "Event Staff",
      status: "Pending",
    },
    {
      id: 2,
      event: "Corporate Annual Meet",
      organizer: "Royal Events",
      location: "Indore",
      date: "22 October 2026",
      role: "Event Coordinator",
      status: "Pending",
    },
  ]);

  const [connections, setConnections] = useState([
    {
      id: 1,
      name: "Priya Sharma",
      company: "Priya Events & Management",
      location: "Bhopal",
    },
    {
      id: 2,
      name: "Rohan Mehta",
      company: "Royal Events",
      location: "Indore",
    },
  ]);

  const [profile] = useState({
    name: "Professional User",
    email: "professional@example.com",
    phone: "+91 9876543210",
    skill: "Event Management",
    experience: "2 Years",
    location: "Bhopal",
  });

  const handleOffer = (id, status) => {
    setOffers((previousOffers) =>
      previousOffers.map((offer) =>
        offer.id === id ? { ...offer, status } : offer
      )
    );
  };

  const fetchAssignedEvents = async () => {
    if (!user?.id) {
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost:5500/api/events/professional/${user.id}`
      );
  
      const data = await response.json();
  
      if (response.ok) {
        setAssignedEvents(data);
      } else {
        setAttendanceMessage(
          data.message || "Unable to load assigned events"
        );
      }
    } catch (error) {
      console.error("Fetch Assigned Events Error:", error);
  
      setAttendanceMessage(
        "Unable to connect to server"
      );
    }
  };
  useEffect(() => {
    fetchAssignedEvents();
  }, []);
  const markAttendance = (eventId) => {
    if (!navigator.geolocation) {
      setAttendanceMessage(
        "Geolocation is not supported by your browser."
      );
      return;
    }
  
    setAttendanceMessage("Getting your location...");
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `http://localhost:5500/api/events/${eventId}/attendance/check-in`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                professional_id: user.id,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              })
            }
          );
  
          const data = await response.json();
  
          if (response.ok) {
            setAttendanceMessage(
              `Attendance marked successfully. You are ${data.distance}m from the event.`
            );
  
            await fetchAssignedEvents();
          } else {
            setAttendanceMessage(
              data.message || "Attendance could not be marked."
            );
          }
  
        } catch (error) {
          console.error("Mark Attendance Error:", error);
  
          setAttendanceMessage(
            "Unable to connect to server."
          );
        }
      },
  
      (error) => {
        console.error("Geolocation Error:", error);
  
        if (error.code === 1) {
          setAttendanceMessage(
            "Location permission denied. Please allow location access."
          );
        } else if (error.code === 2) {
          setAttendanceMessage(
            "Unable to determine your location."
          );
        } else if (error.code === 3) {
          setAttendanceMessage(
            "Location request timed out."
          );
        } else {
          setAttendanceMessage(
            "Unable to get your location."
          );
        }
      },
  
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="professional-content">
            <h1>Professional Dashboard</h1>
            <p className="welcome-text">
              Welcome back, {profile.name} 👋
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Upcoming Events</h3>
                <h2>3</h2>
                <p>Events scheduled</p>
              </div>

              <div className="stat-card">
                <h3>Event Offers</h3>
                <h2>{offers.length}</h2>
                <p>Offers received</p>
              </div>

              <div className="stat-card">
                <h3>My Organizers</h3>
                <h2>{connections.length}</h2>
                <p>Connected organizers</p>
              </div>

              <div className="stat-card">
                <h3>Experience</h3>
                <h2>{profile.experience}</h2>
                <p>Professional experience</p>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>Upcoming Events</h2>

              <div className="event-item">
                <div>
                  <h3>Wedding Celebration</h3>
                  <p>📍 Bhopal</p>
                  <p>📅 15 October 2026</p>
                </div>

                <span className="event-status">Confirmed</span>
              </div>

              <div className="event-item">
                <div>
                  <h3>Corporate Annual Meet</h3>
                  <p>📍 Indore</p>
                  <p>📅 22 October 2026</p>
                </div>

                <span className="event-status">Confirmed</span>
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="professional-content">
            <h1>My Profile</h1>

            <div className="profile-card">
              <div className="profile-avatar">
                {profile.name.charAt(0)}
              </div>

              <h2>{profile.name}</h2>
              <p>Professional / Event Worker</p>

              <div className="profile-details">
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>

                <p>
                  <strong>Phone:</strong> {profile.phone}
                </p>

                <p>
                  <strong>Skill:</strong> {profile.skill}
                </p>

                <p>
                  <strong>Experience:</strong> {profile.experience}
                </p>

                <p>
                  <strong>Location:</strong> {profile.location}
                </p>
              </div>

              <button className="primary-btn">Edit Profile</button>
            </div>
          </div>
        );

      case "organizers":
        return (
          <div className="professional-content">
            <h1>Find Organizers</h1>
            <p className="section-description">
              Connect with event organizers and get more opportunities.
            </p>

            <div className="organizer-grid">
              {connections.map((organizer) => (
                <div className="organizer-card" key={organizer.id}>
                  <div className="organizer-avatar">
                    {organizer.name.charAt(0)}
                  </div>

                  <h3>{organizer.name}</h3>
                  <p>{organizer.company}</p>
                  <p>📍 {organizer.location}</p>

                  <button className="primary-btn">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "requests":
        return (
          <div className="professional-content">
            <h1>Connection Requests</h1>

            <div className="dashboard-card">
              <h3>New Connection Request</h3>

              <div className="request-item">
                <div>
                  <h3>Royal Events</h3>
                  <p>Rohan Mehta wants to connect with you.</p>
                </div>

                <div className="button-group">
                  <button className="accept-btn">Accept</button>
                  <button className="reject-btn">Reject</button>
                </div>
              </div>
            </div>
          </div>
        );

      case "my-organizers":
        return (
          <div className="professional-content">
            <h1>My Organizers</h1>

            <div className="organizer-grid">
              {connections.map((organizer) => (
                <div className="organizer-card" key={organizer.id}>
                  <div className="organizer-avatar">
                    {organizer.name.charAt(0)}
                  </div>

                  <h3>{organizer.name}</h3>
                  <p>{organizer.company}</p>
                  <p>📍 {organizer.location}</p>

                  <button className="secondary-btn">
                    Open Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "offers":
        return (
          <div className="professional-content">
            <h1>Event Offers</h1>
            <p className="section-description">
              Review event offers received from organizers.
            </p>

            <div className="offers-list">
              {offers.map((offer) => (
                <div className="offer-card" key={offer.id}>
                  <div>
                    <h2>{offer.event}</h2>

                    <p>
                      <strong>Organizer:</strong> {offer.organizer}
                    </p>

                    <p>
                      <strong>Location:</strong> {offer.location}
                    </p>

                    <p>
                      <strong>Date:</strong> {offer.date}
                    </p>

                    <p>
                      <strong>Role:</strong> {offer.role}
                    </p>
                  </div>

                  <div className="offer-actions">
                    {offer.status === "Pending" ? (
                      <>
                        <button
                          className="accept-btn"
                          onClick={() =>
                            handleOffer(offer.id, "Accepted")
                          }
                        >
                          Accept
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() =>
                            handleOffer(offer.id, "Rejected")
                          }
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="offer-status">
                        {offer.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "upcoming":
        return (
          <div className="professional-content">
            <h1>Upcoming Events</h1>

            <div className="dashboard-card">
              <div className="event-item">
                <div>
                  <h3>Wedding Celebration</h3>
                  <p>Organizer: Priya Events & Management</p>
                  <p>📍 Bhopal</p>
                  <p>📅 15 October 2026</p>
                </div>

                <span className="event-status">Confirmed</span>
              </div>

              <div className="event-item">
                <div>
                  <h3>Corporate Annual Meet</h3>
                  <p>Organizer: Royal Events</p>
                  <p>📍 Indore</p>
                  <p>📅 22 October 2026</p>
                </div>

                <span className="event-status">Confirmed</span>
              </div>
            </div>
          </div>
        );

      case "experience":
        return (
          <div className="professional-content">
            <h1>My Experience</h1>

            <div className="dashboard-card">
              <h2>Event Management</h2>
              <p>
                2 years of experience working in event management and
                event coordination.
              </p>

              <hr />

              <h3>Skills</h3>

              <div className="skills">
                <span>Event Management</span>
                <span>Event Coordination</span>
                <span>Team Management</span>
                <span>Guest Management</span>
              </div>
            </div>
          </div>
        );

      case "reviews":
        return (
          <div className="professional-content">
            <h1>Reviews</h1>

            <div className="review-card">
              <div className="review-header">
                <h3>Priya Sharma</h3>
                <span>⭐⭐⭐⭐⭐</span>
              </div>

              <p>
                Great professional. Very punctual and cooperative
                during the event.
              </p>
            </div>

            <div className="review-card">
              <div className="review-header">
                <h3>Rohan Mehta</h3>
                <span>⭐⭐⭐⭐</span>
              </div>

              <p>
                Good coordination and professional behaviour.
              </p>
            </div>
          </div>
        );

        case "attendance":
          return (
            <div className="professional-content">
        
              <h1>Attendance</h1>
        
              {attendanceMessage && (
                <div className="dashboard-card">
                  <p>{attendanceMessage}</p>
                </div>
              )}
        
              <div className="stats-grid">
        
                <div className="stat-card">
                  <h3>Total Events</h3>
                  <h2>{assignedEvents.length}</h2>
                  <p>Assigned events</p>
                </div>
        
                <div className="stat-card">
                  <h3>Present</h3>
                  <h2>
                    {
                      assignedEvents.filter(
                        (event) =>
                          event.attendance_status === "present"
                      ).length
                    }
                  </h2>
                  <p>Attendance marked</p>
                </div>
        
                <div className="stat-card">
                  <h3>Pending</h3>
                  <h2>
                    {
                      assignedEvents.filter(
                        (event) =>
                          event.attendance_status !== "present"
                      ).length
                    }
                  </h2>
                  <p>Attendance pending</p>
                </div>
        
              </div>
        
              <div className="dashboard-card">
        
                <h2>My Assigned Events</h2>
        
                {assignedEvents.length === 0 ? (
        
                  <p>
                    No events have been assigned to you yet.
                  </p>
        
                ) : (
        
                  assignedEvents.map((event) => (
        
                    <div
                      className="attendance-row"
                      key={event.id}
                    >
        
                      <div>
                        <strong>
                          {event.title}
                        </strong>
        
                        <p>
                          📍 {event.location || "Location not specified"}
                        </p>
        
                        <p>
                          📅 {event.event_date}
                        </p>
        
                        <p>
                          ⏰ {event.start_time || "--"} -
                          {" "}
                          {event.end_time || "--"}
                        </p>
        
                        {event.check_in && (
                          <p>
                            🕐 Check-in:{" "}
                            {new Date(
                              event.check_in
                            ).toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
        
                      <div>
        
                        {event.attendance_status === "present" ? (
        
                          <strong>
                            ✓ Present
                          </strong>
        
                        ) : (
        
                          <button
                            className="primary-btn"
                            onClick={() =>
                              markAttendance(event.id)
                            }
                          >
                            📍 Mark Attendance
                          </button>
        
                        )}
        
                      </div>
        
                    </div>
        
                  ))
        
                )}
        
              </div>
        
            </div>
          );
      case "earnings":
        return (
          <div className="professional-content">
            <h1>Earnings</h1>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Earnings</h3>
                <h2>₹35,000</h2>
              </div>

              <div className="stat-card">
                <h3>This Month</h3>
                <h2>₹12,000</h2>
              </div>

              <div className="stat-card">
                <h3>Pending</h3>
                <h2>₹5,000</h2>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>Payment History</h2>

              <div className="payment-row">
                <span>Wedding Celebration</span>
                <strong>₹10,000</strong>
              </div>

              <div className="payment-row">
                <span>Corporate Event</span>
                <strong>₹8,000</strong>
              </div>

              <div className="payment-row">
                <span>Birthday Event</span>
                <strong>₹7,000</strong>
              </div>
            </div>
          </div>
        );

      case "chat":
        return (
          <div className="professional-content">
            <h1>Organizer Chat</h1>

            <div className="chat-box">
              <div className="chat-header">
                <h3>Priya Sharma</h3>
                <span>Online</span>
              </div>

              <div className="messages">
                <div className="message received">
                  Hello! Are you available for our upcoming event?
                </div>

                <div className="message sent">
                  Yes, I am available.
                </div>

                <div className="message received">
                  Great! I will send you the event details.
                </div>
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                />
                <button className="primary-btn">Send</button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="professional-dashboard">

      {/* Sidebar */}
      <aside className="professional-sidebar">

        <div className="sidebar-logo">
          <h2>CrewAura</h2>
         
        </div>

        <nav>

          <button
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => setActiveSection("dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
            className={activeSection === "profile" ? "active" : ""}
            onClick={() => setActiveSection("profile")}
          >
            👤 My Profile
          </button>

          <button
            className={activeSection === "organizers" ? "active" : ""}
            onClick={() => setActiveSection("organizers")}
          >
            🔎 Find Organizers
          </button>

          <button
            className={activeSection === "requests" ? "active" : ""}
            onClick={() => setActiveSection("requests")}
          >
            🤝 Connection Requests
          </button>

          <button
            className={
              activeSection === "my-organizers" ? "active" : ""
            }
            onClick={() => setActiveSection("my-organizers")}
          >
            👥 My Organizers
          </button>

          <button
            className={activeSection === "offers" ? "active" : ""}
            onClick={() => setActiveSection("offers")}
          >
            📩 Event Offers
          </button>

          <button
            className={activeSection === "upcoming" ? "active" : ""}
            onClick={() => setActiveSection("upcoming")}
          >
            📅 Upcoming Events
          </button>

          <button
            className={activeSection === "experience" ? "active" : ""}
            onClick={() => setActiveSection("experience")}
          >
            💼 My Experience
          </button>

          <button
            className={activeSection === "reviews" ? "active" : ""}
            onClick={() => setActiveSection("reviews")}
          >
            ⭐ Reviews
          </button>

          <button
            className={activeSection === "attendance" ? "active" : ""}
            onClick={() => setActiveSection("attendance")}
          >
            📋 Attendance
          </button>

          <button
            className={activeSection === "earnings" ? "active" : ""}
            onClick={() => setActiveSection("earnings")}
          >
            💰 Earnings
          </button>

          <button
            className={activeSection === "chat" ? "active" : ""}
            onClick={() => setActiveSection("chat")}
          >
            💬 Organizer Chat
          </button>

        </nav>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          🚪 Logout
        </button>

      </aside>

      {/* Main Content */}
      <main className="professional-main">

        <header className="professional-topbar">
          <div>
            <h2>Professional Panel</h2>
          </div>

          <div className="topbar-right">
            <span className="notification">🔔</span>

            <div className="top-profile">
              <div className="small-avatar">
                {profile.name.charAt(0)}
              </div>

              <span>{profile.name}</span>
            </div>
          </div>
        </header>

        {renderSection()}

      </main>

    </div>
  );
}

export default ProfessionalDashboard;