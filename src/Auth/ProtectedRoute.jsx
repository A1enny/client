import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const userRole = localStorage.getItem("role");
  const location = useLocation();

  // ✅ อนุญาต Guest (ไม่มี role) เข้า /order/:table_id
  if (location.pathname.startsWith("/order/")) {
    return <Outlet />;
  }

  // ✅ เช็ค role ตามปกติ
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
