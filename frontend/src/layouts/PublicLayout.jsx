import { Link, Outlet, useNavigate } from "react-router-dom";
import { Bus, LogOut, User, CalendarDays } from "lucide-react";

export default function PublicLayout() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    const isLoggedIn = Boolean(token);

    const getDashboardPath = () => {
        if (role === "ROLE_ADMIN") {
            return "/admin/dashboard";
        }

        if (role === "ROLE_COMPANY") {
            return "/company/dashboard";
        }

        return "/user/dashboard";
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="app-shell">
            <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
                <div className="container">
                    <Link
                        className="navbar-brand fw-bold d-flex align-items-center gap-2"
                        to="/"
                    >
                        <Bus size={24} />
                        Navette Platform
                    </Link>

                    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                        <Link className="btn btn-link text-decoration-none" to="/">
                            Accueil
                        </Link>

                        <Link className="btn btn-link text-decoration-none" to="/offers">
                            Navettes disponibles
                        </Link>

                        <Link
                            className="btn btn-link text-decoration-none d-flex align-items-center gap-1"
                            to="/regular-reservation"
                        >
                            <CalendarDays size={17} />
                            Réservation régulière
                        </Link>

                        {!isLoggedIn ? (
                            <>
                                <Link
                                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                                    to="/login"
                                >
                                    <User size={18} />
                                    Connexion
                                </Link>

                                <Link className="btn btn-primary" to="/register">
                                    Créer un compte
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link className="btn btn-outline-primary" to={getDashboardPath()}>
                                    Dashboard
                                </Link>

                                <span className="nav-user-email d-none d-lg-inline">
                                    {email}
                                </span>

                                <button
                                    className="btn btn-danger d-flex align-items-center gap-2"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} />
                                    Déconnexion
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
}