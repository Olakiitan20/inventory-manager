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

function App() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const handleLoginSuccess = () => {
    window.location.href = "/dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;