import { Link, Outlet, useNavigate } from "react-router-dom";
import {
    Bus,
    Home,
    LogOut,
    Shield,
    User,
    Building2,
    CalendarDays,
    Search,
} from "lucide-react";

export default function DashboardLayout({ role }) {
    const navigate = useNavigate();

    const email = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const getTitle = () => {
        if (role === "admin") return "Administration";
        if (role === "company") return "Espace Société";
        return "Espace Utilisateur";
    };

    const getIcon = () => {
        if (role === "admin") return <Shield size={22} />;
        if (role === "company") return <Building2 size={22} />;
        return <User size={22} />;
    };

    return (
        <div className="dashboard-shell">
            <aside className="dashboard-sidebar">
                <Link to="/" className="dashboard-logo">
                    <Bus size={26} />
                    <span>Navette</span>
                </Link>

                <div className="dashboard-user-box">
                    <div className="dashboard-avatar">
                        {email?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                        <strong>{email || "Utilisateur"}</strong>
                        <small>{storedRole}</small>
                    </div>
                </div>

                <nav className="dashboard-nav">
                    <Link to="/" className="dashboard-link">
                        <Home size={18} />
                        Accueil
                    </Link>

                    <Link to="/offers" className="dashboard-link">
                        <Search size={18} />
                        Navettes disponibles
                    </Link>

                    <Link to="/regular-reservation" className="dashboard-link">
                        <CalendarDays size={18} />
                        Demander une navette
                    </Link>

                    {role === "user" && (
                        <Link to="/user/dashboard" className="dashboard-link">
                            <User size={18} />
                            Dashboard Utilisateur
                        </Link>
                    )}

                    {role === "company" && (
                        <Link to="/company/dashboard" className="dashboard-link">
                            <Building2 size={18} />
                            Dashboard Société
                        </Link>
                    )}

                    {role === "admin" && (
                        <Link to="/admin/dashboard" className="dashboard-link">
                            <Shield size={18} />
                            Dashboard Admin
                        </Link>
                    )}
                </nav>

                <button
                    type="button"
                    className="dashboard-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    Déconnexion
                </button>
            </aside>

            <div className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h4>{getTitle()}</h4>
                        <p>Bienvenue dans votre espace de gestion.</p>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <div className="dashboard-role-badge">
                            {getIcon()}
                            {storedRole}
                        </div>

                        <button
                            type="button"
                            className="btn btn-danger d-flex align-items-center gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} />
                            Déconnexion
                        </button>
                    </div>
                </header>

                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}