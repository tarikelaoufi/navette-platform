import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bus,
    CalendarDays,
    CheckCircle2,
    Clock,
    MapPin,
    Search,
    Send,
    Users,
    Building2,
    Ticket,
    WalletCards,
} from "lucide-react";
import api from "../../api/axios";

export default function SimpleReservationPage() {
    const navigate = useNavigate();

    const [cities, setCities] = useState([]);
    const [offers, setOffers] = useState([]);

    const [departureCityName, setDepartureCityName] = useState("");
    const [arrivalCityName, setArrivalCityName] = useState("");
    const [travelDate, setTravelDate] = useState(getTodayDate());

    const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
    const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);

    const [loadingCities, setLoadingCities] = useState(true);
    const [searching, setSearching] = useState(false);
    const [reservationLoadingId, setReservationLoadingId] = useState(null);

    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState("");
    const [dateError, setDateError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        let isMounted = true;

        api
            .get("/api/cities")
            .then((response) => {
                if (isMounted) {
                    setCities(response.data);
                }
            })
            .catch((error) => {
                console.error("CITIES ERROR:", error);

                if (isMounted) {
                    setError("Impossible de charger les villes.");
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingCities(false);
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

    const validateSearch = () => {
        setError("");
        setDateError("");

        if (!departureCityName.trim()) {
            setError("Veuillez saisir la ville de départ.");
            return false;
        }

        if (!arrivalCityName.trim()) {
            setError("Veuillez saisir la ville d’arrivée.");
            return false;
        }

        if (!travelDate) {
            setDateError("Veuillez choisir une date de trajet.");
            return false;
        }

        if (travelDate < getTodayDate()) {
            setDateError("La date du trajet doit être aujourd’hui ou dans le futur.");
            return false;
        }

        const departureCity = findCityByName(departureCityName);
        const arrivalCity = findCityByName(arrivalCityName);

        if (!departureCity) {
            setError(`Ville de départ introuvable : ${departureCityName}`);
            return false;
        }

        if (!arrivalCity) {
            setError(`Ville d’arrivée introuvable : ${arrivalCityName}`);
            return false;
        }

        if (departureCity.id === arrivalCity.id) {
            setError("La ville de départ et la ville d’arrivée doivent être différentes.");
            return false;
        }

        return true;
    };

    const handleTravelDateChange = (event) => {
        const selectedDate = event.target.value;

        setTravelDate(selectedDate);
        setDateError("");
        setSuccess("");
        setError("");

        if (selectedDate && selectedDate < getTodayDate()) {
            setDateError("Date invalide : choisissez aujourd’hui ou une date future.");
        }
    };

    const handleSearch = async (event) => {
        event.preventDefault();

        if (!validateSearch()) return;

        const departureCity = findCityByName(departureCityName);
        const arrivalCity = findCityByName(arrivalCityName);

        setSearching(true);
        setSuccess("");
        setOffers([]);

        try {
            const response = await api.get(
                `/api/offers/search?departureCityId=${departureCity.id}&arrivalCityId=${arrivalCity.id}`
            );

            const validOffers = response.data.filter((offer) => {
                const isOpen = offer.status === "OUVERTE";
                const hasPlaces = Number(offer.availablePlaces || 0) > 0;
                const isInsidePeriod =
                    travelDate >= offer.startDate && travelDate <= offer.endDate;

                return isOpen && hasPlaces && isInsidePeriod;
            });

            setOffers(validOffers);
            setHasSearched(true);

            if (validOffers.length === 0) {
                setError(
                    "Aucune navette disponible pour cette destination et cette date. Vous pouvez essayer une autre date ou demander une navette régulière."
                );
            }
        } catch (error) {
            console.error("SEARCH SIMPLE RESERVATION ERROR:", error);
            setError("Impossible de rechercher les navettes disponibles.");
        } finally {
            setSearching(false);
        }
    };

    const checkUserAccess = () => {
        if (!token) {
            navigate("/login");
            return false;
        }

        if (role !== "ROLE_USER") {
            setError("Seul un utilisateur peut demander une réservation de billet.");
            return false;
        }

        if (!userId) {
            setError("Utilisateur introuvable. Veuillez vous reconnecter.");
            return false;
        }

        return true;
    };

    const handleReserve = async (offerId) => {
        setError("");
        setSuccess("");

        if (!checkUserAccess()) return;

        if (!travelDate || travelDate < getTodayDate()) {
            setDateError("La date du trajet doit être aujourd’hui ou dans le futur.");
            return;
        }

        setReservationLoadingId(offerId);

        try {
            const response = await api.post("/api/user/reservations", {
                userId: Number(userId),
                offerId: Number(offerId),
                travelDate,
            });

            if (response.data?.status === "EN_ATTENTE") {
                setSuccess(
                    `Votre demande de billet simple a été envoyée. Montant : ${response.data.amount} MAD. La société doit l’accepter avant confirmation.`
                );
            } else {
                setSuccess("Votre demande de réservation a été envoyée avec succès.");
            }
        } catch (error) {
            console.error("CREATE SIMPLE RESERVATION ERROR:", error);

            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                getValidationMessage(error.response?.data) ||
                "Impossible d’envoyer la demande de réservation."
            );
        } finally {
            setReservationLoadingId(null);
        }
    };

    return (
        <div className="container py-5">
            <div className="regular-reservation-header mb-4">
        <span className="badge bg-primary-subtle text-primary mb-3">
          Billet simple
        </span>

                <h1 className="fw-bold mb-2">Acheter un billet simple</h1>

                <p className="text-muted mb-0">
                    Choisissez votre trajet et votre date. La réservation sera envoyée à la
                    société de transport pour acceptation.
                </p>
            </div>

            <form className="search-card mb-4" onSubmit={handleSearch}>
                <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label">Ville de départ</label>

                        <div className="autocomplete-wrapper">
                            <div className="input-icon-box">
                                <MapPin size={18} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Exemple : Tanger"
                                    value={departureCityName}
                                    onChange={(event) => {
                                        setDepartureCityName(event.target.value);
                                        setShowDepartureSuggestions(true);
                                        setError("");
                                        setSuccess("");
                                    }}
                                    onFocus={() => setShowDepartureSuggestions(true)}
                                    onBlur={() => {
                                        setTimeout(() => setShowDepartureSuggestions(false), 150);
                                    }}
                                />
                            </div>

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

                    <div className="col-md-4">
                        <label className="form-label">Ville d’arrivée</label>

                        <div className="autocomplete-wrapper">
                            <div className="input-icon-box">
                                <MapPin size={18} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Exemple : Tétouan"
                                    value={arrivalCityName}
                                    onChange={(event) => {
                                        setArrivalCityName(event.target.value);
                                        setShowArrivalSuggestions(true);
                                        setError("");
                                        setSuccess("");
                                    }}
                                    onFocus={() => setShowArrivalSuggestions(true)}
                                    onBlur={() => {
                                        setTimeout(() => setShowArrivalSuggestions(false), 150);
                                    }}
                                />
                            </div>

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
                        <label className="form-label">Date du trajet</label>

                        <input
                            type="date"
                            className={`form-control ${dateError ? "is-invalid" : ""}`}
                            min={getTodayDate()}
                            value={travelDate}
                            onChange={handleTravelDateChange}
                        />
                    </div>

                    <div className="col-md-2">
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={searching || loadingCities || Boolean(dateError)}
                        >
                            <Search size={18} />
                            {searching ? "..." : "Chercher"}
                        </button>
                    </div>
                </div>

                {dateError ? (
                    <div className="invalid-feedback d-block mt-2">{dateError}</div>
                ) : (
                    <small className="text-muted d-block mt-3">
                        La date doit être aujourd’hui ou dans le futur.
                    </small>
                )}
            </form>

            {success && (
                <div className="alert alert-success d-flex gap-2" role="alert">
                    <CheckCircle2 size={20} />
                    <div>{success}</div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loadingCities ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted mt-3">Chargement des villes...</p>
                </div>
            ) : !hasSearched ? (
                <div className="empty-state">
                    <Ticket size={44} />

                    <h4>Rechercher un billet</h4>

                    <p>
                        Saisissez une ville de départ, une ville d’arrivée et une date pour
                        voir les billets simples disponibles.
                    </p>
                </div>
            ) : offers.length === 0 ? (
                <div className="empty-state">
                    <Bus size={44} />

                    <h4>Aucune navette disponible</h4>

                    <p>
                        Aucune offre ne correspond à votre trajet pour cette date. Vous
                        pouvez faire une demande de navette régulière.
                    </p>

                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => navigate("/regular-reservation")}
                    >
                        Demander une navette
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    {offers.map((offer) => (
                        <div className="col-md-6 col-xl-4" key={offer.id}>
                            <article className="offer-card h-100">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                    <span className="badge bg-primary-subtle text-primary mb-2">
                      Billet simple
                    </span>
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
                    Valable : {offer.startDate} / {offer.endDate}
                  </span>

                                    <span>
                    <Users size={17} />
                                        {offer.availablePlaces} places disponibles
                  </span>

                                    <span>
                    <Bus size={17} />
                                        {offer.shuttleName}
                  </span>

                                    <span>
                    <Building2 size={17} />
                                        {offer.companyName}
                  </span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center gap-3 mt-4">
                                    <div>
                                        <small className="text-muted">Prix billet simple</small>
                                        <h4 className="fw-bold mb-0">
                                            {formatPrice(offer.ticketPrice)} MAD
                                        </h4>

                                        <small className="text-muted d-block mt-1">
                                            Abonnement : {formatPrice(offer.price)} MAD
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={reservationLoadingId === offer.id}
                                        onClick={() => handleReserve(offer.id)}
                                    >
                                        <Send size={17} />
                                        {reservationLoadingId === offer.id ? "Envoi..." : "Demander"}
                                    </button>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
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

function getValidationMessage(data) {
    if (!data) return "";

    if (typeof data === "string") {
        return data;
    }

    if (data.message) {
        return data.message;
    }

    if (data.error) {
        return data.error;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors[0].defaultMessage || data.errors[0].message || "";
    }

    return "";
}