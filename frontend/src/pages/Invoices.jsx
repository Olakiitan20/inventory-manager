import { useEffect, useState } from "react";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";
import "./Invoices.css";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [items, setItems] = useState([]);

  const [amountPaid, setAmountPaid] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentChannel, setPaymentChannel] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const getToken = () => localStorage.getItem("token");

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
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

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
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

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Products error:", error.message);
      setError(error.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchInvoices(),
        fetchCustomers(),
        fetchProducts(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const resetForm = () => {
    setCustomerSearch("");
    setProductSearch("");
    setSelectedCustomer(null);
    setItems([]);
    setAmountPaid("");
    setPaymentMethod("cash");
    setPaymentChannel("");
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const closeInvoiceDetails = () => {
    setSelectedInvoice(null);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const customerResults = customers
    .filter((customer) => {
      const search = customerSearch.trim().toLowerCase();

      if (!search) {
        return false;
      }

      const name = customer.name?.toLowerCase() || "";
      const phone = customer.phone?.toLowerCase() || "";
      const email = customer.email?.toLowerCase() || "";

      return (
        name.includes(search) ||
        phone.includes(search) ||
        email.includes(search)
      );
    })
    .slice(0, 10);

  const productResults = products
    .filter((product) => {
      const search = productSearch.trim().toLowerCase();

      if (!search) {
        return false;
      }

      const name = product.name?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";

      return name.includes(search) || category.includes(search);
    })
    .filter(
      (product) =>
        !items.some((item) => item.productId === product._id)
    )
    .slice(0, 10);

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch("");
  };

  const changeCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
  };

  const addProduct = (product) => {
    setItems((previous) => [
      ...previous,
      {
        productId: product._id,
        name: product.name,
        unit: product.unit,
        sellingPrice: Number(product.sellingPrice || 0),
        stockQuantity: Number(product.stockQuantity || 0),
        quantity: 1,
      },
    ]);

    setProductSearch("");
  };

  const updateQuantity = (productId, quantity) => {
    setItems((previous) =>
      previous.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(1, Number(quantity) || 1),
            }
          : item
      )
    );
  };

  const removeProduct = (productId) => {
    setItems((previous) =>
      previous.filter((item) => item.productId !== productId)
    );
  };

  const subtotal = items.reduce(
    (total, item) =>
      total + item.sellingPrice * Number(item.quantity),
    0
  );

  const paid = Number(amountPaid) || 0;
  const balance = Math.max(subtotal - paid, 0);

  const getStatus = () => {
    if (paid === subtotal && subtotal > 0) {
      return "paid";
    }

    if (paid > 0) {
      return "partially_paid";
    }

    return "unpaid";
  };

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;

    setPaymentMethod(method);

    if (method !== "transfer") {
      setPaymentChannel("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) {
      setError("Please select a customer.");
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    if (paid < 0) {
      setError("Amount paid cannot be negative.");
      return;
    }

    if (paid > subtotal) {
      setError(
        "Amount paid cannot be greater than the invoice total."
      );
      return;
    }

    if (paymentMethod === "transfer" && !paymentChannel) {
      setError("Please select a transfer channel.");
      return;
    }

    for (const item of items) {
      if (item.quantity > item.stockQuantity) {
        setError(
          `Insufficient stock for ${item.name}. Available stock: ${item.stockQuantity}.`
        );
        return;
      }
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
          })),
          amountPaid: paid,
          paymentMethod,
          paymentChannel:
            paymentMethod === "transfer"
              ? paymentChannel
              : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create invoice"
        );
      }

      setSuccess(
        `Invoice ${
          data.invoice?.invoiceNumber || ""
        } created successfully!`
      );

      await fetchInvoices();
      await fetchProducts();

      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1000);
    } catch (error) {
      console.error("Create invoice error:", error.message);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="invoices-layout">
      <Sidebar onLogout={handleLogout} />

      <main className="invoices-content">
        <div className="invoices-header">
          <div>
            <h1>Invoices</h1>
            <p>Create and manage customer invoices.</p>
          </div>

          <button
            type="button"
            className="create-invoice-button"
            onClick={openModal}
          >
            + Create Invoice
          </button>
        </div>

        {error && !showModal && (
          <div className="invoice-alert invoice-alert-error">
            {error}
          </div>
        )}

        {success && !showModal && (
          <div className="invoice-alert invoice-alert-success">
            {success}
          </div>
        )}

        <div className="invoices-card">
          <div className="invoices-card-header">
            <div>
              <h2>All Invoices</h2>
              <p>Recent customer invoices.</p>
            </div>

            <span className="invoice-count">
              {invoices.length} invoice
              {invoices.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <p className="invoice-empty-message">
              Loading invoices...
            </p>
          ) : invoices.length === 0 ? (
            <p className="invoice-empty-message">
              No invoices found.
            </p>
          ) : (
            <div className="invoices-table-wrapper">
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td>
                        <strong>
                          {invoice.invoiceNumber || "—"}
                        </strong>
                      </td>

                      <td>
                        {invoice.customer?.name ||
                          "Unknown customer"}
                      </td>

                      <td>
                        ₦
                        {Number(
                          invoice.totalAmount || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        ₦
                        {Number(
                          invoice.amountPaid || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        ₦
                        {Number(
                          invoice.balance || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        <span
                          className={`invoice-status ${
                            invoice.status
                              ?.toLowerCase()
                              .replace(/\s+/g, "-") ||
                            "unpaid"
                          }`}
                        >
                          {invoice.status
                            ? invoice.status.replace("_", " ")
                            : "unpaid"}
                        </span>
                      </td>

                      <td>
                        {invoice.createdAt
                          ? new Date(
                              invoice.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="view-invoice-button"
                          onClick={() =>
                            openInvoiceDetails(invoice)
                          }
                        >
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* CREATE INVOICE MODAL */}

      {showModal && (
        <div
          className="invoice-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="invoice-modal invoice-create-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invoice-modal-header">
              <div>
                <h2>Create Invoice</h2>
                <p>
                  Add a customer, products and payment details.
                </p>
              </div>

              <button
                type="button"
                className="invoice-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              className="invoice-form"
              onSubmit={handleSubmit}
            >
              {error && (
                <div className="invoice-alert invoice-alert-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="invoice-alert invoice-alert-success">
                  {success}
                </div>
              )}

              <div className="invoice-form-section">
                <div className="invoice-section-title">
                  <span>01</span>

                  <div>
                    <h3>Customer</h3>

                    <p>
                      Select the customer for this invoice.
                    </p>
                  </div>
                </div>

                {!selectedCustomer ? (
                  <div className="invoice-search-container">
                    <div className="invoice-search-input-wrapper">
                      <span>🔎</span>

                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) =>
                          setCustomerSearch(e.target.value)
                        }
                        placeholder="Search customer by name, phone or email..."
                        autoComplete="off"
                      />
                    </div>

                    {customerSearch.trim() && (
                      <div className="invoice-search-results">
                        {customerResults.length === 0 ? (
                          <div className="invoice-no-results">
                            No matching customers found.
                          </div>
                        ) : (
                          customerResults.map((customer) => (
                            <button
                              type="button"
                              key={customer._id}
                              className="invoice-search-result"
                              onClick={() =>
                                selectCustomer(customer)
                              }
                            >
                              <div>
                                <strong>
                                  {customer.name}
                                </strong>

                                <span>
                                  {customer.phone ||
                                    customer.email ||
                                    "No contact"}
                                </span>
                              </div>

                              <small>
                                {customer.customerType ||
                                  "Customer"}
                              </small>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="selected-customer">
                    <div className="selected-customer-info">
                      <div className="selected-customer-icon">
                        ✓
                      </div>

                      <div>
                        <strong>
                          {selectedCustomer.name}
                        </strong>

                        <span>
                          {selectedCustomer.phone ||
                            selectedCustomer.email ||
                            "No contact information"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="change-customer-button"
                      onClick={changeCustomer}
                      disabled={saving}
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              <div className="invoice-form-section">
                <div className="invoice-section-title">
                  <span>02</span>

                  <div>
                    <h3>Products</h3>

                    <p>
                      Add one or more products to the invoice.
                    </p>
                  </div>
                </div>

                <div className="invoice-search-container">
                  <div className="invoice-search-input-wrapper">
                    <span>🔎</span>

                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) =>
                        setProductSearch(e.target.value)
                      }
                      placeholder="Search product or category..."
                      autoComplete="off"
                    />
                  </div>

                  {productSearch.trim() && (
                    <div className="invoice-search-results">
                      {productResults.length === 0 ? (
                        <div className="invoice-no-results">
                          No matching products found.
                        </div>
                      ) : (
                        productResults.map((product) => (
                          <button
                            type="button"
                            key={product._id}
                            className="invoice-search-result"
                            onClick={() =>
                              addProduct(product)
                            }
                          >
                            <div>
                              <strong>
                                {product.name}
                              </strong>

                              <span>
                                {product.category}
                              </span>
                            </div>

                            <div className="invoice-product-stock">
                              <small>Stock</small>

                              <strong>
                                {product.stockQuantity}{" "}
                                {product.unit}
                              </strong>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="invoice-items">
                    {items.map((item, index) => (
                      <div
                        className="invoice-item"
                        key={item.productId}
                      >
                        <div className="invoice-item-number">
                          {index + 1}
                        </div>

                        <div className="invoice-item-info">
                          <strong>{item.name}</strong>

                          <span>
                            ₦
                            {item.sellingPrice.toLocaleString()}{" "}
                            / {item.unit}
                          </span>
                        </div>

                        <div className="invoice-item-stock">
                          <small>Available</small>

                          <span>{item.stockQuantity}</span>
                        </div>

                        <div className="invoice-item-quantity">
                          <label>Qty</label>

                          <input
                            type="number"
                            min="1"
                            max={item.stockQuantity}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.productId,
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="invoice-item-total">
                          <small>Total</small>

                          <strong>
                            ₦
                            {(
                              item.sellingPrice *
                              Number(item.quantity)
                            ).toLocaleString()}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="remove-invoice-item"
                          onClick={() =>
                            removeProduct(item.productId)
                          }
                          disabled={saving}
                          aria-label={`Remove ${item.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="invoice-form-section">
                <div className="invoice-section-title">
                  <span>03</span>

                  <div>
                    <h3>Payment</h3>

                    <p>
                      Enter the amount paid and payment method.
                    </p>
                  </div>
                </div>

                <div className="invoice-payment-input">
                  <label htmlFor="amount-paid">
                    Amount Paid
                  </label>

                  <div className="currency-input">
                    <span>₦</span>

                    <input
                      id="amount-paid"
                      type="number"
                      min="0"
                      max={subtotal}
                      step="1"
                      value={amountPaid}
                      onChange={(e) =>
                        setAmountPaid(e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="invoice-payment-fields">
                  <div className="invoice-payment-field">
                    <label htmlFor="payment-method">
                      Payment Method
                    </label>

                    <select
                      id="payment-method"
                      value={paymentMethod}
                      onChange={handlePaymentMethodChange}
                    >
                      <option value="cash">Cash</option>

                      <option value="transfer">
                        Transfer
                      </option>

                      <option value="card">Card</option>
                    </select>
                  </div>

                  {paymentMethod === "transfer" && (
                    <div className="invoice-payment-field">
                      <label htmlFor="payment-channel">
                        Transfer Channel
                      </label>

                      <select
                        id="payment-channel"
                        value={paymentChannel}
                        onChange={(e) =>
                          setPaymentChannel(e.target.value)
                        }
                        required
                      >
                        <option value="">
                          Select transfer channel
                        </option>

                        <option value="opay">Opay</option>

                        <option value="moniepoint">
                          Moniepoint
                        </option>

                        <option value="palmpay">
                          PalmPay
                        </option>

                        <option value="bank">Bank</option>

                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="invoice-summary">
                <div className="invoice-summary-row">
                  <span>Subtotal</span>

                  <strong>
                    ₦{subtotal.toLocaleString()}
                  </strong>
                </div>

                <div className="invoice-summary-row">
                  <span>Amount Paid</span>

                  <strong>
                    ₦{paid.toLocaleString()}
                  </strong>
                </div>

                <div className="invoice-summary-row invoice-balance-row">
                  <span>Balance</span>

                  <strong>
                    ₦{balance.toLocaleString()}
                  </strong>
                </div>

                <div className="invoice-summary-status">
                  <span>Status</span>

                  <strong className={`status-${getStatus()}`}>
                    {getStatus().replace("_", " ")}
                  </strong>
                </div>
              </div>

              <div className="invoice-form-actions">
                <button
                  type="button"
                  className="invoice-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="invoice-submit-button"
                  disabled={
                    saving ||
                    !selectedCustomer ||
                    items.length === 0
                  }
                >
                  {saving
                    ? "Creating Invoice..."
                    : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE DETAILS MODAL */}

      {selectedInvoice && (
        <div
          className="invoice-modal-overlay invoice-details-overlay"
          onClick={closeInvoiceDetails}
        >
          <div
            className="invoice-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invoice-details-header no-print">
              <div>
                <h2>Invoice Details</h2>

                <p>
                  {selectedInvoice.invoiceNumber || "Invoice"}
                </p>
              </div>

              <button
                type="button"
                className="invoice-modal-close"
                onClick={closeInvoiceDetails}
              >
                ×
              </button>
            </div>

            <div className="invoice-details-body">
              <div className="invoice-business-heading">
                <div>
                  <h1>Inventory Manager</h1>

                  <p>
                    Sales & Inventory Management System
                  </p>
                </div>

                <div className="invoice-details-number">
                  <span>Invoice</span>

                  <strong>
                    {selectedInvoice.invoiceNumber || "—"}
                  </strong>
                </div>
              </div>

              <div className="invoice-details-info-grid">
                <div className="invoice-details-info-box">
                  <span>Customer</span>

                  <strong>
                    {selectedInvoice.customer?.name ||
                      "Unknown customer"}
                  </strong>

                  {selectedInvoice.customer?.phone && (
                    <small>
                      {selectedInvoice.customer.phone}
                    </small>
                  )}

                  {selectedInvoice.customer?.email && (
                    <small>
                      {selectedInvoice.customer.email}
                    </small>
                  )}
                </div>

                <div className="invoice-details-info-box">
                  <span>Invoice Date</span>

                  <strong>
                    {selectedInvoice.createdAt
                      ? new Date(
                          selectedInvoice.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </strong>

                  <small>
                    {selectedInvoice.customer?.customerType ||
                      "Customer"}
                  </small>
                </div>
              </div>

              <div className="invoice-details-section">
                <h3>Products</h3>

                {selectedInvoice.items?.length > 0 ? (
                  <div className="invoice-details-items-wrapper">
                    <table className="invoice-details-items-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedInvoice.items.map(
                          (item, index) => (
                            <tr
                              key={`${selectedInvoice._id}-${index}`}
                            >
                              <td>{index + 1}</td>

                              <td>
                                <strong>
                                  {item.product?.name ||
                                    "Product"}
                                </strong>

                                {item.product?.unit && (
                                  <small>
                                    {item.product.unit}
                                  </small>
                                )}
                              </td>

                              <td>{item.quantity}</td>

                              <td>
                                ₦
                                {Number(
                                  item.unitPrice || 0
                                ).toLocaleString()}
                              </td>

                              <td>
                                ₦
                                {Number(
                                  item.totalPrice || 0
                                ).toLocaleString()}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="invoice-details-empty">
                    No products found on this invoice.
                  </p>
                )}
              </div>

              <div className="invoice-details-bottom">
                <div className="invoice-payment-summary">
                  <h3>Payment Information</h3>

                  <div className="invoice-detail-row">
                    <span>Payment Method</span>

                    <strong>
                      {selectedInvoice.paymentMethod
                        ? selectedInvoice.paymentMethod.replace(
                            /\b\w/g,
                            (letter) => letter.toUpperCase()
                          )
                        : "—"}
                    </strong>
                  </div>

                  {selectedInvoice.paymentMethod ===
                    "transfer" &&
                    selectedInvoice.paymentChannel && (
                      <div className="invoice-detail-row">
                        <span>Transfer Channel</span>

                        <strong>
                          {selectedInvoice.paymentChannel.replace(
                            /\b\w/g,
                            (letter) => letter.toUpperCase()
                          )}
                        </strong>
                      </div>
                    )}

                  <div className="invoice-detail-row">
                    <span>Status</span>

                    <strong
                      className={`invoice-details-status status-${
                        selectedInvoice.status || "unpaid"
                      }`}
                    >
                      {selectedInvoice.status
                        ? selectedInvoice.status.replace(
                            "_",
                            " "
                          )
                        : "unpaid"}
                    </strong>
                  </div>
                </div>

                <div className="invoice-total-summary">
                  <div className="invoice-detail-row">
                    <span>Subtotal</span>

                    <strong>
                      ₦
                      {Number(
                        selectedInvoice.subtotal || 0
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div className="invoice-detail-row">
                    <span>Amount Paid</span>

                    <strong>
                      ₦
                      {Number(
                        selectedInvoice.amountPaid || 0
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div className="invoice-detail-row invoice-detail-balance">
                    <span>Balance</span>

                    <strong>
                      ₦
                      {Number(
                        selectedInvoice.balance || 0
                      ).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="invoice-details-actions no-print">
              <button
                type="button"
                className="invoice-details-close-button"
                onClick={closeInvoiceDetails}
              >
                Close
              </button>

              <button
                type="button"
                className="invoice-print-button"
                onClick={handlePrintInvoice}
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;