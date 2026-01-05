import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import DataBOS from "../pages/DataBOS";
import ProsesKMeans from "../pages/ProsesKMeans";
import HasilKlaster from "../pages/HasilKlaster";
import Visualisasi from "../pages/Visualisasi";
import Simulasi from "../pages/Simulasi";
import Laporan from "../pages/Laporan";
import UserManagement from "../pages/UserManagement";
import { AuthProvider, useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="p-8 text-center text-red-600">
        Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  return children;
};

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "super_admin",
                  "admin_ijazah",
                  "admin_bos",
                  "operator_sekolah",
                ]}
              >
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <MainLayout>
                  <UserManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/data-bos"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "super_admin",
                  "admin_bos",
                  "operator_sekolah",
                  "operator_bos",
                ]}
              >
                <MainLayout>
                  <DataBOS />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/proses-kmeans"
            element={
              <ProtectedRoute
                allowedRoles={["super_admin", "admin_bos", "operator_bos"]}
              >
                <MainLayout>
                  <ProsesKMeans />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hasil-klaster"
            element={
              <ProtectedRoute
                allowedRoles={["super_admin", "admin_bos", "operator_bos"]}
              >
                <MainLayout>
                  <HasilKlaster />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visualisasi"
            element={
              <ProtectedRoute
                allowedRoles={["super_admin", "admin_bos", "operator_bos"]}
              >
                <MainLayout>
                  <Visualisasi />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulasi"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "admin_bos"]}>
                <MainLayout>
                  <Simulasi />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/laporan"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "admin_bos"]}>
                <MainLayout>
                  <Laporan />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
