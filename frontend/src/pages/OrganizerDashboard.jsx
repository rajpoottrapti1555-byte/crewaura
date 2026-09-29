import { useEffect, useState } from "react";
import "./OrganizerDashboard.css";

function OrganizerDashboard() {

  const user = JSON.parse(localStorage.getItem("user"));

  const [events, setEvents] = useState([]);
const [organizers, setOrganizers] = useState([]);
const [professionals, setProfessionals] = useState([]);
const [selectedProfessionals, setSelectedProfessionals] = useState([]);
const [connectionRequests, setConnectionRequests] = useState([]);
const [connections, setConnections] = useState([]);
const [eventAttendance, setEventAttendance] = useState([]);
const [selectedAttendanceEvent, setSelectedAttendanceEvent] = useState(null);
const [eventProfessionals, setEventProfessionals] = useState({});

const [selectedChat, setSelectedChat] = useState(null);
const [selectedChatEvent, setSelectedChatEvent] = useState(null);

const [messages, setMessages] = useState([]);
const [messageText, setMessageText] = useState("");




  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    event_date: "",
    start_time: "",
    end_time: ""
  });

  const [message, setMessage] = useState("");

  const [activeSection, setActiveSection] = useState("dashboard");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New connection request",
      text: "A professional has sent you a connection request.",
      unread: true
    },
    {
      id: 2,
      title: "Event reminder",
      text: "Tech Summit 2026 is coming up soon.",
      unread: true
    },
    {
      id: 3,
      title: "Payment update",
      text: "A payment status has been updated.",
      unread: true
    },
    {
      id: 4,
      title: "New professional",
      text: "A new professional matches your requirements.",
      unread: true
    }
  ]);

  const titles = {
    dashboard: "Organizer Dashboard",
    profile: "Organizer Profile",
    createEvent: "Create New Event",
    events: "My Events",
    organizers: "Find Organizers",
    workers: "Find Professionals",
    requests: "Connection Requests",
    connections: "My Connections",
    team: "Manage Event Team",
    chat: "Messages",
    attendance: "Worker Attendance",
    payments: "Payments"
  };

  const showSection = (section) => {
    setActiveSection(section);
    setNotificationsOpen(false);
    setMessage("");
  };

  const handleConnect = async (receiverId, receiverName) => {
    try {
      console.log("CURRENT USER:", user);
      console.log("SENDER ID:", user?.id);
      console.log("RECEIVER ID:", receiverId);
  
      if (!user?.id) {
        setMessage("User login information not found");
        return;
      }
  
      if (!receiverId) {
        setMessage("Professional/Organizer ID not found");
        return;
      }
  
      const response = await fetch(
        "http://localhost:5500/api/connections/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_id: Number(user.id),
            receiver_id: Number(receiverId),
            message: "I would like to connect with you.",
          }),
        }
      );
  
      const data = await response.json();
  
      console.log("Connection Response:", data);
  
      if (response.ok) {
        setMessage(`Connection request sent to ${receiverName}`);
        fetchConnectionRequests();
      } else {
        setMessage(data.message || "Unable to send connection request");
      }
  
    } catch (error) {
      console.error("Connection Error:", error);
      setMessage("Unable to connect to server");
    }
  };





  const handleProfessionalSelection = (professionalId) => {
  setSelectedProfessionals((prev) => {
    if (prev.includes(professionalId)) {
      return prev.filter((id) => id !== professionalId);
    }

    return [...prev, professionalId];
  });
};
  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(
        `http://localhost:5500/api/connections/${requestId}/accept`,
        {
          method: "PUT",
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage("Connection request accepted");
        fetchConnectionRequests();
      } else {
        setMessage(data.message || "Unable to accept request");
      }
    } catch (error) {
      console.error("Accept Request Error:", error);
      setMessage("Unable to connect to server");
    }
  };
  
  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(
        `http://localhost:5500/api/connections/${requestId}/reject`,
        {
          method: "PUT",
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage("Connection request rejected");
        fetchConnectionRequests();
      } else {
        setMessage(data.message || "Unable to reject request");
      }
    } catch (error) {
      console.error("Reject Request Error:", error);
      setMessage("Unable to connect to server");
    }
  };


  const handleViewProfile = (userId) => {
    console.log("Viewing profile:", userId);
  
    // Next step me yahan profile page open karenge
  };
  const fetchEvents = async () => {
    if (!user?.id) {
      setMessage("Organizer login information not found");
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost:5500/api/events/organizer/${user.id}`
      );
  
      const data = await response.json();
  
      if (response.ok) {
        setEvents(data);
      
        data.forEach((event) => {
          fetchEventProfessionals(event.id);
        });
      } else {
        setMessage(data.message || "Unable to load events");
      }
    } catch (error) {
      console.error("Fetch Events Error:", error);
      setMessage("Unable to connect to server");
    }
  };



  //fetch organizers
  const fetchOrganizers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5500/api/organizers"
      );
  
      const data = await response.json();
  
      console.log("Organizers:", data);
  
      if (response.ok) {
        setOrganizers(data);
      } else {
        setMessage(data.message || "Unable to load organizers");
      }
    } catch (error) {
      console.error("Fetch Organizers Error:", error);
      setMessage("Unable to connect to server");
    }
  };

  //fetchprofessional
  const fetchProfessionals = async () => {
    try {
      const response = await fetch(
        "http://localhost:5500/api/professionals"
      );
  
      const data = await response.json();
  
      console.log("Professionals:", data);
  
      if (response.ok) {
        setProfessionals(data);
      } else {
        setMessage(data.message || "Unable to load professionals");
      }
    } catch (error) {
      console.error("Fetch Professionals Error:", error);
      setMessage("Unable to connect to server");
    }
  };
  //fetchconnection



  const fetchConnectionRequests = async () => {
    try {
      if (!user?.id) {
        return;
      }
  
      const response = await fetch(
        `http://localhost:5500/api/connections/requests/${user.id}`
      );
  
      const data = await response.json();
  
      console.log("Connection Requests:", data);
  
      if (response.ok) {
        setConnectionRequests(data);
      } else {
        setMessage(
          data.message || "Unable to load connection requests"
        );
      }
    } catch (error) {
      console.error("Fetch Connection Requests Error:", error);
      setMessage("Unable to connect to server");
    }
  };
//fetch connection


const fetchConnections = async () => {
  try {
    if (!user?.id) {
      return;
    }

    const response = await fetch(
      `http://localhost:5500/api/connections/${user.id}`
    );

    const data = await response.json();

    console.log("My Connections:", data);

    if (response.ok) {
      setConnections(data);
    } else {
      setMessage(data.message || "Unable to load connections");
    }
  } catch (error) {
    console.error("Fetch Connections Error:", error);
    setMessage("Unable to connect to server");
  }
};

const fetchEventAttendance = async (eventId) => {
  try {
    const response = await fetch(
      `http://localhost:5500/api/events/${eventId}/attendance`
    );

    const data = await response.json();

    if (response.ok) {
      setEventAttendance(data);
      setSelectedAttendanceEvent(eventId);
    } else {
      setMessage(data.message || "Unable to load attendance");
    }
  } catch (error) {
    console.error("Fetch Attendance Error:", error);
    setMessage("Unable to connect to server");
  }
};


const fetchEventProfessionals = async (eventId) => {
  try {
    const response = await fetch(
      `http://localhost:5500/api/events/${eventId}/professionals`
    );

    const data = await response.json();

    if (response.ok) {
      setEventProfessionals((previous) => ({
        ...previous,
        [eventId]: data
      }));
    } else {
      setMessage(
        data.message || "Unable to load event professionals"
      );
    }

  } catch (error) {
    console.error(
      "Fetch Event Professionals Error:",
      error
    );

    setMessage("Unable to connect to server");
  }
};

const updateAttendance = async (eventId, professionalId, status) => {
  try {
    const response = await fetch(
      `http://localhost:5500/api/events/${eventId}/attendance/${professionalId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setMessage("Attendance updated successfully");
      fetchEventAttendance(eventId);
    } else {
      setMessage(data.message || "Unable to update attendance");
    }
  } catch (error) {
    console.error("Update Attendance Error:", error);
    setMessage("Unable to connect to server");
  }
};



  useEffect(() => {
    fetchEvents(); 
    fetchOrganizers();
    fetchProfessionals();
    fetchConnectionRequests();
    fetchConnections();
  }, []);
  useEffect(() => {
    if (!selectedChat || !selectedChatEvent || !user?.id) {
      setMessages([]);
      return;
    }
  
    const loadMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5500/api/messages/${selectedChatEvent.id}/${user.id}/${selectedChat.id}`
        );
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load messages"
          );
        }
  
        setMessages(data);
  
        // Mark received messages as read
        await fetch(
          `http://localhost:5500/api/messages/read/${selectedChatEvent.id}/${user.id}/${selectedChat.id}`,
          {
            method: "PUT",
          }
        );
  
      } catch (error) {
        console.error("Load Messages Error:", error);
        setMessages([]);
      }
    };
  
    loadMessages();
  
  }, [selectedChat, selectedChatEvent, user?.id]);




  const handleSendMessage = async (e) => {
    e.preventDefault();
  
    if (!messageText.trim()) {
      return;
    }
  
    if (!selectedChat || !selectedChatEvent || !user?.id) {
      return;
    }
  
    try {
      const response = await fetch(
        "http://localhost:5500/api/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_id: selectedChatEvent.id,
            sender_id: user.id,
            receiver_id: selectedChat.id,
            message: messageText.trim(),
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send message"
        );
      }
  
      setMessages((previousMessages) => [
        ...previousMessages,
        data.data,
      ]);
  
      setMessageText("");
  
    } catch (error) {
      console.error("Send Message Error:", error);
      alert(error.message);
    }
  };

  
  
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };
  
   const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Gconstet organizer login information
      if (!user?.id) {
        setMessage("Organizer login information not found.");
        return;
      }
  
      // Check browser GPS support
      if (!navigator.geolocation) {
        setMessage(
          "Geolocation is not supported by your browser."
        );
        return;
      }
  
      setMessage("Getting event location...");
  
      // Get organizer's current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
  
            console.log("Event Latitude:", latitude);
            console.log("Event Longitude:", longitude);
  
            const response = await fetch(
              "http://localhost:5500/api/events",
              {
                method: "POST",
  
                headers: {
                  "Content-Type": "application/json",
                },
  
                body: JSON.stringify({
                  organizer_id: user.id,
  
                  title: formData.title,
                  description: formData.description,
                  location: formData.location,
  
                  // GPS location of event
                  latitude: latitude,
                  longitude: longitude,
  
                  event_date: formData.event_date,
                  start_time: formData.start_time,
                  end_time: formData.end_time,
                }),
              }
            );
  
            const data = await response.json();
  
            if (response.ok) {
              setMessage(
                "Event created successfully with GPS location."
              );
  
              // Refresh organizer events
              fetchEvents();
            } else {
              setMessage(
                data.message || "Unable to create event."
              );
            }
  
          } catch (error) {
            console.error(
              "Create Event Error:",
              error
            );
  
            setMessage(
              "Unable to create event."
            );
          }
        },
  
        (error) => {
          console.error(
            "Event Location Error:",
            error
          );
  
          if (error.code === 1) {
            setMessage(
              "Location permission denied. Please allow location access."
            );
          } else if (error.code === 2) {
            setMessage(
              "Unable to determine your location."
            );
          } else if (error.code === 3) {
            setMessage(
              "Location request timed out."
            );
          } else {
            setMessage(
              "Unable to get event location."
            );
          }
        },
  
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
  
    } catch (error) {
      console.error(error);
  
      setMessage(
        "Something went wrong."
      );
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
  
    const start = new Date(
      `${event.event_date}T${event.start_time || "00:00"}`
    );
  
    const end = new Date(
      `${event.event_date}T${event.end_time || "23:59"}`
    );
  
    if (now < start) {
      return "Upcoming";
    }
  
    if (now >= start && now <= end) {
      return "Ongoing";
    }
  
    return "Completed";
  };


  const markAllRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        unread: false
      }))
    );
  };

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <div className="crew-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="crew-sidebar">

        {/* Logo */}

        <div className="crew-logo">
          <div className="crew-logo-icon">C</div>
          <span>CrewAura</span>
        </div>

        {/* Navigation */}

        <nav className="crew-nav">

          <button
            className={`crew-nav-item ${
              activeSection === "dashboard" ? "active" : ""
            }`}
            onClick={() => showSection("dashboard")}
          >
            <span className="nav-icon">▣</span>
            <span className="nav-label">Dashboard</span>
          </button>

          <button
            className={`crew-nav-item ${
              activeSection === "profile" ? "active" : ""
            }`}
            onClick={() => showSection("profile")}
          >
            <span className="nav-icon">♙</span>
            <span className="nav-label">My Profile</span>
          </button>

          <button
            className={`crew-nav-item ${
              activeSection === "createEvent" ? "active" : ""
            }`}
            onClick={() => showSection("createEvent")}
          >
            <span className="nav-icon">＋</span>
            <span className="nav-label">Create Event</span>
          </button>

          <button
            className={`crew-nav-item ${
              activeSection === "events" ? "active" : ""
            }`}
            onClick={() => showSection("events")}
          >
            <span className="nav-icon">▤</span>
            <span className="nav-label">My Events</span>
          </button>

          <div className="crew-menu-title">
            Connections
          </div>

          <button
            className={`crew-nav-item ${
              activeSection === "organizers" ? "active" : ""
            }`}
            onClick={() => showSection("organizers")}
          >
            <span className="nav-icon">⌕</span>
            <span className="nav-label">Find Organizers</span>
          </button>

          <button
            className={`crew-nav-item ${
              activeSection === "workers" ? "active" : ""
            }`}
            onClick={() => showSection("workers")}
          >
            <span className="nav-icon">♙</span>
            <span className="nav-label">Find Professionals</span>
          </button>

          <button
            className={`crew-nav-item ${
              activeSection === "requests" ? "active" : ""
            }`}
            onClick={() => showSection("requests")}
          >
            <span className="nav-icon">↔</span>
            <span className="nav-label">
              Connection Requests
            </span>
          </button>

          <button
            className={`crew-nav-item ${
              activeSection === "connections" ? "active" : ""
            }`}
            onClick={() => showSection("connections")}
          >
            <span className="nav-icon">♧</span>
            <span className="nav-label">
              My Connections
            </span>
          </button>

          <div className="crew-menu-title">
            Event Management
          </div>

          <button
            className={`crew-nav-item ${
              activeSection === "team" ? "active" : ""
            }`}
            onClick={() => showSection("team")}
          >
            <span className="nav-icon">♟</span>
            <span className="nav-label">Selected Team</span>
          </button>

          <button
            className={`crew-nav-item ${
              activeSection === "chat" ? "active" : ""
            }`}
            onClick={() => showSection("chat")}
          >
            <span className="nav-icon">▱</span>
            <span className="nav-label">Messages</span>
          </button>

          <button
            className={`crew-nav-item ${
              activeSection === "attendance" ? "active" : ""
            }`}
            onClick={() => showSection("attendance")}
          >
            <span className="nav-icon">✓</span>
            <span className="nav-label">Attendance</span>
          </button>

          <button
            className={`crew-nav-item ${
              activeSection === "payments" ? "active" : ""
            }`}
            onClick={() => showSection("payments")}
          >
            <span className="nav-icon">₹</span>
            <span className="nav-label">Payments</span>
          </button>

        </nav>

        {/* Organizer */}

        <div className="crew-sidebar-profile">

          <div className="crew-profile-avatar">
            PS
          </div>

          <div className="crew-profile-text">
            <strong>Priya Sharma</strong>
            <span>Event Organizer</span>
          </div>

        </div>
        

      </aside>

      {/* ================= MAIN AREA ================= */}

      <main className="crew-main">

        {/* TOPBAR */}

        <header className="crew-topbar">

          <div className="crew-page-heading">
            <h1>{titles[activeSection]}</h1>
            <p>
              Manage your events, connections and workforce
            </p>
          </div>

          <div className="crew-notification-wrapper">

            <button
              className="crew-notification-button"
              onClick={() =>
                setNotificationsOpen(!notificationsOpen)
              }
            >
              <span className="notification-icon">
                ♧
              </span>

              {unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="crew-notification-panel">

                <div className="notification-panel-header">
                  <strong>Notifications</strong>

                  <button onClick={markAllRead}>
                    Mark all as read
                  </button>
                </div>

                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`crew-notification-item ${
                      notification.unread ? "unread" : ""
                    }`}
                  >
                    <div className="notification-item-dot"></div>

                    <div>
                      <strong>
                        {notification.title}
                      </strong>

                      <p>
                        {notification.text}
                      </p>
                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <div className="crew-content">

          {/* ================= DASHBOARD ================= */}

          {activeSection === "dashboard" && (
            <section className="crew-section">

              <div className="crew-stats-grid">

                <div className="crew-stat-card">
                  <div className="crew-stat-icon">
                    ▤
                  </div>

                  <div>
                    <span>Total Events</span>
                    <strong>24</strong>
                  </div>
                </div>

                <div className="crew-stat-card">
                  <div className="crew-stat-icon">
                    ♧
                  </div>

                  <div>
                    <span>Connected People</span>
                    <strong>0</strong>
                  </div>
                </div>

                <div className="crew-stat-card">
                  <div className="crew-stat-icon">
                    ◉
                  </div>

                  <div>
                    <span>Active Events</span>
                    <strong>5</strong>
                  </div>
                </div>

                <div className="crew-stat-card">
                  <div className="crew-stat-icon">
                    ₹
                  </div>

                  <div>
                    <span>Total Budget</span>
                    <strong>₹8.4L</strong>
                  </div>
                </div>

              </div>

              <div className="crew-section-heading">
                <h2>Upcoming Events</h2>

                <button
                  className="crew-primary-button"
                  onClick={() =>
                    showSection("createEvent")
                  }
                >
                  + Create Event
                </button>
              </div>

              <div className="crew-event-grid">

                <div className="crew-event-card">

                  <div className="event-card-status">
                    Active
                  </div>

                  <h3>Tech Summit 2026</h3>

                  <div className="event-info">
                    <span>📍 Bhopal</span>
                    <span>📅 28 September 2026</span>
                    <span>👥 85 Workers</span>
                  </div>

                  <button
                    className="crew-outline-button"
                    onClick={() =>
                      showSection("events")
                    }
                  >
                    View Event
                  </button>

                </div>

                <div className="crew-event-card">

                  <div className="event-card-status">
                    Active
                  </div>

                  <h3>Grand Wedding</h3>

                  <div className="event-info">
                    <span>📍 Indore</span>
                    <span>📅 30 September 2026</span>
                    <span>👥 52 Workers</span>
                  </div>

                  <button
                    className="crew-outline-button"
                    onClick={() =>
                      showSection("events")
                    }
                  >
                    View Event
                  </button>

                </div>

                <div className="crew-event-card">

                  <div className="event-card-status">
                    Active
                  </div>

                  <h3>Corporate Leadership Meet</h3>

                  <div className="event-info">
                    <span>📍 Bhopal</span>
                    <span>📅 05 October 2026</span>
                    <span>👥 40 Workers</span>
                  </div>

                  <button
                    className="crew-outline-button"
                    onClick={() =>
                      showSection("events")
                    }
                  >
                    View Event
                  </button>

                </div>

              </div>

            </section>
          )}

          {/* ================= PROFILE ================= */}
          {activeSection === "profile" && (
  <section className="crew-section">

    <div className="crew-profile-layout">

      <div className="crew-profile-card">

        <div className="crew-large-avatar">
          {user?.name
            ? user.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()
            : "OR"}
        </div>

        <h2>{user?.name || "Organizer"}</h2>

        <p>
          Professional Event Organizer
        </p>

        <span className="crew-verified">
          ✓ Aadhaar Verified
        </span>

      </div>

      <div className="crew-profile-information">

        <div className="crew-info-row">
          <span>Phone</span>
          <strong>+91 XXXXX XXXXX</strong>
        </div>

        <div className="crew-info-row">
          <span>Email</span>
          <strong>
            {user?.email || "organizer@example.com"}
          </strong>
        </div>

        <div className="crew-info-row">
          <span>Aadhaar</span>
          <strong>
            XXXX XXXX 1234
          </strong>
        </div>

        <div className="crew-info-row">
          <span>Address</span>
          <strong>
            Bhopal, Madhya Pradesh
          </strong>
        </div>

        <div className="crew-info-row">
          <span>Organization</span>
          <strong>
            CrewAura Events
          </strong>
        </div>

      </div>

    </div>

  

              <div className="crew-form-card">

                <h2>Organization Information</h2>

                <div className="crew-form-grid">

                  <div className="crew-form-group">
                    <label>Organization Name</label>
                    <input
                      type="text"
                      value="CrewAura Events"
                      readOnly
                    />
                  </div>

                  <div className="crew-form-group">
                    <label>Organization Type</label>
                    <input
                      type="text"
                      value="Event Management"
                      readOnly
                    />
                  </div>

                </div>

              </div>

            </section>
          )}

          {/* ================= CREATE EVENT ================= */}

          {activeSection === "createEvent" && (
            <section className="crew-section">

              <div className="crew-form-card">

                <h2>Create New Event</h2>
                <form onSubmit={handleSubmit}>

                <div className="crew-form-grid">

                  <div className="crew-form-group">
                    <label>Event Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                      placeholder="Enter event title"
                     />
                  </div>

                  <div className="crew-form-group">
                    <label>Event Type</label>

                    <select>
                      <option>Select Event Type</option>
                      <option>Conference</option>
                      <option>Exhibition</option>
                      <option>Wedding</option>
                      <option>Corporate Event</option>
                      <option>Concert</option>
                      <option>Sports Tournament</option>
                      <option>Cultural Festival</option>
                    </select>
                  </div>

                  <div className="crew-form-group">
                    <label>Start Date</label>

                    <input
  type="date"
  name="event_date"
  value={formData.event_date}
  onChange={handleChange}
/>
                  </div>

                  <div className="crew-form-group">
                    <label>Location</label>

                    <input
  type="text"
  name="location"
  value={formData.location}
  onChange={handleChange}
  placeholder="Enter event location"
/>
                  </div>

                  <div className="crew-form-group">
                    <label>Expected Guests</label>

                    <input
                      type="number"
                      placeholder="Number of guests"
                    />
                  </div>

                  <div className="crew-form-group">
                    <label>Budget</label>

                    <input
                      type="text"
                      placeholder="₹ Enter budget"
                    />
                  </div>

                </div>

                <div className="crew-form-group crew-full-width">

                  <label>Event Description</label>

                 <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
               rows="6"
              ></textarea>

                </div>
                <div className="crew-form-group crew-full-width">
  <label>Select Team for This Event</label>

  {professionals.length === 0 ? (
    <div className="crew-empty-state">
      <h3>No professionals found</h3>
      <p>Registered professionals will appear here.</p>
    </div>
  ) : (
    <div className="crew-people-grid">
      {professionals.map((professional) => {
        const isSelected = selectedProfessionals.includes(
          professional.id
        );

        return (
          <div
            className="crew-person-card"
            key={professional.id}
          >
            <div className="crew-person-avatar">
              {professional.name
                ? professional.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                : "PR"}
            </div>

            <h3>{professional.name}</h3>

            <p>Event Professional</p>

            <span>📧 {professional.email}</span>

            <button
              type="button"
              className={
                isSelected
                  ? "crew-team-button selected"
                  : "crew-team-button"
              }
              onClick={() =>
                handleProfessionalSelection(professional.id)
              }
            >
              {isSelected ? "✓ Selected" : "+ Select Team"}
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>
                <button className="crew-primary-button">
                  Create Event
                </button>
                </form>
              </div>

            </section>
          )}

{/* ================= MY EVENTS ================= */}
{activeSection === "events" && (
  <section className="crew-section">

    <div className="crew-section-heading">
      <h2>My Events</h2>

      <button
        className="crew-primary-button"
        onClick={() => showSection("createEvent")}
      >
        + Create Event
      </button>
    </div>

    {events.length === 0 ? (
      <div className="crew-empty-state">
        <div className="empty-icon">▤</div>

        <h3>No events found</h3>

        <p>
          Events created by you will appear here.
        </p>
      </div>
    ) : (
      <div className="crew-event-grid">

        {events.map((event) => (
          <div
            className="crew-event-card"
            key={event.id}
          >

            <div className="event-card-status">
            <span>{getEventStatus(event)}</span>
            </div>

            <h3>{event.title}</h3>

            <div className="event-info">

              <span>
                📍 {event.location || "Location not specified"}
              </span>

              <span>
                📅 {event.event_date
                  ? new Date(event.event_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    })
                  : "Date not specified"}
              </span>

              <span>
  👥{" "}
  {eventProfessionals[event.id]
    ? `${eventProfessionals[event.id].length} Professionals`
    : "Loading team..."}
</span>

            </div>

            {event.description && (
              <p>
                {event.description}
              </p>
            )}
             <button
  className="crew-primary-button"
  onClick={() => {
    fetchEventProfessionals(event.id);
    fetchEventAttendance(event.id);
  }}
>
  View Team & Attendance
</button>
          </div>
        ))}

      </div>
    )}

  </section>
)}


{selectedAttendanceEvent && (
  <section className="crew-section">

    <div className="crew-section-heading">
      <h2>Team & Attendance</h2>

      <button
        className="crew-secondary-button"
        onClick={() => {
          setSelectedAttendanceEvent(null);
          setEventAttendance([]);
        }}
      >
        Close
      </button>
    </div>

    {eventProfessionals[selectedAttendanceEvent]?.length === 0 ? (
      <div className="crew-empty-state">
        <h3>No professionals assigned</h3>
        <p>
          No team members have been assigned to this event.
        </p>
      </div>
    ) : (
      <div className="crew-people-grid">

        {eventProfessionals[selectedAttendanceEvent]?.map(
          (professional) => {

            const attendance = eventAttendance.find(
              (person) =>
                person.professional_id ===
                professional.professional_id
            );

            return (
              <div
                className="crew-person-card"
                key={professional.professional_id}
              >

                <div className="crew-person-avatar">
                  {professional.name
                    ? professional.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()
                    : "PR"}
                </div>

                <h3>{professional.name}</h3>

                <p>
                  📧 {professional.email}
                </p>

                <p>
                  Status:{" "}
                  <strong>
                    {attendance?.status || "Absent"}
                  </strong>
                </p>

                <p>
                  Check-in:{" "}
                  {attendance?.check_in
                    ? new Date(
                        attendance.check_in
                      ).toLocaleString("en-IN")
                    : "Not checked in"}
                </p>

                <div className="attendance-buttons">

                  <button
                    type="button"
                    className={
                      attendance?.status === "present"
                        ? "attendance-button active-present"
                        : "attendance-button"
                    }
                    onClick={() =>
                      updateAttendance(
                        selectedAttendanceEvent,
                        professional.professional_id,
                        "present"
                      )
                    }
                  >
                    ✓ Present
                  </button>

                  <button
                    type="button"
                    className={
                      attendance?.status === "absent"
                        ? "attendance-button active-absent"
                        : "attendance-button"
                    }
                    onClick={() =>
                      updateAttendance(
                        selectedAttendanceEvent,
                        professional.professional_id,
                        "absent"
                      )
                    }
                  >
                    ✕ Absent
                  </button>

                </div>

              </div>
            );
          }
        )}

      </div>
    )}
  </section>
)}

{/* ================= FIND ORGANIZERS ================= */}
{activeSection === "organizers" && (
  <section className="crew-section">

    <div className="crew-section-heading">
      <div>
        <h2>Find Organizers</h2>
        <p>
          Connect with event organizers.
        </p>
      </div>
    </div>

    {organizers.length === 0 ? (
      <div className="crew-empty-state">
        <div className="empty-icon">♧</div>

        <h3>No organizers found</h3>

        <p>
          Registered organizers will appear here.
        </p>
      </div>
    ) : (
      <div className="crew-people-grid">

        {organizers.map((organizer) => (
          <div
            className="crew-person-card"
            key={organizer.id}
          >

            <div className="crew-person-avatar">
              {organizer.name
                ? organizer.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                : "OR"}
            </div>

            <h3>{organizer.name}</h3>

            <p>
              Event Organizer
            </p>

            <span>
              📧 {organizer.email}
            </span>

            <button
              className="crew-primary-button"
              onClick={() =>
                handleConnect(organizer.id, organizer.name)
              }
            >
              Connect
            </button>
            

          </div>
        ))}

      </div>
    )}

  </section>
)}

          {/* ================= PROFESSIONALS ================= */}

          {activeSection === "workers" && (
  <section className="crew-section">

    <div className="crew-section-heading">
      <div>
        <h2>Find Professionals</h2>
        <p>
          Find verified professionals for your events.
        </p>
      </div>
    </div>

    {professionals.length === 0 ? (
      <div className="crew-empty-state">
        <div className="empty-icon">♧</div>

        <h3>No professionals found</h3>

        <p>
          Registered professionals will appear here.
        </p>
      </div>
    ) : (
      <div className="crew-people-grid">

        {professionals.map((professional) => (
          <div
            className="crew-person-card"
            key={professional.id}
          >

            <div className="crew-person-avatar">
              {professional.name
                ? professional.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                : "PR"}
            </div>

            <h3>{professional.name}</h3>

            <p>
              Event Professional
            </p>

            <span>
              📧 {professional.email}
            </span>

            <div className="crew-rating">
              ★ Profile
            </div>

            <button
              className="crew-primary-button"
              onClick={() =>
                handleViewProfile(professional.name)
              }
            >
              View Profile
            </button>

          </div>
        ))}

      </div>
    )}

  </section>
)}
          {/* ================= REQUESTS ================= */}

          {activeSection === "requests" && (
  <section className="crew-section">

    <div className="crew-section-heading">
      <div>
        <h2>Connection Requests</h2>
        <p>
          Manage collaboration requests from organizers.
        </p>
      </div>
    </div>

    {connectionRequests.length === 0 ? (
      <div className="crew-empty-state">
        <div className="empty-icon">♧</div>

        <h3>No connection requests</h3>

        <p>
          New collaboration requests will appear here.
        </p>
      </div>
    ) : (
      <div className="crew-people-grid">

        {connectionRequests.map((request) => (
          <div
            className="crew-person-card"
            key={request.id}
          >

            <div className="crew-person-avatar">
              {request.sender_name
                ? request.sender_name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                : "OR"}
            </div>

            <h3>{request.sender_name}</h3>

            <p>
              Event Organizer
            </p>

            <span>
              📧 {request.sender_email}
            </span>

            <span>
              📅 {new Date(request.created_at).toLocaleDateString()}
            </span>

            <div className="crew-request-actions">

              <button
                className="crew-primary-button"
                onClick={() =>
                  handleAcceptRequest(request.id)
                }
              >
                Accept
              </button>

              <button
                className="crew-secondary-button"
                onClick={() =>
                  handleRejectRequest(request.id)
                }
              >
                Reject
              </button>

            </div>

          </div>
        ))}

      </div>
    )}

  </section>
)}
          {/* ================= CONNECTIONS ================= */}

          {activeSection === "connections" && (
  <section className="crew-section">

    <div className="crew-section-heading">
      <div>
        <h2>My Connections</h2>
        <p>Your accepted collaboration connections.</p>
      </div>
    </div>

    {connections.length === 0 ? (
      <div className="crew-empty-state">
        <div className="empty-icon">♧</div>

        <h3>No connections yet</h3>

        <p>
          Accepted collaboration connections will appear here.
        </p>
      </div>
    ) : (
      <div className="crew-people-grid">

        {connections.map((connection) => (
          <div
            className="crew-person-card"
            key={connection.connection_id}
          >

            <div className="crew-person-avatar">
              {connection.name
                ? connection.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>

            <h3>{connection.name}</h3>

            <p>Event Organizer</p>

            <span>
              📧 {connection.email}
            </span>

            <span>
              🤝 Connected
            </span>

            <button
  className="crew-primary-button"
  onClick={() => handleViewProfile(connection.user_id)}
>
  View Profile
</button>

          </div>
        ))}

      </div>
    )}

  </section>
)}
          {/* ================= TEAM ================= */}

          {activeSection === "team" && (
  <section className="crew-section">

    <div className="crew-section-heading">
      <div>
        <h2>Selected Team</h2>
        <p>
          Professionals assigned to each of your events.
        </p>
      </div>
    </div>

    {events.length === 0 ? (

      <div className="crew-empty-state">
        <div className="empty-icon">♟</div>

        <h3>No events found</h3>

        <p>
          Create an event and select professionals
          to build your event team.
        </p>
      </div>

    ) : (

      <div className="crew-event-grid">

        {events.map((event) => {

          const team =
            eventProfessionals[event.id] || [];

          return (

            <div
              className="crew-form-card"
              key={event.id}
            >

              <h2>{event.title}</h2>

              <p>
                📍{" "}
                {event.location ||
                  "Location not specified"}
              </p>

              <p>
                📅 {event.event_date}
              </p>

              <hr />

              <h3>
                Event Team ({team.length})
              </h3>

              {team.length === 0 ? (

                <p>
                  No professionals selected
                  for this event.
                </p>

              ) : (

                <div className="crew-people-grid">

                  {team.map((professional) => (

                    <div
                      className="crew-person-card"
                      key={professional.professional_id}
                    >

                      <div className="crew-person-avatar">

                        {professional.name
                          ? professional.name
                              .split(" ")
                              .map(
                                (word) => word[0]
                              )
                              .join("")
                              .toUpperCase()
                          : "PR"}

                      </div>

                      <h3>
                        {professional.name}
                      </h3>

                      <p>
                        Event Professional
                      </p>

                      <span>
                        📧 {professional.email}
                      </span>

                      <p>
                        ✓ Assigned to this event
                      </p>

                    </div>

                  ))}

                </div>

              )}

            </div>

          );

        })}

      </div>

    )}

  </section>
)}

{/* ================= MESSAGES ================= */}

{activeSection === "chat" && (
  <section className="crew-section">

    <div className="crew-chat">

    {/* LEFT - PEOPLE LIST */}
<div className="crew-chat-sidebar">

  <div className="crew-chat-sidebar-header">
    <h3>Messages</h3>
    <span>Select an event and professional</span>
  </div>

  {/* SELECT EVENT */}
  <select
    value={selectedChatEvent?.id || ""}
    onChange={(e) => {
      const selectedEvent = events.find(
        (item) => Number(item.id) === Number(e.target.value)
      );

      setSelectedChatEvent(selectedEvent || null);
      setSelectedChat(null);
      setMessages([]);
    }}
  >
    <option value="">Select Event</option>

    {events.map((event) => (
      <option key={event.id} value={event.id}>
        {event.title}
      </option>
    ))}
  </select>

  {/* PROFESSIONALS */}
  {selectedChatEvent &&
  eventProfessionals[selectedChatEvent.id]?.length > 0 ? (

    eventProfessionals[selectedChatEvent.id].map((person) => {

      const initials = person.name
        ? person.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "U";

      return (
        <button
          key={person.professional_id}
          type="button"
          className={
            selectedChat?.id === person.professional_id
              ? "crew-chat-person active"
              : "crew-chat-person"
          }
          onClick={() => {
            setSelectedChat({
              id: person.professional_id,
              name: person.name,
              role: "Professional",
              email: person.email,
              initials: initials
            });
          }}
        >

          <div className="crew-person-avatar small">
            {initials}
          </div>

          <div className="crew-chat-person-info">
            <strong>{person.name}</strong>
            <span>Professional</span>
          </div>

        </button>
      );
    })

  ) : (

    <div className="crew-chat-no-people">
      <p>
        {selectedChatEvent
          ? "No professionals selected for this event."
          : "Select an event first."}
      </p>
    </div>

  )}

</div>

      {/* RIGHT - CHAT WINDOW */}
      <div className="crew-chat-window">

        {!selectedChat ? (

          <div className="crew-chat-empty">
            <div className="crew-empty-icon">
              💬
            </div>

            <h3>Select a conversation</h3>

            <p>
              Select a professional or organizer from the left
              to start messaging.
            </p>
          </div>

        ) : (

          <>
            {/* CHAT HEADER */}
            <div className="crew-chat-header">

              <div className="crew-person-avatar">
                {selectedChat.initials}
              </div>

              <div>
                <strong>
                  {selectedChat.name}
                </strong>

                <span>
                  {selectedChat.role}
                </span>
              </div>

            </div>


            {/* MESSAGES */}
            <div className="crew-chat-messages">

              {messages.length === 0 ? (

                <div className="crew-no-messages">
                  <span>No messages yet.</span>

                  <p>
                    Start the conversation with{" "}
                    <strong>
                      {selectedChat.name}
                    </strong>
                  </p>
                </div>

              ) : (

                messages.map((msg) => {

                  const currentUserId = Number(user?.id);

                  const isMine =
                    Number(msg.sender_id) === currentUserId;

                  return (
                    <div
                      key={msg.id}
                      className={
                        isMine
                          ? "crew-message-row mine"
                          : "crew-message-row"
                      }
                    >

                      <div className="crew-message-bubble">

                        <p>
                          {msg.message}
                        </p>

                        <span>
                          {new Date(
                            msg.created_at
                          ).toLocaleString()}
                        </span>

                      </div>

                    </div>
                  );

                })

              )}

            </div>


            {/* MESSAGE INPUT */}
            <form
              className="crew-chat-input"
              onSubmit={handleSendMessage}
            >

              <input
                type="text"
                placeholder={`Message ${selectedChat.name}...`}
                value={messageText}
                onChange={(e) =>
                  setMessageText(e.target.value)
                }
              />

              <button type="submit">
                Send
              </button>

            </form>

          </>

        )}

      </div>

    </div>

  </section>
)}

          {/* ================= ATTENDANCE ================= */}

          {activeSection === "attendance" && (
  <section className="crew-section">
    <h2>Event Attendance</h2>

    <div className="crew-event-grid">
      {events.length === 0 ? (
        <p>No events available.</p>
      ) : (
        events.map((event) => (
          <div className="crew-form-card" key={event.id}>
            <h3>{event.title}</h3>

            <p>
              <strong>Date:</strong> {event.event_date}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {event.location || "Not specified"}
            </p>

            <button
              className="crew-primary-button"
              onClick={() => fetchEventAttendance(event.id)}
            >
              View Attendance
            </button>
          </div>
        ))
      )}
    </div>

    {selectedAttendanceEvent && (
      <div className="crew-form-card">
        <h3>Attendance</h3>

        {eventAttendance.length === 0 ? (
          <p>No professionals assigned to this event.</p>
        ) : (
          eventAttendance.map((person) => (
            <div
              key={person.id}
              className="crew-person-card"
            >
              <h3>{person.name}</h3>

              <p>{person.email}</p>

              <p>
                Status: <strong>{person.status}</strong>
              </p>

              <p>
                Check In:{" "}
                {person.check_in
                  ? new Date(person.check_in).toLocaleString()
                  : "Not checked in"}
              </p>

              <button
                onClick={() =>
                  updateAttendance(
                    person.event_id,
                    person.professional_id,
                    "present"
                  )
                }
              >
                Present
              </button>

              <button
                onClick={() =>
                  updateAttendance(
                    person.event_id,
                    person.professional_id,
                    "absent"
                  )
                }
              >
                Absent
              </button>
            </div>
          ))
        )}
      </div>
    )}
  </section>
)}

          {/* ================= PAYMENTS ================= */}

          {activeSection === "payments" && (
            <section className="crew-section">

              <div className="crew-stats-grid">

                <div className="crew-stat-card">
                  <div>
                    <span>Total Budget</span>
                    <strong>₹2.4L</strong>
                  </div>
                </div>

                <div className="crew-stat-card">
                  <div>
                    <span>Paid</span>
                    <strong>₹1.6L</strong>
                  </div>
                </div>

                <div className="crew-stat-card">
                  <div>
                    <span>Remaining</span>
                    <strong>₹80K</strong>
                  </div>
                </div>

                <div className="crew-stat-card">
                  <div>
                    <span>Workers</span>
                    <strong>85</strong>
                  </div>
                </div>

              </div>

              <div className="crew-table-card">

                <table>

                  <thead>
                    <tr>
                      <th>Professional</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    <tr>
                      <td>Aarav Rao</td>
                      <td>₹3,500</td>
                      <td>
                        <span className="crew-status">
                          Paid
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td>Neha Singh</td>
                      <td>₹2,500</td>
                      <td>
                        <span className="crew-status pending">
                          Pending
                        </span>
                      </td>
                    </tr>

                  </tbody>

                </table>

              </div>

            </section>
          )}

        </div>

      </main>

    </div>
  );
}

export default OrganizerDashboard;