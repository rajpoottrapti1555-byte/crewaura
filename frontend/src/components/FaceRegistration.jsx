import { useState } from "react";

function FaceRegistration({ userId, onRegistered }) {
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const registerFace = async () => {
    if (!userId) {
      setError("User not found. Please login again.");
      return;
    }

    try {
      setProcessing(true);
      setMessage("Starting face registration...");
      setError("");

      const response = await fetch(
        `http://localhost:5001/register-face/${userId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to register face."
        );
      }

      setMessage(
        `✓ Face registered successfully! ${data.samples} samples saved and trained.`
      );

      if (onRegistered) {
        onRegistered();
      }
    } catch (err) {
      console.error("Face registration error:", err);

      setError(
        err.message ||
          "Unable to register face. Make sure the face recognition service is running."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        background: "#fafafa",
      }}
    >
      <h3>Face Recognition</h3>

      <p
        style={{
          marginTop: "8px",
          color: "#666",
        }}
      >
        Register your face once. It will be used to verify your
        identity during attendance.
      </p>

      <button
        type="button"
        onClick={registerFace}
        disabled={processing}
        className="save-profile-button"
        style={{ marginTop: "15px" }}
      >
        {processing
          ? "📷 Registering Face..."
          : "📷 Register My Face"}
      </button>

      {message && (
        <p
          style={{
            marginTop: "12px",
            color: "#198754",
            fontWeight: "600",
          }}
        >
          {message}
        </p>
      )}

      {error && (
        <p
          style={{
            marginTop: "12px",
            color: "#dc3545",
            fontWeight: "600",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default FaceRegistration;