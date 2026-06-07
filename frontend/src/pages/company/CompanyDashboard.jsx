import { useEffect, useState } from "react";
import {
    Bus,
    CalendarDays,
    Clock,
    MapPin,
    Plus,
    Route,
    Ticket,
    Users,
    WalletCards,
    Building2,
} from "lucide-react";
import api from "../../api/axios";

export default function CompanyDashboard() {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role") || "ROLE_COMPANY";

    const [company, setCompany] = useState(null);

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
        departureCityName: "",
        arrivalCityId: "",
        arrivalCityName: "",
        title: "",
        departureTime: "",
        arrivalTime: "",
        startDate: "",
        endDate: "",
        price: "",
        ticketPrice: "",
        totalPlaces: "",
        description: "",
    });

    const [loading, setLoading] = useState(true);
    const [creatingShuttle, setCreatingShuttle] = useState(false);
    const [creatingOffer, setCreatingOffer] = useState(false);
    const [updatingReservationId, setUpdatingReservationId] = useState(null);
    const [updatingDemandId, setUpdatingDemandId] = useState(null);

    const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
    const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadDashboardData = async () => {
        setError("");

        if (!userId) {
            setError("Utilisateur introuvable. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }

        try {
            const companyResponse = await api.get(`/api/company/me?userId=${userId}`);
            const currentCompany = companyResponse.data;

            setCompany(currentCompany);
            localStorage.setItem("companyId", String(currentCompany.id));

            const companyId = currentCompany.id;

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
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Impossible de charger les données de votre espace société."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadDashboardData();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const getCompanyId = () => {
        if (!company?.id) {
            throw new Error("Société introuvable. Veuillez recharger la page.");
        }

        return company.id;
    };

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

    const getCitySuggestions = (value) => {
        const normalizedValue = normalizeText(value);

        if (!normalizedValue) {
            return cities.slice(0, 6);
        }

        return cities
            .filter((city) => normalizeText(city.name).includes(normalizedValue))
            .slice(0, 6);
    };

    const handleOfferCityTyping = (field, value) => {
        setOfferForm((previousForm) => ({
            ...previousForm,
            [`${field}CityName`]: value,
            [`${field}CityId`]: "",
        }));

        setError("");
        setSuccess("");

        if (field === "departure") {
            setShowDepartureSuggestions(true);
        }

        if (field === "arrival") {
            setShowArrivalSuggestions(true);
        }
    };

    const handleSelectOfferCity = (field, city) => {
        setOfferForm((previousForm) => ({
            ...previousForm,
            [`${field}CityName`]: city.name,
            [`${field}CityId`]: city.id,
        }));

        if (field === "departure") {
            setShowDepartureSuggestions(false);
        }

        if (field === "arrival") {
            setShowArrivalSuggestions(false);
        }
    };

    const handleCreateShuttle = async (event) => {
        event.preventDefault();

        setCreatingShuttle(true);
        setError("");
        setSuccess("");

        try {
            const companyId = getCompanyId();

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
                error.message ||
                "Impossible de créer la navette."
            );
        } finally {
            setCreatingShuttle(false);
        }
    };

    const handleCreateOffer = async (event) => {
        event.preventDefault();

        if (!offerForm.departureCityId) {
            setError("Veuillez choisir une ville de départ depuis les suggestions.");
            return;
        }

        if (!offerForm.arrivalCityId) {
            setError("Veuillez choisir une ville d’arrivée depuis les suggestions.");
            return;
        }

        if (Number(offerForm.departureCityId) === Number(offerForm.arrivalCityId)) {
            setError("La ville de départ et la ville d’arrivée doivent être différentes.");
            return;
        }

        setCreatingOffer(true);
        setError("");
        setSuccess("");

        try {
            const companyId = getCompanyId();

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
                ticketPrice: Number(offerForm.ticketPrice),
                totalPlaces: Number(offerForm.totalPlaces),
                description: offerForm.description,
            });

            setSuccess("Offre créée avec succès.");

            setOfferForm({
                shuttleId: "",
                departureCityId: "",
                departureCityName: "",
                arrivalCityId: "",
                arrivalCityName: "",
                title: "",
                departureTime: "",
                arrivalTime: "",
                startDate: "",
                endDate: "",
                price: "",
                ticketPrice: "",
                totalPlaces: "",
                description: "",
            });

            await loadDashboardData();
        } catch (error) {
            console.error("CREATE OFFER ERROR:", error);
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
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
                setSuccess("Billet simple accepté avec succès.");
            } else if (status === "REFUSEE") {
                setSuccess("Billet simple refusé avec succès.");
            } else if (status === "ANNULEE") {
                setSuccess("Billet simple annulé avec succès.");
            }

            await loadDashboardData();
        } catch (error) {
            console.error("UPDATE RESERVATION STATUS ERROR:", error);
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Impossible de modifier le statut du billet simple."
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

    if (!company && error) {
        return (
            <div className="dashboard-page">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-page-header">
                <div>
                    <h1 className="fw-bold mb-1">Tableau de bord société</h1>
                    <p className="text-muted mb-0">
                        {company?.companyName
                            ? `Espace de ${company.companyName}`
                            : "Gérez vos navettes, offres, billets simples et demandes de navette."}
                    </p>

                    {company && (
                        <small className="text-muted">
                            ID société : #{company.id} · Statut : {company.status}
                        </small>
                    )}
                </div>

                <div className="dashboard-page-role">
                    <Building2 size={18} />
                    {role}
                </div>
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
                <StatCard
                    title="Navettes"
                    value={shuttles.length}
                    icon={<Bus size={24} />}
                    colorClass="bg-primary-subtle text-primary"
                />

                <StatCard
                    title="Offres"
                    value={offers.length}
                    icon={<Route size={24} />}
                    colorClass="bg-success-subtle text-success"
                />

                <StatCard
                    title="Billets simples"
                    value={reservations.length}
                    icon={<Ticket size={24} />}
                    colorClass="bg-info-subtle text-info"
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

                                <div className="autocomplete-wrapper">
                                    <div className="input-icon-box">
                                        <MapPin size={18} />
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Exemple : Tanger"
                                            value={offerForm.departureCityName}
                                            onChange={(event) => {
                                                handleOfferCityTyping("departure", event.target.value);
                                            }}
                                            onFocus={() => setShowDepartureSuggestions(true)}
                                            onBlur={() => {
                                                setTimeout(() => setShowDepartureSuggestions(false), 150);
                                            }}
                                            required
                                        />
                                    </div>

                                    {showDepartureSuggestions && (
                                        <div className="autocomplete-menu">
                                            {getCitySuggestions(offerForm.departureCityName).length === 0 ? (
                                                <button
                                                    type="button"
                                                    className="autocomplete-item disabled"
                                                >
                                                    Aucune ville trouvée
                                                </button>
                                            ) : (
                                                getCitySuggestions(offerForm.departureCityName).map(
                                                    (city) => (
                                                        <button
                                                            type="button"
                                                            key={city.id}
                                                            className="autocomplete-item"
                                                            onMouseDown={() => {
                                                                handleSelectOfferCity("departure", city);
                                                            }}
                                                        >
                                                            {city.name}
                                                            <small>{city.country || "Ville"}</small>
                                                        </button>
                                                    )
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Ville d’arrivée</label>

                                <div className="autocomplete-wrapper">
                                    <div className="input-icon-box">
                                        <MapPin size={18} />
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Exemple : Tétouan"
                                            value={offerForm.arrivalCityName}
                                            onChange={(event) => {
                                                handleOfferCityTyping("arrival", event.target.value);
                                            }}
                                            onFocus={() => setShowArrivalSuggestions(true)}
                                            onBlur={() => {
                                                setTimeout(() => setShowArrivalSuggestions(false), 150);
                                            }}
                                            required
                                        />
                                    </div>

                                    {showArrivalSuggestions && (
                                        <div className="autocomplete-menu">
                                            {getCitySuggestions(offerForm.arrivalCityName).length === 0 ? (
                                                <button
                                                    type="button"
                                                    className="autocomplete-item disabled"
                                                >
                                                    Aucune ville trouvée
                                                </button>
                                            ) : (
                                                getCitySuggestions(offerForm.arrivalCityName).map(
                                                    (city) => (
                                                        <button
                                                            type="button"
                                                            key={city.id}
                                                            className="autocomplete-item"
                                                            onMouseDown={() => {
                                                                handleSelectOfferCity("arrival", city);
                                                            }}
                                                        >
                                                            {city.name}
                                                            <small>{city.country || "Ville"}</small>
                                                        </button>
                                                    )
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
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

                            <div className="col-md-4">
                                <label className="form-label">Prix abonnement</label>
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

                            <div className="col-md-4">
                                <label className="form-label">Prix billet simple</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="ticketPrice"
                                    className="form-control"
                                    placeholder="25"
                                    value={offerForm.ticketPrice}
                                    onChange={handleOfferChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
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
                    <h4>Demandes de billets simples</h4>
                    <span>{reservations.length}</span>
                </div>

                {reservations.length === 0 ? (
                    <EmptyBox message="Aucune demande de billet simple trouvée." />
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

                                            <h6 className="fw-bold mb-1">{reservation.offerTitle}</h6>

                                            <p className="text-muted mb-2">
                                                {reservation.departureCityName} →{" "}
                                                {reservation.arrivalCityName}
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
                                            Demandé le : {formatDateTime(reservation.reservationDate)}
                                        </span>

                                        <span>
                                            <Ticket size={16} />
                                            Prix billet : {formatPrice(reservation.amount)} MAD
                                        </span>
                                    </div>

                                    <ReservationActions
                                        reservation={reservation}
                                        updatingReservationId={updatingReservationId}
                                        onUpdate={handleUpdateReservationStatus}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="dashboard-section mb-4">
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
                                            Places souhaitées :{" "}
                                            {demand.seats || demand.interestedCount || 1}
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

                                    <DemandActions
                                        demand={demand}
                                        updatingDemandId={updatingDemandId}
                                        onUpdate={handleUpdateDemandStatus}
                                    />
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

            <section className="dashboard-section">
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
                                            <Ticket size={16} />
                                            Billet simple : {formatPrice(offer.ticketPrice)} MAD
                                        </span>

                                        <span>
                                            <WalletCards size={16} />
                                            Abonnement : {formatPrice(offer.price)} MAD
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
        </div>
    );
}

function StatCard({ title, value, icon, colorClass }) {
    return (
        <div className="col-md-3">
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

function ReservationActions({ reservation, updatingReservationId, onUpdate }) {
    return (
        <div className="d-flex flex-wrap gap-2 mt-3">
            {reservation.status === "EN_ATTENTE" && (
                <>
                    <button
                        type="button"
                        className="btn btn-success btn-sm"
                        disabled={updatingReservationId === reservation.id}
                        onClick={() => onUpdate(reservation.id, "CONFIRMEE")}
                    >
                        Accepter
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        disabled={updatingReservationId === reservation.id}
                        onClick={() => onUpdate(reservation.id, "REFUSEE")}
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
                    onClick={() => onUpdate(reservation.id, "ANNULEE")}
                >
                    Annuler
                </button>
            )}

            {(reservation.status === "REFUSEE" || reservation.status === "ANNULEE") && (
                <span className="text-muted small">Aucune action disponible</span>
            )}
        </div>
    );
}

function DemandActions({ demand, updatingDemandId, onUpdate }) {
    return (
        <div className="d-flex flex-wrap gap-2 mt-3">
            {demand.status === "PENDING" && (
                <>
                    <button
                        type="button"
                        className="btn btn-success btn-sm"
                        disabled={updatingDemandId === demand.id}
                        onClick={() => onUpdate(demand.id, "ACCEPTED")}
                    >
                        Accepter
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        disabled={updatingDemandId === demand.id}
                        onClick={() => onUpdate(demand.id, "REJECTED")}
                    >
                        Refuser
                    </button>
                </>
            )}

            {demand.status !== "PENDING" && (
                <span className="text-muted small">Aucune action disponible</span>
            )}
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
            {hasWifi && <span className="badge bg-info-subtle text-info">Wi-Fi{suffix}</span>}

            {hasAirConditioning && (
                <span className="badge bg-primary-subtle text-primary">
                    Climatisation{suffix}
                </span>
            )}

            {hasUsbCharger && (
                <span className="badge bg-success-subtle text-success">USB{suffix}</span>
            )}

            {allowsLuggage && (
                <span className="badge bg-warning-subtle text-warning">Bagages{suffix}</span>
            )}

            {!hasAnyOption && (
                <span className="badge bg-secondary-subtle text-secondary">{emptyText}</span>
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

function normalizeText(value) {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
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