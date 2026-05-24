import { Link, Outlet } from "react-router-dom";
import { Bus, User } from "lucide-react";

export default function PublicLayout() {
    return (
        <div className="app-shell">
            <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
                <div className="container">
                    <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
                        <Bus size={24} />
                        Navette Platform
                    </Link>

                    <div className="d-flex align-items-center gap-2">
                        <Link className="btn btn-link text-decoration-none" to="/">
                            Accueil
                        </Link>

                        <Link className="btn btn-link text-decoration-none" to="/offers">
                            Offres
                        </Link>

                        <Link className="btn btn-outline-primary d-flex align-items-center gap-2" to="/login">
                            <User size={18} />
                            Connexion
                        </Link>

                        <Link className="btn btn-primary" to="/register">
                            Créer un compte
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
}