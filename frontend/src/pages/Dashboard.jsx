import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

const Dashboard = ({ onLogout }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("User");

  const navigate = useNavigate();

  useEffect(() => {
    // Get logged-in user information
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        if (user?.name) {
          setUserName(user.name);
        }
      } catch (error) {
        console.error(
          "Error reading user information:",
          error
        );
      }
    }

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          onLogout();
          return;
        }

        const response = await fetch(
          `${API_URL}/dashboard/summary`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch dashboard"
          );
        }

        setSummary(data.summary);
      } catch (error) {
        console.error(
          "Dashboard error:",
          error.message
        );

        if (
          error.message
            .toLowerCase()
            .includes("token") ||
          error.message
            .toLowerCase()
            .includes("unauthorized")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", { replace: true });
          return;
        }

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate, onLogout]);

  if (loading) {
    return <h2>Loading dashboard...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={onLogout} />

      <main className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {userName} </h1>
            <p>
              Here's what's happening with your inventory today.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <span className="card-label">Customers</span>
            <h2>{summary.customerCount}</h2>
            <p>Active customers</p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">Products</span>
            <h2>{summary.productCount}</h2>
            <p>Active products</p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">Invoices</span>
            <h2>{summary.invoiceCount}</h2>
            <p>Total invoices</p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">Low Stock</span>
            <h2>{summary.lowStockProducts}</h2>
            <p>Products need attention</p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">Total Sales</span>
            <h2>
              ₦
              {Number(
                summary.totalSales || 0
              ).toLocaleString()}
            </h2>
            <p>Total invoice sales</p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">Payments</span>
            <h2>
              ₦
              {Number(
                summary.totalPayments || 0
              ).toLocaleString()}
            </h2>
            <p>Total payments received</p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">Outstanding</span>
            <h2>
              ₦
              {Number(
                summary.totalOutstanding || 0
              ).toLocaleString()}
            </h2>
            <p>Outstanding balance</p>
          </div>
        </div>

        {/* Sales Overview */}
        <section className="dashboard-section sales-overview">
          <div className="section-header">
            <div>
              <h2>Sales Overview</h2>
              <p>Current sales and payment position</p>
            </div>
          </div>

          <div className="sales-overview-grid">
            <div className="sales-overview-item">
              <span>Total Sales</span>

              <strong>
                ₦
                {Number(
                  summary.totalSales || 0
                ).toLocaleString()}
              </strong>
            </div>

            <div className="sales-overview-item">
              <span>Payments Received</span>

              <strong>
                ₦
                {Number(
                  summary.totalPayments || 0
                ).toLocaleString()}
              </strong>
            </div>

            <div className="sales-overview-item">
              <span>Outstanding</span>

              <strong>
                ₦
                {Number(
                  summary.totalOutstanding || 0
                ).toLocaleString()}
              </strong>
            </div>
          </div>
        </section>

        {/* Best-Selling Products */}
        <section
          className="dashboard-section best-selling-section"
          style={{ marginTop: "20px" }}
        >
          <div className="section-header">
            <div>
              <h2>🏆 Best-Selling Products</h2>
              <p>Products with the highest quantity sold</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/products")}
            >
              View Products
            </button>
          </div>

          {!summary.bestSellingProducts ||
          summary.bestSellingProducts.length === 0 ? (
            <p className="empty-message">
              No product sales recorded yet.
            </p>
          ) : (
            <div className="best-selling-list">
              {summary.bestSellingProducts.map(
                (product, index) => (
                  <div
                    className="best-selling-item"
                    key={product.productId}
                  >
                    <div className="best-selling-rank">
                      #{index + 1}
                    </div>

                    <div className="best-selling-info">
                      <strong>
                        {product.productName ||
                          "Unknown product"}
                      </strong>

                      <span>
                        {product.category ||
                          "Product"}{" "}
                        {product.unit
                          ? `• ${product.unit}`
                          : ""}
                      </span>
                    </div>

                    <div className="best-selling-stats">
                      <strong>
                        {Number(
                          product.totalQuantitySold || 0
                        ).toLocaleString()}
                      </strong>

                      <span>units sold</span>
                    </div>

                    <div className="best-selling-sales">
                      <strong>
                        ₦
                        {Number(
                          product.totalSalesAmount || 0
                        ).toLocaleString()}
                      </strong>

                      <span>sales</span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <div className="dashboard-sections">
          {/* Recent Invoices */}
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h2>Recent Invoices</h2>
                <p>Latest invoices created</p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/invoices")}
              >
                View All
              </button>
            </div>

            {summary.recentInvoices.length === 0 ? (
              <p className="empty-message">
                No invoices yet.
              </p>
            ) : (
              <div className="activity-list">
                {summary.recentInvoices.map(
                  (invoice) => (
                    <div
                      className="activity-item"
                      key={invoice._id}
                    >
                      <div className="activity-info">
                        <strong>
                          {invoice.invoiceNumber}
                        </strong>

                        <span>
                          {invoice.customer?.name ||
                            "Unknown customer"}
                        </span>
                      </div>

                      <div className="activity-amount">
                        ₦
                        {Number(
                          invoice.totalAmount || 0
                        ).toLocaleString()}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* Recent Payments */}
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h2>Recent Payments</h2>
                <p>Latest payments received</p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/payments")}
              >
                View All
              </button>
            </div>

            {summary.recentPayments.length === 0 ? (
              <p className="empty-message">
                No payments yet.
              </p>
            ) : (
              <div className="activity-list">
                {summary.recentPayments.map(
                  (payment) => (
                    <div
                      className="activity-item"
                      key={payment._id}
                    >
                      <div className="activity-info">
                        <strong>
                          {payment.invoice
                            ?.invoiceNumber ||
                            "Payment"}
                        </strong>

                        <span>
                          {payment.customer?.name ||
                            "Unknown customer"}
                        </span>
                      </div>

                      <div className="activity-amount">
                        ₦
                        {Number(
                          payment.amount || 0
                        ).toLocaleString()}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>

        {/* Recent Stock Movements */}
        <section
          className="dashboard-section"
          style={{ marginTop: "20px" }}
        >
          <div className="section-header">
            <div>
              <h2>Recent Stock Movements</h2>
              <p>Latest inventory activity</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/inventory")}
            >
              View All
            </button>
          </div>

          {!summary.recentStockMovements ||
          summary.recentStockMovements.length === 0 ? (
            <p className="empty-message">
              No stock movements yet.
            </p>
          ) : (
            <div className="activity-list">
              {summary.recentStockMovements.map(
                (movement) => {
                  const movementType =
                    movement.type?.toLowerCase();

                  const isStockIn =
                    movementType === "in";

                  const isStockOut =
                    movementType === "out";

                  return (
                    <div
                      className="activity-item"
                      key={movement._id}
                    >
                      <div className="activity-info">
                        <strong>
                          {movement.product?.name ||
                            "Unknown product"}
                        </strong>

                        <span>
                          {movement.reason ||
                            "Stock movement"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            padding: "5px 9px",
                            borderRadius: "6px",
                            backgroundColor:
                              isStockIn
                                ? "#dcfce7"
                                : isStockOut
                                ? "#fee2e2"
                                : "#fef3c7",
                            color: isStockIn
                              ? "#166534"
                              : isStockOut
                              ? "#991b1b"
                              : "#92400e",
                          }}
                        >
                          {isStockIn
                            ? "Stock In"
                            : isStockOut
                            ? "Stock Out"
                            : "Adjustment"}
                        </span>

                        <strong
                          style={{
                            fontSize: "13px",
                            color: "#111827",
                          }}
                        >
                          {movement.quantity}
                        </strong>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;