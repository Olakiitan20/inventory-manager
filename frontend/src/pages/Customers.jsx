import { useEffect, useState } from "react";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";
import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    customerType: "",
    creditLimit: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // =========================
  // FETCH CUSTOMERS
  // =========================

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/customers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch customers"
        );
      }

      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Customers error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      customerType: "",
      creditLimit: "",
      address: "",
    });
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSuccess("");
    resetForm();
  };

  // =========================
  // CREATE CUSTOMER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          customerType: formData.customerType,
          creditLimit: Number(formData.creditLimit) || 0,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create customer"
        );
      }

      setSuccess("Customer created successfully!");

      resetForm();

      // Refresh customer list
      await fetchCustomers();

      // Close modal after a short delay
      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 800);
    } catch (error) {
      console.error("Create customer error:", error.message);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="customers-layout">
      <Sidebar onLogout={handleLogout} />

      <main className="customers-content">

        {/* =========================
            HEADER
        ========================= */}

        <div className="customers-header">
          <div>
            <h1>Customers</h1>
            <p>Manage your business customers.</p>
          </div>

          <button
            className="add-customer-button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowModal(true);
            }}
          >
            + Add Customer
          </button>
        </div>

        {/* =========================
            ERROR MESSAGE
        ========================= */}

        {error && !showModal && (
          <div className="customer-alert customer-alert-error">
            {error}
          </div>
        )}

        {/* =========================
            CUSTOMER TABLE
        ========================= */}

        <div className="customers-card">
          {loading ? (
            <p className="empty-message">
              Loading customers...
            </p>
          ) : customers.length === 0 ? (
            <p className="empty-message">
              No customers found.
            </p>
          ) : (
            <div className="customers-table-wrapper">
              <table className="customers-table">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Credit Limit</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>

                      <td>
                        {customer.name}
                      </td>

                      <td>
                        {customer.phone}
                      </td>

                      <td>
                        {customer.email || "—"}
                      </td>

                      <td>
                        <span className="customer-type">
                          {customer.customerType}
                        </span>
                      </td>

                      <td>
                        ₦
                        {Number(
                          customer.creditLimit || 0
                        ).toLocaleString()}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>

      </main>

      {/* =========================
          ADD CUSTOMER MODAL
      ========================= */}

      {showModal && (
        <div
          className="customer-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="customer-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="customer-modal-header">

              <div>
                <h2>Add Customer</h2>

                <p>
                  Create a new business customer.
                </p>
              </div>

              <button
                type="button"
                className="customer-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* Success */}

            {success && (
              <div className="customer-alert customer-alert-success">
                {success}
              </div>
            )}

            {/* Error */}

            {error && (
              <div className="customer-alert customer-alert-error">
                {error}
              </div>
            )}

            {/* Form */}

            <form
              className="customer-form"
              onSubmit={handleSubmit}
            >

              {/* Name */}

              <div className="customer-form-group">
                <label htmlFor="customer-name">
                  Customer Name
                </label>

                <input
                  id="customer-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              {/* Phone + Email */}

              <div className="customer-form-row">

                <div className="customer-form-group">
                  <label htmlFor="customer-phone">
                    Phone
                  </label>

                  <input
                    id="customer-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="customer-form-group">
                  <label htmlFor="customer-email">
                    Email
                  </label>

                  <input
                    id="customer-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>

              </div>

              {/* Type + Credit Limit */}

              <div className="customer-form-row">

                <div className="customer-form-group">
                  <label htmlFor="customer-type">
                    Customer Type
                  </label>

                  <select
                    id="customer-type"
                    name="customerType"
                    value={formData.customerType}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select customer type
                    </option>

                    <option value="retailer">
                      Retailer
                    </option>

                    <option value="wholesaler">
                      Wholesaler
                    </option>

                    <option value="distributor">
                      Distributor
                    </option>
                  </select>
                </div>

                <div className="customer-form-group">
                  <label htmlFor="credit-limit">
                    Credit Limit
                  </label>

                  <input
                    id="credit-limit"
                    name="creditLimit"
                    type="number"
                    value={formData.creditLimit}
                    onChange={handleChange}
                    placeholder="₦0"
                    min="0"
                  />
                </div>

              </div>

              {/* Address */}

              <div className="customer-form-group">

                <label htmlFor="customer-address">
                  Address
                </label>

                <textarea
                  id="customer-address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter customer address"
                  rows="3"
                ></textarea>

              </div>

              {/* Buttons */}

              <div className="customer-modal-actions">

                <button
                  type="button"
                  className="customer-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customer-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Customer"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;