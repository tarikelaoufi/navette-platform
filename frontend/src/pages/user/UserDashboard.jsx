import { useEffect, useState } from "react";
import {
    CalendarDays,
    Clock,
    MapPin,
    RefreshCw,
    Ticket,
    Users,
    WalletCards,
} from "lucide-react";
import api from "../../api/axios";

export default function UserDashboard() {
    const userId = localStorage.getItem("userId");

    const [reservations, setReservations] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [demands, setDemands] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = async () => {
        setLoading(true);
        setError("");

        try {
            const [reservationsResponse, subscriptionsResponse, demandsResponse] =
                await Promise.all([
                    api.get(`/api/user/reservations?userId=${userId}`),
                    api.get(`/api/user/subscriptions?userId=${userId}`),
                    api.get(`/api/user/demands?userId=${userId}`),
                ]);

            setReservations(reservationsResponse.data);
            setSubscriptions(subscriptionsResponse.data);
            setDemands(demandsResponse.data);
        } catch (error) {
            console.error("USER DASHBOARD ERROR:", error);
            setError("Impossible de charger les données de votre espace.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const totalReservations = reservations.length;
    const totalSubscriptions = subscriptions.length;
    const totalDemands = demands.length;

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-muted mt-3">Chargement de votre espace...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
                <div>
                    <h1 className="fw-bold mb-1">Tableau de bord utilisateur</h1>
                    <p className="text-muted mb-0">
                        Suivez vos réservations, abonnements et demandes de navette.
                    </p>
                </div>

                <button className="btn btn-outline-primary" onClick={fetchDashboardData}>
                    <RefreshCw size={18} />
                    Actualiser
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
                            <Ticket size={24} />
                        </div>
                        <div>
                            <small>Réservations</small>
                            <strong>{totalReservations}</strong>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon bg-success-subtle text-success">
                            <WalletCards size={24} />
                        </div>
                        <div>
                            <small>Abonnements</small>
                            <strong>{totalSubscriptions}</strong>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon bg-warning-subtle text-warning">
                            <Users size={24} />
                        </div>
                        <div>
                            <small>Demandes</small>
                            <strong>{totalDemands}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Mes réservations</h4>
                    <span>{reservations.length}</span>
                </div>

                {reservations.length === 0 ? (
                    <EmptyBox message="Aucune réservation trouvée." />
                ) : (
                    <div className="row g-3">
                        {reservations.map((reservation) => (
                            <div className="col-lg-6" key={reservation.id}>
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                {reservation.offerTitle}
                                            </h6>
                                            <p className="text-muted mb-2">
                                                {reservation.departureCityName} →{" "}
                                                {reservation.arrivalCityName}
                                            </p>
                                        </div>

                                        <span className="badge bg-primary-subtle text-primary align-self-start">
                      {reservation.status}
                    </span>
                                    </div>

                                    <div className="mini-info">
                    <span>
                      <CalendarDays size={16} />
                      Trajet : {reservation.travelDate}
                    </span>
                                        <span>
                      <Clock size={16} />
                      Réservé le : {formatDateTime(reservation.reservationDate)}
                    </span>
                                        <span>
                      <MapPin size={16} />
                      Montant : {reservation.amount} MAD
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
                    <h4>Mes abonnements</h4>
                    <span>{subscriptions.length}</span>
                </div>

                {subscriptions.length === 0 ? (
                    <EmptyBox message="Aucun abonnement trouvé." />
                ) : (
                    <div className="row g-3">
                        {subscriptions.map((subscription) => (
                            <div className="col-lg-6" key={subscription.id}>
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                {subscription.offerTitle}
                                            </h6>
                                            <p className="text-muted mb-2">
                                                {subscription.departureCityName} →{" "}
                                                {subscription.arrivalCityName}
                                            </p>
                                        </div>

                                        <span className="badge bg-success-subtle text-success align-self-start">
                      {subscription.status}
                    </span>
                                    </div>

                                    <div className="mini-info">
                    <span>
                      <CalendarDays size={16} />
                      Du {subscription.startDate} au {subscription.endDate}
                    </span>
                                        <span>
                      <Clock size={16} />
                      Souscrit le :{" "}
                                            {formatDateTime(subscription.subscriptionDate)}
                    </span>
                                        <span>
                      <WalletCards size={16} />
                      Montant : {subscription.amount} MAD
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
                    <h4>Mes demandes</h4>
                    <span>{demands.length}</span>
                </div>

                {demands.length === 0 ? (
                    <EmptyBox message="Aucune demande trouvée." />
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