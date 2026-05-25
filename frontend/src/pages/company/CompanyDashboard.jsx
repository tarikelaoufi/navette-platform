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
    const [demands, setDemands] = useState([]);
    const [cities, setCities] = useState([]);

    const [shuttleForm, setShuttleForm] = useState({
        name: "",
        type: "",
        capacity: "",
        description: "",
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

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadDashboardData = async ({ showLoader = false } = {}) => {
        if (showLoader) {
            setRefreshing(true);
        }

        setError("");

        try {
            const [shuttlesResponse, offersResponse, demandsResponse, citiesResponse] =
                await Promise.all([
                    api.get(`/api/company/shuttles?companyId=${companyId}`),
                    api.get(`/api/company/offers?companyId=${companyId}`),
                    api.get("/api/company/demands"),
                    api.get("/api/cities"),
                ]);

            setShuttles(shuttlesResponse.data);
            setOffers(offersResponse.data);
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
            api.get("/api/company/demands"),
            api.get("/api/cities"),
        ])
            .then(([shuttlesResponse, offersResponse, demandsResponse, citiesResponse]) => {
                if (!isMounted) return;

                setShuttles(shuttlesResponse.data);
                setOffers(offersResponse.data);
                setDemands(demandsResponse.data);
                setCities(citiesResponse.data);
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

    const handleShuttleChange = (event) => {
        const { name, value } = event.target;

        setShuttleForm((previousForm) => ({
            ...previousForm,
            [name]: value,
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
            });

            setSuccess("Navette créée avec succès.");

            setShuttleForm({
                name: "",
                type: "",
                capacity: "",
                description: "",
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