import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

function PrivateRoute() {
  const auth = useAuth();

  return auth?.user ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;
