import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Search, Users, Clock, Bus } from "lucide-react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [cities, setCities] = useState([]);

    const [departureCityId, setDepartureCityId] = useState("");
    const [arrivalCityId, setArrivalCityId] = useState("");

    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");

    const fetchOffers = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/api/offers");
            setOffers(response.data);
        } catch (error) {
            console.error("OFFERS ERROR:", error);
            setError("Impossible de charger les offres.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCities = async () => {
        try {
            const response = await api.get("/api/cities");
            setCities(response.data);
        } catch (error) {
            console.error("CITIES ERROR:", error);
        }
    };

    const handleSearch = async (event) => {
        event.preventDefault();

        if (!departureCityId || !arrivalCityId) {
            setError("Veuillez choisir la ville de départ et la ville d’arrivée.");
            return;
        }

        if (departureCityId === arrivalCityId) {
            setError("La ville de départ et la ville d’arrivée doivent être différentes.");
            return;
        }

        setSearching(true);
        setError("");

        try {
            const response = await api.get(
                `/api/offers/search?departureCityId=${departureCityId}&arrivalCityId=${arrivalCityId}`
            );

            setOffers(response.data);
        } catch (error) {
            console.error("SEARCH OFFERS ERROR:", error);
            setError("Impossible de rechercher les offres.");
        } finally {
            setSearching(false);
        }
    };

    const resetSearch = () => {
        setDepartureCityId("");
        setArrivalCityId("");
        fetchOffers();
    };

    useEffect(() => {
        fetchOffers();
        fetchCities();
    }, []);

    return (
        <div className="container py-5">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
                <div>
          <span className="badge bg-primary-subtle text-primary mb-3">
            Offres publiques
          </span>
                    <h1 className="fw-bold mb-2">Offres disponibles</h1>
                    <p className="text-muted mb-0">
                        Consultez les offres ouvertes proposées par les sociétés de transport.
                    </p>
                </div>

                <button className="btn btn-outline-primary align-self-start" onClick={resetSearch}>
                    Afficher toutes les offres
                </button>
            </div>

            <form className="search-card mb-4" onSubmit={handleSearch}>
                <div className="row g-3 align-items-end">
                    <div className="col-md-5">
                        <label className="form-label">Ville de départ</label>
                        <select
                            className="form-select"
                            value={departureCityId}
                            onChange={(event) => setDepartureCityId(event.target.value)}
                        >
                            <option value="">Choisir une ville</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-5">
                        <label className="form-label">Ville d’arrivée</label>
                        <select
                            className="form-select"
                            value={arrivalCityId}
                            onChange={(event) => setArrivalCityId(event.target.value)}
                        >
                            <option value="">Choisir une ville</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <button type="submit" className="btn btn-primary w-100" disabled={searching}>
                            <Search size={18} />
                            {searching ? "..." : "Chercher"}
                        </button>
                    </div>
                </div>
            </form>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted mt-3">Chargement des offres...</p>
                </div>
            ) : offers.length === 0 ? (
                <div className="empty-state">
                    <Bus size={44} />
                    <h4>Aucune offre trouvée</h4>
                    <p>
                        Aucune navette ne correspond à votre recherche. Vous pourrez créer une demande
                        depuis votre espace utilisateur.
                    </p>
                </div>
            ) : (
                <div className="row g-4">
                    {offers.map((offer) => (
                        <div className="col-md-6 col-xl-4" key={offer.id}>
                            <article className="offer-card">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h5 className="fw-bold mb-1">{offer.title}</h5>
                                        <p className="text-muted mb-0">{offer.companyName}</p>
                                    </div>

                                    <span className="badge bg-success-subtle text-success">
                    {offer.status}
                  </span>
                                </div>

                                <div className="route-box mb-3">
                                    <div>
                                        <small>Départ</small>
                                        <strong>{offer.departureCityName}</strong>
                                    </div>

                                    <span className="route-line" />

                                    <div className="text-end">
                                        <small>Arrivée</small>
                                        <strong>{offer.arrivalCityName}</strong>
                                    </div>
                                </div>

                                <div className="offer-info">
                  <span>
                    <Clock size={17} />
                      {offer.departureTime} → {offer.arrivalTime}
                  </span>

                                    <span>
                    <CalendarDays size={17} />
                                        {offer.startDate} / {offer.endDate}
                  </span>

                                    <span>
                    <Users size={17} />
                                        {offer.availablePlaces} places disponibles
                  </span>

                                    <span>
                    <MapPin size={17} />
                                        {offer.shuttleName}
                  </span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <div>
                                        <small className="text-muted">Prix</small>
                                        <h4 className="fw-bold mb-0">{offer.price} MAD</h4>
                                    </div>

                                    <Link to={`/offers/${offer.id}`} className="btn btn-primary">
                                        Voir détails
                                    </Link>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}