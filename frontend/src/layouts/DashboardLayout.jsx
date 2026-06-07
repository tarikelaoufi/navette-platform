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
    Ticket,
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
        if (role === "admin") return <Shield size={20} />;
        if (role === "company") return <Building2 size={20} />;
        return <User size={20} />;
    };

    return (
        <div className="dashboard-shell">
            <aside className="dashboard-sidebar">
                <Link to="/" className="dashboard-logo">
                    <Bus size={24} />
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

                    <Link to="/simple-reservation" className="dashboard-link">
                        <Ticket size={18} />
                        Billet
                    </Link>

                    <Link to="/offers" className="dashboard-link">
                        <Search size={18} />
                        Horaires
                    </Link>

                    <Link to="/regular-reservation" className="dashboard-link">
                        <CalendarDays size={18} />
                        Demande
                    </Link>

                    {role === "company" && (
                        <Link to="/company/dashboard" className="dashboard-link">
                            <Building2 size={18} />
                            Société
                        </Link>
                    )}

                    {role === "admin" && (
                        <Link to="/admin/dashboard" className="dashboard-link">
                            <Shield size={18} />
                            Admin
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

                    <div className="dashboard-header-actions">
                        <div className="dashboard-role-badge">
                            {getIcon()}
                            {storedRole}
                        </div>

                        <button
                            type="button"
                            className="dashboard-top-logout"
                            onClick={handleLogout}
                        >
                            <LogOut size={17} />
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