import { useEffect, useState } from "react";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";
import "./Payments.css";

const Payments = () => {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentChannel, setPaymentChannel] = useState("");
  const [reference, setReference] = useState("");

  const [historySearch, setHistorySearch] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch customers");
      }

      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Customers error:", error.message);
      setError(error.message);
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch invoices");
      }

      setInvoices(data.invoices || []);
    } catch (error) {
      console.error("Invoices error:", error.message);
      setError(error.message);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch payments");
      }

      setPayments(data.payments || []);
    } catch (error) {
      console.error("Payments history error:", error.message);
      setError(error.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchCustomers(),
        fetchInvoices(),
        fetchPayments(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name
      .toLowerCase()
      .includes(customerSearch.toLowerCase())
  );

  const customerInvoices = selectedCustomer
    ? invoices.filter(
        (invoice) =>
          invoice.customer?._id === selectedCustomer._id &&
          Number(invoice.balance) > 0
      )
    : [];

  const filteredPayments = payments.filter((payment) => {
    const customerName =
      payment.customer?.name?.toLowerCase() || "";

    const invoiceNumber =
      payment.invoice?.invoiceNumber?.toLowerCase() || "";

    const paymentReference =
      payment.reference?.toLowerCase() || "";

    const search = historySearch.toLowerCase();

    return (
      customerName.includes(search) ||
      invoiceNumber.includes(search) ||
      paymentReference.includes(search)
    );
  });

  const handleCustomerSearch = (e) => {
    const value = e.target.value;

    setCustomerSearch(value);
    setSelectedCustomer(null);
    setSelectedInvoice(null);
    setAmount("");
    setSuccess("");
    setError("");
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setSelectedInvoice(null);
    setAmount("");
    setSuccess("");
    setError("");
  };

  const handleInvoiceChange = (e) => {
    const invoiceId = e.target.value;

    const invoice = customerInvoices.find(
      (item) => item._id === invoiceId
    );

    setSelectedInvoice(invoice || null);
    setAmount("");
    setSuccess("");
    setError("");
  };

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;

    setPaymentMethod(method);

    if (method !== "transfer") {
      setPaymentChannel("");
    }
  };

  const resetPaymentForm = () => {
    setSelectedInvoice(null);
    setAmount("");
    setPaymentMethod("cash");
    setPaymentChannel("");
    setReference("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    if (!selectedCustomer) {
      setError("Please select a customer.");
      setSaving(false);
      return;
    }

    if (!selectedInvoice) {
      setError("Please select an outstanding invoice.");
      setSaving(false);
      return;
    }

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Please enter a valid payment amount.");
      setSaving(false);
      return;
    }

    if (paymentAmount > Number(selectedInvoice.balance)) {
      setError(
        "Payment amount cannot be greater than the outstanding balance."
      );
      setSaving(false);
      return;
    }

    if (paymentMethod === "transfer" && !paymentChannel) {
      setError("Please select a transfer channel.");
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice._id,
          amount: paymentAmount,
          paymentMethod,
          paymentChannel:
            paymentMethod === "transfer"
              ? paymentChannel
              : undefined,
          reference: reference.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to record payment"
        );
      }

      setSuccess(
        `Payment of ₦${paymentAmount.toLocaleString()} recorded successfully!`
      );

      await Promise.all([
        fetchInvoices(),
        fetchPayments(),
      ]);

      if (data.invoice?.balance > 0) {
        setSelectedInvoice({
          ...selectedInvoice,
          amountPaid: data.invoice.amountPaid,
          balance: data.invoice.balance,
          status: data.invoice.status,
        });

        setAmount("");
        setPaymentChannel("");
        setReference("");
        setPaymentMethod("cash");
      } else {
        resetPaymentForm();
      }
    } catch (error) {
      console.error("Create payment error:", error.message);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatPaymentDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
  };

  const closeReceipt = () => {
    setSelectedPayment(null);
  };

  return (
    <div className="payments-layout">
      <Sidebar onLogout={handleLogout} />

      <main className="payments-content">
        <div className="payments-page">

          {/* PAGE HEADER */}
          <div className="payments-header">
            <div>
              <h1>Payments</h1>
              <p>
                Record customer payments and manage outstanding balances.
              </p>
            </div>
          </div>

          {/* ALERTS */}
          {success && (
            <div className="payment-alert payment-alert-success">
              {success}
            </div>
          )}

          {error && (
            <div className="payment-alert payment-alert-error">
              {error}
            </div>
          )}

          {/* RECORD PAYMENT CARD */}
          <div className="payment-card">

            <div className="payment-card-header">
              <div>
                <h2>Record Payment</h2>
                <p>
                  Search for a customer and record their outstanding payment.
                </p>
              </div>
            </div>

            {loading ? (
              <p className="payment-loading">
                Loading payment information...
              </p>
            ) : (
              <form
                className="payment-form"
                onSubmit={handleSubmit}
              >

                {/* CUSTOMER SEARCH */}
                <div className="payment-form-group customer-search-group">
                  <label htmlFor="customer-search">
                    Customer
                  </label>

                  <input
                    id="customer-search"
                    type="text"
                    value={customerSearch}
                    onChange={handleCustomerSearch}
                    placeholder="Search customer by name..."
                    autoComplete="off"
                  />

                  {customerSearch && !selectedCustomer && (
                    <div className="payment-search-results">

                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <button
                            type="button"
                            key={customer._id}
                            className="payment-search-result"
                            onClick={() =>
                              handleCustomerSelect(customer)
                            }
                          >
                            <strong>{customer.name}</strong>

                            <span>
                              {customer.phone ||
                                "No phone number"}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="payment-no-results">
                          No customer found.
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* SELECTED CUSTOMER */}
                {selectedCustomer && (
                  <div className="selected-customer">
                    <div>
                      <span className="selected-label">
                        Selected Customer
                      </span>

                      <strong>
                        {selectedCustomer.name}
                      </strong>
                    </div>

                    <span>
                      {selectedCustomer.phone ||
                        "No phone number"}
                    </span>
                  </div>
                )}

                {/* OUTSTANDING INVOICE */}
                {selectedCustomer && (
                  <div className="payment-form-group">
                    <label htmlFor="invoice-select">
                      Outstanding Invoice
                    </label>

                    {customerInvoices.length > 0 ? (
                      <select
                        id="invoice-select"
                        value={selectedInvoice?._id || ""}
                        onChange={handleInvoiceChange}
                      >
                        <option value="">
                          Select an outstanding invoice
                        </option>

                        {customerInvoices.map((invoice) => (
                          <option
                            key={invoice._id}
                            value={invoice._id}
                          >
                            {invoice.invoiceNumber} — ₦
                            {Number(
                              invoice.balance
                            ).toLocaleString()}
                            {" outstanding"}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="no-invoice">
                        This customer has no outstanding balance.
                      </div>
                    )}
                  </div>
                )}

                {/* INVOICE SUMMARY */}
                {selectedInvoice && (
                  <div className="invoice-summary">

                    <div className="summary-item">
                      <span>Invoice</span>
                      <strong>
                        {selectedInvoice.invoiceNumber}
                      </strong>
                    </div>

                    <div className="summary-item">
                      <span>Total Amount</span>
                      <strong>
                        ₦
                        {Number(
                          selectedInvoice.totalAmount
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <div className="summary-item">
                      <span>Already Paid</span>
                      <strong>
                        ₦
                        {Number(
                          selectedInvoice.amountPaid
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <div className="summary-item balance-item">
                      <span>Outstanding</span>
                      <strong>
                        ₦
                        {Number(
                          selectedInvoice.balance
                        ).toLocaleString()}
                      </strong>
                    </div>

                  </div>
                )}

                {/* PAYMENT FIELDS */}
                {selectedInvoice && (
                  <>
                    <div className="payment-form-group">
                      <label htmlFor="payment-amount">
                        Payment Amount
                      </label>

                      <input
                        id="payment-amount"
                        type="number"
                        min="1"
                        step="1"
                        max={selectedInvoice.balance}
                        value={amount}
                        onChange={(e) =>
                          setAmount(e.target.value)
                        }
                        placeholder="Enter payment amount"
                        required
                      />

                      <small>
                        Maximum payment: ₦
                        {Number(
                          selectedInvoice.balance
                        ).toLocaleString()}
                      </small>
                    </div>

                    <div className="payment-form-group">
                      <label htmlFor="payment-method">
                        Payment Method
                      </label>

                      <select
                        id="payment-method"
                        value={paymentMethod}
                        onChange={
                          handlePaymentMethodChange
                        }
                      >
                        <option value="cash">
                          Cash
                        </option>

                        <option value="transfer">
                          Transfer
                        </option>

                        <option value="card">
                          Card
                        </option>
                      </select>
                    </div>

                    {/* TRANSFER CHANNEL */}
                    {paymentMethod === "transfer" && (
                      <div className="payment-form-group">
                        <label htmlFor="payment-channel">
                          Transfer Channel
                        </label>

                        <select
                          id="payment-channel"
                          value={paymentChannel}
                          onChange={(e) =>
                            setPaymentChannel(
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">
                            Select transfer channel
                          </option>

                          <option value="opay">
                            Opay
                          </option>

                          <option value="moniepoint">
                            Moniepoint
                          </option>

                          <option value="palmpay">
                            PalmPay
                          </option>

                          <option value="bank">
                            Bank
                          </option>

                          <option value="other">
                            Other
                          </option>
                        </select>
                      </div>
                    )}

                    {/* REFERENCE */}
                    <div className="payment-form-group">
                      <label htmlFor="payment-reference">
                        Payment Reference
                      </label>

                      <input
                        id="payment-reference"
                        type="text"
                        value={reference}
                        onChange={(e) =>
                          setReference(e.target.value)
                        }
                        placeholder="Optional payment reference"
                      />
                    </div>

                    {/* SUBMIT */}
                    <div className="payment-actions">
                      <button
                        type="submit"
                        className="record-payment-button"
                        disabled={saving}
                      >
                        {saving
                          ? "Recording Payment..."
                          : "Record Payment"}
                      </button>
                    </div>
                  </>
                )}

              </form>
            )}

          </div>

          {/* PAYMENT HISTORY */}
          <div className="payment-history-card">

            <div className="payment-history-header">
              <div>
                <h2>Payment History</h2>
                <p>
                  View all recorded customer payments.
                </p>
              </div>

              <div className="payment-history-count">
                {filteredPayments.length} payment
                {filteredPayments.length !== 1
                  ? "s"
                  : ""}
              </div>
            </div>

            {/* HISTORY SEARCH */}
            <div className="payment-history-search">
              <label htmlFor="history-search">
                Search Payment History
              </label>

              <input
                id="history-search"
                type="text"
                value={historySearch}
                onChange={(e) =>
                  setHistorySearch(e.target.value)
                }
                placeholder="Search by customer, invoice number or reference..."
              />
            </div>

            {/* HISTORY TABLE */}
            {loading ? (
              <p className="payment-loading">
                Loading payment history...
              </p>
            ) : filteredPayments.length === 0 ? (
              <div className="empty-payment-history">
                <h3>No payment records found</h3>

                <p>
                  Recorded payments will appear here.
                </p>
              </div>
            ) : (
              <div className="payment-table-wrapper">
                <table className="payment-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Invoice</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Channel</th>
                      <th>Reference</th>
                      <th>Received By</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment._id}>

                        <td>
                          {formatPaymentDate(
                            payment.createdAt
                          )}
                        </td>

                        <td>
                          <strong>
                            {payment.customer?.name ||
                              "Unknown"}
                          </strong>
                        </td>

                        <td>
                          {payment.invoice?.invoiceNumber ||
                            "—"}
                        </td>

                        <td className="payment-amount-cell">
                          ₦
                          {Number(
                            payment.amount
                          ).toLocaleString()}
                        </td>

                        <td>
                          <span
                            className={`payment-method-badge payment-method-${payment.paymentMethod}`}
                          >
                            {payment.paymentMethod}
                          </span>
                        </td>

                        <td>
                          {payment.paymentChannel ||
                            "—"}
                        </td>

                        <td>
                          {payment.reference || "—"}
                        </td>

                        <td>
                          {payment.receivedBy?.name ||
                            "Unknown"}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="view-receipt-button"
                            onClick={() =>
                              handleViewReceipt(payment)
                            }
                          >
                            View Receipt
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

          {/* RECEIPT MODAL */}
          {selectedPayment && (
            <div
              className="receipt-modal-overlay"
              onClick={closeReceipt}
            >
              <div
                className="receipt-modal"
                onClick={(e) => e.stopPropagation()}
              >

                <div className="receipt-header">
                  <div>
                    <h2>Payment Receipt</h2>
                    <p>
                      Inventory Manager
                    </p>
                  </div>

                  <button
                    type="button"
                    className="receipt-close-button"
                    onClick={closeReceipt}
                  >
                    ×
                  </button>
                </div>

                <div className="receipt-body">

                  <div className="receipt-title">
                    <h3>PAYMENT RECEIPT</h3>
                    <span>
                      {selectedPayment._id}
                    </span>
                  </div>

                  <div className="receipt-divider"></div>

                  <div className="receipt-details">

                    <div className="receipt-detail-row">
                      <span>Date</span>
                      <strong>
                        {formatPaymentDate(
                          selectedPayment.createdAt
                        )}
                      </strong>
                    </div>

                    <div className="receipt-detail-row">
                      <span>Customer</span>
                      <strong>
                        {selectedPayment.customer?.name ||
                          "Unknown"}
                      </strong>
                    </div>

                    <div className="receipt-detail-row">
                      <span>Invoice</span>
                      <strong>
                        {selectedPayment.invoice
                          ?.invoiceNumber || "—"}
                      </strong>
                    </div>

                    <div className="receipt-detail-row">
                      <span>Payment Method</span>
                      <strong>
                        {selectedPayment.paymentMethod}
                      </strong>
                    </div>

                    {selectedPayment.paymentChannel && (
                      <div className="receipt-detail-row">
                        <span>Transfer Channel</span>
                        <strong>
                          {selectedPayment.paymentChannel}
                        </strong>
                      </div>
                    )}

                    <div className="receipt-detail-row">
                      <span>Reference</span>
                      <strong>
                        {selectedPayment.reference ||
                          "—"}
                      </strong>
                    </div>

                    <div className="receipt-detail-row">
                      <span>Received By</span>
                      <strong>
                        {selectedPayment.receivedBy?.name ||
                          "Unknown"}
                      </strong>
                    </div>

                  </div>

                  <div className="receipt-divider"></div>

                  <div className="receipt-amount">
                    <span>Amount Paid</span>
                    <strong>
                      ₦
                      {Number(
                        selectedPayment.amount
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div className="receipt-footer">
                    <p>
                      Thank you for your payment.
                    </p>

                    <small>
                      This receipt confirms payment against the
                      referenced invoice.
                    </small>
                  </div>

                </div>

                <div className="receipt-actions">
                  <button
                    type="button"
                    className="receipt-print-button"
                    onClick={() => window.print()}
                  >
                    Print Receipt
                  </button>

                  <button
                    type="button"
                    className="receipt-close-secondary"
                    onClick={closeReceipt}
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Payments;