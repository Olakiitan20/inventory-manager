import { useEffect, useState } from "react";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";
import "./Inventory.css";

const Inventory = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [movementType, setMovementType] = useState("in");

  // Search text is kept separately from the form data
  const [productSearch, setProductSearch] = useState("");

  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    reason: "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Fetch stock movements
  const fetchMovements = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/stock`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch inventory"
        );
      }

      setMovements(data.movements || []);
    } catch (error) {
      console.error("Inventory error:", error.message);
      setError(error.message);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch products"
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Products error:", error.message);
      setError(error.message);
    }
  };

  // Load inventory and products when page opens
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchMovements(),
        fetchProducts(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // Handle quantity and reason inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      productId: "",
      quantity: "",
      reason: "",
    });

    setProductSearch("");
  };

  // Close modal
  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSuccess("");
    setError("");
    resetForm();
  };

  // Open Stock In or Stock Out modal
  const openMovementModal = (type) => {
    setMovementType(type);
    setError("");
    setSuccess("");
    resetForm();
    setShowModal(true);
  };

  // Select product from search results
  const selectProduct = (product) => {
    setFormData((previous) => ({
      ...previous,
      productId: product._id,
    }));

    // Clear search after selecting a product
    setProductSearch("");
  };

  // Change selected product
  const changeProduct = () => {
    setFormData((previous) => ({
      ...previous,
      productId: "",
    }));

    setProductSearch("");
  };

  // Find selected product
  const selectedProduct = products.find(
    (product) => product._id === formData.productId
  );

  // Filter products based on what the user types
  const searchResults = products
    .filter((product) => {
      const search = productSearch.trim().toLowerCase();

      if (!search) {
        return false;
      }

      const productName =
        product.name?.toLowerCase() || "";

      const productCategory =
        product.category?.toLowerCase() || "";

      return (
        productName.includes(search) ||
        productCategory.includes(search)
      );
    })
    .slice(0, 10);

  // Submit Stock In / Stock Out
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productId) {
      setError("Please select a product.");
      return;
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (!formData.reason.trim()) {
      setError("Please enter a reason.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const endpoint =
        movementType === "in"
          ? "/stock/in"
          : "/stock/out";

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            productId: formData.productId,
            quantity: Number(formData.quantity),
            reason: formData.reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update stock"
        );
      }

      setSuccess(
        movementType === "in"
          ? "Stock added successfully!"
          : "Stock removed successfully!"
      );

      resetForm();

      await fetchMovements();
      await fetchProducts();

      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 800);
    } catch (error) {
      console.error(
        "Stock movement error:",
        error.message
      );

      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inventory-layout">

      <Sidebar onLogout={handleLogout} />

      <main className="inventory-content">

        {/* HEADER */}

        <div className="inventory-header">

          <div>
            <h1>Inventory</h1>

            <p>
              Track your stock levels and inventory movements.
            </p>
          </div>

          <div className="inventory-actions">

            <button
              type="button"
              className="stock-in-button"
              onClick={() => openMovementModal("in")}
            >
              + Stock In
            </button>

            <button
              type="button"
              className="stock-out-button"
              onClick={() => openMovementModal("out")}
            >
              − Stock Out
            </button>

          </div>

        </div>

        {/* PAGE ERROR */}

        {error && !showModal && (
          <div className="inventory-alert inventory-alert-error">
            {error}
          </div>
        )}

        {/* INVENTORY CARD */}

        <div className="inventory-card">

          <div className="inventory-card-header">

            <div>
              <h2>Stock Movements</h2>

              <p>
                Recent inventory activity.
              </p>
            </div>

            <span className="movement-count">
              {movements.length} movement
              {movements.length !== 1 ? "s" : ""}
            </span>

          </div>

          {loading ? (
            <p className="empty-message">
              Loading inventory...
            </p>
          ) : movements.length === 0 ? (
            <p className="empty-message">
              No stock movements found.
            </p>
          ) : (
            <div className="inventory-table-wrapper">

              <table className="inventory-table">

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>Performed By</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {movements.map((movement) => (

                    <tr key={movement._id}>

                      <td>
                        <strong>
                          {movement.product?.name ||
                            "Unknown product"}
                        </strong>
                      </td>

                      <td>
                        {movement.product?.category || "—"}
                      </td>

                      <td>

                        <span
                          className={
                            movement.type === "in"
                              ? "movement-in"
                              : movement.type === "out"
                              ? "movement-out"
                              : "movement-adjustment"
                          }
                        >
                          {movement.type}
                        </span>

                      </td>

                      <td>
                        {movement.quantity}
                      </td>

                      <td>
                        {movement.reason}
                      </td>

                      <td>
                        {movement.performedBy?.name ||
                          "Unknown"}
                      </td>

                      <td>
                        {new Date(
                          movement.createdAt
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </main>

      {/* MODAL */}

      {showModal && (

        <div
          className="inventory-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="inventory-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="inventory-modal-header">

              <div>

                <h2>
                  {movementType === "in"
                    ? "Stock In"
                    : "Stock Out"}
                </h2>

                <p>
                  {movementType === "in"
                    ? "Add stock to a product."
                    : "Remove stock from a product."}
                </p>

              </div>

              <button
                type="button"
                className="inventory-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* SUCCESS MESSAGE */}

            {success && (
              <div className="inventory-alert inventory-alert-success">
                {success}
              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div className="inventory-alert inventory-alert-error">
                {error}
              </div>
            )}

            {/* FORM */}

            <form
              className="inventory-form"
              onSubmit={handleSubmit}
            >

              {/* PRODUCT SEARCH */}

              <div className="inventory-form-group">

                <label htmlFor="product-search">
                  Product
                </label>

                {!selectedProduct ? (

                  <div className="product-search-container">

                    <div className="product-search-input-wrapper">

                      <span className="product-search-icon">
                        🔎
                      </span>

                      <input
                        id="product-search"
                        type="text"
                        value={productSearch}
                        onChange={(e) =>
                          setProductSearch(e.target.value)
                        }
                        placeholder="Search product or category..."
                        autoComplete="off"
                      />

                    </div>

                    {/* SEARCH RESULTS */}

                    {productSearch.trim() && (

                      <div className="product-search-results">

                        {searchResults.length === 0 ? (

                          <div className="no-search-results">
                            No matching products found.
                          </div>

                        ) : (

                          searchResults.map((product) => (

                            <button
                              type="button"
                              key={product._id}
                              className="product-search-result"
                              onClick={() =>
                                selectProduct(product)
                              }
                            >

                              <div className="search-product-info">

                                <strong>
                                  {product.name}
                                </strong>

                                <span>
                                  {product.category}
                                </span>

                              </div>

                              <div className="search-product-stock">

                                <small>
                                  Stock
                                </small>

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

                ) : (

                  /* SELECTED PRODUCT */

                  <div className="selected-product">

                    <div className="selected-product-info">

                      <div className="selected-product-icon">
                        ✓
                      </div>

                      <div>

                        <strong>
                          {selectedProduct.name}
                        </strong>

                        <span>
                          Current stock:{" "}
                          {selectedProduct.stockQuantity}{" "}
                          {selectedProduct.unit}
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="change-product-button"
                      onClick={changeProduct}
                      disabled={saving}
                    >
                      Change
                    </button>

                  </div>

                )}

              </div>

              {/* QUANTITY */}

              <div className="inventory-form-group">

                <label htmlFor="stock-quantity">
                  Quantity
                </label>

                <input
                  id="stock-quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  min="1"
                  required
                />

              </div>

              {/* REASON */}

              <div className="inventory-form-group">

                <label htmlFor="stock-reason">
                  Reason
                </label>

                <textarea
                  id="stock-reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder={
                    movementType === "in"
                      ? "e.g. New stock received"
                      : "e.g. Product sold"
                  }
                  rows="3"
                  required
                ></textarea>

              </div>

              {/* BUTTONS */}

              <div className="inventory-modal-actions">

                <button
                  type="button"
                  className="inventory-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    movementType === "in"
                      ? "inventory-submit-in"
                      : "inventory-submit-out"
                  }
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : movementType === "in"
                    ? "Add Stock"
                    : "Remove Stock"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Inventory;