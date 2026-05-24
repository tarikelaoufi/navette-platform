import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import HomePage from "../pages/public/HomePage";
import OffersPage from "../pages/public/OffersPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import UserDashboard from "../pages/user/UserDashboard";
import CompanyDashboard from "../pages/company/CompanyDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

export default function AppRouter() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route
                element={
                    <ProtectedRoute allowedRoles={["ROLE_USER"]}>
                        <DashboardLayout role="user" />
                    </ProtectedRoute>
                }
            >
                <Route path="/user/dashboard" element={<UserDashboard />} />
            </Route>

            <Route
                element={
                    <ProtectedRoute allowedRoles={["ROLE_COMPANY"]}>
                        <DashboardLayout role="company" />
                    </ProtectedRoute>
                }
            >
                <Route path="/company/dashboard" element={<CompanyDashboard />} />
            </Route>

            <Route
                element={
                    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                        <DashboardLayout role="admin" />
                    </ProtectedRoute>
                }
            >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}