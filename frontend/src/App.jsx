import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Users from "./pages/Users";
import ChangePassword from "./pages/ChangePassword";

function App() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // Get logged-in user
  let currentUser = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Error reading user information:", error);
  }

  const isAdmin = currentUser?.role === "admin";

  const handleLoginSuccess = () => {
    window.location.href = "/dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* CUSTOMERS */}
        <Route
          path="/customers"
          element={
            isLoggedIn ? (
              <Customers />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* PRODUCTS */}
        <Route
          path="/products"
          element={
            isLoggedIn ? (
              <Products />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* INVENTORY */}
        <Route
          path="/inventory"
          element={
            isLoggedIn ? (
              <Inventory />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* INVOICES */}
        <Route
          path="/invoices"
          element={
            isLoggedIn ? (
              <Invoices />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* PAYMENTS */}
        <Route
          path="/payments"
          element={
            isLoggedIn ? (
              <Payments />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* USERS - ADMIN ONLY */}
        <Route
          path="/users"
          element={
            isLoggedIn && isAdmin ? (
              <Users />
            ) : (
              <Navigate
                to={isLoggedIn ? "/dashboard" : "/login"}
                replace
              />
            )
          }
        />

        {/* DEFAULT */}
        <Route
          path="*"
          element={
            <Navigate
              to={isLoggedIn ? "/dashboard" : "/login"}
              replace
            />
          }
        />
        
        {/* CHANGE PASSWORD */}
        <Route
          path="/change-password"
          element={
            isLoggedIn ? (
              <ChangePassword />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;