import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import API_URL from "../api";

import "./Users.css";

function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  /* =========================================
     GET CURRENT USER
  ========================================= */

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        navigate("/login", { replace: true });
        return;
      }

      const user = JSON.parse(storedUser);

      setCurrentUser(user);

      if (user.role !== "admin") {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Error reading current user:", error);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* =========================================
     FETCH USERS
  ========================================= */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);
      setError(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser]);

  /* =========================================
     SEARCH / FILTER USERS
  ========================================= */

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter((user) => {
      const name = user.name?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const role = user.role?.toLowerCase() || "";

      return (
        name.includes(search) ||
        email.includes(search) ||
        role.includes(search)
      );
    });
  }, [users, searchTerm]);

  /* =========================================
     CHANGE USER ROLE
  ========================================= */

  const handleRoleChange = async (user) => {
    if (!currentUser) {
      return;
    }

    if (user._id === currentUser.id || user._id === currentUser._id) {
      setError("You cannot change your own role.");
      return;
    }

    const newRole = user.role === "admin" ? "staff" : "admin";

    const confirmed = window.confirm(
      `Are you sure you want to make ${user.name} a ${newRole}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(user._id);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/users/${user._id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user role");
      }

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === user._id
            ? {
                ...item,
                role: newRole,
              }
            : item
        )
      );

      setSuccess(
        `${user.name}'s role has been changed to ${newRole}.`
      );
    } catch (error) {
      console.error("Update role error:", error);
      setError(error.message || "Failed to update user role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  /* =========================================
     DELETE USER
  ========================================= */

  const handleDeleteUser = async (user) => {
    if (!currentUser) {
      return;
    }

    if (user._id === currentUser.id || user._id === currentUser._id) {
      setError("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(user._id);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      setUsers((prevUsers) =>
        prevUsers.filter((item) => item._id !== user._id)
      );

      setSuccess(`${user.name} has been deleted successfully.`);
    } catch (error) {
      console.error("Delete user error:", error);
      setError(error.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /* =========================================
     GET INITIALS
  ========================================= */

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="users-layout">
      <Sidebar />

      <main className="users-content">
        {/* HEADER */}

        <div className="users-header">
          <h1>User Management</h1>

          <p>
            Manage your team members and control their access
            levels.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="users-alert-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="users-alert-success">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Close success message"
            >
              ×
            </button>
          </div>
        )}

        {/* USERS CARD */}

        <section className="users-card">
          {/* TOOLBAR */}

          <div className="users-toolbar">
            <div className="users-toolbar-info">
              <h2>
                Team Members{" "}
                <span className="users-count">
                  ({filteredUsers.length})
                </span>
              </h2>

              <p>
                View and manage users registered in your
                inventory system.
              </p>
            </div>

            {/* SEARCH BAR */}

            <div className="users-search">
              <span className="users-search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search name, email or role..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="users-loading">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="users-empty">
              {searchTerm
                ? `No users found matching "${searchTerm}".`
                : "No users found."}
            </div>
          ) : (
            /* TABLE */

            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const isCurrentUser =
                      user._id === currentUser?._id ||
                      user._id === currentUser?.id;

                    const isUpdating =
                      updatingUserId === user._id;

                    const isDeleting =
                      deletingUserId === user._id;

                    return (
                      <tr key={user._id}>
                        {/* USER */}

                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {getInitials(user.name)}
                            </div>

                            <div className="user-details">
                              <span className="user-name">
                                {user.name}
                              </span>

                              {isCurrentUser && (
                                <span className="user-email">
                                  Your account
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td>
                          <span className="user-email">
                            {user.email}
                          </span>
                        </td>

                        {/* ROLE */}

                        <td>
                          <span
                            className={`role-badge ${
                              user.role === "admin"
                                ? "admin"
                                : "staff"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* JOINED */}

                        <td>
                          <span className="joined-date">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td>
                          {isCurrentUser ? (
                            <span className="current-user-label">
                              Your account
                            </span>
                          ) : (
                            <div className="user-actions">
                              <button
                                type="button"
                                className="role-button"
                                onClick={() =>
                                  handleRoleChange(user)
                                }
                                disabled={
                                  isUpdating ||
                                  isDeleting
                                }
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : user.role === "admin"
                                  ? "Make Staff"
                                  : "Make Admin"}
                              </button>

                              <button
                                type="button"
                                className="delete-user-button"
                                onClick={() =>
                                  handleDeleteUser(user)
                                }
                                disabled={
                                  isUpdating ||
                                  isDeleting
                                }
                              >
                                {isDeleting
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Users;