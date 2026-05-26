import { useEffect, useState } from "react";
import {
    Building2,
    Bus,
    CalendarCheck,
    CalendarDays,
    Clock,
    MapPin,
    MessageSquareText,
    RefreshCw,
    Route,
    Users,
    WalletCards,
} from "lucide-react";
import api from "../../api/axios";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [offers, setOffers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [demands, setDemands] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadAdminData = async ({ showLoader = false } = {}) => {
        if (showLoader) {
            setRefreshing(true);
        }

        setError("");

        try {
            const [
                statsResponse,
                usersResponse,
                companiesResponse,
                offersResponse,
                reservationsResponse,
                demandsResponse,
            ] = await Promise.all([
                api.get("/api/admin/stats"),
                api.get("/api/admin/users"),
                api.get("/api/admin/companies"),
                api.get("/api/admin/offers"),
                api.get("/api/admin/reservations"),
                api.get("/api/admin/regular-reservations"),
            ]);

            setStats(statsResponse.data);
            setUsers(usersResponse.data);
            setCompanies(companiesResponse.data);
            setOffers(offersResponse.data);
            setReservations(reservationsResponse.data);
            setDemands(demandsResponse.data);
        } catch (error) {
            console.error("ADMIN DASHBOARD ERROR:", error);
            setError("Impossible de charger les données administrateur.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            api.get("/api/admin/stats"),
            api.get("/api/admin/users"),
            api.get("/api/admin/companies"),
            api.get("/api/admin/offers"),
            api.get("/api/admin/reservations"),
            api.get("/api/admin/regular-reservations"),
        ])
            .then(
                ([
                     statsResponse,
                     usersResponse,
                     companiesResponse,
                     offersResponse,
                     reservationsResponse,
                     demandsResponse,
                 ]) => {
                    if (!isMounted) return;

                    setStats(statsResponse.data);
                    setUsers(usersResponse.data);
                    setCompanies(companiesResponse.data);
                    setOffers(offersResponse.data);
                    setReservations(reservationsResponse.data);
                    setDemands(demandsResponse.data);
                }
            )
            .catch((error) => {
                console.error("ADMIN DASHBOARD ERROR:", error);

                if (isMounted) {
                    setError("Impossible de charger les données administrateur.");
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
                <p className="text-muted mt-3">
                    Chargement de l’espace administrateur...
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
                <div>
                    <h1 className="fw-bold mb-1">Tableau de bord administrateur</h1>
                    <p className="text-muted mb-0">
                        Vue globale sur les utilisateurs, sociétés, offres, réservations et
                        demandes de navette.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    onClick={() => loadAdminData({ showLoader: true })}
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
                <StatCard
                    title="Utilisateurs"
                    value={stats?.totalUsers || users.length || 0}
                    icon={<Users size={24} />}
                    colorClass="bg-primary-subtle text-primary"
                />

                <StatCard
                    title="Sociétés"
                    value={stats?.totalCompanies || companies.length || 0}
                    icon={<Building2 size={24} />}
                    colorClass="bg-success-subtle text-success"
                />

                <StatCard
                    title="Navettes"
                    value={stats?.totalShuttles || 0}
                    icon={<Bus size={24} />}
                    colorClass="bg-info-subtle text-info"
                />

                <StatCard
                    title="Offres"
                    value={stats?.totalOffers || offers.length || 0}
                    icon={<Route size={24} />}
                    colorClass="bg-warning-subtle text-warning"
                />

                <StatCard
                    title="Abonnements"
                    value={stats?.totalSubscriptions || 0}
                    icon={<WalletCards size={24} />}
                    colorClass="bg-secondary-subtle text-secondary"
                />

                <StatCard
                    title="Réservations"
                    value={stats?.totalReservations || reservations.length || 0}
                    icon={<CalendarCheck size={24} />}
                    colorClass="bg-danger-subtle text-danger"
                />

                <StatCard
                    title="Demandes de navette"
                    value={stats?.totalDemands || demands.length || 0}
                    icon={<MessageSquareText size={24} />}
                    colorClass="bg-dark-subtle text-dark"
                />
            </div>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Utilisateurs</h4>
                    <span>{users.length}</span>
                </div>

                {users.length === 0 ? (
                    <EmptyBox message="Aucun utilisateur trouvé." />
                ) : (
                    <div className="table-responsive">
                        <table className="table align-middle admin-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Status</th>
                            </tr>
                            </thead>

                            <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || "-"}</td>
                                    <td>
                      <span className="badge bg-primary-subtle text-primary">
                        {user.status}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Sociétés de transport</h4>
                    <span>{companies.length}</span>
                </div>

                {companies.length === 0 ? (
                    <EmptyBox message="Aucune société trouvée." />
                ) : (
                    <div className="row g-3">
                        {companies.map((company) => (
                            <div className="col-lg-6" key={company.id}>
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                                            <h6 className="fw-bold mb-1">{company.companyName}</h6>
                                            <p className="text-muted mb-2">
                                                {company.professionalEmail}
                                            </p>
                                        </div>

                                        <span className="badge bg-success-subtle text-success align-self-start">
                      {company.status}
                    </span>
                                    </div>

                                    <div className="mini-info">
                                        <span>Téléphone : {company.companyPhone || "-"}</span>
                                        <span>Adresse : {company.address || "-"}</span>
                                        <span>Utilisateur : {company.user?.email || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Offres</h4>
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
                                                {offer.departureCity?.name ||
                                                    offer.departureCityName ||
                                                    "-"}{" "}
                                                →{" "}
                                                {offer.arrivalCity?.name ||
                                                    offer.arrivalCityName ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <span
                                            className={`badge align-self-start ${getOfferBadgeClass(
                                                offer.status
                                            )}`}
                                        >
                      {offer.status}
                    </span>
                                    </div>

                                    <div className="mini-info">
                    <span>
                      Société :{" "}
                        {offer.company?.companyName || offer.companyName || "-"}
                    </span>

                                        <span>
                      Navette : {offer.shuttle?.name || offer.shuttleName || "-"}
                    </span>

                                        <span>
                      Horaire : {offer.departureTime} → {offer.arrivalTime}
                    </span>

                                        <span>
                      Période : {offer.startDate} / {offer.endDate}
                    </span>

                                        <span>Prix : {offer.price} MAD</span>

                                        <span>
                      Places : {offer.availablePlaces} / {offer.totalPlaces}
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
                    <h4>Réservations</h4>
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
                                                {reservation.offer?.title ||
                                                    reservation.offerTitle ||
                                                    `Réservation #${reservation.id}`}
                                            </h6>

                                            <p className="text-muted mb-2">
                                                Utilisateur :{" "}
                                                {reservation.user?.email ||
                                                    reservation.userEmail ||
                                                    `ID ${
                                                        reservation.user?.id || reservation.userId || "-"
                                                    }`}
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
                      Client :{" "}
                        {reservation.userFullName ||
                            reservation.user?.firstName ||
                            "-"}
                    </span>

                                        <span>
                      Trajet : {reservation.departureCityName || "-"} →{" "}
                                            {reservation.arrivalCityName || "-"}
                    </span>

                                        <span>Date trajet : {reservation.travelDate}</span>

                                        <span>
                      Date réservation :{" "}
                                            {formatDateTime(reservation.reservationDate)}
                    </span>

                                        <span>Montant : {reservation.amount} MAD</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="dashboard-section">
                <div className="section-header">
                    <h4>Demandes de navette des utilisateurs</h4>
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
                                            <h6 className="fw-bold mb-1">
                                                {demand.departureCity?.name ||
                                                    demand.departureCityName ||
                                                    demand.departureCity ||
                                                    "-"}{" "}
                                                →{" "}
                                                {demand.arrivalCity?.name ||
                                                    demand.arrivalCityName ||
                                                    demand.arrivalCity ||
                                                    "-"}
                                            </h6>

                                            <p className="text-muted mb-2">
                                                Utilisateur :{" "}
                                                {demand.userFullName ||
                                                    demand.userEmail ||
                                                    `ID ${demand.userId || "-"}`}
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
                      Période : {demand.period || "-"}
                    </span>

                                        <span>
                      <CalendarDays size={16} />
                      Dates : {demand.startDate || "-"} /{" "}
                                            {demand.endDate || "-"}
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
        <div className="col-md-6 col-xl-4">
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
                <span className="badge bg-info-subtle text-info">
          Wi-Fi{suffix}
        </span>
            )}

            {hasAirConditioning && (
                <span className="badge bg-primary-subtle text-primary">
          Climatisation{suffix}
        </span>
            )}

            {hasUsbCharger && (
                <span className="badge bg-success-subtle text-success">
          USB{suffix}
        </span>
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

function getReservationBadgeClass(status) {
    if (status === "CONFIRMEE") {
        return "bg-success-subtle text-success";
    }

    if (status === "EN_ATTENTE") {
        return "bg-warning-subtle text-warning";
    }

    if (status === "REFUSEE") {
        return "bg-danger-subtle text-danger";
    }

    if (status === "ANNULEE") {
        return "bg-secondary-subtle text-secondary";
    }

    return "bg-primary-subtle text-primary";
}

function getDemandBadgeClass(status) {
    if (status === "ACCEPTED") {
        return "bg-success-subtle text-success";
    }

    if (status === "PENDING") {
        return "bg-warning-subtle text-warning";
    }

    if (status === "REJECTED") {
        return "bg-danger-subtle text-danger";
    }

    if (status === "CANCELLED") {
        return "bg-secondary-subtle text-secondary";
    }

    return "bg-primary-subtle text-primary";
}

function getOfferBadgeClass(status) {
    if (status === "OUVERTE") {
        return "bg-success-subtle text-success";
    }

    if (status === "COMPLETE") {
        return "bg-danger-subtle text-danger";
    }

    if (status === "FERMEE") {
        return "bg-secondary-subtle text-secondary";
    }

    return "bg-warning-subtle text-warning";
}