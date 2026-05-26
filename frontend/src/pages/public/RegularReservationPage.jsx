import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, MapPin, Send, Users } from "lucide-react";
import api from "../../api/axios";

export default function RegularReservationPage() {
    const navigate = useNavigate();

    const [cities, setCities] = useState([]);

    const [formData, setFormData] = useState({
        departureCity: "",
        arrivalCity: "",
        desiredTime: "",
        period: "",
        startDate: "",
        endDate: "",
        seats: 1,
        notes: "",
        hasWifi: false,
        hasAirConditioning: false,
        hasUsbCharger: false,
        allowsLuggage: false,
    });

    const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
    const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);

    const [loadingCities, setLoadingCities] = useState(true);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

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
                    setError("Impossible de charger les suggestions des villes.");
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

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: type === "checkbox" ? checked : value,
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

    const resetForm = () => {
        setFormData({
            departureCity: "",
            arrivalCity: "",
            desiredTime: "",
            period: "",
            startDate: "",
            endDate: "",
            seats: 1,
            notes: "",
            hasWifi: false,
            hasAirConditioning: false,
            hasUsbCharger: false,
            allowsLuggage: false,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSuccess("");
        setError("");

        if (!token) {
            navigate("/login");
            return;
        }

        if (role !== "ROLE_USER") {
            setError("Seul un utilisateur peut demander une navette.");
            return;
        }

        if (
            formData.departureCity.trim().toLowerCase() ===
            formData.arrivalCity.trim().toLowerCase()
        ) {
            setError("La ville de départ et la ville d’arrivée doivent être différentes.");
            return;
        }

        if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
            setError("La date de fin ne peut pas être avant la date de début.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/api/user/regular-reservations", {
                userId: Number(userId),
                departureCity: formData.departureCity.trim(),
                arrivalCity: formData.arrivalCity.trim(),
                desiredTime: formData.desiredTime,
                period: formData.period,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                seats: Number(formData.seats),
                notes: formData.notes,
                hasWifi: formData.hasWifi,
                hasAirConditioning: formData.hasAirConditioning,
                hasUsbCharger: formData.hasUsbCharger,
                allowsLuggage: formData.allowsLuggage,
            });

            setSuccess("Votre demande de navette régulière a été envoyée avec succès.");
            resetForm();
        } catch (error) {
            console.error("REGULAR SHUTTLE REQUEST ERROR:", error);
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Impossible d’envoyer la demande de navette."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="regular-reservation-header mb-4">
        <span className="badge bg-primary-subtle text-primary mb-3">
          Demande personnalisée
        </span>

                <h1 className="fw-bold mb-2">Demander une navette régulière</h1>

                <p className="text-muted mb-0">
                    Vous ne trouvez pas une navette adaptée ? Envoyez une demande de
                    navette régulière avec vos villes, votre horaire, votre période et les
                    options souhaitées.
                </p>
            </div>

            <div className="regular-reservation-card">
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

                {loadingCities && (
                    <div className="alert alert-info" role="alert">
                        Chargement des suggestions des villes...
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="form-label">Ville de départ</label>

                            <div className="autocomplete-wrapper">
                                <div className="input-icon-box">
                                    <MapPin size={18} />
                                    <input
                                        name="departureCity"
                                        className="form-control"
                                        placeholder="Exemple : Tétouan"
                                        value={formData.departureCity}
                                        onChange={(event) => {
                                            handleChange(event);
                                            setShowDepartureSuggestions(true);
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
                                        {getCitySuggestions(formData.departureCity).length === 0 ? (
                                            <button type="button" className="autocomplete-item disabled">
                                                Aucune ville trouvée
                                            </button>
                                        ) : (
                                            getCitySuggestions(formData.departureCity).map((city) => (
                                                <button
                                                    type="button"
                                                    key={city.id}
                                                    className="autocomplete-item"
                                                    onMouseDown={() => {
                                                        setFormData((previousData) => ({
                                                            ...previousData,
                                                            departureCity: city.name,
                                                        }));
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

                        <div className="col-md-6">
                            <label className="form-label">Ville d’arrivée</label>

                            <div className="autocomplete-wrapper">
                                <div className="input-icon-box">
                                    <MapPin size={18} />
                                    <input
                                        name="arrivalCity"
                                        className="form-control"
                                        placeholder="Exemple : Tanger"
                                        value={formData.arrivalCity}
                                        onChange={(event) => {
                                            handleChange(event);
                                            setShowArrivalSuggestions(true);
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
                                        {getCitySuggestions(formData.arrivalCity).length === 0 ? (
                                            <button type="button" className="autocomplete-item disabled">
                                                Aucune ville trouvée
                                            </button>
                                        ) : (
                                            getCitySuggestions(formData.arrivalCity).map((city) => (
                                                <button
                                                    type="button"
                                                    key={city.id}
                                                    className="autocomplete-item"
                                                    onMouseDown={() => {
                                                        setFormData((previousData) => ({
                                                            ...previousData,
                                                            arrivalCity: city.name,
                                                        }));
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

                        <div className="col-md-4">
                            <label className="form-label">Heure souhaitée</label>

                            <div className="input-icon-box">
                                <Clock size={18} />
                                <input
                                    type="time"
                                    name="desiredTime"
                                    className="form-control"
                                    value={formData.desiredTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Période</label>

                            <select
                                name="period"
                                className="form-select"
                                value={formData.period}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Choisir une période</option>
                                <option value="Every day">Tous les jours</option>
                                <option value="Weekdays">Jours ouvrables</option>
                                <option value="Weekend">Weekend</option>
                                <option value="Weekly">Chaque semaine</option>
                                <option value="Monthly">Mensuel</option>
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Nombre de places</label>

                            <div className="input-icon-box">
                                <Users size={18} />
                                <input
                                    type="number"
                                    min="1"
                                    name="seats"
                                    className="form-control"
                                    value={formData.seats}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Date de début</label>

                            <div className="input-icon-box">
                                <CalendarDays size={18} />
                                <input
                                    type="date"
                                    name="startDate"
                                    className="form-control"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Date de fin</label>

                            <div className="input-icon-box">
                                <CalendarDays size={18} />
                                <input
                                    type="date"
                                    name="endDate"
                                    className="form-control"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="col-12">
                            <label className="form-label fw-semibold mb-3">
                                Options souhaitées
                            </label>

                            <div className="row g-3">
                                <div className="col-md-3">
                                    <div className="form-check border rounded p-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="requestHasWifi"
                                            name="hasWifi"
                                            checked={formData.hasWifi}
                                            onChange={handleChange}
                                        />

                                        <label className="form-check-label ms-2" htmlFor="requestHasWifi">
                                            Wi-Fi
                                        </label>
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="form-check border rounded p-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="requestHasAirConditioning"
                                            name="hasAirConditioning"
                                            checked={formData.hasAirConditioning}
                                            onChange={handleChange}
                                        />

                                        <label
                                            className="form-check-label ms-2"
                                            htmlFor="requestHasAirConditioning"
                                        >
                                            Climatisation
                                        </label>
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="form-check border rounded p-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="requestHasUsbCharger"
                                            name="hasUsbCharger"
                                            checked={formData.hasUsbCharger}
                                            onChange={handleChange}
                                        />

                                        <label
                                            className="form-check-label ms-2"
                                            htmlFor="requestHasUsbCharger"
                                        >
                                            Chargeur USB
                                        </label>
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="form-check border rounded p-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="requestAllowsLuggage"
                                            name="allowsLuggage"
                                            checked={formData.allowsLuggage}
                                            onChange={handleChange}
                                        />

                                        <label
                                            className="form-check-label ms-2"
                                            htmlFor="requestAllowsLuggage"
                                        >
                                            Bagages
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12">
                            <label className="form-label">Notes</label>

                            <textarea
                                name="notes"
                                className="form-control"
                                rows="4"
                                placeholder="Exemple : Je cherche une navette régulière pour aller au travail chaque matin."
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-12">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg d-flex align-items-center gap-2"
                                disabled={loading}
                            >
                                <Send size={20} />
                                {loading ? "Envoi..." : "Envoyer la demande de navette"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
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