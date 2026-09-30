
import { useEffect, useState } from "react";
import FaceRegistration from "../components/FaceRegistration";

function ProfessionalProfile() {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    phone: "",
    skills: "",
    experience_years: "",
    city: "",
    availability: "available",
    bio: "",
    previous_job: "",
    job_title: "",
    event_experience: "",
    certifications: "",
    languages: "",
    expected_rate: "",

    date_of_birth: "",
    gender: "",
    address: "",
    state: "",
    pincode: "",
    aadhaar_number: "",
    profile_photo: "",
  });

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("STORED USER:", storedUser);

    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      const loggedUser = JSON.parse(storedUser);
      setUserId(loggedUser.id);
    } catch (error) {
      console.error("Invalid user:", error);
      setLoading(false);
    }
  }, []);

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5500/api/profile/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load profile"
          );
        }

        setUser(data.user || null);
        setProfile(data.profile || null);

        if (data.profile) {
          const p = data.profile;

          setFormData({
            phone: p.phone || "",
            skills: p.skills || "",
            experience_years: p.experience_years ?? "",
            city: p.city || "",
            availability: p.availability || "available",
            bio: p.bio || "",
            previous_job: p.previous_job || "",
            job_title: p.job_title || "",
            event_experience: p.event_experience || "",
            certifications: p.certifications || "",
            languages: p.languages || "",
            expected_rate: p.expected_rate ?? "",

            date_of_birth: p.date_of_birth
              ? p.date_of_birth.substring(0, 10)
              : "",

            gender: p.gender || "",
            address: p.address || "",
            state: p.state || "",
            pincode: p.pincode || "",

            // Backend does not return complete Aadhaar
            aadhaar_number: "",

            profile_photo: p.profile_photo || "",
          });
        }
      } catch (error) {
        console.error("Profile loading error:", error);
        setMessage("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "aadhaar_number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.replace(/\D/g, "").slice(0, 12),
      }));

      return;
    }

    if (name === "pincode") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.replace(/\D/g, "").slice(0, 10),
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage("User not found. Please login again.");
      return;
    }

    if (
      formData.aadhaar_number &&
      formData.aadhaar_number.length !== 12
    ) {
      setMessage("Aadhaar number must contain 12 digits.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5500/api/profile/professional",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: userId,

            phone: formData.phone,
            skills: formData.skills,
            experience_years: formData.experience_years,
            city: formData.city,
            availability: formData.availability,
            bio: formData.bio,
            previous_job: formData.previous_job,
            job_title: formData.job_title,
            event_experience: formData.event_experience,
            certifications: formData.certifications,
            languages: formData.languages,
            expected_rate: formData.expected_rate,

            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            address: formData.address,
            state: formData.state,
            pincode: formData.pincode,
            aadhaar_number: formData.aadhaar_number,
            profile_photo: formData.profile_photo,

            services: [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save profile"
        );
      }

      // Reload profile
      const refresh = await fetch(
        `http://localhost:5500/api/profile/${userId}`
      );

      const refreshedData = await refresh.json();

      setUser(refreshedData.user || user);
      setProfile(refreshedData.profile || null);

      if (refreshedData.profile) {
        const p = refreshedData.profile;

        setFormData({
          phone: p.phone || "",
          skills: p.skills || "",
          experience_years: p.experience_years ?? "",
          city: p.city || "",
          availability: p.availability || "available",
          bio: p.bio || "",
          previous_job: p.previous_job || "",
          job_title: p.job_title || "",
          event_experience: p.event_experience || "",
          certifications: p.certifications || "",
          languages: p.languages || "",
          expected_rate: p.expected_rate ?? "",

          date_of_birth: p.date_of_birth
            ? p.date_of_birth.substring(0, 10)
            : "",

          gender: p.gender || "",
          address: p.address || "",
          state: p.state || "",
          pincode: p.pincode || "",
          aadhaar_number: "",
          profile_photo: p.profile_photo || "",
        });
      }

      setIsEditing(false);
      setMessage("Profile updated successfully!");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Save profile error:", error);
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    if (!profile) {
      setIsEditing(false);
      return;
    }

    const p = profile;

    setFormData({
      phone: p.phone || "",
      skills: p.skills || "",
      experience_years: p.experience_years ?? "",
      city: p.city || "",
      availability: p.availability || "available",
      bio: p.bio || "",
      previous_job: p.previous_job || "",
      job_title: p.job_title || "",
      event_experience: p.event_experience || "",
      certifications: p.certifications || "",
      languages: p.languages || "",
      expected_rate: p.expected_rate ?? "",

      date_of_birth: p.date_of_birth
        ? p.date_of_birth.substring(0, 10)
        : "",

      gender: p.gender || "",
      address: p.address || "",
      state: p.state || "",
      pincode: p.pincode || "",
      aadhaar_number: "",
      profile_photo: p.profile_photo || "",
    });

    setMessage("");
    setIsEditing(false);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  const name = user?.name || "Professional";
  const email = user?.email || "Email not available";

  const initial = name.charAt(0).toUpperCase();

  const statusText = {
    available: "Available",
    busy: "Busy",
    unavailable: "Unavailable",
  };

  // =====================================================
  // VIEW MODE
  // =====================================================

  if (!isEditing) {
    return (
      <div className="profile-wrapper">

        {/* PROFILE HERO */}
        <div className="profile-hero-card">

          <div className="profile-hero-left">

            <div className="profile-large-avatar">

              {formData.profile_photo ? (
                <img
                  src={formData.profile_photo}
                  alt="Profile"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling.style.display =
                      "flex";
                  }}
                />
              ) : null}

              <span
                style={{
                  display: formData.profile_photo
                    ? "none"
                    : "flex",
                }}
              >
                {initial}
              </span>

            </div>

            <div className="profile-hero-info">

              <h2>{name}</h2>

              <p className="profile-role">
                {formData.job_title ||
                  "Professional / Event Worker"}
              </p>

              <p className="profile-email">
                ✉ {email}
              </p>

              <div className="profile-status-row">

                <span
                  className={`profile-status ${formData.availability}`}
                >
                  ●{" "}
                  {statusText[
                    formData.availability
                  ] || "Available"}
                </span>

                {formData.city && (
                  <span className="profile-location">
                    📍 {formData.city}
                  </span>
                )}

              </div>
            </div>
          </div>

          <button
            className="profile-edit-button"
            onClick={() => setIsEditing(true)}
          >
            ✎ Edit Profile
          </button>

        </div>

        {/* MESSAGE */}
        {message && (
          <div className="profile-success">
            ✓ {message}
          </div>
        )}

        {/* PERSONAL */}
        <ProfileCard title="Personal Information" icon="👤">

          <ProfileItem
            label="Full Name"
            value={name}
          />

          <ProfileItem
            label="Email"
            value={email}
          />

          <ProfileItem
            label="Phone"
            value={formData.phone}
          />

          <ProfileItem
            label="Date of Birth"
            value={formatDate(formData.date_of_birth)}
          />

          <ProfileItem
            label="Gender"
            value={formData.gender}
          />

        </ProfileCard>

        {/* PROFESSIONAL */}
        <ProfileCard
          title="Professional Information"
          icon="💼"
        >

          <ProfileItem
            label="Job Title"
            value={formData.job_title}
          />

          <ProfileItem
            label="Experience"
            value={
              formData.experience_years
                ? `${formData.experience_years} Years`
                : ""
            }
          />

          <ProfileItem
            label="Previous Job"
            value={formData.previous_job}
          />

          <ProfileItem
            label="Expected Rate"
            value={
              formData.expected_rate
                ? `₹${formData.expected_rate}`
                : ""
            }
          />

          <ProfileItem
            label="Skills"
            value={formData.skills}
            full
          />

          <ProfileItem
            label="Event Experience"
            value={formData.event_experience}
            full
          />

          <ProfileItem
            label="Certifications"
            value={formData.certifications}
          />

          <ProfileItem
            label="Languages"
            value={formData.languages}
          />

        </ProfileCard>

        {/* ADDRESS */}
        <ProfileCard title="Location" icon="📍">

          <ProfileItem
            label="Address"
            value={formData.address}
            full
          />

          <ProfileItem
            label="City"
            value={formData.city}
          />

          <ProfileItem
            label="State"
            value={formData.state}
          />

          <ProfileItem
            label="Pincode"
            value={formData.pincode}
          />

        </ProfileCard>

        {/* ABOUT */}
        <ProfileCard title="About Me" icon="✨">

          <div className="profile-about">
            {formData.bio ||
              "No professional bio added yet."}
          </div>

        </ProfileCard>

        {/* VERIFICATION */}
        <ProfileCard
          title="Identity Verification"
          icon="🛡️"
        >

          <div className="verification-box">

            <div>
              <span>Aadhaar Number</span>

              <strong>
                {profile?.aadhaar_last4
                  ? `•••• •••• ${profile.aadhaar_last4}`
                  : "Not Added"}
              </strong>
            </div>

            {profile?.aadhaar_verified ? (
              <span className="verified">
                ✓ Verified
              </span>
            ) : (
              <span className="not-verified">
                Not Verified
              </span>
            )}

          </div>

        </ProfileCard>
        {/* FACE REGISTRATION */}

<ProfileCard
  title="Face Recognition"
  icon="📷"
>
  <div
    style={{
      gridColumn: "1 / -1",
    }}
  >
    <FaceRegistration
      userId={userId}
      onRegistered={() => {
        setMessage(
          "Face registration completed successfully!"
        );
      }}
    />
  </div>
</ProfileCard>

      </div>
    );
  }

  // =====================================================
  // EDIT MODE
  // =====================================================

  return (
    <div className="profile-wrapper">

      <div className="edit-profile-header">

        <div>
          <h2>Edit Profile</h2>
          <p>
            Update your personal and professional details
          </p>
        </div>

        <button
          className="cancel-edit-button"
          onClick={handleCancel}
        >
          Cancel
        </button>

      </div>

      {message && (
        <div className="profile-error">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* PERSONAL */}
        <EditCard
          title="Personal Information"
          icon="👤"
        >

          <EditInput
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />

          <EditInput
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
          />

          <EditInput
            label="Gender"
            name="gender"
            type="select"
            value={formData.gender}
            onChange={handleChange}
            options={[
              "",
              "Male",
              "Female",
              "Other",
            ]}
          />

          <EditInput
            label="Profile Photo URL"
            name="profile_photo"
            value={formData.profile_photo}
            onChange={handleChange}
            placeholder="Paste image URL"
            full
          />

        </EditCard>

        {/* PROFESSIONAL */}
        <EditCard
          title="Professional Information"
          icon="💼"
        >

          <EditInput
            label="Job Title"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            placeholder="e.g. Event Manager"
          />

          <EditInput
            label="Previous Job"
            name="previous_job"
            value={formData.previous_job}
            onChange={handleChange}
            placeholder="Previous job"
          />

          <EditInput
            label="Experience (Years)"
            name="experience_years"
            type="number"
            value={formData.experience_years}
            onChange={handleChange}
            placeholder="e.g. 2"
          />

          <EditInput
            label="Expected Rate"
            name="expected_rate"
            type="number"
            value={formData.expected_rate}
            onChange={handleChange}
            placeholder="₹"
          />

          <EditInput
            label="Skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Event Management, Decoration..."
            full
          />

          <EditInput
            label="Event Experience"
            name="event_experience"
            type="textarea"
            value={formData.event_experience}
            onChange={handleChange}
            placeholder="Describe your event experience"
            full
          />

          <EditInput
            label="Certifications"
            name="certifications"
            type="textarea"
            value={formData.certifications}
            onChange={handleChange}
            placeholder="Your certifications"
          />

          <EditInput
            label="Languages"
            name="languages"
            type="textarea"
            value={formData.languages}
            onChange={handleChange}
            placeholder="Hindi, English..."
          />

          <EditInput
            label="Availability"
            name="availability"
            type="select"
            value={formData.availability}
            onChange={handleChange}
            options={[
              "available",
              "busy",
              "unavailable",
            ]}
          />

          <EditInput
            label="Professional Bio"
            name="bio"
            type="textarea"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell organizers about yourself..."
            full
          />

        </EditCard>

        {/* LOCATION */}
        <EditCard
          title="Location Information"
          icon="📍"
        >

          <EditInput
            label="Full Address"
            name="address"
            type="textarea"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter complete address"
            full
          />

          <EditInput
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Bhopal"
          />

          <EditInput
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Madhya Pradesh"
          />

          <EditInput
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="462001"
          />

        </EditCard>

        {/* IDENTITY */}
        <EditCard
          title="Identity Verification"
          icon="🛡️"
        >

          <EditInput
            label="Aadhaar Number"
            name="aadhaar_number"
            type="password"
            value={formData.aadhaar_number}
            onChange={handleChange}
            placeholder={
              profile?.aadhaar_last4
                ? "Leave empty to keep existing Aadhaar"
                : "Enter 12-digit Aadhaar"
            }
            full
          />

          {profile?.aadhaar_last4 && (
            <p className="aadhaar-note">
              Existing Aadhaar ending in{" "}
              <strong>
                {profile.aadhaar_last4}
              </strong>{" "}
              is already saved.
            </p>
          )}

        </EditCard>

        {/* SAVE */}
        <div className="profile-save-actions">

          <button
            type="button"
            className="cancel-edit-button"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-profile-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "✓ Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
}

// =====================================================
// VIEW CARD
// =====================================================

function ProfileCard({ title, icon, children }) {
  return (
    <div className="profile-info-card">

      <div className="profile-card-title">
        <span className="profile-card-icon">
          {icon}
        </span>

        <h3>{title}</h3>
      </div>

      <div className="profile-info-grid">
        {children}
      </div>

    </div>
  );
}

// =====================================================
// VIEW ITEM
// =====================================================

function ProfileItem({
  label,
  value,
  full = false,
}) {
  return (
    <div
      className={`profile-info-item ${
        full ? "full" : ""
      }`}
    >
      <span>{label}</span>

      <strong>
        {value || "Not added"}
      </strong>
    </div>
  );
}

// =====================================================
// EDIT CARD
// =====================================================

function EditCard({
  title,
  icon,
  children,
}) {
  return (
    <div className="profile-info-card">

      <div className="profile-card-title">
        <span className="profile-card-icon">
          {icon}
        </span>

        <h3>{title}</h3>
      </div>

      <div className="profile-edit-grid">
        {children}
      </div>

    </div>
  );
}

// =====================================================
// EDIT INPUT
// =====================================================

function EditInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  options = [],
  full = false,
}) {
  return (
    <div
      className={`profile-input-group ${
        full ? "full" : ""
      }`}
    >

      <label>{label}</label>

      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows="4"
        />
      ) : type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option === ""
                ? "Select"
                : option.charAt(0).toUpperCase() +
                  option.slice(1)}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={
            name === "aadhaar_number"
              ? 12
              : undefined
          }
        />
      )}

    </div>
  );
}

// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default ProfessionalProfile;