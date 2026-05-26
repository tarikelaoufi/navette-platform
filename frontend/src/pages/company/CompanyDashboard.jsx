import { useEffect, useState } from "react";
import {
    Bus,
    CalendarDays,
    Clock,
    MapPin,
    Plus,
    RefreshCw,
    Route,
    Users,
} from "lucide-react";
import api from "../../api/axios";

export default function CompanyDashboard() {
    const companyId = 1;

    const [shuttles, setShuttles] = useState([]);
    const [offers, setOffers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [demands, setDemands] = useState([]);
    const [cities, setCities] = useState([]);

    const [shuttleForm, setShuttleForm] = useState({
        name: "",
        type: "",
        capacity: "",
        description: "",
        hasWifi: false,
        hasAirConditioning: false,
        hasUsbCharger: false,
        allowsLuggage: false,
    });

    const [offerForm, setOfferForm] = useState({
        shuttleId: "",
        departureCityId: "",
        arrivalCityId: "",
        title: "",
        departureTime: "",
        arrivalTime: "",
        startDate: "",
        endDate: "",
        price: "",
        totalPlaces: "",
        description: "",
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [creatingShuttle, setCreatingShuttle] = useState(false);
    const [creatingOffer, setCreatingOffer] = useState(false);
    const [updatingReservationId, setUpdatingReservationId] = useState(null);
    const [updatingDemandId, setUpdatingDemandId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadDashboardData = async ({ showLoader = false } = {}) => {
        if (showLoader) {
            setRefreshing(true);
        }

        setError("");

        try {
            const [
                shuttlesResponse,
                offersResponse,
                reservationsResponse,
                demandsResponse,
                citiesResponse,
            ] = await Promise.all([
                api.get(`/api/company/shuttles?companyId=${companyId}`),
                api.get(`/api/company/offers?companyId=${companyId}`),
                api.get(`/api/company/reservations?companyId=${companyId}`),
                api.get("/api/company/regular-reservations"),
                api.get("/api/cities"),
            ]);

            setShuttles(shuttlesResponse.data);
            setOffers(offersResponse.data);
            setReservations(reservationsResponse.data);
            setDemands(demandsResponse.data);
            setCities(citiesResponse.data);
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
            api.get(`/api/company/reservations?companyId=${companyId}`),
            api.get("/api/company/regular-reservations"),
            api.get("/api/cities"),
        ])
            .then(
                ([
                     shuttlesResponse,
                     offersResponse,
                     reservationsResponse,
                     demandsResponse,
                     citiesResponse,
                 ]) => {
                    if (!isMounted) return;

                    setShuttles(shuttlesResponse.data);
                    setOffers(offersResponse.data);
                    setReservations(reservationsResponse.data);
                    setDemands(demandsResponse.data);
                    setCities(citiesResponse.data);
                }
            )
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

    const handleShuttleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setShuttleForm((previousForm) => ({
            ...previousForm,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleOfferChange = (event) => {
        const { name, value } = event.target;

        setOfferForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));
    };

    const handleCreateShuttle = async (event) => {
        event.preventDefault();

        setCreatingShuttle(true);
        setError("");
        setSuccess("");

        try {
            await api.post("/api/company/shuttles", {
                companyId,
                name: shuttleForm.name,
                type: shuttleForm.type,
                capacity: Number(shuttleForm.capacity),
                description: shuttleForm.description,
                hasWifi: shuttleForm.hasWifi,
                hasAirConditioning: shuttleForm.hasAirConditioning,
                hasUsbCharger: shuttleForm.hasUsbCharger,
                allowsLuggage: shuttleForm.allowsLuggage,
            });

            setSuccess("Navette créée avec succès.");

            setShuttleForm({
                name: "",
                type: "",
                capacity: "",
                description: "",
                hasWifi: false,
                hasAirConditioning: false,
                hasUsbCharger: false,
                allowsLuggage: false,
            });

            await loadDashboardData();
        } catch (error) {
            console.error("CREATE SHUTTLE ERROR:", error);
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Impossible de créer la navette."
            );
        } finally {
            setCreatingShuttle(false);
        }
    };

    const handleCreateOffer = async (event) => {
        event.preventDefault();

        if (offerForm.departureCityId === offerForm.arrivalCityId) {
            setError("La ville de départ et la ville d’arrivée doivent être différentes.");
            return;
        }

        setCreatingOffer(true);
        setError("");
        setSuccess("");

        try {
            await api.post("/api/company/offers", {
                companyId,
                shuttleId: Number(offerForm.shuttleId),
                departureCityId: Number(offerForm.departureCityId),
                arrivalCityId: Number(offerForm.arrivalCityId),
                title: offerForm.title,
                departureTime: offerForm.departureTime,
                arrivalTime: offerForm.arrivalTime,
                startDate: offerForm.startDate,
                endDate: offerForm.endDate,
                price: Number(offerForm.price),
                totalPlaces: Number(offerForm.totalPlaces),
                description: offerForm.description,
            });

            setSuccess("Offre créée avec succès.");

            setOfferForm({
                shuttleId: "",
                departureCityId: "",
                arrivalCityId: "",
                title: "",
                departureTime: "",
                arrivalTime: "",
                startDate: "",
                endDate: "",
                price: "",
                totalPlaces: "",
                description: "",
            });

            await loadDashboardData();
        } catch (error) {
            console.error("CREATE OFFER ERROR:", error);
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Impossible de créer l’offre."
            );
        } finally {
            setCreatingOffer(false);
        }
    };

    const handleUpdateReservationStatus = async (reservationId, status) => {
        setUpdatingReservationId(reservationId);
        setError("");
        setSuccess("");

        try {
            await api.put(`/api/company/reservations/${reservationId}/status?status=${status}`);

            if (status === "CONFIRMEE") {
                setSuccess("Réservation acceptée avec succès.");
            } else if (status === "REFUSEE") {
                setSuccess("Réservation refusée avec succès.");
            } else if (status === "ANNULEE") {
                setSuccess("Réservation annulée avec succès.");
            }

            await loadDashboardData();
        } catch (error) {
            console.error("UPDATE RESERVATION STATUS ERROR:", error);
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Impossible de modifier le statut de la réservation."
            );
        } finally {
            setUpdatingReservationId(null);
        }
    };

    const handleUpdateDemandStatus = async (demandId, status) => {
        setUpdatingDemandId(demandId);
        setError("");
        setSuccess("");

        try {
            await api.put(`/api/company/regular-reservations/${demandId}/status?status=${status}`);

            if (status === "ACCEPTED") {
                setSuccess("Demande de navette acceptée avec succès.");
            } else if (status === "REJECTED") {
                setSuccess("Demande de navette refusée avec succès.");
            }

            await loadDashboardData();
        } catch (error) {
            console.error("UPDATE DEMAND STATUS ERROR:", error);
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Impossible de modifier le statut de la demande."
            );
        } finally {
            setUpdatingDemandId(null);
        }
    };

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
                        Gérez vos navettes, vos offres, les réservations clients et les demandes de navette.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    onClick={() => loadDashboardData({ showLoader: true })}
                    disabled={refreshing}
                >
                    <RefreshCw size={18} />
                    {refreshing ? "Actualisation..." : "Actualiser"}
                </button>
            </div>

            {success && (
                <div className="alert alert-success" role="alert">
                    {success}
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row g-4 mb-4">
                <div className="col-md-3">
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

                <div className="col-md-3">
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

                <div className="col-md-3">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon bg-info-subtle text-info">
                            <CalendarDays size={24} />
                        </div>
                        <div>
                            <small>Réservations</small>
                            <strong>{reservations.length}</strong>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon bg-warning-subtle text-warning">
                            <Users size={24} />
                        </div>
                        <div>
                            <small>Demandes</small>
                            <strong>{demands.length}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Créer une navette</h4>
                    <span>
            <Plus size={16} />
          </span>
                </div>

                <form onSubmit={handleCreateShuttle}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Nom de la navette</label>
                            <input
                                name="name"
                                className="form-control"
                                placeholder="Navette Tanger Tétouan"
                                value={shuttleForm.name}
                                onChange={handleShuttleChange}
                                required
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Type</label>
                            <input
                                name="type"
                                className="form-control"
                                placeholder="Minibus"
                                value={shuttleForm.type}
                                onChange={handleShuttleChange}
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Capacité</label>
                            <input
                                type="number"
                                min="1"
                                name="capacity"
                                className="form-control"
                                placeholder="30"
                                value={shuttleForm.capacity}
                                onChange={handleShuttleChange}
                                required
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-control"
                                rows="2"
                                placeholder="Navette confortable avec climatisation..."
                                value={shuttleForm.description}
                                onChange={handleShuttleChange}
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label fw-semibold mb-3">
                                Options de la navette
                            </label>

                            <div className="row g-3">
                                <OptionCheckbox
                                    id="hasWifi"
                                    name="hasWifi"
                                    label="Wi-Fi"
                                    checked={shuttleForm.hasWifi}
                                    onChange={handleShuttleChange}
                                />

                                <OptionCheckbox
                                    id="hasAirConditioning"
                                    name="hasAirConditioning"
                                    label="Climatisation"
                                    checked={shuttleForm.hasAirConditioning}
                                    onChange={handleShuttleChange}
                                />

                                <OptionCheckbox
                                    id="hasUsbCharger"
                                    name="hasUsbCharger"
                                    label="Chargeur USB"
                                    checked={shuttleForm.hasUsbCharger}
                                    onChange={handleShuttleChange}
                                />

                                <OptionCheckbox
                                    id="allowsLuggage"
                                    name="allowsLuggage"
                                    label="Bagages"
                                    checked={shuttleForm.allowsLuggage}
                                    onChange={handleShuttleChange}
                                />
                            </div>
                        </div>

                        <div className="col-12">
                            <button className="btn btn-primary" disabled={creatingShuttle}>
                                {creatingShuttle ? "Création..." : "Créer la navette"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Créer une offre</h4>
                    <span>
            <Plus size={16} />
          </span>
                </div>

                {shuttles.length === 0 ? (
                    <EmptyBox message="Créez d’abord une navette avant de créer une offre." />
                ) : (
                    <form onSubmit={handleCreateOffer}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Titre</label>
                                <input
                                    name="title"
                                    className="form-control"
                                    placeholder="Abonnement Tanger - Tétouan Matin"
                                    value={offerForm.title}
                                    onChange={handleOfferChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Navette</label>
                                <select
                                    name="shuttleId"
                                    className="form-select"
                                    value={offerForm.shuttleId}
                                    onChange={handleOfferChange}
                                    required
                                >
                                    <option value="">Choisir une navette</option>
                                    {shuttles.map((shuttle) => (
                                        <option key={shuttle.id} value={shuttle.id}>
                                            {shuttle.name} - {shuttle.capacity} places
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Ville de départ</label>
                                <select
                                    name="departureCityId"
                                    className="form-select"
                                    value={offerForm.departureCityId}
                                    onChange={handleOfferChange}
                                    required
                                >
                                    <option value="">Choisir une ville</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Ville d’arrivée</label>
                                <select
                                    name="arrivalCityId"
                                    className="form-select"
                                    value={offerForm.arrivalCityId}
                                    onChange={handleOfferChange}
                                    required
                                >
                                    <option value="">Choisir une ville</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Heure départ</label>
                                <input
                                    type="time"
                                    name="departureTime"
                                    className="form-control"
                                    value={offerForm.departureTime}
                                    onChange={handleOfferChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Heure arrivée</label>
                                <input
                                    type="time"
                                    name="arrivalTime"
                                    className="form-control"
                                    value={offerForm.arrivalTime}
                                    onChange={handleOfferChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Date début</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    className="form-control"
                                    value={offerForm.startDate}
                                    onChange={handleOfferChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Date fin</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    className="form-control"
                                    value={offerForm.endDate}
                                    onChange={handleOfferChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Prix</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="price"
                                    className="form-control"
                                    placeholder="500"
                                    value={offerForm.price}
                                    onChange={handleOfferChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Nombre de places</label>
                                <input
                                    type="number"
                                    min="1"
                                    name="totalPlaces"
                                    className="form-control"
                                    placeholder="30"
                                    value={offerForm.totalPlaces}
                                    onChange={handleOfferChange}
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="2"
                                    placeholder="Abonnement mensuel pour trajet..."
                                    value={offerForm.description}
                                    onChange={handleOfferChange}
                                />
                            </div>

                            <div className="col-12">
                                <button className="btn btn-primary" disabled={creatingOffer}>
                                    {creatingOffer ? "Création..." : "Créer l’offre"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </section>

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <h4>Réservations des clients</h4>
                    <span>{reservations.length}</span>
                </div>

                {reservations.length === 0 ? (
                    <EmptyBox message="Aucune réservation client trouvée." />
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
                      <Users size={16} />
                      Client : {reservation.userFullName}
                    </span>

                                        <span>
                      <CalendarDays size={16} />
                      Date du trajet : {reservation.travelDate}
                    </span>

                                        <span>
                      <Clock size={16} />
                      Réservée le : {formatDateTime(reservation.reservationDate)}
                    </span>

                                        <span>
                      <Bus size={16} />
                      Montant : {reservation.amount} MAD
                    </span>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        {reservation.status === "EN_ATTENTE" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-success btn-sm"
                                                    disabled={updatingReservationId === reservation.id}
                                                    onClick={() =>
                                                        handleUpdateReservationStatus(
                                                            reservation.id,
                                                            "CONFIRMEE"
                                                        )
                                                    }
                                                >
                                                    Accepter
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    disabled={updatingReservationId === reservation.id}
                                                    onClick={() =>
                                                        handleUpdateReservationStatus(
                                                            reservation.id,
                                                            "REFUSEE"
                                                        )
                                                    }
                                                >
                                                    Refuser
                                                </button>
                                            </>
                                        )}

                                        {reservation.status === "CONFIRMEE" && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                disabled={updatingReservationId === reservation.id}
                                                onClick={() =>
                                                    handleUpdateReservationStatus(
                                                        reservation.id,
                                                        "ANNULEE"
                                                    )
                                                }
                                            >
                                                Annuler
                                            </button>
                                        )}

                                        {(reservation.status === "REFUSEE" ||
                                            reservation.status === "ANNULEE") && (
                                            <span className="text-muted small">
                        Aucune action disponible
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

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

                                        <OptionBadges
                                            hasWifi={shuttle.hasWifi}
                                            hasAirConditioning={shuttle.hasAirConditioning}
                                            hasUsbCharger={shuttle.hasUsbCharger}
                                            allowsLuggage={shuttle.allowsLuggage}
                                            emptyText="Aucune option"
                                        />
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
                                                {demand.departureCityName || demand.departureCity} →{" "}
                                                {demand.arrivalCityName || demand.arrivalCity}
                                            </h6>

                                            <p className="text-muted mb-2">
                                                Période : {demand.period}
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
                      Heure souhaitée : {demand.desiredTime}
                    </span>

                                        <span>
                      <Users size={16} />
                      Places souhaitées : {demand.seats || demand.interestedCount || 1}
                    </span>

                                        <span>
                      <CalendarDays size={16} />
                                            {demand.startDate && demand.endDate
                                                ? `${demand.startDate} / ${demand.endDate}`
                                                : `Créée le : ${formatDateTime(demand.createdAt)}`}
                    </span>

                                        {demand.notes && (
                                            <span>
                        <MapPin size={16} />
                                                {demand.notes}
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

                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        {demand.status === "PENDING" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-success btn-sm"
                                                    disabled={updatingDemandId === demand.id}
                                                    onClick={() =>
                                                        handleUpdateDemandStatus(demand.id, "ACCEPTED")
                                                    }
                                                >
                                                    Accepter
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    disabled={updatingDemandId === demand.id}
                                                    onClick={() =>
                                                        handleUpdateDemandStatus(demand.id, "REJECTED")
                                                    }
                                                >
                                                    Refuser
                                                </button>
                                            </>
                                        )}

                                        {demand.status !== "PENDING" && (
                                            <span className="text-muted small">
                        Aucune action disponible
                      </span>
                                        )}
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

function OptionCheckbox({ id, name, label, checked, onChange }) {
    return (
        <div className="col-md-3">
            <div className="form-check border rounded p-3">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id={id}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                />

                <label className="form-check-label ms-2" htmlFor={id}>
                    {label}
                </label>
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