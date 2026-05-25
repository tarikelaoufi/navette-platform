import { Link } from "react-router-dom";
import { ArrowRight, Bus, Search, ShieldCheck } from "lucide-react";

export default function HomePage() {
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

    return (
        <div>
            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center min-vh-75 py-5">
                        <div className="col-lg-7">
              <span className="badge bg-primary-subtle text-primary mb-3">
                Plateforme de navettes des autocars
              </span>

                            <h1 className="display-4 fw-bold mb-4">
                                Trouvez une navette ou créez une demande selon votre besoin.
                            </h1>

                            <p className="lead text-muted mb-4">
                                Navette Platform permet aux utilisateurs de chercher des offres,
                                réserver une place, s’abonner à un trajet, ou créer une demande
                                si aucune offre ne correspond.
                            </p>

                            <div className="d-flex gap-3 flex-wrap">
                                <Link
                                    to="/offers"
                                    className="btn btn-primary btn-lg d-flex align-items-center gap-2"
                                >
                                    Voir les offres
                                    <ArrowRight size={20} />
                                </Link>

                                {!isLoggedIn ? (
                                    <Link to="/register" className="btn btn-outline-primary btn-lg">
                                        Créer un compte
                                    </Link>
                                ) : (
                                    <Link
                                        to={getDashboardPath()}
                                        className="btn btn-outline-primary btn-lg"
                                    >
                                        Accéder au dashboard
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-5 mt-5 mt-lg-0">
                            <div className="hero-card shadow-sm">
                                <div className="icon-box bg-primary text-white">
                                    <Bus size={32} />
                                </div>

                                <h4 className="fw-bold mt-4">Tanger → Tétouan</h4>
                                <p className="text-muted mb-4">Abonnement mensuel disponible</p>

                                <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                                    <span>Départ</span>
                                    <strong>08:00</strong>
                                </div>

                                <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                                    <span>Arrivée</span>
                                    <strong>09:00</strong>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <span>Prix</span>
                                    <strong>500 MAD</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 pb-5">
                        <div className="col-md-4">
                            <div className="feature-card">
                                <Search size={28} />
                                <h5>Recherche rapide</h5>
                                <p>Trouvez les offres disponibles entre deux villes.</p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="feature-card">
                                <Bus size={28} />
                                <h5>Réservation simple</h5>
                                <p>Réservez une place pour un trajet ponctuel.</p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="feature-card">
                                <ShieldCheck size={28} />
                                <h5>Gestion sécurisée</h5>
                                <p>Espaces séparés pour utilisateur, société et admin.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}