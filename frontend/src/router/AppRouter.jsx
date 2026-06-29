import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import HomePage from "../pages/public/HomePage";
import OffersPage from "../pages/public/OffersPage";
import OfferDetailsPage from "../pages/public/OfferDetailsPage";
import RegularReservationPage from "../pages/public/RegularReservationPage";
import SimpleReservationPage from "../pages/public/SimpleReservationPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CompanyRegisterPage from "../pages/auth/CompanyRegisterPage";

import UserDashboard from "../pages/user/UserDashboard";
import CompanyDashboard from "../pages/company/CompanyDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProfilePage from "../pages/profile/ProfilePage";

export default function AppRouter() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route
                    path="/offers/:id"
                    element={<OfferDetailsPage />}
                />
                <Route
                    path="/simple-reservation"
                    element={<SimpleReservationPage />}
                />
                <Route
                    path="/regular-reservation"
                    element={<RegularReservationPage />}
                />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/register"
                    element={<RegisterPage />}
                />
                <Route
                    path="/company/register"
                    element={<CompanyRegisterPage />}
                />
            </Route>

            <Route
                element={
                    <ProtectedRoute allowedRoles={["ROLE_USER"]}>
                        <DashboardLayout role="user" />
                    </ProtectedRoute>
                }
            >
                <Route
                    path="/user/dashboard"
                    element={<UserDashboard />}
                />

                <Route
                    path="/user/profile"
                    element={<ProfilePage />}
                />
            </Route>

            <Route
                element={
                    <ProtectedRoute allowedRoles={["ROLE_COMPANY"]}>
                        <DashboardLayout role="company" />
                    </ProtectedRoute>
                }
            >
                <Route
                    path="/company/dashboard"
                    element={<CompanyDashboard />}
                />

                <Route
                    path="/company/profile"
                    element={<ProfilePage />}
                />
            </Route>

            <Route
                element={
                    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                        <DashboardLayout role="admin" />
                    </ProtectedRoute>
                }
            >
                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/profile"
                    element={<ProfilePage />}
                />
            </Route>

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}
