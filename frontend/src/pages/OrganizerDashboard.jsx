
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
  const [selectedAttendanceEvent, setSelectedAttendanceEvent] =
    useState(null);

  const [eventProfessionals, setEventProfessionals] = useState({});

  const [organizerProfile, setOrganizerProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    organization_name: "",
    phone: "",
    city: "",
    address: "",
    description: "",
    profile_photo: ""
  });

  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatEvent, setSelectedChatEvent] = useState(null);
  const [selectedConversationId, setSelectedConversationId] =
    useState(null);

  const [chatType, setChatType] = useState("professional");

  const [selectedProfile, setSelectedProfile] = useState(null);

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

  /* =========================================================
     CONNECTIONS
     ========================================================= */

  const handleConnect = async (receiverId, receiverName) => {
    try {
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
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sender_id: Number(user.id),
            receiver_id: Number(receiverId),
            message: "I would like to connect with you."
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Connection request sent to " + receiverName);
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
    setSelectedProfessionals((previous) => {
      if (previous.includes(professionalId)) {
        return previous.filter((id) => id !== professionalId);
      }

      return [...previous, professionalId];
    });
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(
        `http://localhost:5500/api/connections/${requestId}/accept`,
        {
          method: "PUT"
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Connection request accepted");
        fetchConnectionRequests();
        fetchConnections();
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
          method: "PUT"
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

  /* =========================================================
     VIEW PROFILE
     ========================================================= */

  const handleViewProfile = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5500/api/profile/${userId}`
      );

      const data = await response.json();

      console.log("Professional Profile:", data);

      if (response.ok) {
        setSelectedProfile(data);
      } else {
        setMessage(data.message || "Unable to load professional profile");
      }
    } catch (error) {
      console.error("View Profile Error:", error);
      setMessage("Unable to connect to server");
    }
  };

  /* =========================================================
     EVENTS
     ========================================================= */

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

  const fetchOrganizers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5500/api/organizers"
      );

      const data = await response.json();

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

  const fetchProfessionals = async () => {
    try {
      const response = await fetch(
        "http://localhost:5500/api/professionals"
      );

      const data = await response.json();

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





  const fetchConnectionRequests = async () => {
    try {
      if (!user?.id) {
        return;
      }

      const response = await fetch(
        `http://localhost:5500/api/connections/requests/${user.id}`
      );

      const data = await response.json();

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

  const fetchConnections = async () => {
    try {
      if (!user?.id) {
        return;
      }

      const response = await fetch(
        `http://localhost:5500/api/connections/${user.id}`
      );

      const data = await response.json();

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
      console.error("Fetch Event Professionals Error:", error);
      setMessage("Unable to connect to server");
    }
  };

  const updateAttendance = async (
    eventId,
    professionalId,
    status
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5500/api/events/${eventId}/attendance/${professionalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status
          })
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

  /* =========================================================
     ORGANIZER PROFILE
     ========================================================= */

  const fetchOrganizerProfile = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5500/api/profile/${user.id}`
      );

      const data = await response.json();

      console.log("Organizer Profile:", data);

      if (response.ok) {
        setOrganizerProfile(data);
      } else {
        setMessage(
          data.message || "Unable to load organizer profile"
        );
      }
    } catch (error) {
      console.error("Fetch Organizer Profile Error:", error);
      setMessage("Unable to connect to server");
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchOrganizers();
    fetchProfessionals();
    fetchConnectionRequests();
    fetchConnections();
    fetchOrganizerProfile();
  }, []);

  /* =========================================================
     CHAT - LOAD MESSAGES
     ========================================================= */

  useEffect(() => {
    if (!selectedChat || !user?.id) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        if (selectedConversationId) {
          const response = await fetch(
            `http://localhost:5500/api/conversations/${selectedConversationId}/messages?userId=${user.id}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Unable to load conversation"
            );
          }

          setMessages(data);
          return;
        }

        if (!selectedChatEvent) {
          setMessages([]);
          return;
        }

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

        await fetch(
          `http://localhost:5500/api/messages/read/${selectedChatEvent.id}/${user.id}/${selectedChat.id}`,
          {
            method: "PUT"
          }
        );
      } catch (error) {
        console.error("Load Messages Error:", error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [
    selectedChat,
    selectedChatEvent,
    selectedConversationId,
    user?.id
  ]);

  /* =========================================================
     CHAT - SEND MESSAGE
     ========================================================= */

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    if (!selectedChat || !user?.id) {
      return;
    }

    try {
      if (selectedConversationId) {
        const response = await fetch(
          `http://localhost:5500/api/conversations/${selectedConversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              sender_id: user.id,
              message: messageText.trim()
            })
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
          data.data
        ]);

        setMessageText("");
        return;
      }

      if (!selectedChatEvent) {
        return;
      }

      const response = await fetch(
        "http://localhost:5500/api/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            event_id: selectedChatEvent.id,
            sender_id: user.id,
            receiver_id: selectedChat.id,
            message: messageText.trim()
          })
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
        data.data
      ]);

      setMessageText("");
    } catch (error) {
      console.error("Send Message Error:", error);
      alert(error.message);
    }
  };

  /* =========================================================
     CREATE EVENT
     ========================================================= */

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
      if (!user?.id) {
        setMessage("Organizer login information not found.");
        return;
      }

      if (!navigator.geolocation) {
        setMessage(
          "Geolocation is not supported by your browser."
        );
        return;
      }

      setMessage("Getting event location...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const response = await fetch(
              "http://localhost:5500/api/events",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  organizer_id: user.id,
                  title: formData.title,
                  description: formData.description,
                  location: formData.location,
                  latitude,
                  longitude,
                  event_date: formData.event_date,
                  start_time: formData.start_time,
                  end_time: formData.end_time
                })
              }
            );

            const data = await response.json();

            if (response.ok) {
                            console.log("Event created successfully:", data);

              // Get newly created event ID
              const eventId =
                data.event?.id ||
                data.event?.event_id ||
                data.id ||
                data.event_id;

              if (!eventId) {
                console.error("Event ID not found in response:", data);

                setMessage(
                  "Event created, but event ID was not received."
                );

                fetchEvents();
                return;
              }

              console.log("Created Event ID:", eventId);

              // ==========================================
              // SEND EVENT REQUEST TO SELECTED PROFESSIONALS
              // ==========================================

              if (
                selectedProfessionals &&
                selectedProfessionals.length > 0
              ) {
                console.log(
                  "Sending requests to:",
                  selectedProfessionals
                );

                const requestResults = await Promise.all(
                  selectedProfessionals.map(async (professionalId) => {
                    try {
                      const requestResponse = await fetch(
                        `http://localhost:5500/api/events/${eventId}/request-professional`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            organizer_id: user.id,
                            professional_id: professionalId,
                            message:
                              "You have received an event request.",
                          }),
                        }
                      );

                      const requestData =
                        await requestResponse.json();

                      console.log(
                        `Request result for professional ${professionalId}:`,
                        requestData
                      );

                      return {
                        professionalId,
                        success: requestResponse.ok,
                        data: requestData,
                      };
                    } catch (error) {
                      console.error(
                        `Failed to send request to professional ${professionalId}:`,
                        error
                      );

                      return {
                        professionalId,
                        success: false,
                      };
                    }
                  })
                );

                console.log(
                  "All event request results:",
                  requestResults
                );

                const failedRequests =
                  requestResults.filter(
                    (result) => !result.success
                  );

                if (failedRequests.length === 0) {
                  setMessage(
                    "Event created successfully. Requests sent to all selected professionals."
                  );
                } else {
                  setMessage(
                    `Event created. ${
                      requestResults.length - failedRequests.length
                    } requests sent successfully, ${
                      failedRequests.length
                    } failed.`
                  );
                }
              } else {
                setMessage(
                  "Event created successfully. No professionals were selected."
                );
              }

              // Reset form after successful event creation
              setFormData({
                title: "",
                description: "",
                location: "",
                latitude: "",
                longitude: "",
                event_date: "",
                start_time: "",
                end_time: ""
              });

              // Refresh organizer events
              fetchEvents();
              fetchEvents();
            
              // Clear selected professionals
              setSelectedProfessionals([]);
            } else {
              setMessage(
                data.message || "Unable to create event."
              );
            
            }
          } catch (error) {
            console.error("Create Event Error:", error);
            setMessage("Unable to create event.");
          }
        },
        (error) => {
          console.error("Event Location Error:", error);

          if (error.code === 1) {
            setMessage(
              "Location permission denied. Please allow location access."
            );
          } else if (error.code === 2) {
            setMessage(
              "Unable to determine your location."
            );
          } else if (error.code === 3) {
            setMessage("Location request timed out.");
          } else {
            setMessage("Unable to get event location.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  };
  
  const fetchMessages = async (eventId, otherUserId) => {
    try {
      if (!eventId || !otherUserId || !user?.id) return;
  
      const response = await fetch(
        `http://localhost:5500/api/messages/${eventId}/${user.id}/${otherUserId}`
      );
  
      const data = await response.json();
  
      if (response.ok) {
        setMessages(data);
      } else {
        setMessage(data.message || "Unable to load messages");
      }
    } catch (error) {
      console.error("Fetch Messages Error:", error);
      setMessage("Unable to connect to server");
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
  
    if (!messageText.trim()) return;
  
    if (!selectedChatEvent || !selectedChat || !user?.id) {
      setMessage("Please select an event and professional");
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
  
      if (response.ok) {
        setMessageText("");
  
        await fetchMessages(
          selectedChatEvent.id,
          selectedChat.id
        );
      } else {
        setMessage(data.message || "Unable to send message");
      }
    } catch (error) {
      console.error("Send Message Error:", error);
      setMessage("Unable to connect to server");
    }
  };

  /* =========================================================
     PROFILE EDIT
     ========================================================= */

  const startEditingProfile = () => {
    const profile = organizerProfile?.profile || {};

    setProfileForm({
      organization_name: profile.organization_name || "",
      phone: profile.phone || "",
      city: profile.city || "",
      address: profile.address || "",
      description: profile.description || "",
      profile_photo: profile.profile_photo || ""
    });

    setIsEditingProfile(true);
    setMessage("");
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setMessage("Organizer login information not found.");
      return;
    }

    try {
      setProfileSaving(true);
      setMessage("Saving profile...");

      const response = await fetch(
        "http://localhost:5500/api/profile/organizer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: Number(user.id),
            organization_name: profileForm.organization_name,
            phone: profileForm.phone,
            city: profileForm.city,
            address: profileForm.address,
            description: profileForm.description,
            profile_photo: profileForm.profile_photo
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to save organizer profile"
        );
        return;
      }

      setMessage("Profile saved successfully");
      setIsEditingProfile(false);

      await fetchOrganizerProfile();
    } catch (error) {
      console.error("Save Organizer Profile Error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setProfileSaving(false);
    }
  };

  /* =========================================================
     EVENT STATUS
     ========================================================= */

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
    setNotifications((previous) =>
      previous.map((notification) => ({
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

        <div className="crew-logo">
          <div className="crew-logo-icon">C</div>
          <span>CrewAura</span>
        </div>

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

          <div className="crew-menu-title">Connections</div>

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
            <span className="nav-label">My Connections</span>
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

        {/* Organizer profile at bottom */}

        <div className="crew-profile">

          <button
            type="button"
            className="crew-profile-avatar profile-avatar-button"
            onClick={() => showSection("profile")}
          >
            {user?.name
              ? user.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()
              : "OR"}
          </button>

          <button
            type="button"
            className="crew-profile-text profile-text-button"
            onClick={() => showSection("profile")}
          >
            <strong>{user?.name || "Organizer"}</strong>
            <span>Event Organizer</span>
          </button>

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
              <span className="notification-icon">♧</span>

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

                      <strong>{notification.title}</strong>

                      <p>{notification.text}</p>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <div className="crew-content">

          {message && (
            <div className="crew-message">
              {message}
            </div>
          )}

          {/* ================= DASHBOARD ================= */}

          {activeSection === "dashboard" && (
            <section className="crew-section">

              <div className="crew-stats-grid">

                <div className="crew-stat-card">
                  <div className="crew-stat-icon">▤</div>
                  <div>
                    <span>Total Events</span>
                    <strong>{events.length}</strong>
                  </div>
                </div>

                <div className="crew-stat-card">
                  <div className="crew-stat-icon">♧</div>
                  <div>
                    <span>Connected People</span>
                    <strong>{connections.length}</strong>
                  </div>
                </div>

                <div className="crew-stat-card">
                  <div className="crew-stat-icon">◉</div>
                  <div>
                    <span>Active Events</span>
                    <strong>
                      {
                        events.filter(
                          (event) =>
                            getEventStatus(event) === "Ongoing"
                        ).length
                      }
                    </strong>
                  </div>
                </div>

                <div className="crew-stat-card">
                  <div className="crew-stat-icon">₹</div>
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
                  onClick={() => showSection("createEvent")}
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
                    onClick={() => showSection("events")}
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
                    onClick={() => showSection("events")}
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
                    onClick={() => showSection("events")}
                  >
                    View Event
                  </button>

                </div>

              </div>

            </section>
          )}

          {/* ================= PROFILE ================= */}

          {activeSection === "profile" && (
            <section className="crew-section organizer-profile-page">

              <div className="organizer-profile-header">

                <div>

                  <span className="profile-page-label">
                    ORGANIZER ACCOUNT
                  </span>

                  <h2>My Profile</h2>

                  <p>
                    Manage your organizer information and
                    profile details.
                  </p>

                </div>

                {!isEditingProfile && (
                  <button
                    type="button"
                    className="crew-primary-button"
                    onClick={startEditingProfile}
                  >
                    ✎ Edit Profile
                  </button>
                )}

              </div>

              {isEditingProfile ? (
                <form
                  className="organizer-profile-edit-card"
                  onSubmit={handleProfileSave}
                >

                  <div className="profile-edit-heading">
                    <span>EDIT PROFILE</span>
                    <h2>Update Organizer Information</h2>
                  </div>

                  <div className="crew-form-grid">

                    <div className="crew-form-group">
                      <label>Organization Name</label>

                      <input
                        type="text"
                        name="organization_name"
                        value={profileForm.organization_name}
                        onChange={handleProfileChange}
                        placeholder="Enter organization name"
                      />
                    </div>

                    <div className="crew-form-group">
                      <label>Phone</label>

                      <input
                        type="text"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="crew-form-group">
                      <label>City</label>

                      <input
                        type="text"
                        name="city"
                        value={profileForm.city}
                        onChange={handleProfileChange}
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="crew-form-group crew-full-width">
                      <label>Address</label>

                      <textarea
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileChange}
                        placeholder="Enter organization address"
                        rows="3"
                      />
                    </div>

                    <div className="crew-form-group crew-full-width">
                      <label>Description</label>

                      <textarea
                        name="description"
                        value={profileForm.description}
                        onChange={handleProfileChange}
                        placeholder="Tell us about your organization"
                        rows="4"
                      />
                    </div>

                    <div className="crew-form-group crew-full-width">
                      <label>Profile Photo URL</label>

                      <input
                        type="text"
                        name="profile_photo"
                        value={profileForm.profile_photo}
                        onChange={handleProfileChange}
                        placeholder="Paste profile photo URL"
                      />

                      <small>
                        Paste a direct image URL for your
                        profile photo.
                      </small>
                    </div>

                    {profileForm.profile_photo && (
                      <div className="crew-form-group crew-full-width">

                        <label>Photo Preview</label>

                        <div className="crew-profile-photo-preview">

                          <img
                            src={profileForm.profile_photo}
                            alt="Profile Preview"
                            className="crew-large-profile-photo"
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />

                        </div>

                      </div>
                    )}

                  </div>

                  <div className="organizer-profile-actions">

                    <button
                      type="button"
                      className="crew-secondary-button"
                      onClick={() =>
                        setIsEditingProfile(false)
                      }
                      disabled={profileSaving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="crew-primary-button"
                      disabled={profileSaving}
                    >
                      {profileSaving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                  </div>

                </form>
              ) : (
                <div className="organizer-profile-view">

                  <div className="organizer-profile-main-card">

                    <div className="organizer-profile-photo-wrapper">

                      {organizerProfile?.profile
                        ?.profile_photo ? (
                        <img
                          src={
                            organizerProfile.profile
                              .profile_photo
                          }
                          alt="Organizer Profile"
                          className="organizer-profile-main-photo"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="organizer-profile-main-avatar">
                          {organizerProfile?.user?.name
                            ? organizerProfile.user.name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()
                            : user?.name
                              ? user.name
                                  .split(" ")
                                  .map((word) => word[0])
                                  .join("")
                                  .toUpperCase()
                              : "OR"}
                        </div>
                      )}

                    </div>

                    <div className="organizer-profile-main-info">

                      <span className="profile-role-badge">
                        ✓ Verified Organizer
                      </span>

                      <h1>
                        {organizerProfile?.user?.name ||
                          user?.name ||
                          "Organizer"}
                      </h1>

                      <h3>
                        {organizerProfile?.profile
                          ?.organization_name ||
                          "Event Organization"}
                      </h3>

                      <p>
                        {organizerProfile?.profile?.city
                          ? `📍 ${organizerProfile.profile.city}`
                          : "📍 Location not added"}
                      </p>

                    </div>

                  </div>

                  <div className="organizer-profile-details-grid">

                    <div className="organizer-detail-card">

                      <div className="organizer-detail-icon">
                        📞
                      </div>

                      <div>
                        <span>Phone Number</span>

                        <strong>
                          {organizerProfile?.profile?.phone ||
                            "Not added"}
                        </strong>
                      </div>

                    </div>

                    <div className="organizer-detail-card">

                      <div className="organizer-detail-icon">
                        ✉
                      </div>

                      <div>
                        <span>Email Address</span>

                        <strong>
                          {organizerProfile?.user?.email ||
                            user?.email ||
                            "Not added"}
                        </strong>
                      </div>

                    </div>

                    <div className="organizer-detail-card">

                      <div className="organizer-detail-icon">
                        🏢
                      </div>

                      <div>
                        <span>Organization</span>

                        <strong>
                          {organizerProfile?.profile
                            ?.organization_name ||
                            "Not added"}
                        </strong>
                      </div>

                    </div>

                    <div className="organizer-detail-card">

                      <div className="organizer-detail-icon">
                        📍
                      </div>

                      <div>
                        <span>City</span>

                        <strong>
                          {organizerProfile?.profile?.city ||
                            "Not added"}
                        </strong>
                      </div>

                    </div>

                  </div>

                  <div className="organizer-profile-info-card">

                    <div className="organizer-info-card-heading">

                      <span className="organizer-info-icon">
                        🏠
                      </span>

                      <div>
                        <span>Organization Address</span>
                        <h3>Address</h3>
                      </div>

                    </div>

                    <p>
                      {organizerProfile?.profile?.address ||
                        "No address has been added yet."}
                    </p>

                  </div>

                  <div className="organizer-profile-info-card">

                    <div className="organizer-info-card-heading">

                      <span className="organizer-info-icon">
                        ℹ
                      </span>

                      <div>
                        <span>About Organization</span>
                        <h3>About Us</h3>
                      </div>

                    </div>

                    <p>
                      {organizerProfile?.profile
                        ?.description ||
                        "No organization description has been added yet."}
                    </p>

                  </div>

                </div>
              )}

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
                        required
                      />
                    </div>

                    <div className="crew-form-group">
                      <label>Event Type</label>

                      <select defaultValue="">
                        <option value="">
                          Select Event Type
                        </option>
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
                        required
                      />
                    </div>

                    <div className="crew-form-group">
                      <label>Start Time</label>

                      <input
                        type="time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="crew-form-group">
                      <label>End Time</label>

                      <input
                        type="time"
                        name="end_time"
                        value={formData.end_time}
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
                        required
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
                    />

                  </div>

                  <div className="crew-form-group crew-full-width">

                    <label>
                      Select Team for This Event
                    </label>

                    {professionals.length === 0 ? (
                      <div className="crew-empty-state">

                        <h3>No professionals found</h3>

                        <p>
                          Registered professionals will
                          appear here.
                        </p>

                      </div>
                    ) : (
                      <div className="crew-people-grid">

                        {professionals.map(
                          (professional) => {
                            const isSelected =
                              selectedProfessionals.includes(
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
                                        .map(
                                          (word) =>
                                            word[0]
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
                                  📧{" "}
                                  {professional.email}
                                </span>

                                <button
                                  type="button"
                                  className={
                                    isSelected
                                      ? "crew-team-button selected"
                                      : "crew-team-button"
                                  }
                                  onClick={() =>
                                    handleProfessionalSelection(
                                      professional.id
                                    )
                                  }
                                >
                                  {isSelected
                                    ? "✓ Selected"
                                    : "+ Select Team"}
                                </button>

                              </div>
                            );
                          }
                        )}

                      </div>
                    )}

                  </div>

                  <button
                    type="submit"
                    className="crew-primary-button"
                  >
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
                  onClick={() =>
                    showSection("createEvent")
                  }
                >
                  + Create Event
                </button>

              </div>

              {events.length === 0 ? (
                <div className="crew-empty-state">

                  <div className="empty-icon">▤</div>

                  <h3>No events found</h3>

                  <p>
                    Events created by you will appear
                    here.
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
                        {getEventStatus(event)}
                      </div>

                      <h3>{event.title}</h3>

                      <div className="event-info">

<<<<<<< HEAD
               
=======
                        <span>
                          📍{" "}
                          {event.location ||
                            "Location not specified"}
                        </span>

                        <span>
                          📅{" "}
                          {event.event_date
                            ? new Date(
                                event.event_date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric"
                                }
                              )
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
                        <p>{event.description}</p>
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

>>>>>>> c384781 (Update EventSaathi project)
              </div>

              {organizers.length === 0 ? (
                <div className="crew-empty-state">

                  <div className="empty-icon">♧</div>

                  <h3>No organizers found</h3>

                  <p>
                    Registered organizers will appear
                    here.
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

                      <p>Event Organizer</p>

                      <span>
                        📧 {organizer.email}
                      </span>

                      <button
                        className="crew-primary-button"
                        onClick={() =>
                          handleConnect(
                            organizer.id,
                            organizer.name
                          )
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

          {/* ================= FIND PROFESSIONALS ================= */}

          {activeSection === "workers" && (
            <section className="crew-section">

              <div className="crew-section-heading">

                <div>
                  <h2>Find Professionals</h2>

                  <p>
                    Discover professionals for your
                    events.
                  </p>
                </div>

              </div>

              {professionals.length === 0 ? (
                <div className="crew-empty-state">

                  <div className="empty-icon">♙</div>

                  <h3>No professionals found</h3>

                  <p>
                    Registered professionals will appear
                    here.
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

                      <p>Event Professional</p>

                      <span>
                        📧 {professional.email}
                      </span>

                      <button
                        className="crew-primary-button"
                        onClick={() =>
                          handleViewProfile(
                            professional.id
                          )
                        }
                      >
                        View Profile
                      </button>

                      <button
                        className="crew-outline-button"
                        onClick={() =>
                          handleConnect(
                            professional.id,
                            professional.name
                          )
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

          {/* ================= PROFESSIONAL PROFILE MODAL ================= */}

          {selectedProfile && (
            <div className="crew-profile-modal">

              <div className="crew-profile-card">

                <button
                  type="button"
                  className="crew-close-btn"
                  onClick={() =>
                    setSelectedProfile(null)
                  }
                >
                  ×
                </button>

                <div className="crew-large-avatar">

                  {selectedProfile?.user?.name
                    ? selectedProfile.user.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()
                    : "PR"}

                </div>

                <h2>
                  {selectedProfile?.user?.name ||
                    "Professional"}
                </h2>

                <p>
                  📧{" "}
                  {selectedProfile?.user?.email ||
                    "Not available"}
                </p>

                {selectedProfile?.profile && (
                  <>
                    <hr />

                    <p>
                      📍{" "}
                      <strong>City:</strong>{" "}
                      {selectedProfile.profile.city ||
                        "Not specified"}
                    </p>

                    <p>
                      💼{" "}
                      <strong>Experience:</strong>{" "}
                      {selectedProfile.profile
                        .experience_years || 0}{" "}
                      years
                    </p>

                    <p>
                      📞{" "}
                      <strong>Phone:</strong>{" "}
                      {selectedProfile.profile.phone ||
                        "Not specified"}
                    </p>

                    <p>
                      📝{" "}
                      <strong>Bio:</strong>{" "}
                      {selectedProfile.profile.bio ||
                        "No bio available"}
                    </p>
                  </>
                )}

                {selectedProfile?.services?.length > 0 && (
                  <>
                    <h3>Services</h3>

                    <div className="crew-service-list">

<<<<<<< HEAD
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
          
            fetchMessages(
              selectedChatEvent.id,
              person.professional_id
            );
          }}
        >
=======
                      {selectedProfile.services.map(
                        (service) => (
                          <span key={service.id}>
                            {service.name ||
                              service.service_name}
                          </span>
                        )
                      )}
>>>>>>> c384781 (Update EventSaathi project)

                    </div>
                  </>
                )}

              </div>

            </div>
          )}

          {/* ================= REQUESTS ================= */}

          {activeSection === "requests" && (
            <section className="crew-section">

              <div className="crew-section-heading">

                <div>
                  <h2>Connection Requests</h2>

                  <p>
                    Manage collaboration requests from
                    organizers.
                  </p>
                </div>

              </div>

              {connectionRequests.length === 0 ? (
                <div className="crew-empty-state">

                  <div className="empty-icon">♧</div>

                  <h3>No connection requests</h3>

                  <p>
                    New collaboration requests will
                    appear here.
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

                      <h3>
                        {request.sender_name}
                      </h3>

                      <p>Event Organizer</p>

                      <span>
                        📧 {request.sender_email}
                      </span>

                      <span>
                        📅{" "}
                        {new Date(
                          request.created_at
                        ).toLocaleDateString()}
                      </span>

                      <div className="crew-request-actions">

                        <button
                          className="crew-primary-button"
                          onClick={() =>
                            handleAcceptRequest(
                              request.id
                            )
                          }
                        >
                          Accept
                        </button>

                        <button
                          className="crew-secondary-button"
                          onClick={() =>
                            handleRejectRequest(
                              request.id
                            )
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

                  <p>
                    Your accepted collaboration
                    connections.
                  </p>
                </div>

              </div>

              {connections.length === 0 ? (
                <div className="crew-empty-state">

                  <div className="empty-icon">♧</div>

                  <h3>No connections yet</h3>

                  <p>
                    Accepted collaboration connections
                    will appear here.
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

                      <p>
                        {connection.role ||
                          "Connected User"}
                      </p>

                      <span>
                        📧 {connection.email}
                      </span>

                      <span>🤝 Connected</span>

                      <button
                        className="crew-primary-button"
                        onClick={() =>
                          handleViewProfile(
                            connection.user_id
                          )
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

          {/* ================= TEAM ================= */}

          {activeSection === "team" && (
            <section className="crew-section">

              <div className="crew-section-heading">

                <div>
                  <h2>Selected Team</h2>

                  <p>
                    Professionals assigned to each of
                    your events.
                  </p>
                </div>

              </div>

              {events.length === 0 ? (
                <div className="crew-empty-state">

                  <div className="empty-icon">♟</div>

                  <h3>No events found</h3>

                  <p>
                    Create an event and select
                    professionals to build your event
                    team.
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
                                key={
                                  professional.professional_id
                                }
                              >

                                <div className="crew-person-avatar">

                                  {professional.name
                                    ? professional.name
                                        .split(" ")
                                        .map(
                                          (word) =>
                                            word[0]
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
                                  📧{" "}
                                  {professional.email}
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

                <div className="crew-chat-sidebar">

                  <div className="crew-chat-sidebar-header">

                    <h3>Messages</h3>

                    <span>
                      Select an event and professional
                    </span>

                  </div>

                  {/* PERSONAL CHATS */}

                  {connections.length > 0 && (
                    <div className="chat-extra-section">

                      <h4>My Connections</h4>

                      {connections.map((connection) => {

                        const otherUserId =
                          Number(connection.user_id);

                        const otherUserName =
                          connection.name || "Organizer";

                        const initials =
                          otherUserName
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();

                        return (
                          <button
                            key={otherUserId}
                            type="button"
                            className={
                              selectedChat?.id ===
                                otherUserId &&
                              chatType === "personal"
                                ? "crew-chat-person active"
                                : "crew-chat-person"
                            }
                            onClick={async () => {

                              try {

                                const response =
                                  await fetch(
                                    "http://localhost:5500/api/conversations/personal",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type":
                                          "application/json"
                                      },
                                      body: JSON.stringify({
                                        user1_id: user.id,
                                        user2_id:
                                          otherUserId
                                      })
                                    }
                                  );

                                const data =
                                  await response.json();

                                if (!response.ok) {
                                  throw new Error(
                                    data.message ||
                                      "Unable to open chat"
                                  );
                                }

                                setSelectedChat({
                                  id: otherUserId,
                                  name: otherUserName,
                                  role:
                                    connection.role ||
                                    "Organizer",
                                  initials
                                });

                                setSelectedConversationId(
                                  data.conversation_id
                                );

                                setChatType("personal");

                                setSelectedChatEvent(null);

                                setMessages([]);

                                setMessageText("");

                              } catch (error) {

                                console.error(
                                  "Open Personal Chat Error:",
                                  error
                                );

                                alert(error.message);

                              }

                            }}
                          >

                            <div className="crew-person-avatar small">
                              {initials}
                            </div>

                            <div className="crew-chat-person-info">

                              <strong>
                                {otherUserName}
                              </strong>

                              <span>
                                {connection.role ||
                                  "Organizer"}
                              </span>

                            </div>

                          </button>
                        );
                      })}

                    </div>
                  )}

                  {/* EVENT SELECTION */}

                  <select
                    value={selectedChatEvent?.id || ""}
                    onChange={(e) => {

                      const selectedEvent =
                        events.find(
                          (item) =>
                            Number(item.id) ===
                            Number(e.target.value)
                        );

                      setSelectedChatEvent(
                        selectedEvent || null
                      );

                      setSelectedChat(null);
                      setSelectedConversationId(null);
                      setChatType("professional");
                      setMessages([]);
                      setMessageText("");

                    }}
                  >

                    <option value="">
                      Select Event
                    </option>

                    {events.map((event) => (
                      <option
                        key={event.id}
                        value={event.id}
                      >
                        {event.title}
                      </option>
                    ))}

                  </select>

                  {/* PROFESSIONAL LIST */}

                  {selectedChatEvent &&
                  eventProfessionals[
                    selectedChatEvent.id
                  ]?.length > 0 ? (

                    eventProfessionals[
                      selectedChatEvent.id
                    ].map((person) => {

                      const initials =
                        person.name
                          ? person.name
                              .split(" ")
                              .map(
                                (word) =>
                                  word[0]
                              )
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "U";

                      return (
                        <button
                          key={person.professional_id}
                          type="button"
                          className={
                            selectedChat?.id ===
                              person.professional_id &&
                            chatType === "professional"
                              ? "crew-chat-person active"
                              : "crew-chat-person"
                          }
                          onClick={() => {

                            setSelectedChat({
                              id: person.professional_id,
                              name: person.name,
                              role: "Professional",
                              email: person.email,
                              initials
                            });

                            setSelectedConversationId(null);
                            setChatType("professional");
                            setMessages([]);
                            setMessageText("");

                          }}
                        >

                          <div className="crew-person-avatar small">
                            {initials}
                          </div>

                          <div className="crew-chat-person-info">

                            <strong>
                              {person.name}
                            </strong>

                            <span>
                              Professional
                            </span>

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

                {/* CHAT WINDOW */}

                <div className="crew-chat-window">

                  {!selectedChat ? (

                    <div className="crew-chat-empty">

                      <div className="crew-empty-icon">
                        💬
                      </div>

                      <h3>
                        Select a conversation
                      </h3>

                      <p>
                        Select a professional or organizer
                        from the left to start messaging.
                      </p>

                    </div>

                  ) : (

                    <>

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

                      <div className="crew-chat-messages">

                        {messages.length === 0 ? (

                          <div className="crew-no-messages">

                            <span>
                              No messages yet.
                            </span>

                            <p>
                              Start the conversation
                              with{" "}
                              <strong>
                                {selectedChat.name}
                              </strong>
                            </p>

                          </div>

                        ) : (

                          messages.map((msg) => {

                            const currentUserId =
                              Number(user?.id);

                            const isMine =
                              Number(msg.sender_id) ===
                              currentUserId;

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

                      <form
                        className="crew-chat-input"
                        onSubmit={handleSendMessage}
                      >

                        <input
                          type="text"
                          placeholder={`Message ${selectedChat.name}...`}
                          value={messageText}
                          onChange={(e) =>
                            setMessageText(
                              e.target.value
                            )
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
                    <div
                      className="crew-form-card"
                      key={event.id}
                    >

                      <h3>{event.title}</h3>

                      <p>
                        <strong>Date:</strong>{" "}
                        {event.event_date}
                      </p>

                      <p>
                        <strong>Location:</strong>{" "}
                        {event.location ||
                          "Not specified"}
                      </p>

                      <button
                        className="crew-primary-button"
                        onClick={() =>
                          fetchEventAttendance(event.id)
                        }
                      >
                        View Attendance
                      </button>

                    </div>
                  ))
                )}

              </div>

              {selectedAttendanceEvent && (
                <div className="crew-form-card">

                  <div className="crew-section-heading">

                    <h3>Attendance</h3>

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

                  {eventAttendance.length === 0 ? (
                    <p>
                      No professionals assigned to this
                      event.
                    </p>
                  ) : (
                    <div className="crew-people-grid">

                      {eventAttendance.map((person) => (
                        <div
                          key={person.id}
                          className="crew-person-card"
                        >

                          <h3>{person.name}</h3>

                          <p>{person.email}</p>

                          <p>
                            Status:{" "}
                            <strong>
                              {person.status}
                            </strong>
                          </p>

                          <p>
                            Check In:{" "}
                            {person.check_in
                              ? new Date(
                                  person.check_in
                                ).toLocaleString()
                              : "Not checked in"}
                          </p>

                          <div className="attendance-buttons">

                            <button
                              type="button"
                              onClick={() =>
                                updateAttendance(
                                  person.event_id ||
                                    selectedAttendanceEvent,
                                  person.professional_id,
                                  "present"
                                )
                              }
                            >
                              ✓ Present
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateAttendance(
                                  person.event_id ||
                                    selectedAttendanceEvent,
                                  person.professional_id,
                                  "absent"
                                )
                              }
                            >
                              ✕ Absent
                            </button>

                          </div>

                        </div>
                      ))}

                    </div>
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

