import {
    Link,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    Bus,
    LogOut,
    User,
    UserRound,
} from "lucide-react";

export default function PublicLayout() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

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

    const getProfilePath = () => {
        if (role === "ROLE_ADMIN") {
            return "/admin/profile";
        }

        if (role === "ROLE_COMPANY") {
            return "/company/profile";
        }

        return "/user/profile";
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="app-shell">
            <nav className="public-top-navbar">
                <div className="public-navbar-inner">
                    <Link
                        className="public-brand"
                        to="/"
                    >
                        <Bus size={22} />
                        <span>Navette</span>
                    </Link>

                    <div className="public-navbar-links">
                        <Link
                            className="public-nav-link"
                            to="/"
                        >
                            Accueil
                        </Link>

                        <Link
                            className="public-nav-link"
                            to="/simple-reservation"
                        >
                            Acheter un billet
                        </Link>

                        <Link
                            className="public-nav-link"
                            to="/offers"
                        >
                            Navettes disponibles
                        </Link>

                        <Link
                            className="public-nav-link"
                            to="/regular-reservation"
                        >
                            Planifier une navette
                        </Link>

                        {isLoggedIn ? (
                            <>
                                <Link
                                    className="public-nav-link"
                                    to={getDashboardPath()}
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    className="public-nav-link"
                                    to={getProfilePath()}
                                >
                                    <UserRound size={16} />
                                    Mon profil
                                </Link>

                                <span className="public-role-badge">
                                    {role}
                                </span>

                                <button
                                    type="button"
                                    className="public-logout-button"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={16} />
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    className="public-login-link"
                                    to="/login"
                                >
                                    <User size={16} />
                                    Connexion
                                </Link>

                                <Link
                                    className="public-register-link"
                                    to="/register"
                                >
                                    Créer un compte
                                </Link>
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
