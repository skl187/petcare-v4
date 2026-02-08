import { useEffect } from "react";
import { useAuth } from "./components/auth/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("lastValidRoute", location.pathname); // Save last valid route
    }
  }, [location.pathname, user]);

  if (loading) {
    return <div>Loading...</div>; // Loading state while auth is checked
  }

  if (!user) {
    sessionStorage.setItem("redirectTo", location.pathname);
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

