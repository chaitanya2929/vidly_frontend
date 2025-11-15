import React from "react";
// Import useLocation and Outlet
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // adjust path if needed

// This component no longer needs a 'children' prop
export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation(); // Get the current location

  // 1. While loading, show a loading message
  //    This prevents a redirect loop on a page refresh.
  if (loading) {
    return <div className="p-8 text-center">Checking authentication…</div>;
  }

  // 2. If not logged in (after loading), redirect to /login
  if (!user) {
    // We pass the 'from' location in the state.
    // This tells the /login page where the user was trying to go.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If logged in, render the child route (e.g., <Movies />)
  //    <Outlet /> renders the matching child route defined in App.tsx
  return <Outlet />;
}
