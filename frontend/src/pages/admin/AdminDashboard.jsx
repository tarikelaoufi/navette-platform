import { useEffect, useState } from "react";
import {
    Building2,
    Bus,
    CalendarCheck,
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
                api.get("/api/admin/demands"),
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
            api.get("/api/admin/demands"),
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
                        demandes.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
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
                    value={stats?.totalUsers || 0}
                    icon={<Users size={24} />}
                    colorClass="bg-primary-subtle text-primary"
                />

                <StatCard
                    title="Sociétés"
                    value={stats?.totalCompanies || 0}
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
                    value={stats?.totalOffers || 0}
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
                    value={stats?.totalReservations || 0}
                    icon={<CalendarCheck size={24} />}
                    colorClass="bg-danger-subtle text-danger"
                />

                <StatCard
                    title="Demandes"
                    value={stats?.totalDemands || 0}
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

                                        <span className="badge bg-warning-subtle text-warning align-self-start">
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
                                                    `ID ${reservation.user?.id || reservation.userId || "-"}`}
                                            </p>
                                        </div>

                                        <span className="badge bg-primary-subtle text-primary align-self-start">
                      {reservation.status}
                    </span>
                                    </div>

                                    <div className="mini-info">
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
                    <h4>Demandes</h4>
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
                                                {demand.departureCity?.name ||
                                                    demand.departureCityName ||
                                                    "-"}{" "}
                                                →{" "}
                                                {demand.arrivalCity?.name ||
                                                    demand.arrivalCityName ||
                                                    "-"}
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
                                        <span>Heure souhaitée : {demand.desiredTime}</span>
                                        <span>Intéressés : {demand.interestedCount}</span>
                                        <span>Créée le : {formatDateTime(demand.createdAt)}</span>
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