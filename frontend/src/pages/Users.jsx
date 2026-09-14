import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";
import "./Users.css";

const Users = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // ==========================================
  // CHECK CURRENT USER
  // ==========================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      setCurrentUser(user);

      if (user?.role !== "admin") {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error(
        "User information error:",
        error
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ==========================================
  // FETCH USERS
  // ==========================================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          window.location.href = "/login";
          return;
        }

        if (response.status === 403) {
          navigate("/dashboard", {
            replace: true,
          });

          return;
        }

        throw new Error(
          data.message ||
            "Failed to fetch users"
        );
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error(
        "Users error:",
        error.message
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser]);

  // ==========================================
  // CHANGE USER ROLE
  // ==========================================
  const handleRoleChange = async (user) => {
    const newRole =
      user.role === "admin"
        ? "staff"
        : "admin";

    const confirmChange = window.confirm(
      `Are you sure you want to change ${user.name}'s role to ${newRole}?`
    );

    if (!confirmChange) {
      return;
    }

    try {
      setUpdatingUserId(user._id);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/users/${user._id}/role`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          window.location.href = "/login";
          return;
        }

        throw new Error(
          data.message ||
            "Failed to update user role"
        );
      }

      // Update the user immediately
      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === user._id
            ? {
                ...item,
                role: data.user.role,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Role update error:",
        error.message
      );

      setError(error.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // ==========================================
  // DELETE USER
  // ==========================================
  const handleDeleteUser = async (user) => {
    // Never allow deletion of current account
    if (
      currentUser?.id === user._id ||
      currentUser?.id ===
        user._id?.toString()
    ) {
      setError(
        "You cannot delete your own account."
      );

      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.name}'s account?\n\nThis user will no longer be able to log in.\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingUserId(user._id);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/users/${user._id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          window.location.href = "/login";

          return;
        }

        if (response.status === 403) {
          navigate("/dashboard", {
            replace: true,
          });

          return;
        }

        throw new Error(
          data.message ||
            "Failed to delete user"
        );
      }

      // Remove the deleted user immediately
      setUsers((previousUsers) =>
        previousUsers.filter(
          (item) =>
            item._id !== user._id
        )
      );
    } catch (error) {
      console.error(
        "Delete user error:",
        error.message
      );

      setError(error.message);
    } finally {
      setDeletingUserId(null);
    }
  };

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div className="users-layout">
      <Sidebar onLogout={handleLogout} />

      <main className="users-content">
        <div className="users-header">
          <div>
            <h1>Users</h1>

            <p>
              Manage your team members and
              their access levels.
            </p>
          </div>
        </div>

        {error && (
          <div className="users-alert users-alert-error">
            {error}
          </div>
        )}

        <div className="users-card">
          {loading ? (
            <div className="users-empty">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="users-empty">
              No users found.
            </div>
          ) : (
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
                  {users.map((user) => {
                    const isCurrentUser =
                      currentUser?.id ===
                        user._id ||
                      currentUser?.id ===
                        user._id?.toString();

                    const isUpdating =
                      updatingUserId ===
                      user._id;

                    const isDeleting =
                      deletingUserId ===
                      user._id;

                    return (
                      <tr key={user._id}>
                        {/* USER */}
                        <td>
                          <div className="users-name">
                            <div className="user-avatar">
                              {user.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {user.name}
                              </strong>

                              {isCurrentUser && (
                                <span className="current-user-label">
                                  You
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
                            className={`user-role ${
                              user.role ===
                              "admin"
                                ? "user-role-admin"
                                : "user-role-staff"
                            }`}
                          >
                            {user.role ===
                            "admin"
                              ? "Admin"
                              : "Staff"}
                          </span>
                        </td>

                        {/* DATE */}
                        <td>
                          <span className="user-date">
                            {user.createdAt
                              ? new Date(
                                  user.createdAt
                                ).toLocaleDateString()
                              : "—"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td>
                          {isCurrentUser ? (
                            <span className="protected-label">
                              Your account
                            </span>
                          ) : (
                            <div className="user-actions">
                              <button
                                type="button"
                                className={
                                  user.role ===
                                  "admin"
                                    ? "role-button role-button-staff"
                                    : "role-button role-button-admin"
                                }
                                onClick={() =>
                                  handleRoleChange(
                                    user
                                  )
                                }
                                disabled={
                                  isUpdating ||
                                  isDeleting
                                }
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : user.role ===
                                    "admin"
                                  ? "Make Staff"
                                  : "Make Admin"}
                              </button>

                              <button
                                type="button"
                                className="delete-user-button"
                                onClick={() =>
                                  handleDeleteUser(
                                    user
                                  )
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
        </div>
      </main>
    </div>
  );
};

export default Users;