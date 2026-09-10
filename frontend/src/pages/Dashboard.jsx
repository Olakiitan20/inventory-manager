import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

const Dashboard = ({ onLogout }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/dashboard/summary`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch dashboard");
        }

        setSummary(data.summary);
      } catch (error) {
        console.error("Dashboard error:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <h2>Loading dashboard...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={onLogout} />

      <main className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's what's happening today.</p>
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
            <h2>₦{summary.totalSales.toLocaleString()}</h2>
            <p>Total invoice sales</p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">Payments</span>
            <h2>₦{summary.totalPayments.toLocaleString()}</h2>
            <p>Total payments received</p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">Outstanding</span>
            <h2>₦{summary.totalOutstanding.toLocaleString()}</h2>
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
                ₦{Number(summary.totalSales || 0).toLocaleString()}
              </strong>
            </div>

            <div className="sales-overview-item">
              <span>Payments Received</span>
              <strong>
                ₦{Number(summary.totalPayments || 0).toLocaleString()}
              </strong>
            </div>

            <div className="sales-overview-item">
              <span>Outstanding</span>
              <strong>
                ₦{Number(summary.totalOutstanding || 0).toLocaleString()}
              </strong>
            </div>
          </div>
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
              <p className="empty-message">No invoices yet.</p>
            ) : (
              <div className="activity-list">
                {summary.recentInvoices.map((invoice) => (
                  <div className="activity-item" key={invoice._id}>
                    <div className="activity-info">
                      <strong>{invoice.invoiceNumber}</strong>

                      <span>
                        {invoice.customer?.name || "Unknown customer"}
                      </span>
                    </div>

                    <div className="activity-amount">
                      ₦{invoice.totalAmount.toLocaleString()}
                    </div>
                  </div>
                ))}
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
              <p className="empty-message">No payments yet.</p>
            ) : (
              <div className="activity-list">
                {summary.recentPayments.map((payment) => (
                  <div className="activity-item" key={payment._id}>
                    <div className="activity-info">
                      <strong>
                        {payment.invoice?.invoiceNumber || "Payment"}
                      </strong>

                      <span>
                        {payment.customer?.name || "Unknown customer"}
                      </span>
                    </div>

                    <div className="activity-amount">
                      ₦{payment.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;