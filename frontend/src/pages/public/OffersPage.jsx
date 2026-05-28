import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CalendarDays,
    MapPin,
    Search,
    Users,
    Clock,
    Bus,
    Ticket,
    WalletCards,
} from "lucide-react";
import api from "../../api/axios";

export default function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [cities, setCities] = useState([]);

    const [departureCityName, setDepartureCityName] = useState("");
    const [arrivalCityName, setArrivalCityName] = useState("");

    const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
    const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);

    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");

    const loadInitialData = async () => {
        setError("");

        try {
            const [offersResponse, citiesResponse] = await Promise.all([
                api.get("/api/offers"),
                api.get("/api/cities"),
            ]);

            setOffers(offersResponse.data);
            setCities(citiesResponse.data);
        } catch (error) {
            console.error("OFFERS PAGE ERROR:", error);
            setError("Impossible de charger les offres.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        Promise.all([api.get("/api/offers"), api.get("/api/cities")])
            .then(([offersResponse, citiesResponse]) => {
                if (!isMounted) return;

                setOffers(offersResponse.data);
                setCities(citiesResponse.data);
            })
            .catch((error) => {
                console.error("OFFERS PAGE ERROR:", error);

                if (isMounted) {
                    setError("Impossible de charger les offres.");
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

    const findCityByName = (name) => {
        const normalizedSearch = normalizeText(name);

        return (
            cities.find((city) => normalizeText(city.name) === normalizedSearch) ||
            cities.find((city) => normalizeText(city.name).includes(normalizedSearch))
        );
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

    const handleSearch = async (event) => {
        event.preventDefault();

        if (!departureCityName.trim() || !arrivalCityName.trim()) {
            setError("Veuillez saisir la ville de départ et la ville d’arrivée.");
            return;
        }

        const departureCity = findCityByName(departureCityName);
        const arrivalCity = findCityByName(arrivalCityName);

        if (!departureCity) {
            setError(`Ville de départ introuvable : ${departureCityName}`);
            return;
        }

        if (!arrivalCity) {
            setError(`Ville d’arrivée introuvable : ${arrivalCityName}`);
            return;
        }

        if (departureCity.id === arrivalCity.id) {
            setError("La ville de départ et la ville d’arrivée doivent être différentes.");
            return;
        }

        setSearching(true);
        setError("");

        try {
            const response = await api.get(
                `/api/offers/search?departureCityId=${departureCity.id}&arrivalCityId=${arrivalCity.id}`
            );

            setOffers(response.data);
        } catch (error) {
            console.error("SEARCH OFFERS ERROR:", error);
            setError("Impossible de rechercher les offres.");
        } finally {
            setSearching(false);
        }
    };

    const resetSearch = async () => {
        setDepartureCityName("");
        setArrivalCityName("");
        setLoading(true);
        await loadInitialData();
    };

    return (
        <div className="container py-5">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
                <div>
          <span className="badge bg-primary-subtle text-primary mb-3">
            Navettes disponibles
          </span>

                    <h1 className="fw-bold mb-2">Navettes disponibles</h1>

                    <p className="text-muted mb-0">
                        Consultez les horaires, le prix du billet simple et le prix
                        d’abonnement pour chaque navette.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary align-self-start"
                    onClick={resetSearch}
                >
                    Afficher toutes les navettes
                </button>
            </div>

            <form className="search-card mb-4" onSubmit={handleSearch}>
                <div className="row g-3 align-items-end">
                    <div className="col-md-5">
                        <label className="form-label">Ville de départ</label>

                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Exemple : Tanger"
                                value={departureCityName}
                                onChange={(event) => {
                                    setDepartureCityName(event.target.value);
                                    setShowDepartureSuggestions(true);
                                }}
                                onFocus={() => setShowDepartureSuggestions(true)}
                                onBlur={() => {
                                    setTimeout(() => setShowDepartureSuggestions(false), 150);
                                }}
                            />

                            {showDepartureSuggestions && (
                                <div className="autocomplete-menu">
                                    {getCitySuggestions(departureCityName).length === 0 ? (
                                        <button type="button" className="autocomplete-item disabled">
                                            Aucune ville trouvée
                                        </button>
                                    ) : (
                                        getCitySuggestions(departureCityName).map((city) => (
                                            <button
                                                type="button"
                                                key={city.id}
                                                className="autocomplete-item"
                                                onMouseDown={() => {
                                                    setDepartureCityName(city.name);
                                                    setShowDepartureSuggestions(false);
                                                }}
                                            >
                                                {city.name}
                                                <small>{city.country || "Ville"}</small>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-5">
                        <label className="form-label">Ville d’arrivée</label>

                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Exemple : Tétouan"
                                value={arrivalCityName}
                                onChange={(event) => {
                                    setArrivalCityName(event.target.value);
                                    setShowArrivalSuggestions(true);
                                }}
                                onFocus={() => setShowArrivalSuggestions(true)}
                                onBlur={() => {
                                    setTimeout(() => setShowArrivalSuggestions(false), 150);
                                }}
                            />

                            {showArrivalSuggestions && (
                                <div className="autocomplete-menu">
                                    {getCitySuggestions(arrivalCityName).length === 0 ? (
                                        <button type="button" className="autocomplete-item disabled">
                                            Aucune ville trouvée
                                        </button>
                                    ) : (
                                        getCitySuggestions(arrivalCityName).map((city) => (
                                            <button
                                                type="button"
                                                key={city.id}
                                                className="autocomplete-item"
                                                onMouseDown={() => {
                                                    setArrivalCityName(city.name);
                                                    setShowArrivalSuggestions(false);
                                                }}
                                            >
                                                {city.name}
                                                <small>{city.country || "Ville"}</small>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-2">
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={searching}
                        >
                            <Search size={18} />
                            {searching ? "..." : "Chercher"}
                        </button>
                    </div>
                </div>

                <small className="text-muted d-block mt-3">
                    Vous pouvez écrire le nom de la ville ou choisir une suggestion.
                </small>
            </form>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted mt-3">Chargement des navettes...</p>
                </div>
            ) : offers.length === 0 ? (
                <div className="empty-state">
                    <Bus size={44} />

                    <h4>Aucune navette trouvée</h4>

                    <p>
                        Aucune navette ne correspond à votre recherche. Vous pouvez créer une
                        demande depuis votre espace utilisateur.
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

                                <div className="d-flex justify-content-between align-items-center gap-3 mt-4">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <Ticket size={17} />
                                            <small className="text-muted">Billet simple</small>
                                        </div>

                                        <h4 className="fw-bold mb-1">
                                            {formatPrice(offer.ticketPrice)} MAD
                                        </h4>

                                        <div className="d-flex align-items-center gap-2">
                                            <WalletCards size={15} />
                                            <small className="text-muted">
                                                Abonnement : {formatPrice(offer.price)} MAD
                                            </small>
                                        </div>
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

function normalizeText(value) {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function formatPrice(value) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    return Number(value).toFixed(2);
}