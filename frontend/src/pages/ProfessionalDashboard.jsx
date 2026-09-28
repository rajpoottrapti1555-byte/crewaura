import { useEffect, useState } from "react";

function ProfessionalDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [offers, setOffers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState({});

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    skill: "",
    experience: "",
    location: "",
  });

  /*
  =========================================================
  LOAD PROFESSIONAL DATA
  =========================================================
  */

  useEffect(() => {
    const loadProfessionalData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!storedUser || !storedUser.id) {
          console.error("Professional user not found");
          return;
        }

        const userId = storedUser.id;

        /*
        =========================
        PROFILE
        =========================
        */

        const profileResponse = await fetch(
          `http://localhost:5500/api/professionals/profile/${userId}`
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();

          setProfile({
            name: profileData.name || storedUser.name || "",
            email: profileData.email || storedUser.email || "",
            phone: profileData.phone || "",
            skill: profileData.skills || "",
            experience: profileData.experience_years
              ? `${profileData.experience_years} Years`
              : "0 Years",
            location: profileData.city || "",
          });
        } else {
          setProfile((previousProfile) => ({
            ...previousProfile,
            name: storedUser.name || "",
            email: storedUser.email || "",
          }));
        }

        /*
        =========================
        CONNECTIONS
        =========================
        */

        const connectionsResponse = await fetch(
          `http://localhost:5500/api/professionals/${userId}/connections`
        );

        if (connectionsResponse.ok) {
          const connectionsData = await connectionsResponse.json();

          setConnections(
            connectionsData.map((connection) => ({
              id: connection.connection_id || connection.id,
              name: connection.name || "Organizer",
              company:
                connection.organization_name ||
                connection.company ||
                connection.name ||
                "Event Organizer",
              location:
                connection.city ||
                connection.location ||
                "",
            }))
          );
        }

        /*
        =========================
        CONNECTION REQUESTS
        =========================
        */

        const requestsResponse = await fetch(
          `http://localhost:5500/api/professionals/${userId}/connection-requests`
        );

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();

          setConnectionRequests(requestsData);
        }

        /*
        =========================
        EVENT OFFERS
        =========================
        */

        const offersResponse = await fetch(
          `http://localhost:5500/api/professionals/${userId}/event-offers`
        );

        if (offersResponse.ok) {
          const offersData = await offersResponse.json();

          setOffers(
            offersData.map((offer) => ({
              id: offer.staff_id,
              event: offer.title || "Event",
              organizer:
                offer.organization_name ||
                offer.organizer_name ||
                "Event Organizer",
              location: offer.location || "",
              date: offer.event_date
                ? new Date(offer.event_date).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )
                : "",
              role: offer.professional_role || "Event Staff",
              status:
                offer.offer_status === "confirmed"
                  ? "Accepted"
                  : offer.offer_status === "rejected"
                  ? "Rejected"
                  : "Pending",
            }))
          );
        }

        /*
        =========================
        UPCOMING EVENTS
        =========================
        */

        const upcomingResponse = await fetch(
          `http://localhost:5500/api/professionals/${userId}/upcoming-events`
        );

        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json();

          setUpcomingEvents(upcomingData);

          console.log("Upcoming Events:", upcomingData);
        }

        /*
        =========================
        ALL ASSIGNED EVENTS
        =========================
        */

        const assignedResponse = await fetch(
          `http://localhost:5500/api/events/professional/${userId}`
        );

        if (assignedResponse.ok) {
          const assignedData = await assignedResponse.json();

          setAssignedEvents(assignedData);

          console.log("Assigned Events:", assignedData);
        }
      } catch (error) {
        console.error("Error loading professional data:", error);
      }
    };

    loadProfessionalData();
  }, []);

  /*
  =========================================================
  ACCEPT / REJECT EVENT OFFER
  =========================================================
  */

  const handleOffer = async (id, status) => {
    try {
      const action = status === "Accepted" ? "accept" : "reject";

      const response = await fetch(
        `http://localhost:5500/api/professionals/event-offers/${id}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to update event offer");
        return;
      }

      setOffers((previousOffers) =>
        previousOffers.map((offer) =>
          offer.id === id
            ? {
                ...offer,
                status,
              }
            : offer
        )
      );

      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (storedUser?.id) {
        const upcomingResponse = await fetch(
          `http://localhost:5500/api/professionals/${storedUser.id}/upcoming-events`
        );

        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json();

          setUpcomingEvents(upcomingData);
        }

        const assignedResponse = await fetch(
          `http://localhost:5500/api/events/professional/${storedUser.id}`
        );

        if (assignedResponse.ok) {
          const assignedData = await assignedResponse.json();

          setAssignedEvents(assignedData);
        }
      }

      alert(
        status === "Accepted"
          ? "Event offer accepted!"
          : "Event offer rejected!"
      );
    } catch (error) {
      console.error("Offer update error:", error);

      alert("Unable to connect to server");
    }
  };

  /*
  =========================================================
  GPS ATTENDANCE
  =========================================================
  */

  const handleAttendance = (eventId, status) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || !storedUser.id) {
      alert("Professional information not found");
      return;
    }

    setAttendanceLoading((previous) => ({
      ...previous,
      [eventId]: true,
    }));

    if (!navigator.geolocation) {
      alert("GPS is not supported by this browser");

      setAttendanceLoading((previous) => ({
        ...previous,
        [eventId]: false,
      }));

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const response = await fetch(
            `http://localhost:5500/api/events/${eventId}/attendance/${storedUser.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status,
                latitude,
                longitude,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            alert(data.message || "Unable to mark attendance");
            return;
          }

          alert(
            `${data.message}${
              data.distance !== undefined
                ? ` Distance: ${data.distance} meters`
                : ""
            }`
          );

          /*
          Refresh assigned events
          */

          const assignedResponse = await fetch(
            `http://localhost:5500/api/events/professional/${storedUser.id}`
          );

          if (assignedResponse.ok) {
            const assignedData = await assignedResponse.json();

            setAssignedEvents(assignedData);
          }
        } catch (error) {
          console.error("Attendance Error:", error);

          alert("Unable to connect to server");
        } finally {
          setAttendanceLoading((previous) => ({
            ...previous,
            [eventId]: false,
          }));
        }
      },
      (error) => {
        console.error("GPS Error:", error);

        let message = "Unable to get your location.";

        if (error.code === 1) {
          message =
            "Location permission denied. Please allow location access.";
        } else if (error.code === 2) {
          message =
            "Your location could not be determined.";
        } else if (error.code === 3) {
          message =
            "Location request timed out. Please try again.";
        }

        alert(message);

        setAttendanceLoading((previous) => ({
          ...previous,
          [eventId]: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /*
  =========================================================
  ACCEPT / REJECT CONNECTION REQUEST
  =========================================================
  */

  const handleConnectionRequest = async (requestId, action) => {
    try {
      if (!requestId) {
        alert("Invalid connection request");
        return;
      }

      const response = await fetch(
        `http://localhost:5500/api/connections/${requestId}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Unable to update connection request"
        );
        return;
      }

      setConnectionRequests((previousRequests) =>
        previousRequests.filter(
          (request) =>
            (request.id || request.request_id) !== requestId
        )
      );

      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (storedUser?.id) {
        const connectionsResponse = await fetch(
          `http://localhost:5500/api/professionals/${storedUser.id}/connections`
        );

        if (connectionsResponse.ok) {
          const connectionsData =
            await connectionsResponse.json();

          setConnections(
            connectionsData.map((connection) => ({
              id:
                connection.connection_id ||
                connection.id,

              name:
                connection.name ||
                "Organizer",

              company:
                connection.organization_name ||
                connection.company ||
                connection.name ||
                "Event Organizer",

              location:
                connection.city ||
                connection.location ||
                "",
            }))
          );
        }
      }

      alert(
        action === "accept"
          ? "Connection request accepted!"
          : "Connection request rejected!"
      );
    } catch (error) {
      console.error(
        "Connection request error:",
        error
      );

      alert("Unable to connect to server");
    }
  };

  /*
  =========================================================
  RENDER SECTION
  =========================================================
  */

  const renderSection = () => {
    switch (activeSection) {

      /*
      =====================================================
      DASHBOARD
      =====================================================
      */

      case "dashboard":
        return (
          <div className="professional-content">
            <h1>Professional Dashboard</h1>

            <p className="welcome-text">
              Welcome back, {profile.name || "Professional"} 👋
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Upcoming Events</h3>
                <h2>{upcomingEvents.length}</h2>
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
                <h2>{profile.experience || "0 Years"}</h2>
                <p>Professional experience</p>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>Upcoming Events</h2>

              {upcomingEvents.length === 0 ? (
                <div className="event-item">
                  <div>
                    <h3>No upcoming events</h3>
                    <p>
                      No confirmed events are currently scheduled.
                    </p>
                  </div>

                  <span className="event-status">None</span>
                </div>
              ) : (
                upcomingEvents.slice(0, 3).map((event) => (
                  <div
                    className="event-item"
                    key={event.staff_id || event.id}
                  >
                    <div>
                      <h3>{event.title}</h3>

                      <p>
                        Organizer:{" "}
                        {event.organization_name ||
                          event.organizer_name ||
                          "Organizer"}
                      </p>

                      <p>
                        📍{" "}
                        {event.location ||
                          "Location not available"}
                      </p>

                      <p>
                        📅{" "}
                        {event.event_date
                          ? new Date(
                              event.event_date
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Date not available"}
                      </p>
                    </div>

                    <span className="event-status">
                      Confirmed
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      /*
      =====================================================
      PROFILE
      =====================================================
      */

      case "profile":
        return (
          <div className="professional-content">
            <h1>My Profile</h1>

            <div className="profile-card">
              <div className="profile-avatar">
                {profile.name
                  ? profile.name.charAt(0).toUpperCase()
                  : "P"}
              </div>

              <h2>
                {profile.name || "Professional User"}
              </h2>

              <p>Professional / Event Worker</p>

              <div className="profile-details">
                <p>
                  <strong>Email:</strong>{" "}
                  {profile.email || "Not available"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {profile.phone || "Not available"}
                </p>

                <p>
                  <strong>Skill:</strong>{" "}
                  {profile.skill || "Not available"}
                </p>

                <p>
                  <strong>Experience:</strong>{" "}
                  {profile.experience || "0 Years"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {profile.location || "Not available"}
                </p>
              </div>

              <button className="primary-btn">
                Edit Profile
              </button>
            </div>
          </div>
        );

      /*
      =====================================================
      FIND ORGANIZERS
      =====================================================
      */

      case "organizers":
        return (
          <div className="professional-content">
            <h1>Find Organizers</h1>

            <p className="section-description">
              Connect with event organizers and get more
              opportunities.
            </p>

            {connections.length === 0 ? (
              <div className="dashboard-card">
                <h3>No organizers connected yet</h3>

                <p>
                  Organizers you connect with will appear here.
                </p>
              </div>
            ) : (
              <div className="organizer-grid">
                {connections.map((organizer) => (
                  <div
                    className="organizer-card"
                    key={organizer.id}
                  >
                    <div className="organizer-avatar">
                      {organizer.name
                        ? organizer.name
                            .charAt(0)
                            .toUpperCase()
                        : "O"}
                    </div>

                    <h3>{organizer.name}</h3>

                    <p>{organizer.company}</p>

                    <p>
                      📍{" "}
                      {organizer.location ||
                        "Location not available"}
                    </p>

                    <button className="primary-btn">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /*
      =====================================================
      CONNECTION REQUESTS
      =====================================================
      */

      case "requests":
        return (
          <div className="professional-content">
            <h1>Connection Requests</h1>

            {connectionRequests.length === 0 ? (
              <div className="dashboard-card">
                <h3>No connection requests</h3>

                <p>
                  New organizer connection requests will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="dashboard-card">
                {connectionRequests.map((request) => (
                  <div
                    className="request-item"
                    key={
                      request.id ||
                      request.request_id
                    }
                  >
                    <div>
                      <h3>
                        {request.name ||
                          request.sender_name ||
                          "Organizer"}
                      </h3>

                      <p>
                        wants to connect with you.
                      </p>
                    </div>

                    <div className="button-group">
                      <button
                        className="accept-btn"
                        onClick={() =>
                          handleConnectionRequest(
                            request.id ||
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
                          handleConnectionRequest(
                            request.id ||
                              request.request_id,
                            "reject"
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
          </div>
        );

      /*
      =====================================================
      MY ORGANIZERS
      =====================================================
      */

      case "my-organizers":
        return (
          <div className="professional-content">
            <h1>My Organizers</h1>

            {connections.length === 0 ? (
              <div className="dashboard-card">
                <h3>No organizers yet</h3>

                <p>
                  Your accepted organizer connections will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="organizer-grid">
                {connections.map((organizer) => (
                  <div
                    className="organizer-card"
                    key={organizer.id}
                  >
                    <div className="organizer-avatar">
                      {organizer.name
                        ? organizer.name
                            .charAt(0)
                            .toUpperCase()
                        : "O"}
                    </div>

                    <h3>{organizer.name}</h3>

                    <p>{organizer.company}</p>

                    <p>
                      📍{" "}
                      {organizer.location ||
                        "Location not available"}
                    </p>

                    <button className="secondary-btn">
                      Open Chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /*
      =====================================================
      EVENT OFFERS
      =====================================================
      */

      case "offers":
        return (
          <div className="professional-content">
            <h1>Event Offers</h1>

            <p className="section-description">
              Review event offers received from organizers.
            </p>

            {offers.length === 0 ? (
              <div className="dashboard-card">
                <h3>No event offers</h3>

                <p>
                  New event offers from organizers will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="offers-list">
                {offers.map((offer) => (
                  <div
                    className="offer-card"
                    key={offer.id}
                  >
                    <div>
                      <h2>{offer.event}</h2>

                      <p>
                        <strong>Organizer:</strong>{" "}
                        {offer.organizer}
                      </p>

                      <p>
                        <strong>Location:</strong>{" "}
                        {offer.location ||
                          "Not available"}
                      </p>

                      <p>
                        <strong>Date:</strong>{" "}
                        {offer.date ||
                          "Not available"}
                      </p>

                      <p>
                        <strong>Role:</strong>{" "}
                        {offer.role}
                      </p>
                    </div>

                    <div className="offer-actions">
                      {offer.status === "Pending" ? (
                        <>
                          <button
                            className="accept-btn"
                            onClick={() =>
                              handleOffer(
                                offer.id,
                                "Accepted"
                              )
                            }
                          >
                            Accept
                          </button>

                          <button
                            className="reject-btn"
                            onClick={() =>
                              handleOffer(
                                offer.id,
                                "Rejected"
                              )
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
            )}
          </div>
        );

      /*
      =====================================================
      UPCOMING EVENTS
      =====================================================
      */

      case "upcoming":
        return (
          <div className="professional-content">
            <h1>Upcoming Events</h1>

            {upcomingEvents.length === 0 ? (
              <div className="dashboard-card">
                <h3>No upcoming events</h3>

                <p>
                  You don't have any confirmed upcoming events
                  right now.
                </p>
              </div>
            ) : (
              <div className="dashboard-card">
                {upcomingEvents.map((event) => (
                  <div
                    className="event-item"
                    key={
                      event.staff_id ||
                      event.id
                    }
                  >
                    <div>
                      <h3>{event.title}</h3>

                      <p>
                        Organizer:{" "}
                        {event.organization_name ||
                          event.organizer_name ||
                          "Organizer"}
                      </p>

                      <p>
                        📍{" "}
                        {event.location ||
                          "Location not available"}
                      </p>

                      <p>
                        📅{" "}
                        {event.event_date
                          ? new Date(
                              event.event_date
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "Date not available"}
                      </p>

                      {event.professional_role && (
                        <p>
                          💼 Role:{" "}
                          {event.professional_role}
                        </p>
                      )}
                    </div>

                    <span className="event-status">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /*
      =====================================================
      EXPERIENCE
      =====================================================
      */

      case "experience":
        return (
          <div className="professional-content">
            <h1>My Experience</h1>

            <div className="dashboard-card">
              <h2>Event Management</h2>

              <p>
                {profile.experience ||
                  "Experience information is not available yet."}
              </p>

              <hr />

              <h3>Skills</h3>

              <div className="skills">
                {profile.skill ? (
                  profile.skill
                    .split(",")
                    .map((skill, index) => (
                      <span key={index}>
                        {skill.trim()}
                      </span>
                    ))
                ) : (
                  <>
                    <span>Event Management</span>
                    <span>Event Coordination</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      /*
      =====================================================
      REVIEWS
      =====================================================
      */

      case "reviews":
        return (
          <div className="professional-content">
            <h1>Reviews</h1>

            <div className="review-card">
              <div className="review-header">
                <h3>Reviews</h3>
                <span>⭐</span>
              </div>

              <p>
                Review information will appear here when
                organizers submit reviews for your work.
              </p>
            </div>
          </div>
        );

      /*
      =====================================================
      ATTENDANCE
      =====================================================
      */

      case "attendance":
        return (
          <div className="professional-content">
            <h1>Attendance</h1>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Assigned Events</h3>
                <h2>{assignedEvents.length}</h2>
              </div>

              <div className="stat-card">
                <h3>Confirmed Events</h3>

                <h2>
                  {
                    assignedEvents.filter(
                      (event) =>
                        event.staff_status ===
                        "confirmed"
                    ).length
                  }
                </h2>
              </div>

              <div className="stat-card">
                <h3>Completed Events</h3>

                <h2>
                  {
                    assignedEvents.filter(
                      (event) =>
                        event.staff_status ===
                          "completed" ||
                        event.event_status ===
                          "completed"
                    ).length
                  }
                </h2>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>Event Attendance</h2>

              {assignedEvents.length === 0 ? (
                <p>
                  No assigned events available.
                </p>
              ) : (
                assignedEvents.map((event) => (
                  <div
                    className="attendance-row"
                    key={
                      event.staff_id ||
                      event.event_id
                    }
                  >
                    <div>
                      <strong>{event.title}</strong>

                      <p>
                        {event.event_date
                          ? new Date(
                              event.event_date
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "Date unavailable"}
                      </p>

                      <p>
                        Status:{" "}
                        {event.staff_status ||
                          "Assigned"}
                      </p>
                    </div>

                    <div className="button-group">
                      <button
                        className="accept-btn"
                        disabled={
                          attendanceLoading[
                            event.event_id
                          ]
                        }
                        onClick={() =>
                          handleAttendance(
                            event.event_id,
                            "present"
                          )
                        }
                      >
                        {attendanceLoading[
                          event.event_id
                        ]
                          ? "Checking..."
                          : "Mark Present"}
                      </button>

                      <button
                        className="reject-btn"
                        disabled={
                          attendanceLoading[
                            event.event_id
                          ]
                        }
                        onClick={() =>
                          handleAttendance(
                            event.event_id,
                            "absent"
                          )
                        }
                      >
                        Mark Absent
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      /*
      =====================================================
      EARNINGS
      =====================================================
      */

      case "earnings":
        return (
          <div className="professional-content">
            <h1>Earnings</h1>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Earnings</h3>
                <h2>₹0</h2>
              </div>

              <div className="stat-card">
                <h3>This Month</h3>
                <h2>₹0</h2>
              </div>

              <div className="stat-card">
                <h3>Pending</h3>
                <h2>₹0</h2>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>Payment History</h2>

              <p>
                Earnings and payment history will appear here
                once the payment module is connected.
              </p>
            </div>
          </div>
        );

      /*
      =====================================================
      CHAT
      =====================================================
      */

      case "chat":
        return (
          <div className="professional-content">
            <h1>Organizer Chat</h1>

            <div className="chat-box">
              <div className="chat-header">
                <h3>
                  {connections.length > 0
                    ? connections[0].name
                    : "Organizer"}
                </h3>

                <span>Online</span>
              </div>

              <div className="messages">
                <div className="message received">
                  Hello! Are you available for our
                  upcoming event?
                </div>

                <div className="message sent">
                  Yes, I am available.
                </div>

                <div className="message received">
                  Great! I will send you the event
                  details.
                </div>
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                />

                <button className="primary-btn">
                  Send
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /*
  =========================================================
  MAIN UI
  =========================================================
  */

  return (
    <div className="professional-dashboard">

      {/* Sidebar */}

      <aside className="professional-sidebar">

        <div className="sidebar-logo">
          <h2>CrewAura</h2>
        </div>

        <nav>

          <button
            className={
              activeSection === "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("dashboard")
            }
          >
            🏠 Dashboard
          </button>

          <button
            className={
              activeSection === "profile"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("profile")
            }
          >
            👤 My Profile
          </button>

          <button
            className={
              activeSection === "organizers"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("organizers")
            }
          >
            🔎 Find Organizers
          </button>

          <button
            className={
              activeSection === "requests"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("requests")
            }
          >
            🤝 Connection Requests
          </button>

          <button
            className={
              activeSection === "my-organizers"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("my-organizers")
            }
          >
            👥 My Organizers
          </button>

          <button
            className={
              activeSection === "offers"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("offers")
            }
          >
            📩 Event Offers
          </button>

          <button
            className={
              activeSection === "upcoming"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("upcoming")
            }
          >
            📅 Upcoming Events
          </button>

          <button
            className={
              activeSection === "experience"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("experience")
            }
          >
            💼 My Experience
          </button>

          <button
            className={
              activeSection === "reviews"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("reviews")
            }
          >
            ⭐ Reviews
          </button>

          <button
            className={
              activeSection === "attendance"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("attendance")
            }
          >
            📋 Attendance
          </button>

          <button
            className={
              activeSection === "earnings"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("earnings")
            }
          >
            💰 Earnings
          </button>

          <button
            className={
              activeSection === "chat"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("chat")
            }
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

            <span className="notification">
              🔔
            </span>

            <div className="top-profile">

              <div className="small-avatar">
                {profile.name
                  ? profile.name
                      .charAt(0)
                      .toUpperCase()
                  : "P"}
              </div>

              <span>
                {profile.name || "Professional"}
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