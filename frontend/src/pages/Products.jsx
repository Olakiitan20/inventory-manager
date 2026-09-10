import { useEffect, useState } from "react";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    unit: "piece",
    costPrice: "",
    sellingPrice: "",
    stockQuantity: "",
    lowStockThreshold: "10",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      unit: "piece",
      costPrice: "",
      sellingPrice: "",
      stockQuantity: "",
      lowStockThreshold: "10",
    });
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSuccess("");
    setError("");
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          unit: formData.unit,
          costPrice: Number(formData.costPrice),
          sellingPrice: Number(formData.sellingPrice),
          stockQuantity: Number(formData.stockQuantity) || 0,
          lowStockThreshold:
            Number(formData.lowStockThreshold) || 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create product"
        );
      }

      setSuccess("Product created successfully!");

      resetForm();

      await fetchProducts();

      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 800);
    } catch (error) {
      console.error("Create product error:", error.message);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="products-layout">
      <Sidebar onLogout={handleLogout} />

      <main className="products-content">
        <div className="products-header">
          <div>
            <h1>Products</h1>
            <p>Manage your products and stock information.</p>
          </div>

          <button
            className="add-product-button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowModal(true);
            }}
          >
            + Add Product
          </button>
        </div>

        {error && !showModal && (
          <div className="product-alert product-alert-error">
            {error}
          </div>
        )}

        <div className="products-card">
          {loading ? (
            <p className="empty-message">
              Loading products...
            </p>
          ) : products.length === 0 ? (
            <p className="empty-message">
              No products found.
            </p>
          ) : (
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Cost Price</th>
                    <th>Selling Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="product-name">
                          <strong>{product.name}</strong>

                          {product.description && (
                            <span>
                              {product.description}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>{product.category}</td>

                      <td>
                        <span className="product-unit">
                          {product.unit}
                        </span>
                      </td>

                      <td>
                        ₦
                        {Number(
                          product.costPrice || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        ₦
                        {Number(
                          product.sellingPrice || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        <span
                          className={
                            Number(product.stockQuantity) <=
                            Number(product.lowStockThreshold)
                              ? "stock-low"
                              : "stock-good"
                          }
                        >
                          {product.stockQuantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div
          className="product-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="product-modal-header">
              <div>
                <h2>Add Product</h2>
                <p>
                  Create a new product for your inventory.
                </p>
              </div>

              <button
                type="button"
                className="product-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {success && (
              <div className="product-alert product-alert-success">
                {success}
              </div>
            )}

            {error && (
              <div className="product-alert product-alert-error">
                {error}
              </div>
            )}

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >
              <div className="product-form-group">
                <label htmlFor="product-name">
                  Product Name
                </label>

                <input
                  id="product-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="product-form-group">
                <label htmlFor="product-description">
                  Description
                </label>

                <textarea
                  id="product-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows="3"
                ></textarea>
              </div>

              <div className="product-form-row">
                <div className="product-form-group">
                  <label htmlFor="product-category">
                    Category
                  </label>

                  <input
                    id="product-category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Yoghurt"
                    required
                  />
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-unit">
                    Unit
                  </label>

                  <select
                    id="product-unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    <option value="piece">Piece</option>
                    <option value="crate">Crate</option>
                    <option value="carton">Carton</option>
                    <option value="kg">Kg</option>
                    <option value="liter">Liter</option>
                  </select>
                </div>
              </div>

              <div className="product-form-row">
                <div className="product-form-group">
                  <label htmlFor="cost-price">
                    Cost Price
                  </label>

                  <input
                    id="cost-price"
                    name="costPrice"
                    type="number"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="₦0"
                    min="0"
                    required
                  />
                </div>

                <div className="product-form-group">
                  <label htmlFor="selling-price">
                    Selling Price
                  </label>

                  <input
                    id="selling-price"
                    name="sellingPrice"
                    type="number"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    placeholder="₦0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="product-form-row">
                <div className="product-form-group">
                  <label htmlFor="stock-quantity">
                    Stock Quantity
                  </label>

                  <input
                    id="stock-quantity"
                    name="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="product-form-group">
                  <label htmlFor="low-stock-threshold">
                    Low Stock Threshold
                  </label>

                  <input
                    id="low-stock-threshold"
                    name="lowStockThreshold"
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    placeholder="10"
                    min="0"
                  />
                </div>
              </div>

              <div className="product-modal-actions">
                <button
                  type="button"
                  className="product-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="product-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;