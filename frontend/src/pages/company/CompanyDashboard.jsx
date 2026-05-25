import { useEffect, useState } from "react";
import {
    Bus,
    CalendarDays,
    Clock,
    MapPin,
    RefreshCw,
    Route,
    Users,
} from "lucide-react";
import api from "../../api/axios";

export default function CompanyDashboard() {
    const companyId = 1;

    const [shuttles, setShuttles] = useState([]);
    const [offers, setOffers] = useState([]);
    const [demands, setDemands] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadDashboardData = async ({ showLoader = false } = {}) => {
        if (showLoader) {
            setRefreshing(true);
        }

        setError("");

        try {
            const [shuttlesResponse, offersResponse, demandsResponse] =
                await Promise.all([
                    api.get(`/api/company/shuttles?companyId=${companyId}`),
                    api.get(`/api/company/offers?companyId=${companyId}`),
                    api.get("/api/company/demands"),
                ]);

            setShuttles(shuttlesResponse.data);
            setOffers(offersResponse.data);
            setDemands(demandsResponse.data);
        } catch (error) {
            console.error("COMPANY DASHBOARD ERROR:", error);
            setError("Impossible de charger les données de votre espace société.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            api.get(`/api/company/shuttles?companyId=${companyId}`),
            api.get(`/api/company/offers?companyId=${companyId}`),
            api.get("/api/company/demands"),
        ])
            .then(([shuttlesResponse, offersResponse, demandsResponse]) => {
                if (!isMounted) return;

                setShuttles(shuttlesResponse.data);
                setOffers(offersResponse.data);
                setDemands(demandsResponse.data);
            })
            .catch((error) => {
                console.error("COMPANY DASHBOARD ERROR:", error);

                if (isMounted) {
                    setError("Impossible de charger les données de votre espace société.");
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-muted mt-3">Chargement de votre espace société...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
                <div>
                    <h1 className="fw-bold mb-1">Tableau de bord société</h1>
                    <p className="text-muted mb-0">
                        Gérez vos navettes, vos offres et consultez les demandes ouvertes.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => loadDashboardData({ showLoader: true })}
                    disabled={refreshing}
                >
                    <RefreshCw size={18} />
                    {refreshing ? "Actualisation..." : "Actualiser"}
                </button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon bg-primary-subtle text-primary">
                            <Bus size={24} />
                        </div>
                        <div>
                            <small>Navettes</small>
                            <strong>{shuttles.length}</strong>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon bg-success-subtle text-success">
                            <Route size={24} />
                        </div>
                        <div>
                            <small>Offres</small>
                            <strong>{offers.length}</strong>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon bg-warning-subtle text-warning">
                            <Users size={24} />
                        </div>
                        <div>
                            <small>Demandes ouvertes</small>
                            <strong>{demands.length}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Mes navettes</h4>
                    <span>{shuttles.length}</span>
                </div>

                {shuttles.length === 0 ? (
                    <EmptyBox message="Aucune navette trouvée." />
                ) : (
                    <div className="row g-3">
                        {shuttles.map((shuttle) => (
                            <div className="col-lg-6" key={shuttle.id}>
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                                            <h6 className="fw-bold mb-1">{shuttle.name}</h6>
                                            <p className="text-muted mb-2">
                                                {shuttle.type || "Type non défini"}
                                            </p>
                                        </div>

                                        <span className="badge bg-primary-subtle text-primary align-self-start">
                      {shuttle.status}
                    </span>
                                    </div>

                                    <div className="mini-info">
                    <span>
                      <Users size={16} />
                      Capacité : {shuttle.capacity} places
                    </span>

                                        <span>
                      <Bus size={16} />
                      Société : {shuttle.companyName}
                    </span>

                                        <span>
                      <MapPin size={16} />
                                            {shuttle.description || "Aucune description."}
                    </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Mes offres</h4>
                    <span>{offers.length}</span>
                </div>

                {offers.length === 0 ? (
                    <EmptyBox message="Aucune offre trouvée." />
                ) : (
                    <div className="row g-3">
                        {offers.map((offer) => (
                            <div className="col-lg-6" key={offer.id}>
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                                            <h6 className="fw-bold mb-1">{offer.title}</h6>
                                            <p className="text-muted mb-2">
                                                {offer.departureCityName} → {offer.arrivalCityName}
                                            </p>
                                        </div>

                                        <span className="badge bg-success-subtle text-success align-self-start">
                      {offer.status}
                    </span>
                                    </div>

                                    <div className="mini-info">
                    <span>
                      <Clock size={16} />
                        {offer.departureTime} → {offer.arrivalTime}
                    </span>

                                        <span>
                      <CalendarDays size={16} />
                                            {offer.startDate} / {offer.endDate}
                    </span>

                                        <span>
                      <Users size={16} />
                      Places : {offer.availablePlaces} / {offer.totalPlaces}
                    </span>

                                        <span>
                      <Bus size={16} />
                      Navette : {offer.shuttleName}
                    </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="dashboard-section">
                <div className="section-header">
                    <h4>Demandes ouvertes des utilisateurs</h4>
                    <span>{demands.length}</span>
                </div>

                {demands.length === 0 ? (
                    <EmptyBox message="Aucune demande ouverte trouvée." />
                ) : (
                    <div className="row g-3">
                        {demands.map((demand) => (
                            <div className="col-lg-6" key={demand.id}>
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                {demand.departureCityName} → {demand.arrivalCityName}
                                            </h6>
                                            <p className="text-muted mb-2">
                                                Période : {demand.period}
                                            </p>
                                        </div>

                                        <span className="badge bg-warning-subtle text-warning align-self-start">
                      {demand.status}
                    </span>
                                    </div>

                                    <div className="mini-info">
                    <span>
                      <Clock size={16} />
                      Heure souhaitée : {demand.desiredTime}
                    </span>

                                        <span>
                      <Users size={16} />
                      Intéressés : {demand.interestedCount}
                    </span>

                                        <span>
                      <CalendarDays size={16} />
                      Créée le : {formatDateTime(demand.createdAt)}
                    </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function EmptyBox({ message }) {
    return (
        <div className="empty-mini-box">
            <p>{message}</p>
        </div>
    );
}

function formatDateTime(value) {
    if (!value) return "-";

    return new Date(value).toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}