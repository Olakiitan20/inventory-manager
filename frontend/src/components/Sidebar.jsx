import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-top">

        {/* Brand / Home Link */}
        <div className="sidebar-brand">
          <NavLink
            to="/dashboard"
            className="sidebar-logo"
            onClick={closeMobileMenu}
          >
            Inventory Manager
          </NavLink>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
          >
            ☰
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">

          <NavLink
            to="/dashboard"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/customers"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">♙</span>
            <span>Customers</span>
          </NavLink>

          <NavLink
            to="/products"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">▣</span>
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/inventory"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">▤</span>
            <span>Inventory</span>
          </NavLink>

          <NavLink
            to="/invoices"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">▤</span>
            <span>Invoices</span>
          </NavLink>

          <NavLink
            to="/payments"
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">₦</span>
            <span>Payments</span>
          </NavLink>

        </nav>
      </div>

      {/* Logout */}
      <div className="sidebar-logout">
        <button
          type="button"
          onClick={onLogout}
        >
          <span className="nav-icon">↪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;