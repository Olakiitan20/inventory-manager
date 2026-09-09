import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";
import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
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

        setCustomers(data.customers);
      } catch (error) {
        console.error("Customers error:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="customers-layout">
        <Sidebar onLogout={handleLogout} />
        <main className="customers-content">
          <h2>Loading customers...</h2>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customers-layout">
        <Sidebar onLogout={handleLogout} />
        <main className="customers-content">
          <h2>{error}</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="customers-layout">
      <Sidebar onLogout={handleLogout} />

      <main className="customers-content">
        <div className="customers-header">
          <div>
            <h1>Customers</h1>
            <p>Manage your business customers.</p>
          </div>

          <button className="add-customer-button">
            + Add Customer
          </button>
        </div>

        <div className="customers-card">
          {customers.length === 0 ? (
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
                      <td>{customer.name}</td>

                      <td>{customer.phone}</td>

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
                        {customer.creditLimit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Customers;