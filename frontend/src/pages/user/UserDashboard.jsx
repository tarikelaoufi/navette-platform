import { useEffect, useState } from "react";
import {
    CalendarDays,
    Clock,
    MapPin,
    Ticket,
    Users,
    WalletCards,
    Building2,
    Bus,
} from "lucide-react";
import api from "../../api/axios";

export default function UserDashboard() {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role") || "ROLE_USER";

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
                    api.get(`/api/user/regular-reservations?userId=${userId}`),
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
        const timer = setTimeout(() => {
            fetchDashboardData();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-muted mt-3">Chargement de votre espace...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-page-header">
                <div>
                    <h1 className="fw-bold mb-1">Tableau de bord utilisateur</h1>
                    <p className="text-muted mb-0">
                        Suivez séparément vos billets simples, abonnements et demandes de navette.
                    </p>
                </div>

                <div className="dashboard-page-role">
                    <Users size={18} />
                    {role}
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row g-4 mb-4">
                <StatCard
                    title="Billets simples"
                    value={reservations.length}
                    icon={<Ticket size={24} />}
                    colorClass="bg-primary-subtle text-primary"
                />

                <StatCard
                    title="Abonnements"
                    value={subscriptions.length}
                    icon={<WalletCards size={24} />}
                    colorClass="bg-success-subtle text-success"
                />

                <StatCard
                    title="Demandes de navette"
                    value={demands.length}
                    icon={<Users size={24} />}
                    colorClass="bg-warning-subtle text-warning"
                />
            </div>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Mes billets simples</h4>
                    <span>{reservations.length}</span>
                </div>

                {reservations.length === 0 ? (
                    <EmptyBox message="Aucun billet simple trouvé." />
                ) : (
                    <div className="row g-3">
                        {reservations.map((reservation) => (
                            <div className="col-lg-6" key={reservation.id}>
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                      <span className="badge bg-primary-subtle text-primary mb-2">
                        Billet simple
                      </span>

                                            <h6 className="fw-bold mb-1">
                                                {reservation.offerTitle || `Billet #${reservation.id}`}
                                            </h6>

                                            <p className="text-muted mb-2">
                                                {reservation.departureCityName} → {reservation.arrivalCityName}
                                            </p>
                                        </div>

                                        <span
                                            className={`badge align-self-start ${getReservationBadgeClass(
                                                reservation.status
                                            )}`}
                                        >
                      {reservation.status}
                    </span>
                                    </div>

                                    <div className="mini-info">
                    <span>
                      <CalendarDays size={16} />
                      Date du trajet : {reservation.travelDate}
                    </span>

                                        <span>
                      <Clock size={16} />
                      Horaire : {reservation.departureTime || "-"} →{" "}
                                            {reservation.arrivalTime || "-"}
                    </span>

                                        <span>
                      <Building2 size={16} />
                      Société : {reservation.companyName || "-"}
                    </span>

                                        <span>
                      <Bus size={16} />
                      Navette : {reservation.shuttleName || "-"}
                    </span>

                                        <span>
                      <Clock size={16} />
                      Demandé le : {formatDateTime(reservation.reservationDate)}
                    </span>

                                        <span>
                      <Ticket size={16} />
                      Prix billet : {formatPrice(reservation.amount)} MAD
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
                      <span className="badge bg-success-subtle text-success mb-2">
                        Abonnement
                      </span>

                                            <h6 className="fw-bold mb-1">
                                                {subscription.offerTitle || `Abonnement #${subscription.id}`}
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
                      Souscrit le : {formatDateTime(subscription.subscriptionDate)}
                    </span>

                                        <span>
                      <WalletCards size={16} />
                      Prix abonnement : {formatPrice(subscription.amount)} MAD
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
                    <h4>Mes demandes de navette</h4>
                    <span>{demands.length}</span>
                </div>

                {demands.length === 0 ? (
                    <EmptyBox message="Aucune demande de navette trouvée." />
                ) : (
                    <div className="row g-3">
                        {demands.map((demand) => (
                            <div className="col-lg-6" key={demand.id}>
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                      <span className="badge bg-warning-subtle text-warning mb-2">
                        Demande de navette
                      </span>

                                            <h6 className="fw-bold mb-1">
                                                {demand.departureCityName || demand.departureCity} →{" "}
                                                {demand.arrivalCityName || demand.arrivalCity}
                                            </h6>

                                            <p className="text-muted mb-2">
                                                Période : {demand.period || "-"}
                                            </p>
                                        </div>

                                        <span
                                            className={`badge align-self-start ${getDemandBadgeClass(
                                                demand.status
                                            )}`}
                                        >
                      {demand.status}
                    </span>
                                    </div>

                                    <div className="mini-info">
                    <span>
                      <Clock size={16} />
                      Heure souhaitée : {demand.desiredTime || "-"}
                    </span>

                                        <span>
                      <Users size={16} />
                      Places souhaitées : {demand.seats || 1}
                    </span>

                                        <span>
                      <CalendarDays size={16} />
                                            {demand.startDate && demand.endDate
                                                ? `${demand.startDate} / ${demand.endDate}`
                                                : "Dates non précisées"}
                    </span>

                                        {demand.notes && (
                                            <span>
                        <MapPin size={16} />
                        Note : {demand.notes}
                      </span>
                                        )}

                                        <OptionBadges
                                            hasWifi={demand.hasWifi}
                                            hasAirConditioning={demand.hasAirConditioning}
                                            hasUsbCharger={demand.hasUsbCharger}
                                            allowsLuggage={demand.allowsLuggage}
                                            suffix=" demandé"
                                            emptyText="Aucune option demandée"
                                        />
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

function StatCard({ title, value, icon, colorClass }) {
    return (
        <div className="col-md-4">
            <div className="dashboard-stat-card">
                <div className={`stat-icon ${colorClass}`}>{icon}</div>

                <div>
                    <small>{title}</small>
                    <strong>{value}</strong>
                </div>
            </div>
        </div>
    );
}

function OptionBadges({
                          hasWifi,
                          hasAirConditioning,
                          hasUsbCharger,
                          allowsLuggage,
                          suffix = "",
                          emptyText = "Aucune option",
                      }) {
    const hasAnyOption =
        hasWifi || hasAirConditioning || hasUsbCharger || allowsLuggage;

    return (
        <div className="d-flex flex-wrap gap-2 mt-2">
            {hasWifi && (
                <span className="badge bg-info-subtle text-info">Wi-Fi{suffix}</span>
            )}

            {hasAirConditioning && (
                <span className="badge bg-primary-subtle text-primary">
          Climatisation{suffix}
        </span>
            )}

            {hasUsbCharger && (
                <span className="badge bg-success-subtle text-success">USB{suffix}</span>
            )}

            {allowsLuggage && (
                <span className="badge bg-warning-subtle text-warning">
          Bagages{suffix}
        </span>
            )}

            {!hasAnyOption && (
                <span className="badge bg-secondary-subtle text-secondary">
          {emptyText}
        </span>
            )}
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

function formatPrice(value) {
    if (value === null || value === undefined || value === "") return "-";
    return Number(value).toFixed(2);
}

function getReservationBadgeClass(status) {
    if (status === "CONFIRMEE") return "bg-success-subtle text-success";
    if (status === "EN_ATTENTE") return "bg-warning-subtle text-warning";
    if (status === "REFUSEE") return "bg-danger-subtle text-danger";
    if (status === "ANNULEE") return "bg-secondary-subtle text-secondary";
    return "bg-primary-subtle text-primary";
}

function getDemandBadgeClass(status) {
    if (status === "ACCEPTED") return "bg-success-subtle text-success";
    if (status === "PENDING") return "bg-warning-subtle text-warning";
    if (status === "REJECTED") return "bg-danger-subtle text-danger";
    if (status === "CANCELLED") return "bg-secondary-subtle text-secondary";
    return "bg-primary-subtle text-primary";
}