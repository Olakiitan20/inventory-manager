import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to change password."
        );
      }

      setMessage("Password changed successfully.");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <div className="change-password-header">
          <div className="password-icon">🔐</div>

          <h1>Change Password</h1>

          <p>
            Update your password to keep your account secure.
          </p>
        </div>

        {message && (
          <div className="password-message success-message">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="password-message error-message">
            ✕ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="password-field">
            <label htmlFor="currentPassword">
              Current Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="currentPassword"
                type={
                  showCurrentPassword ? "text" : "password"
                }
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="show-password-button"
                onClick={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }
              >
                {showCurrentPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="password-field">
            <label htmlFor="newPassword">
              New Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="show-password-button"
                onClick={() =>
                  setShowNewPassword(!showNewPassword)
                }
              >
                {showNewPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <small>
              Password must contain at least 6 characters.
            </small>
          </div>

          {/* Confirm Password */}
          <div className="password-field">
            <label htmlFor="confirmPassword">
              Confirm New Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={
                  showConfirmPassword ? "text" : "password"
                }
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="show-password-button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="change-password-button"
            disabled={loading}
          >
            {loading
              ? "Changing Password..."
              : "Change Password"}
          </button>
        </form>

        <button
          type="button"
          className="back-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ChangePassword;
