import { useEffect, useMemo, useState } from "react";
import {
    Ban,
    Building2,
    Bus,
    CalendarDays,
    CheckCircle2,
    Clock,
    Mail,
    MapPin,
    MessageSquareText,
    Phone,
    RefreshCw,
    Route,
    ShieldCheck,
    Ticket,
    UserCheck,
    UserRound,
    Users,
    WalletCards,
    XCircle,
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
    const [companyActionId, setCompanyActionId] = useState(null);
    const [userActionId, setUserActionId] = useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const pendingCompanies = useMemo(
        () =>
            companies.filter(
                (company) => company.status === "EN_ATTENTE"
            ),
        [companies]
    );

    const otherCompanies = useMemo(
        () =>
            companies.filter(
                (company) => company.status !== "EN_ATTENTE"
            ),
        [companies]
    );

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

            setUsers(
                Array.isArray(usersResponse.data)
                    ? usersResponse.data
                    : []
            );

            setCompanies(
                Array.isArray(companiesResponse.data)
                    ? companiesResponse.data
                    : []
            );

            setOffers(
                Array.isArray(offersResponse.data)
                    ? offersResponse.data
                    : []
            );

            setReservations(
                Array.isArray(reservationsResponse.data)
                    ? reservationsResponse.data
                    : []
            );

            setDemands(
                Array.isArray(demandsResponse.data)
                    ? demandsResponse.data
                    : []
            );
        } catch (requestError) {
            console.error(
                "ADMIN DASHBOARD ERROR:",
                requestError
            );

            setError(
                getApiErrorMessage(
                    requestError,
                    "Impossible de charger les données administrateur."
                )
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadAdminData();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    async function handleValidateCompany(companyId) {
        await performCompanyAction({
            companyId,
            endpoint: `/api/admin/companies/${companyId}/validate`,
            successText:
                "La société a été validée avec succès.",
        });
    }

    async function handleRejectCompany(companyId) {
        await performCompanyAction({
            companyId,
            endpoint: `/api/admin/companies/${companyId}/reject`,
            successText:
                "La demande de partenariat a été refusée.",
        });
    }

    async function handleBlockCompany(companyId) {
        await performCompanyAction({
            companyId,
            endpoint: `/api/admin/companies/${companyId}/block`,
            successText:
                "La société et son compte utilisateur ont été bloqués.",
        });
    }

    async function handleReactivateCompany(companyId) {
        await performCompanyAction({
            companyId,
            endpoint: `/api/admin/companies/${companyId}/validate`,
            successText:
                "La société et son compte utilisateur ont été réactivés.",
        });
    }

    async function performCompanyAction({
                                            companyId,
                                            endpoint,
                                            successText,
                                        }) {
        if (companyActionId !== null) {
            return;
        }

        setCompanyActionId(companyId);
        setError("");
        setSuccessMessage("");

        try {
            await api.put(endpoint);

            setSuccessMessage(successText);

            await loadAdminData();
        } catch (requestError) {
            console.error(
                "COMPANY STATUS ERROR:",
                requestError
            );

            setError(
                getApiErrorMessage(
                    requestError,
                    "Impossible de modifier le statut de cette société."
                )
            );
        } finally {
            setCompanyActionId(null);
        }
    }

    async function handleUpdateUserStatus(
        userId,
        status
    ) {
        if (userActionId !== null) {
            return;
        }

        setUserActionId(userId);
        setError("");
        setSuccessMessage("");

        try {
            await api.put(
                `/api/admin/users/${userId}/status`,
                {
                    status,
                }
            );

            setSuccessMessage(
                status === "BLOQUE"
                    ? "L’utilisateur a été bloqué avec succès."
                    : "L’utilisateur a été réactivé avec succès."
            );

            await loadAdminData();
        } catch (requestError) {
            console.error(
                "USER STATUS ERROR:",
                requestError
            );

            setError(
                getApiErrorMessage(
                    requestError,
                    "Impossible de modifier le statut de cet utilisateur."
                )
            );
        } finally {
            setUserActionId(null);
        }
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <div
                    className="spinner-border text-primary"
                    role="status"
                />

                <p className="text-muted mt-3">
                    Chargement de l’espace administrateur...
                </p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-page-header">
                <div>
                    <h1 className="fw-bold mb-1">
                        Tableau de bord administrateur
                    </h1>

                    <p className="text-muted mb-0">
                        Gérez les utilisateurs, les sociétés, les offres,
                        les billets et les demandes de navette.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    onClick={() =>
                        loadAdminData({ showLoader: true })
                    }
                    disabled={refreshing}
                >
                    <RefreshCw
                        size={18}
                        className={refreshing ? "spin" : ""}
                    />

                    {refreshing
                        ? "Actualisation..."
                        : "Actualiser"}
                </button>
            </div>

            {successMessage && (
                <div
                    className="alert alert-success"
                    role="alert"
                >
                    {successMessage}
                </div>
            )}

            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <div className="row g-4 mb-4">
                <StatCard
                    title="Utilisateurs"
                    value={stats?.totalUsers ?? users.length}
                    icon={<Users size={24} />}
                    colorClass="bg-primary-subtle text-primary"
                />

                <StatCard
                    title="Sociétés"
                    value={
                        stats?.totalCompanies ??
                        companies.length
                    }
                    icon={<Building2 size={24} />}
                    colorClass="bg-success-subtle text-success"
                />

                <StatCard
                    title="Demandes partenaires"
                    value={pendingCompanies.length}
                    icon={<Clock size={24} />}
                    colorClass="bg-warning-subtle text-warning"
                />

                <StatCard
                    title="Navettes"
                    value={stats?.totalShuttles ?? 0}
                    icon={<Bus size={24} />}
                    colorClass="bg-info-subtle text-info"
                />

                <StatCard
                    title="Offres"
                    value={
                        stats?.totalOffers ??
                        offers.length
                    }
                    icon={<Route size={24} />}
                    colorClass="bg-warning-subtle text-warning"
                />

                <StatCard
                    title="Billets simples"
                    value={
                        stats?.totalReservations ??
                        reservations.length
                    }
                    icon={<Ticket size={24} />}
                    colorClass="bg-danger-subtle text-danger"
                />

                <StatCard
                    title="Abonnements"
                    value={stats?.totalSubscriptions ?? 0}
                    icon={<WalletCards size={24} />}
                    colorClass="bg-secondary-subtle text-secondary"
                />

                <StatCard
                    title="Demandes de navette"
                    value={
                        stats?.totalDemands ??
                        demands.length
                    }
                    icon={<MessageSquareText size={24} />}
                    colorClass="bg-dark-subtle text-dark"
                />
            </div>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <div>
                        <h4 className="mb-1">
                            Demandes de partenariat
                        </h4>

                        <p className="text-muted mb-0">
                            Sociétés en attente de validation.
                        </p>
                    </div>

                    <span>{pendingCompanies.length}</span>
                </div>

                {pendingCompanies.length === 0 ? (
                    <EmptyBox message="Aucune demande de partenariat en attente." />
                ) : (
                    <div className="row g-3">
                        {pendingCompanies.map((company) => {
                            const actionLoading =
                                companyActionId === company.id;

                            return (
                                <div
                                    className="col-xl-6"
                                    key={company.id}
                                >
                                    <div className="mini-card border-warning">
                                        <div className="d-flex justify-content-between gap-3 mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="stat-icon bg-warning-subtle text-warning">
                                                    <Building2 size={22} />
                                                </div>

                                                <div>
                                                    <h6 className="fw-bold mb-1">
                                                        {company.companyName}
                                                    </h6>

                                                    <span className="badge bg-warning-subtle text-warning">
                                                        EN_ATTENTE
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mini-info">
                                            <span>
                                                <UserRound size={16} />
                                                Responsable :{" "}
                                                {getCompanyManagerName(
                                                    company
                                                )}
                                            </span>

                                            <span>
                                                <Mail size={16} />
                                                Email :{" "}
                                                {company.professionalEmail ||
                                                    company.user?.email ||
                                                    company.userEmail ||
                                                    "-"}
                                            </span>

                                            <span>
                                                <Phone size={16} />
                                                Téléphone :{" "}
                                                {company.phone ||
                                                    company.companyPhone ||
                                                    "-"}
                                            </span>

                                            <span>
                                                <MapPin size={16} />
                                                Adresse :{" "}
                                                {company.address || "-"}
                                            </span>

                                            <span>
                                                <CalendarDays size={16} />
                                                Demande envoyée :{" "}
                                                {formatDateTime(
                                                    company.createdAt
                                                )}
                                            </span>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
                                            <button
                                                type="button"
                                                className="btn btn-success d-flex align-items-center gap-2"
                                                disabled={actionLoading}
                                                onClick={() =>
                                                    handleValidateCompany(
                                                        company.id
                                                    )
                                                }
                                            >
                                                {actionLoading ? (
                                                    <span className="spinner-border spinner-border-sm" />
                                                ) : (
                                                    <CheckCircle2 size={17} />
                                                )}

                                                Valider
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-outline-danger d-flex align-items-center gap-2"
                                                disabled={actionLoading}
                                                onClick={() =>
                                                    handleRejectCompany(
                                                        company.id
                                                    )
                                                }
                                            >
                                                <XCircle size={17} />
                                                Refuser
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <div>
                        <h4 className="mb-1">
                            Utilisateurs
                        </h4>

                        <p className="text-muted mb-0">
                            Bloquez ou réactivez les comptes utilisateurs.
                        </p>
                    </div>

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
                                <th>Rôle</th>
                                <th>Téléphone</th>
                                <th>Statut compte</th>
                                <th>Statut société</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {users.map((user) => {
                                const actionLoading =
                                    userActionId === user.id;

                                const isAdmin =
                                    user.role === "ROLE_ADMIN";

                                return (
                                    <tr key={user.id}>
                                        <td>#{user.id}</td>

                                        <td>
                                            {user.firstName}{" "}
                                            {user.lastName}
                                        </td>

                                        <td>{user.email}</td>

                                        <td>
                                                <span className="badge bg-light text-dark border">
                                                    {getRoleLabel(
                                                        user.role
                                                    )}
                                                </span>
                                        </td>

                                        <td>
                                            {user.phone || "-"}
                                        </td>

                                        <td>
                                                <span
                                                    className={`badge ${getUserBadgeClass(
                                                        user.status
                                                    )}`}
                                                >
                                                    {user.status}
                                                </span>
                                        </td>

                                        <td>
                                            {user.companyStatus ? (
                                                <span
                                                    className={`badge ${getCompanyBadgeClass(
                                                        user.companyStatus
                                                    )}`}
                                                >
                                                        {
                                                            user.companyStatus
                                                        }
                                                    </span>
                                            ) : (
                                                <span className="text-muted">
                                                        —
                                                    </span>
                                            )}
                                        </td>

                                        <td>
                                            {isAdmin ? (
                                                <span className="text-muted small d-inline-flex align-items-center gap-1">
                                                        <ShieldCheck
                                                            size={15}
                                                        />
                                                        Protégé
                                                    </span>
                                            ) : user.status ===
                                            "BLOQUE" ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-2"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handleUpdateUserStatus(
                                                            user.id,
                                                            "ACTIF"
                                                        )
                                                    }
                                                >
                                                    {actionLoading ? (
                                                        <span className="spinner-border spinner-border-sm" />
                                                    ) : (
                                                        <UserCheck
                                                            size={16}
                                                        />
                                                    )}
                                                    Réactiver
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handleUpdateUserStatus(
                                                            user.id,
                                                            "BLOQUE"
                                                        )
                                                    }
                                                >
                                                    {actionLoading ? (
                                                        <span className="spinner-border spinner-border-sm" />
                                                    ) : (
                                                        <Ban
                                                            size={16}
                                                        />
                                                    )}
                                                    Bloquer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Sociétés de transport</h4>
                    <span>{otherCompanies.length}</span>
                </div>

                {otherCompanies.length === 0 ? (
                    <EmptyBox message="Aucune société validée, refusée ou bloquée." />
                ) : (
                    <div className="row g-3">
                        {otherCompanies.map((company) => {
                            const actionLoading =
                                companyActionId === company.id;

                            return (
                                <div
                                    className="col-lg-6"
                                    key={company.id}
                                >
                                    <div className="mini-card">
                                        <div className="d-flex justify-content-between gap-3">
                                            <div>
                                                <h6 className="fw-bold mb-1">
                                                    {company.companyName}
                                                </h6>

                                                <p className="text-muted mb-2">
                                                    {company.professionalEmail}
                                                </p>
                                            </div>

                                            <span
                                                className={`badge align-self-start ${getCompanyBadgeClass(
                                                    company.status
                                                )}`}
                                            >
                                                {company.status}
                                            </span>
                                        </div>

                                        <div className="mini-info">
                                            <span>
                                                Responsable :{" "}
                                                {getCompanyManagerName(
                                                    company
                                                )}
                                            </span>

                                            <span>
                                                Téléphone :{" "}
                                                {company.phone ||
                                                    company.companyPhone ||
                                                    "-"}
                                            </span>

                                            <span>
                                                Adresse :{" "}
                                                {company.address || "-"}
                                            </span>

                                            <span>
                                                Utilisateur :{" "}
                                                {company.user?.email ||
                                                    company.userEmail ||
                                                    "-"}
                                            </span>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
                                            {company.status ===
                                                "VALIDEE" && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
                                                        disabled={
                                                            actionLoading
                                                        }
                                                        onClick={() =>
                                                            handleBlockCompany(
                                                                company.id
                                                            )
                                                        }
                                                    >
                                                        {actionLoading ? (
                                                            <span className="spinner-border spinner-border-sm" />
                                                        ) : (
                                                            <Ban size={16} />
                                                        )}

                                                        Bloquer
                                                    </button>
                                                )}

                                            {(company.status ===
                                                "BLOQUEE" ||
                                                company.status ===
                                                "REFUSEE") && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handleReactivateCompany(
                                                            company.id
                                                        )
                                                    }
                                                >
                                                    {actionLoading ? (
                                                        <span className="spinner-border spinner-border-sm" />
                                                    ) : (
                                                        <UserCheck
                                                            size={16}
                                                        />
                                                    )}

                                                    Réactiver
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Offres de navette</h4>
                    <span>{offers.length}</span>
                </div>

                {offers.length === 0 ? (
                    <EmptyBox message="Aucune offre trouvée." />
                ) : (
                    <div className="row g-3">
                        {offers.map((offer) => (
                            <div
                                className="col-lg-6"
                                key={offer.id}
                            >
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                {offer.title}
                                            </h6>

                                            <p className="text-muted mb-2">
                                                {offer.departureCity
                                                        ?.name ||
                                                    offer.departureCityName ||
                                                    "-"}{" "}
                                                →{" "}
                                                {offer.arrivalCity
                                                        ?.name ||
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
                                            {offer.company
                                                    ?.companyName ||
                                                offer.companyName ||
                                                "-"}
                                        </span>

                                        <span>
                                            Navette :{" "}
                                            {offer.shuttle?.name ||
                                                offer.shuttleName ||
                                                "-"}
                                        </span>

                                        <span>
                                            Horaire :{" "}
                                            {offer.departureTime ||
                                                "-"}{" "}
                                            →{" "}
                                            {offer.arrivalTime ||
                                                "-"}
                                        </span>

                                        <span>
                                            Période :{" "}
                                            {offer.startDate || "-"} /{" "}
                                            {offer.endDate || "-"}
                                        </span>

                                        <span>
                                            <Ticket size={16} />
                                            Billet simple :{" "}
                                            {formatPrice(
                                                offer.ticketPrice
                                            )}{" "}
                                            MAD
                                        </span>

                                        <span>
                                            <WalletCards size={16} />
                                            Abonnement :{" "}
                                            {formatPrice(
                                                offer.price
                                            )}{" "}
                                            MAD
                                        </span>

                                        <span>
                                            Places :{" "}
                                            {offer.availablePlaces} /{" "}
                                            {offer.totalPlaces}
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
                    <h4>
                        Billets simples des utilisateurs
                    </h4>

                    <span>{reservations.length}</span>
                </div>

                {reservations.length === 0 ? (
                    <EmptyBox message="Aucun billet simple trouvé." />
                ) : (
                    <div className="row g-3">
                        {reservations.map((reservation) => (
                            <div
                                className="col-lg-6"
                                key={reservation.id}
                            >
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                                            <span className="badge bg-primary-subtle text-primary mb-2">
                                                Billet simple
                                            </span>

                                            <h6 className="fw-bold mb-1">
                                                {reservation.offer
                                                        ?.title ||
                                                    reservation.offerTitle ||
                                                    `Billet #${reservation.id}`}
                                            </h6>

                                            <p className="text-muted mb-2">
                                                Utilisateur :{" "}
                                                {reservation.user
                                                        ?.email ||
                                                    reservation.userEmail ||
                                                    `ID ${
                                                        reservation.user
                                                            ?.id ||
                                                        reservation.userId ||
                                                        "-"
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
                                                reservation.user
                                                    ?.firstName ||
                                                "-"}
                                        </span>

                                        <span>
                                            Trajet :{" "}
                                            {reservation.departureCityName ||
                                                "-"}{" "}
                                            →{" "}
                                            {reservation.arrivalCityName ||
                                                "-"}
                                        </span>

                                        <span>
                                            Horaire :{" "}
                                            {reservation.departureTime ||
                                                "-"}{" "}
                                            →{" "}
                                            {reservation.arrivalTime ||
                                                "-"}
                                        </span>

                                        <span>
                                            Date trajet :{" "}
                                            {reservation.travelDate ||
                                                "-"}
                                        </span>

                                        <span>
                                            Date demande :{" "}
                                            {formatDateTime(
                                                reservation.reservationDate
                                            )}
                                        </span>

                                        <span>
                                            Société :{" "}
                                            {reservation.companyName ||
                                                "-"}
                                        </span>

                                        <span>
                                            Navette :{" "}
                                            {reservation.shuttleName ||
                                                "-"}
                                        </span>

                                        <span>
                                            <Ticket size={16} />
                                            Prix billet :{" "}
                                            {formatPrice(
                                                reservation.amount
                                            )}{" "}
                                            MAD
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
                    <h4>
                        Demandes de navette des utilisateurs
                    </h4>

                    <span>{demands.length}</span>
                </div>

                {demands.length === 0 ? (
                    <EmptyBox message="Aucune demande de navette trouvée." />
                ) : (
                    <div className="row g-3">
                        {demands.map((demand) => (
                            <div
                                className="col-lg-6"
                                key={demand.id}
                            >
                                <div className="mini-card">
                                    <div className="d-flex justify-content-between gap-3">
                                        <div>
                                            <span className="badge bg-warning-subtle text-warning mb-2">
                                                Demande de navette
                                            </span>

                                            <h6 className="fw-bold mb-1">
                                                {demand.departureCity
                                                        ?.name ||
                                                    demand.departureCityName ||
                                                    demand.departureCity ||
                                                    "-"}{" "}
                                                →{" "}
                                                {demand.arrivalCity
                                                        ?.name ||
                                                    demand.arrivalCityName ||
                                                    demand.arrivalCity ||
                                                    "-"}
                                            </h6>

                                            <p className="text-muted mb-2">
                                                Utilisateur :{" "}
                                                {demand.userFullName ||
                                                    demand.userEmail ||
                                                    `ID ${
                                                        demand.userId ||
                                                        "-"
                                                    }`}
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
                                            Heure souhaitée :{" "}
                                            {demand.desiredTime ||
                                                "-"}
                                        </span>

                                        <span>
                                            <Users size={16} />
                                            Places souhaitées :{" "}
                                            {demand.seats || 1}
                                        </span>

                                        <span>
                                            <CalendarDays
                                                size={16}
                                            />
                                            Période :{" "}
                                            {demand.period || "-"}
                                        </span>

                                        <span>
                                            <CalendarDays
                                                size={16}
                                            />
                                            Dates :{" "}
                                            {demand.startDate ||
                                                "-"}{" "}
                                            /{" "}
                                            {demand.endDate ||
                                                "-"}
                                        </span>

                                        {demand.notes && (
                                            <span>
                                                <MapPin size={16} />
                                                Note :{" "}
                                                {demand.notes}
                                            </span>
                                        )}

                                        <OptionBadges
                                            hasWifi={
                                                demand.hasWifi
                                            }
                                            hasAirConditioning={
                                                demand.hasAirConditioning
                                            }
                                            hasUsbCharger={
                                                demand.hasUsbCharger
                                            }
                                            allowsLuggage={
                                                demand.allowsLuggage
                                            }
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

function StatCard({
                      title,
                      value,
                      icon,
                      colorClass,
                  }) {
    return (
        <div className="col-md-6 col-xl-4">
            <div className="dashboard-stat-card">
                <div className={`stat-icon ${colorClass}`}>
                    {icon}
                </div>

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
        hasWifi ||
        hasAirConditioning ||
        hasUsbCharger ||
        allowsLuggage;

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

function getCompanyManagerName(company) {
    if (company.userFullName) {
        return company.userFullName;
    }

    if (company.user) {
        const fullName = [
            company.user.firstName,
            company.user.lastName,
        ]
            .filter(Boolean)
            .join(" ");

        if (fullName) {
            return fullName;
        }
    }

    return "-";
}

function getRoleLabel(role) {
    if (role === "ROLE_ADMIN") {
        return "Administrateur";
    }

    if (role === "ROLE_COMPANY") {
        return "Société";
    }

    if (role === "ROLE_USER") {
        return "Utilisateur";
    }

    return role || "-";
}

function formatDateTime(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function formatPrice(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    return Number(value).toFixed(2);
}

function getApiErrorMessage(
    requestError,
    fallbackMessage
) {
    const responseData =
        requestError?.response?.data;

    if (typeof responseData === "string") {
        return responseData;
    }

    return (
        responseData?.message ||
        responseData?.error ||
        requestError?.message ||
        fallbackMessage
    );
}

function getUserBadgeClass(status) {
    if (status === "ACTIF") {
        return "bg-success-subtle text-success";
    }

    if (status === "EN_ATTENTE") {
        return "bg-warning-subtle text-warning";
    }

    if (status === "BLOQUE") {
        return "bg-danger-subtle text-danger";
    }

    return "bg-secondary-subtle text-secondary";
}

function getCompanyBadgeClass(status) {
    if (status === "VALIDEE") {
        return "bg-success-subtle text-success";
    }

    if (status === "EN_ATTENTE") {
        return "bg-warning-subtle text-warning";
    }

    if (status === "REFUSEE") {
        return "bg-danger-subtle text-danger";
    }

    if (status === "BLOQUEE") {
        return "bg-dark-subtle text-dark";
    }

    return "bg-secondary-subtle text-secondary";
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
        return "bg-primary-subtle text-primary";
    }

    if (status === "ANNULEE") {
        return "bg-danger-subtle text-danger";
    }

    if (
        status === "EXPIREE" ||
        status === "FERMEE"
    ) {
        return "bg-secondary-subtle text-secondary";
    }

    return "bg-warning-subtle text-warning";
}
