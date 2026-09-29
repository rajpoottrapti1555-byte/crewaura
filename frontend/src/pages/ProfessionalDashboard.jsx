import { useEffect, useState } from "react";
import ProfessionalProfile from "./ProfessionalProfile";

function ProfessionalDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [offers, setOffers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [eventRequests, setEventRequests] = useState([]);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [assignedEvents, setAssignedEvents] = useState([]);

  const [attendanceLoading, setAttendanceLoading] = useState({});
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [organizers, setOrganizers] = useState([]);
  const [sendingRequest, setSendingRequest] = useState({});
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);




  const [profile, setProfile] = useState({
    name: "Professional User",
    email: "professional@example.com",
    phone: "+91 9876543210",
    skill: "Event Management",
    experience: "2 Years",
    location: "Bhopal",
  });

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userId = storedUser.id;

  // =========================================================
  // CHAT STATE
  // =========================================================

  const [chatOrganizers, setChatOrganizers] = useState([]);
  const [selectedOrganizer, setSelectedOrganizer] =
    useState(null);

  const [chatConversationId, setChatConversationId] =
    useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);

  // =========================================================
  // BACKEND URL
  // =========================================================

  const BACKEND_URL = "http://localhost:5500";

  // =========================================================
  // GET EVENT ID
  // =========================================================

  const getEventId = (event) => {
    return (
      event?.event_id ??
      event?.id ??
      event?.eventId
    );
  };

  // =========================================================
  // LOAD PROFESSIONAL DATA
  // =========================================================

  useEffect(() => {
    const loadProfessionalData = async () => {
      try {
        if (!userId) {
          console.error("Professional user ID not found");
          return;
        }

        // =====================================================
        // PROFILE
        // =====================================================

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/professionals/profile/${userId}`
          );

          if (response.ok) {
            const data = await response.json();

            setProfile({
              name: data.name || "Professional User",
              email: data.email || "",
              phone: data.phone || "",
              skill:
                data.skill ||
                data.skills ||
                "Event Management",
              experience:
                data.experience ||
                data.experience_years ||
                "2 Years",
              location:
                data.location ||
                data.city ||
                "Bhopal",
            });
          }
        } catch (error) {
          console.error(
            "Profile loading error:",
            error
          );
        }

        // =====================================================
        // CONNECTIONS
        // =====================================================

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/professionals/${userId}/connections`
          );

          if (response.ok) {
            const data = await response.json();
            setConnections(data);
          }
        } catch (error) {
          console.error(
            "Connections loading error:",
            error
          );
        }

        // =====================================================
        // CONNECTION REQUESTS
        // =====================================================

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/professionals/${userId}/connection-requests`
          );

          if (response.ok) {
            const data = await response.json();
            setConnectionRequests(data);
          }
        } catch (error) {
          console.error(
            "Connection requests loading error:",
            error
          );
        }

        // =====================================================
        // EVENT REQUESTS
        // =====================================================

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/events/professional/${userId}/event-requests`
          );

          if (response.ok) {
            const data = await response.json();
            setEventRequests(data);
          } else {
            console.error(
              "Event requests API error:",
              response.status
            );
          }
        } catch (error) {
          console.error(
            "Event requests loading error:",
            error
          );
        }

        // =====================================================
        // EVENT OFFERS
        // =====================================================

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/professionals/${userId}/event-offers`
          );

          if (response.ok) {
            const data = await response.json();

            console.log(
              "Event Offers:",
              data
            );

            setOffers(data);
          }
        } catch (error) {
          console.error(
            "Offers loading error:",
            error
          );
        }

        // =====================================================
        // UPCOMING EVENTS
        // =====================================================

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/professionals/${userId}/upcoming-events`
          );

          if (response.ok) {
            const data = await response.json();
            setUpcomingEvents(data);
          }
        } catch (error) {
          console.error(
            "Upcoming events loading error:",
            error
          );
        }


        try {
          const response = await fetch(
            "http://localhost:5500/api/organizers"
          );
        
          if (response.ok) {
            const data = await response.json();
            setOrganizers(data);
            console.log("All Organizers:", data);
          } else {
            console.error("Organizers API error:", response.status);
          }
        } catch (error) {
          console.error("Organizers loading error:", error);
        }

        // =====================================================
        // MY EVENTS
        // =====================================================

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/events/professional/${userId}`
          );

          if (response.ok) {
            const data = await response.json();

            setAssignedEvents(data);

            const attendanceMap = {};

            data.forEach((event) => {
              const eventId = getEventId(event);

              if (
                event.attendance_status ===
                  "present" &&
                eventId
              ) {
                attendanceMap[eventId] =
                  "present";
              }
            });

            setAttendanceStatus(
              attendanceMap
            );

            console.log(
              "Assigned Events:",
              data
            );

            console.log(
              "Attendance Status:",
              attendanceMap
            );
          }
        } catch (error) {
          console.error(
            "Assigned events loading error:",
            error
          );
        }
      } catch (error) {
        console.error(
          "Error loading professional data:",
          error
        );
      }
    };

    loadProfessionalData();
  }, [userId]);

  // =========================================================
  // LOAD CHAT ORGANIZERS
  // =========================================================

  useEffect(() => {
    const loadChatOrganizers = async () => {
      try {
        if (!userId) {
          console.error(
            "Cannot load chat organizers: userId missing"
          );
          return;
        }

        const response = await fetch(
          `${BACKEND_URL}/api/connections/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load connected organizers."
          );
        }

        console.log(
          "Chat Organizers:",
          data
        );

        setChatOrganizers(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Chat organizers loading error:",
          error
        );

        setChatOrganizers([]);
      }
    };

    loadChatOrganizers();
  }, [userId]);

  // =========================================================
  // OPEN PERSONAL CHAT
  // =========================================================

  const openOrganizerChat = async (
    organizer
  ) => {
    try {
      if (!userId) {
        alert(
          "Professional user ID not found."
        );
        return;
      }

      const organizerId = Number(
        organizer.user_id ??
          organizer.id ??
          organizer.organizer_id
      );

      if (!organizerId) {
        alert(
          "Organizer ID is missing."
        );
        return;
      }

      setChatLoading(true);

      setSelectedOrganizer({
        ...organizer,
        user_id: organizerId,
      });

      setChatMessages([]);
      setChatConversationId(null);

      // =====================================================
      // CREATE / GET PERSONAL CONVERSATION
      // =====================================================

      const conversationResponse =
        await fetch(
          `${BACKEND_URL}/api/conversations/personal`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              user1_id: Number(userId),
              user2_id: organizerId,
            }),
          }
        );

      const conversationData =
        await conversationResponse.json();

      if (!conversationResponse.ok) {
        throw new Error(
          conversationData.message ||
            "Unable to open conversation."
        );
      }

      const conversationId =
        conversationData.conversation_id;

      setChatConversationId(
        conversationId
      );

      // =====================================================
      // LOAD MESSAGES
      // =====================================================

      const messagesResponse =
        await fetch(
          `${BACKEND_URL}/api/conversations/${conversationId}/messages?userId=${userId}`
        );

      const messagesData =
        await messagesResponse.json();

      if (!messagesResponse.ok) {
        throw new Error(
          messagesData.message ||
            "Unable to load messages."
        );
      }

      setChatMessages(
        Array.isArray(messagesData)
          ? messagesData
          : []
      );
    } catch (error) {
      console.error(
        "Open organizer chat error:",
        error
      );

      alert(
        error.message ||
          "Unable to open organizer chat."
      );
    } finally {
      setChatLoading(false);
    }
  };

  // =========================================================
  // SEND CHAT MESSAGE
  // =========================================================

  const sendChatMessage = async () => {
    const message =
      chatInput.trim();

    if (!message) {
      return;
    }

    if (!chatConversationId) {
      alert(
        "Please select an organizer first."
      );
      return;
    }

    if (!userId) {
      alert(
        "Professional user ID not found."
      );
      return;
    }

    try {
      setChatSending(true);

      const response =
        await fetch(
          `${BACKEND_URL}/api/conversations/${chatConversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              sender_id: Number(userId),
              message: message,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send message."
        );
      }

      console.log(
        "Sent message:",
        data
      );

      setChatInput("");

      // =====================================================
      // RELOAD MESSAGES
      // =====================================================

      const messagesResponse =
        await fetch(
          `${BACKEND_URL}/api/conversations/${chatConversationId}/messages?userId=${userId}`
        );

      const messagesData =
        await messagesResponse.json();

      if (messagesResponse.ok) {
        setChatMessages(
          Array.isArray(messagesData)
            ? messagesData
            : []
        );
      }
    } catch (error) {
      console.error(
        "Send chat message error:",
        error
      );

      alert(
        error.message ||
          "Unable to send message."
      );
    } finally {
      setChatSending(false);
    }
  };

  // =========================================================
  // EVENT REQUEST ACCEPT / REJECT
  // =========================================================

  const handleEventRequest = async (
    requestId,
    action
  ) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/events/event-requests/${requestId}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to process event request."
        );
        return;
      }

      if (action === "accept") {
        alert(
          "Event request accepted! Event added to My Events."
        );
      } else {
        alert(
          "Event request rejected."
        );
      }

      const requestsResponse =
        await fetch(
          `${BACKEND_URL}/api/events/professional/${userId}/event-requests`
        );

      if (requestsResponse.ok) {
        const requestsData =
          await requestsResponse.json();

        setEventRequests(
          requestsData
        );
      }

      if (action === "accept") {
        const eventsResponse =
          await fetch(
            `${BACKEND_URL}/api/events/professional/${userId}`
          );

        if (eventsResponse.ok) {
          const eventsData =
            await eventsResponse.json();

          setAssignedEvents(
            eventsData
          );

          const attendanceMap = {};

          eventsData.forEach(
            (event) => {
              const eventId =
                getEventId(event);

              if (
                event.attendance_status ===
                  "present" &&
                eventId
              ) {
                attendanceMap[
                  eventId
                ] = "present";
              }
            }
          );

          setAttendanceStatus(
            attendanceMap
          );
        }

        const upcomingResponse =
          await fetch(
            `${BACKEND_URL}/api/professionals/${userId}/upcoming-events`
          );

        if (upcomingResponse.ok) {
          const upcomingData =
            await upcomingResponse.json();

          setUpcomingEvents(
            upcomingData
          );
        }
      }
    } catch (error) {
      console.error(
        "Event request action error:",
        error
      );

      alert(
        "Unable to process event request."
      );
    }
  };

  // =========================================================
  // NORMAL CONNECTION REQUEST
  // =========================================================

  const handleConnectionRequest = async (
    requestId,
    action
  ) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/professionals/connection-requests/${requestId}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to process request."
        );
        return;
      }

      alert(
        action === "accept"
          ? "Connection request accepted."
          : "Connection request rejected."
      );

      const requestsResponse =
        await fetch(
          `${BACKEND_URL}/api/professionals/${userId}/connection-requests`
        );

      if (requestsResponse.ok) {
        const requestsData =
          await requestsResponse.json();

        setConnectionRequests(
          requestsData
        );
      }

      const connectionsResponse =
        await fetch(
          `${BACKEND_URL}/api/professionals/${userId}/connections`
        );

      if (connectionsResponse.ok) {
        const connectionsData =
          await connectionsResponse.json();

        setConnections(
          connectionsData
        );
      }

      // Refresh chat organizers too
      const chatConnectionsResponse =
        await fetch(
          `${BACKEND_URL}/api/connections/${userId}`
        );

      if (
        chatConnectionsResponse.ok
      ) {
        const chatConnectionsData =
          await chatConnectionsResponse.json();

        setChatOrganizers(
          Array.isArray(
            chatConnectionsData
          )
            ? chatConnectionsData
            : []
        );
      }
    } catch (error) {
      console.error(
        "Connection request error:",
        error
      );

      alert(
        "Unable to process connection request."
      );
    }
  };

  const sendConnectionRequest = async (organizerId) => {
    try {
      setSendingRequest((prev) => ({
        ...prev,
        [organizerId]: true,
      }));
  
      const response = await fetch(
        "http://localhost:5500/api/connections/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_id: userId,
            receiver_id: organizerId,
            sender_role: "professional",
            receiver_role: "organizer",
            message: "I would like to connect with you.",
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Failed to send connection request");
        return;
      }
  
      alert("Connection request sent!");
  
      setOrganizers((prev) =>
        prev.map((organizer) =>
          organizer.id === organizerId
            ? {
                ...organizer,
                connection_status: "pending",
              }
            : organizer
        )
      );
    } catch (error) {
      console.error("Connection request error:", error);
      alert("Something went wrong while sending request.");
    } finally {
      setSendingRequest((prev) => ({
        ...prev,
        [organizerId]: false,
      }));
    }
  };

  // =========================================================
  // GPS ATTENDANCE
  // =========================================================

  const handleAttendance = async (
    event
  ) => {
    const eventId =
      getEventId(event);

    console.log(
      "Attendance Event:",
      event
    );

    console.log(
      "Attendance Event ID:",
      eventId
    );

    if (!eventId) {
      alert(
        "Event ID is missing."
      );
      return;
    }

    if (
      !navigator.geolocation
    ) {
      alert(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setAttendanceLoading(
      (previous) => ({
        ...previous,
        [eventId]: true,
      })
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const eventLatitude =
            Number(event.latitude);

          const eventLongitude =
            Number(event.longitude);

          if (
            Number.isNaN(
              eventLatitude
            ) ||
            Number.isNaN(
              eventLongitude
            )
          ) {
            alert(
              "Event location coordinates are not available."
            );
            return;
          }

          const toRadians =
            (value) =>
              (value * Math.PI) /
              180;

          const R = 6371000;

          const dLat =
            toRadians(
              latitude -
                eventLatitude
            );

          const dLon =
            toRadians(
              longitude -
                eventLongitude
            );

          const a =
            Math.sin(
              dLat / 2
            ) *
              Math.sin(
                dLat / 2
              ) +
            Math.cos(
              toRadians(
                eventLatitude
              )
            ) *
              Math.cos(
                toRadians(
                  latitude
                )
              ) *
              Math.sin(
                dLon / 2
              ) *
              Math.sin(
                dLon / 2
              );

          const c =
            2 *
            Math.atan2(
              Math.sqrt(a),
              Math.sqrt(1 - a)
            );

          const distance =
            R * c;

          console.log(
            "User Latitude:",
            latitude
          );

          console.log(
            "User Longitude:",
            longitude
          );

          console.log(
            "Event Latitude:",
            eventLatitude
          );

          console.log(
            "Event Longitude:",
            eventLongitude
          );

          console.log(
            "Distance:",
            distance
          );

          if (
            distance > 200
          ) {
            alert(
              `You are ${Math.round(
                distance
              )} meters away from the event location. You must be within 200 meters to mark attendance.`
            );

            return;
          }

          const response =
            await fetch(
              `${BACKEND_URL}/api/events/${eventId}/attendance/check-in`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify(
                  {
                    professional_id:
                      userId,
                    latitude,
                    longitude,
                  }
                ),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            alert(
              data.message ||
                "Unable to mark attendance."
            );
            return;
          }

          alert(
            "Attendance marked successfully!"
          );

          setAttendanceStatus(
            (previous) => ({
              ...previous,
              [eventId]:
                "present",
            })
          );

          const assignedResponse =
            await fetch(
              `${BACKEND_URL}/api/events/professional/${userId}`
            );

          if (
            assignedResponse.ok
          ) {
            const assignedData =
              await assignedResponse.json();

            setAssignedEvents(
              assignedData
            );
          }
        } catch (error) {
          console.error(
            "Attendance error:",
            error
          );

          alert(
            "Unable to mark attendance."
          );
        } finally {
          setAttendanceLoading(
            (previous) => ({
              ...previous,
              [eventId]:
                false,
            })
          );
        }
      },

      (error) => {
        console.error(
          "GPS error:",
          error
        );

        setAttendanceLoading(
          (previous) => ({
            ...previous,
            [eventId]:
              false,
          })
        );

        alert(
          "Unable to access your location. Please allow location permission."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // =========================================================
  // HANDLE EVENT OFFER
  // =========================================================

  const handleOffer = async (
    offer,
    action
  ) => {
    try {
      const offerId =
        offer?.staff_id ??
        offer?.offer_id ??
        offer?.id ??
        offer?.event_offer_id;

      if (!offerId) {
        alert("Offer ID is missing.");
        return;
      }

      console.log(
        "Selected Offer:",
        offer
      );

      console.log(
        "Offer ID:",
        offerId
      );

      const response = await fetch(
        `${BACKEND_URL}/api/professionals/event-offers/${offerId}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            `Unable to ${action} event offer.`
        );
        return;
      }

      if (action === "accept") {
        alert(
          "Event offer accepted! Event added to My Events."
        );
      } else {
        alert(
          "Event offer rejected."
        );
      }

      const offersResponse =
        await fetch(
          `${BACKEND_URL}/api/professionals/${userId}/event-offers`
        );

      if (offersResponse.ok) {
        const offersData =
          await offersResponse.json();

        setOffers(offersData);
      }

      const eventsResponse =
        await fetch(
          `${BACKEND_URL}/api/events/professional/${userId}`
        );

      if (eventsResponse.ok) {
        const eventsData =
          await eventsResponse.json();

        setAssignedEvents(
          eventsData
        );

        const attendanceMap = {};

        eventsData.forEach(
          (event) => {
            const eventId =
              getEventId(event);

            if (
              event.attendance_status ===
                "present" &&
              eventId
            ) {
              attendanceMap[
                eventId
              ] = "present";
            }
          }
        );

        setAttendanceStatus(
          attendanceMap
        );
      }

      const upcomingResponse =
        await fetch(
          `${BACKEND_URL}/api/professionals/${userId}/upcoming-events`
        );

      if (upcomingResponse.ok) {
        const upcomingData =
          await upcomingResponse.json();

        setUpcomingEvents(
          upcomingData
        );
      }
    } catch (error) {
      console.error(
        "Event offer action error:",
        error
      );

      alert(
        "Unable to process event offer."
      );
    }
  };

  // =========================================================
  // RENDER SECTION
  // =========================================================

  const renderSection = () => {
    switch (activeSection) {

      // =====================================================
      // DASHBOARD
      // =====================================================

      case "dashboard":
        return (
          <div className="professional-content">

            <h1>
              Professional Dashboard
            </h1>

            <p className="welcome-text">
              Welcome back,{" "}
              {profile.name} 👋
            </p>

            <div className="stats-grid">

              <div className="stat-card">
                <h3>
                  Upcoming Events
                </h3>

                <h2>
                  {upcomingEvents.length}
                </h2>

                <p>
                  Events scheduled
                </p>
              </div>

              <div className="stat-card">
                <h3>
                  Event Offers
                </h3>

                <h2>
                  {offers.length}
                </h2>

                <p>
                  Offers received
                </p>
              </div>

              <div className="stat-card">
                <h3>
                  My Organizers
                </h3>

                <h2>
                  {connections.length}
                </h2>

                <p>
                  Connected organizers
                </p>
              </div>

              <div className="stat-card">
                <h3>
                  Event Requests
                </h3>

                <h2>
                  {
                    eventRequests.filter(
                      (request) =>
                        request.status ===
                        "pending"
                    ).length
                  }
                </h2>

                <p>
                  Pending requests
                </p>
              </div>

            </div>

            <div className="dashboard-card">

              <h2>
                Upcoming Events
              </h2>

              {upcomingEvents.length ===
              0 ? (
                <p>
                  No upcoming events.
                </p>
              ) : (
                upcomingEvents
                  .slice(0, 3)
                  .map(
                    (
                      event,
                      index
                    ) => (
                      <div
                        className="event-item"
                        key={
                          getEventId(
                            event
                          ) ||
                          index
                        }
                      >

                        <div>

                          <h3>
                            {event.title ||
                              event.event_title}
                          </h3>

                          <p>
                            📍{" "}
                            {
                              event.location
                            }
                          </p>

                          <p>
                            📅{" "}
                            {
                              event.event_date
                            }
                          </p>

                        </div>

                        <span className="event-status">
                          Confirmed
                        </span>

                      </div>
                    )
                  )
              )}

            </div>

          </div>
        );

      // =====================================================
      // PROFILE
      // =====================================================

      case "profile":
        return (
          <div className="professional-content profile-page">

            <div className="profile-page-header">

              <div>

                <h1>
                  My Profile
                </h1>

                <p>
                  View and manage your personal and professional information
                </p>

              </div>

            </div>

            <ProfessionalProfile />

          </div>
        );

      // =====================================================
      // EDIT PROFESSIONAL PROFILE
      // =====================================================

      case "edit-profile":
        return (
          <div className="professional-content">

            <button
              className="secondary-btn"
              onClick={() =>
                setActiveSection(
                  "profile"
                )
              }
              style={{
                marginBottom:
                  "20px",
              }}
            >
              ← Back to My Profile
            </button>

            <ProfessionalProfile />

          </div>
        );

      // =====================================================
      // FIND ORGANIZERS
      // =====================================================
      case "organizers":
        return (
          <div className="professional-content">
            <h1>Find Organizers</h1>
      
            <p className="section-description">
              Browse organizers and send connection requests.
            </p>
      
            <div className="organizer-grid">
              {organizers.length === 0 ? (
                <p>No organizers found.</p>
              ) : (
                const [organizers, setOrganizers] = useState([]);
const [professionals, setProfessionals] = useState([]);
const [selectedProfessionals, setSelectedProfessionals] = useState([]);
const [connectionRequests, setConnectionRequests] = useState([]);
const [connections, setConnections] = useState([]);
const [eventAttendance, setEventAttendance] = useState([]);
const [selectedAttendanceEvent, setSelectedAttendanceEvent] = useState(null);
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
const [selectedConversationId, setSelectedConversationId] = useState(null);
const [chatType, setChatType] = useState("professional");
const [selectedProfile, setSelectedProfile] = useState(null);
const [messages, setMessages] = useState([]);
const [messageText, setMessageText] = useState("");
                      </button>
      
                      {organizer.connection_status === "connected" ? (
                        <button className="primary-btn" disabled>
                          Connected
                        </button>
                      ) : organizer.connection_status === "pending" ? (
                        <button className="primary-btn" disabled>
                          Request Sent
                        </button>
                      ) : (
                        <button
                          className="primary-btn"
                          disabled={sendingRequest[organizer.id]}
                          onClick={() =>
                            sendConnectionRequest(organizer.id)
                          }
                        >
                          {sendingRequest[organizer.id]
                            ? "Sending..."
                            : "Connect"}
                        </button>
                      )}
      
                    </div>
                  </div>
                ))
              )}
            </div>
      
            {selectedOrganizer && (
              <div className="profile-modal-overlay">
                <div className="profile-modal">
      
                  <button
                    className="close-btn"
                    onClick={() => setSelectedOrganizer(null)}
                  >
                    ✕
                  </button>
      
                  <div className="organizer-avatar">
                    {(selectedOrganizer.name || "O")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
      
                  <h2>{selectedOrganizer.name}</h2>
      
                  <p>
                    <strong>Company:</strong>{" "}
                    {selectedOrganizer.company ||
                      selectedOrganizer.organization ||
                      "Not available"}
                  </p>
      
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedOrganizer.email || "Not available"}
                  </p>
      
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedOrganizer.phone || "Not available"}
                  </p>
      
                  <p>
                    <strong>Location:</strong>{" "}
                    {selectedOrganizer.location || "Not available"}
                  </p>
      
                  <button
                    className="primary-btn"
                    onClick={() => setSelectedOrganizer(null)}
                  >
                    Close
                  </button>
      
                </div>
              </div>
            )}
          </div>
        );

      // =====================================================
      // CONNECTION REQUESTS + EVENT REQUESTS
      // =====================================================

      case "requests":
        return (
          <div className="professional-content">

            <h1>
              Connection Requests
            </h1>

            <div className="dashboard-card">

              <h2>
                Event Requests
              </h2>

              {eventRequests.length ===
              0 ? (
                <p>
                  No event requests available.
                </p>
              ) : (
                eventRequests.map(
                  (request) => (
                    <div
                      className="request-item"
                      key={
                        request.request_id
                      }
                    >

                      <div>

                        <h3>
                          {
                            request.event_title
                          }
                        </h3>

                        <p>
                          <strong>
                            Organizer:
                          </strong>{" "}
                          {
                            request.organizer_name
                          }
                        </p>

                        <p>
                          <strong>
                            Location:
                          </strong>{" "}
                          {
                            request.event_location
                          }
                        </p>

                        <p>
                          <strong>
                            Date:
                          </strong>{" "}
                          {
                            request.event_date
                          }
                        </p>

                        <p>
                          <strong>
                            Time:
                          </strong>{" "}
                          {
                            request.start_time
                          }{" "}
                          -{" "}
                          {
                            request.end_time
                          }
                        </p>

                        {request.message && (
                          <p>
                            <strong>
                              Message:
                            </strong>{" "}
                            {
                              request.message
                            }
                          </p>
                        )}

                        <p>
                          <strong>
                            Status:
                          </strong>{" "}
                          {
                            request.status
                          }
                        </p>

                      </div>

                      {request.status ===
                        "pending" && (
                        <div className="button-group">

                          <button
                            className="accept-btn"
                            onClick={() =>
                              handleEventRequest(
                                request.request_id,
                                "accept"
                              )
                            }
                          >
                            Accept
                          </button>

                          <button
                            className="reject-btn"
                            onClick={() =>
                              handleEventRequest(
                                request.request_id,
                                "reject"
                              )
                            }
                          >
                            Reject
                          </button>

                        </div>
                      )}

                    </div>
                  )
                )
              )}

            </div>

            <div className="dashboard-card">

              <h2>
                Organizer Connection Requests
              </h2>

              {connectionRequests.length ===
              0 ? (
                <p>
                  No connection requests.
                </p>
              ) : (
                connectionRequests.map(
                  (request) => (
                    <div
                      className="request-item"
                      key={
                        request.id
                      }
                    >

                      <div>

                        <h3>
                          {request.sender_name ||
                            request.name ||
                            "Organizer"}
                        </h3>

                        <p>
                          {request.message ||
                            "Wants to connect with you."}
                        </p>

                      </div>

                      {request.status ===
                        "pending" && (
                        <div className="button-group">

                          <button
                            className="accept-btn"
                            onClick={() =>
                              handleConnectionRequest(
                                request.id,
                                "accept"
                              )
                            }
                          >
                            Accept
                          </button>

                          <button
                            className="reject-btn"
                            onClick={() =>
                              handleConnectionRequest(
                                request.id,
                                "reject"
                              )
                            }
                          >
                            Reject
                          </button>

                        </div>
                      )}

                    </div>
                  )
                )
              )}

            </div>

          </div>
        );

      // =====================================================
      // MY ORGANIZERS
      // =====================================================

      case "my-organizers":
        return (
          <div className="professional-content">

            <h1>
              My Organizers
            </h1>

            <div className="organizer-grid">

              {connections.map(
                (organizer) => (
                  <div
                    className="organizer-card"
                    key={
                      organizer.id
                    }
                  >

                    <div className="organizer-avatar">
                      {(
                        organizer.name ||
                        "O"
                      ).charAt(0)}
                    </div>

                    <h3>
                      {organizer.name}
                    </h3>

                    <p>
                      {organizer.company ||
                        "Event Organizer"}
                    </p>

                    <p>
                      📍{" "}
                      {organizer.location ||
                        ""}
                    </p>

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        openOrganizerChat(
                          organizer
                        )
                      }
                    >
                      Open Chat
                    </button>

                  </div>
                )
              )}

            </div>

          </div>
        );

      // =====================================================
      // OFFERS
      // =====================================================

      case "offers":
        return (
          <div className="professional-content">

            <h1>
              Event Offers
            </h1>

            <p className="section-description">
              Review event offers received
              from organizers.
            </p>

            <div className="offers-list">

              {offers.length === 0 ? (
                <p>
                  No event offers.
                </p>
              ) : (
                offers.map(
                  (
                    offer,
                    index
                  ) => {

                    const offerKey =
                      offer?.staff_id ??
                      offer?.offer_id ??
                      offer?.id ??
                      offer?.event_offer_id ??
                      `offer-${index}`;

                    const offerStatus =
                      offer?.offer_status ??
                      offer?.status ??
                      "pending";

                    const normalizedOfferStatus =
                      String(
                        offerStatus
                      ).toLowerCase();

                    return (
                      <div
                        className="offer-card"
                        key={
                          offerKey
                        }
                      >

                        <div>

                          <h2>
                            {offer.event ||
                              offer.title ||
                              offer.event_title}
                          </h2>

                          <p>
                            <strong>
                              Organizer:
                            </strong>{" "}
                            {offer.organizer ||
                              offer.organizer_name ||
                              ""}
                          </p>

                          <p>
                            <strong>
                              Location:
                            </strong>{" "}
                            {offer.location ||
                              ""}
                          </p>

                          <p>
                            <strong>
                              Date:
                            </strong>{" "}
                            {offer.date ||
                              offer.event_date ||
                              ""}
                          </p>

                          <p>
                            <strong>
                              Role:
                            </strong>{" "}
                            {offer.role ||
                              offer.professional_role ||
                              "Event Staff"}
                          </p>

                          <p>
                            <strong>
                              Status:
                            </strong>{" "}
                            {
                              normalizedOfferStatus
                            }
                          </p>

                        </div>

                        <div className="offer-actions">

                          {[
                            "pending",
                            "applied",
                            "shortlisted",
                          ].includes(
                            normalizedOfferStatus
                          ) ? (
                            <>

                              <button
                                className="accept-btn"
                                onClick={() =>
                                  handleOffer(
                                    offer,
                                    "accept"
                                  )
                                }
                              >
                                Accept
                              </button>

                              <button
                                className="reject-btn"
                                onClick={() =>
                                  handleOffer(
                                    offer,
                                    "reject"
                                  )
                                }
                              >
                                Reject
                              </button>

                            </>
                          ) : (
                            <span className="offer-status">
                              {
                                offerStatus
                              }
                            </span>
                          )}

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>
        );

      // =====================================================
      // UPCOMING EVENTS
      // =====================================================

      case "upcoming":
        return (
          <div className="professional-content">

            <h1>
              Upcoming Events
            </h1>

            <div className="dashboard-card">

              {upcomingEvents.length ===
              0 ? (
                <p>
                  No upcoming events.
                </p>
              ) : (
                upcomingEvents.map(
                  (
                    event,
                    index
                  ) => (
                    <div
                      className="event-item"
                      key={
                        getEventId(
                          event
                        ) ||
                        index
                      }
                    >

                      <div>

                        <h3>
                          {event.title ||
                            event.event_title}
                        </h3>

                        <p>
                          Organizer:{" "}
                          {event.organizer_name ||
                            event.organizer ||
                            ""}
                        </p>

                        <p>
                          📍{" "}
                          {event.location ||
                            ""}
                        </p>

                        <p>
                          📅{" "}
                          {event.event_date ||
                            event.date ||
                            ""}
                        </p>

                      </div>

                      <span className="event-status">
                        Confirmed
                      </span>

                    </div>
                  )
                )
              )}

            </div>

          </div>
        );

      // =====================================================
      // MY EXPERIENCE
      // =====================================================

      case "experience":
        return (
          <div className="professional-content">

            <h1>
              My Experience
            </h1>

            <div className="dashboard-card">

              <h2>
                {profile.skill ||
                  "Event Management"}
              </h2>

              <p>
                {profile.experience ||
                  "2 Years"}{" "}
                of experience working
                in event management and
                event coordination.
              </p>

              <hr />

              <h3>
                Skills
              </h3>

              <div className="skills">

                <span>
                  Event Management
                </span>

                <span>
                  Event Coordination
                </span>

                <span>
                  Team Management
                </span>

                <span>
                  Guest Management
                </span>

              </div>

            </div>

          </div>
        );

      // =====================================================
      // REVIEWS
      // =====================================================

      case "reviews":
        return (
          <div className="professional-content">

            <h1>
              Reviews
            </h1>

            <div className="review-card">

              <div className="review-header">

                <h3>
                  Priya Sharma
                </h3>

                <span>
                  ⭐⭐⭐⭐⭐
                </span>

              </div>

              <p>
                Great professional.
                Very punctual and
                cooperative during the
                event.
              </p>

            </div>

            <div className="review-card">

              <div className="review-header">

                <h3>
                  Rohan Mehta
                </h3>

                <span>
                  ⭐⭐⭐⭐
                </span>

              </div>

              <p>
                Good coordination and
                professional behaviour.
              </p>

            </div>

          </div>
        );

      // =====================================================
      // ATTENDANCE
      // =====================================================

      case "attendance":
        return (
          <div className="professional-content">

            <h1>
              Attendance
            </h1>

            <div className="stats-grid">

              <div className="stat-card">

                <h3>
                  Total Events
                </h3>

                <h2>
                  {assignedEvents.length}
                </h2>

              </div>

              <div className="stat-card">

                <h3>
                  Present
                </h3>

                <h2>
                  {
                    assignedEvents.filter(
                      (event) => {
                        const eventId =
                          getEventId(
                            event
                          );

                        return (
                          attendanceStatus[
                            eventId
                          ] ===
                            "present" ||
                          event.attendance_status ===
                            "present"
                        );
                      }
                    ).length
                  }
                </h2>

              </div>

              <div className="stat-card">

                <h3>
                  Absent
                </h3>

                <h2>
                  {
                    assignedEvents.filter(
                      (event) =>
                        event.attendance_status ===
                        "absent"
                    ).length
                  }
                </h2>

              </div>

            </div>

            <div className="dashboard-card">

              <h2>
                Attendance History
              </h2>

              {assignedEvents.length ===
              0 ? (
                <p>
                  No attendance records.
                </p>
              ) : (
                assignedEvents.map(
                  (
                    event,
                    index
                  ) => {

                    const eventId =
                      getEventId(
                        event
                      );

                    return (
                      <div
                        className="attendance-row"
                        key={
                          eventId ||
                          index
                        }
                      >

                        <span>
                          {event.title}
                        </span>

                        <span>
                          {
                            event.event_date
                          }
                        </span>

                        <strong>
                          {attendanceStatus[
                            eventId
                          ] ===
                          "present"
                            ? "present"
                            : event.attendance_status ||
                              "Not Marked"}
                        </strong>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>
        );

      // =====================================================
      // EARNINGS
      // =====================================================

      case "earnings":
        return (
          <div className="professional-content">

            <h1>
              Earnings
            </h1>

            <div className="stats-grid">

              <div className="stat-card">

                <h3>
                  Total Earnings
                </h3>

                <h2>
                  ₹35,000
                </h2>

              </div>

              <div className="stat-card">

                <h3>
                  This Month
                </h3>

                <h2>
                  ₹12,000
                </h2>

              </div>

              <div className="stat-card">

                <h3>
                  Pending
                </h3>

                <h2>
                  ₹5,000
                </h2>

              </div>

            </div>

            <div className="dashboard-card">

              <h2>
                Payment History
              </h2>

              <div className="payment-row">

                <span>
                  Wedding Celebration
                </span>

                <strong>
                  ₹10,000
                </strong>

              </div>

              <div className="payment-row">

                <span>
                  Corporate Event
                </span>

                <strong>
                  ₹8,000
                </strong>

              </div>

              <div className="payment-row">

                <span>
                  Birthday Event
                </span>

                <strong>
                  ₹7,000
                </strong>

              </div>

            </div>

          </div>
        );

      // =====================================================
      // CHAT
      // =====================================================

      case "chat":
        return (
          <div className="professional-content">

            <h1>
              Organizer Chat
            </h1>

            <div className="chat-box">

              {/* ================================
                  LEFT ORGANIZER LIST
              ================================= */}

              <div className="chat-organizer-list">

                <div className="chat-list-title">
                  My Organizers
                </div>

                {chatOrganizers.length ===
                0 ? (
                  <div
                    style={{
                      padding:
                        "20px",
                      color:
                        "#777",
                    }}
                  >
                    No connected organizers yet.
                  </div>
                ) : (
                  chatOrganizers.map(
                    (organizer) => {

                      const organizerId =
                        Number(
                          organizer.user_id ??
                            organizer.id ??
                            organizer.organizer_id
                        );

                      const isSelected =
                        Number(
                          selectedOrganizer?.user_id
                        ) ===
                        organizerId;

                      return (
                        <div
                          key={
                            organizerId
                          }
                          className={
                            isSelected
                              ? "chat-person active"
                              : "chat-person"
                          }
                          onClick={() =>
                            openOrganizerChat(
                              organizer
                            )
                          }
                        >

                          <div className="organizer-avatar">

                            {(
                              organizer.name ||
                              "O"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {organizer.name ||
                                "Organizer"}
                            </strong>

                            <p>
                              {organizer.email ||
                                "Event Organizer"}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )
                )}

              </div>

              {/* ================================
                  RIGHT CHAT AREA
              ================================= */}

              <div className="chat-main">

                <div className="chat-header">

                  <div>

                    <h3>
                      {selectedOrganizer
                        ? `Chat with ${
                            selectedOrganizer.name ||
                            "Organizer"
                          }`
                        : "Select an Organizer"}
                    </h3>

                    {selectedOrganizer && (
                      <span>
                        {selectedOrganizer.email ||
                          "Connected Organizer"}
                      </span>
                    )}

                  </div>

                </div>

                <div className="messages">

                  {!selectedOrganizer && (
                    <div className="empty-chat">
                      Select an organizer to start chatting.
                    </div>
                  )}

                  {selectedOrganizer &&
                    chatLoading && (
                      <div className="empty-chat">
                        Loading messages...
                      </div>
                    )}

                  {selectedOrganizer &&
                    !chatLoading &&
                    chatMessages.length ===
                      0 && (
                      <div className="empty-chat">
                        No messages yet. Start the conversation.
                      </div>
                    )}

                  {chatMessages.map(
                    (message) => {

                      const isMine =
                        Number(
                          message.sender_id
                        ) ===
                        Number(userId);

                      return (
                        <div
                          key={
                            message.id
                          }
                          className={
                            isMine
                              ? "message sent"
                              : "message received"
                          }
                        >

                          <div>
                            {message.message}
                          </div>

                          <small>
                            {new Date(
                              message.created_at
                            ).toLocaleTimeString(
                              "en-IN",
                              {
                                hour:
                                  "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )}
                          </small>

                        </div>
                      );
                    }
                  )}

                </div>

                {/* ================================
                    CHAT INPUT
                ================================= */}

                <div className="chat-input">

                  <input
                    type="text"
                    value={
                      chatInput
                    }
                    onChange={(e) =>
                      setChatInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        sendChatMessage();
                      }
                    }}
                    placeholder={
                      selectedOrganizer
                        ? "Type a message..."
                        : "Select an organizer first..."
                    }
                    disabled={
                      !selectedOrganizer ||
                      chatSending
                    }
                  />

                  <button
                    className="primary-btn"
                    onClick={
                      sendChatMessage
                    }
                    disabled={
                      !selectedOrganizer ||
                      !chatInput.trim() ||
                      chatSending
                    }
                  >
                    {chatSending
                      ? "Sending..."
                      : "Send"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        );

      // =====================================================
      // MY EVENTS
      // =====================================================

      case "my-events":
        return (
          <div className="professional-content">

            <h1>
              My Events
            </h1>

            {assignedEvents.length ===
            0 ? (
              <div className="dashboard-card">

                <p>
                  No events assigned yet.
                </p>

              </div>
            ) : (
              assignedEvents.map(
                (
                  event,
                  index
                ) => {

                  const eventId =
                    getEventId(
                      event
                    );

                  return (
                    <div
                      className="dashboard-card"
                      key={
                        eventId ||
                        index
                      }
                    >

                      <div className="event-item">

                        <div>

                          <h3>
                            {event.title}
                          </h3>

                          <p>
                            Organizer:{" "}
                            {
                              event.organizer_name
                            }
                          </p>

                          <p>
                            📍{" "}
                            {
                              event.location
                            }
                          </p>

                          <p>
                            📅{" "}
                            {
                              event.event_date
                            }
                          </p>

                          <p>
                            🕐{" "}
                            {
                              event.start_time
                            }{" "}
                            -{" "}
                            {
                              event.end_time
                            }
                          </p>

                          <p>
                            Role:{" "}
                            {
                              event.professional_role ||
                              "Event Staff"
                            }
                          </p>

                        </div>

                        <span className="event-status">
                          {
                            event.staff_status ||
                            "Confirmed"
                          }
                        </span>

                      </div>

                      <hr />

                      <h3>
                        Attendance
                      </h3>

                      {attendanceStatus[
                        eventId
                      ] ===
                      "present" ? (
                        <p>
                          ✓ Present
                        </p>
                      ) : (
                        <button
                          className="primary-btn"
                          disabled={
                            attendanceLoading[
                              eventId
                            ]
                          }
                          onClick={() =>
                            handleAttendance(
                              event
                            )
                          }
                        >
                          {attendanceLoading[
                            eventId
                          ]
                            ? "Checking Location..."
                            : "Mark Present"}
                        </button>
                      )}

                    </div>
                  );
                }
              )
            )}

          </div>
        );

      // =====================================================
      // DEFAULT
      // =====================================================

      default:
        return null;
    }
  };

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="professional-dashboard">

      {/* SIDEBAR */}

      <aside className="professional-sidebar">

        <div className="sidebar-logo">

          <h2>
            CrewAura
          </h2>

        </div>

        <nav>

          <button
            className={
              activeSection ===
              "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "dashboard"
              )
            }
          >
            🏠 Dashboard
          </button>

          <button
            className={
              activeSection ===
              "profile"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "profile"
              )
            }
          >
            👤 My Profile
          </button>

          <button
            className={
              activeSection ===
              "organizers"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "organizers"
              )
            }
          >
            🔎 Find Organizers
          </button>

          <button
            className={
              activeSection ===
              "requests"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "requests"
              )
            }
          >
            🤝 Connection Requests

            {eventRequests.filter(
              (request) =>
                request.status ===
                "pending"
            ).length > 0 && (
              <span
                style={{
                  marginLeft:
                    "6px",
                }}
              >
                (
                {
                  eventRequests.filter(
                    (request) =>
                      request.status ===
                      "pending"
                  ).length
                }
                )
              </span>
            )}

          </button>

          <button
            className={
              activeSection ===
              "my-organizers"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "my-organizers"
              )
            }
          >
            👥 My Organizers
          </button>

          <button
            className={
              activeSection ===
              "offers"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "offers"
              )
            }
          >
            📩 Event Offers
          </button>

          <button
            className={
              activeSection ===
              "upcoming"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "upcoming"
              )
            }
          >
            📅 Upcoming Events
          </button>

          <button
            className={
              activeSection ===
              "my-events"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "my-events"
              )
            }
          >
            🗓️ My Events
          </button>

          <button
            className={
              activeSection ===
              "experience"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "experience"
              )
            }
          >
            💼 My Experience
          </button>

          <button
            className={
              activeSection ===
              "reviews"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "reviews"
              )
            }
          >
            ⭐ Reviews
          </button>

          <button
            className={
              activeSection ===
              "attendance"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "attendance"
              )
            }
          >
            📋 Attendance
          </button>

          <button
            className={
              activeSection ===
              "earnings"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "earnings"
              )
            }
          >
            💰 Earnings
          </button>

          <button
            className={
              activeSection ===
              "chat"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "chat"
              )
            }
          >
            💬 Organizer Chat
          </button>

        </nav>

        <button
          className="logout-btn"
          onClick={() => {

            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "user"
            );

            window.location.href =
              "/login";
          }}
        >
          🚪 Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}

      <main className="professional-main">

        <header className="professional-topbar">

          <div>

            <h2>
              Professional Panel
            </h2>

          </div>

          <div className="topbar-right">

            <span className="notification">
              🔔
            </span>

            <div className="top-profile">

              <div className="small-avatar">

                {profile.name
                  ? profile.name.charAt(0)
                  : "P"}

              </div>

              <span>
                {profile.name}
              </span>

            </div>

          </div>

        </header>

        {renderSection()}

      </main>

    </div>
  );
}

export default ProfessionalDashboard;