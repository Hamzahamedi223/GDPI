import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false, departmentOnly = false, scanningAccess = false }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user_data"));
  const isAdmin = user?.role?.name === "admin";
  const isChefService = user?.role?.name === "chef service";
  const userDepartment = user?.department?.name;
  const hasScanningAccess = user?.scanning_access === true;

  console.log("Current User Role:", user?.role?.name || "No role found");
  console.log("User Department:", userDepartment || "No department found");
  console.log("Accessing Page:", location.pathname);
  console.log("Is Admin:", isAdmin);
  console.log("Is Chef Service:", isChefService);
  console.log("Has Scanning Access:", hasScanningAccess);
  console.log("Route Requires Admin:", adminOnly);
  console.log("Route Requires Department:", departmentOnly);
  console.log("Route Requires Scanning Access:", scanningAccess);

  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log("Access denied: Non-admin user trying to access admin route");
    return <Navigate to="/dashboard" replace />;
  }

  if (departmentOnly && (!isChefService || !userDepartment)) {
    console.log("Access denied: User not authorized for department-specific route");
    return <Navigate to="/dashboard" replace />;
  }

  if (scanningAccess && !hasScanningAccess) {
    console.log("Access denied: User does not have scanning access");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Access granted to:", location.pathname);
  return children;
};

export default ProtectedRoute;
