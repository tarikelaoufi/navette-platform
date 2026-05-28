import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    Bus,
    CalendarDays,
    CheckCircle2,
    Clock,
    Info,
    Ticket,
    Users,
    WalletCards,
} from "lucide-react";
import api from "../../api/axios";

export default function OfferDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [offer, setOffer] = useState(null);
    const [travelDate, setTravelDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [reservationLoading, setReservationLoading] = useState(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);

    const [error, setError] = useState("");
    const [dateError, setDateError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    const loadOffer = async () => {
        setError("");

        try {
            const response = await api.get(`/api/offers/${id}`);

            setOffer(response.data);

            if (!travelDate) {
                const minimumDate = getMinimumTravelDate(response.data.startDate);
                setTravelDate(minimumDate);
            }
        } catch (error) {
            console.error("OFFER DETAILS ERROR:", error);
            setError("Impossible de charger les détails de l’offre.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        api
            .get(`/api/offers/${id}`)
            .then((response) => {
                if (!isMounted) return;

                setOffer(response.data);

                const minimumDate = getMinimumTravelDate(response.data.startDate);
                setTravelDate(minimumDate);
            })
            .catch((error) => {
                console.error("OFFER DETAILS ERROR:", error);

                if (isMounted) {
                    setError("Impossible de charger les détails de l’offre.");
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
    }, [id]);

    const checkUserAccess = () => {
        if (!token) {
            navigate("/login");
            return false;
        }

        if (role !== "ROLE_USER") {
            setError("Seul un utilisateur peut réserver un billet ou s’abonner.");
            return false;
        }

        if (!userId) {
            setError("Utilisateur introuvable. Veuillez vous reconnecter.");
            return false;
        }

        return true;
    };

    const validateTravelDate = () => {
        setDateError("");

        if (!travelDate) {
            setDateError("Veuillez choisir une date de trajet.");
            return false;
        }

        const minimumDate = getMinimumTravelDate(offer?.startDate);

        if (travelDate < minimumDate) {
            setDateError(
                `La date du trajet doit être aujourd’hui ou après le ${formatDisplayDate(
                    minimumDate
                )}.`
            );
            return false;
        }

        if (offer?.endDate && travelDate > offer.endDate) {
            setDateError(
                `La date du trajet doit être avant le ${formatDisplayDate(offer.endDate)}.`
            );
            return false;
        }

        return true;
    };

    const handleTravelDateChange = (event) => {
        const selectedDate = event.target.value;
        setTravelDate(selectedDate);
        setDateError("");
        setError("");
        setSuccess("");

        if (!offer) return;

        const minimumDate = getMinimumTravelDate(offer.startDate);

        if (selectedDate && selectedDate < minimumDate) {
            setDateError(
                `Date invalide : choisissez aujourd’hui ou une date après le ${formatDisplayDate(
                    minimumDate
                )}.`
            );
            return;
        }

        if (offer.endDate && selectedDate > offer.endDate) {
            setDateError(
                `Date invalide : l’offre se termine le ${formatDisplayDate(offer.endDate)}.`
            );
        }
    };

    const handleReservation = async () => {
        if (!checkUserAccess()) return;
        if (!validateTravelDate()) return;

        setReservationLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.post("/api/user/reservations", {
                userId: Number(userId),
                offerId: Number(id),
                travelDate,
            });

            const reservationStatus = response.data?.status;
            const amount = response.data?.amount;

            if (reservationStatus === "EN_ATTENTE") {
                setSuccess(
                    `Votre demande de billet simple a été envoyée. Montant : ${amount} MAD. La société doit l’accepter avant confirmation.`
                );
            } else {
                setSuccess("Votre réservation a été envoyée avec succès.");
            }

            await loadOffer();
        } catch (error) {
            console.error("RESERVATION ERROR:", error);

            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                getValidationMessage(error.response?.data);

            setError(
                backendMessage ||
                "Impossible d’envoyer la demande de réservation. Vérifiez la date choisie."
            );
        } finally {
            setReservationLoading(false);
        }
    };

    const handleSubscription = async () => {
        if (!checkUserAccess()) return;

        setSubscriptionLoading(true);
        setError("");
        setSuccess("");

        try {
            await api.post("/api/user/subscriptions", {
                userId: Number(userId),
                offerId: Number(id),
                startDate: offer.startDate,
                endDate: offer.endDate,
            });

            setSuccess("Abonnement à la navette effectué avec succès.");

            await loadOffer();
        } catch (error) {
            console.error("SUBSCRIPTION ERROR:", error);
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Impossible de s’abonner à la navette."
            );
        } finally {
            setSubscriptionLoading(false);
        }
    };

    const isOfferFull = Number(offer?.availablePlaces || 0) <= 0;
    const isOfferOpen = offer?.status === "OUVERTE";
    const minimumTravelDate = getMinimumTravelDate(offer?.startDate);

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-muted mt-3">Chargement de l’offre...</p>
            </div>
        );
    }

    if (error && !offer) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">{error}</div>

                <Link to="/offers" className="btn btn-outline-primary">
                    Retour aux navettes
                </Link>
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">Offre introuvable.</div>

                <Link to="/offers" className="btn btn-outline-primary">
                    Retour aux navettes
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <Link to="/offers" className="btn btn-link text-decoration-none mb-4 px-0">
                <ArrowLeft size={18} />
                Retour aux navettes
            </Link>

            <div className="offer-details-card">
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-4 mb-4">
                    <div>
            <span className={`badge mb-3 ${getOfferBadgeClass(offer.status)}`}>
              {offer.status}
            </span>

                        <h1 className="fw-bold mb-2">{offer.title}</h1>

                        <p className="text-muted mb-0">
                            {offer.description || "Aucune description disponible."}
                        </p>
                    </div>

                    <div className="d-flex flex-column flex-sm-row gap-3">
                        <div className="price-box">
                            <small>Billet simple</small>
                            <strong>{formatPrice(offer.ticketPrice)} MAD</strong>
                        </div>

                        <div className="price-box">
                            <small>Abonnement</small>
                            <strong>{formatPrice(offer.price)} MAD</strong>
                        </div>
                    </div>
                </div>

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

                {!isOfferOpen && (
                    <div className="alert alert-warning d-flex gap-2" role="alert">
                        <Info size={20} />
                        <div>
                            Cette offre n’est pas ouverte actuellement. La réservation peut être
                            indisponible.
                        </div>
                    </div>
                )}

                <div className="route-details mb-4">
                    <div>
                        <small>Ville de départ</small>
                        <h4>{offer.departureCityName}</h4>
                    </div>

                    <div className="route-details-line" />

                    <div className="text-lg-end">
                        <small>Ville d’arrivée</small>
                        <h4>{offer.arrivalCityName}</h4>
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-md-6 col-xl-3">
                        <div className="detail-box">
                            <Clock size={22} />
                            <small>Horaire</small>
                            <strong>
                                {offer.departureTime} → {offer.arrivalTime}
                            </strong>
                        </div>
                    </div>

                    <div className="col-md-6 col-xl-3">
                        <div className="detail-box">
                            <CalendarDays size={22} />
                            <small>Période de l’offre</small>
                            <strong>
                                {offer.startDate} / {offer.endDate}
                            </strong>
                        </div>
                    </div>

                    <div className="col-md-6 col-xl-3">
                        <div className="detail-box">
                            <Users size={22} />
                            <small>Places disponibles</small>
                            <strong>
                                {offer.availablePlaces} / {offer.totalPlaces}
                            </strong>
                        </div>
                    </div>

                    <div className="col-md-6 col-xl-3">
                        <div className="detail-box">
                            <Bus size={22} />
                            <small>Navette</small>
                            <strong>{offer.shuttleName || "-"}</strong>
                        </div>
                    </div>
                </div>

                <div className="company-box mb-4">
                    <Building2 size={24} />

                    <div>
                        <small>Société de transport</small>
                        <strong>{offer.companyName || "-"}</strong>
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-lg-6">
                        <div className="action-box h-100">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Ticket size={22} className="text-primary" />
                                <h5 className="fw-bold mb-0">Réserver un billet simple</h5>
                            </div>

                            <p className="text-muted mb-3">
                                Choisissez une date de trajet. Votre demande sera envoyée à la
                                société, puis elle pourra l’accepter ou la refuser.
                            </p>

                            <label className="form-label">Date du trajet</label>

                            <input
                                type="date"
                                className={`form-control ${dateError ? "is-invalid" : ""}`}
                                min={minimumTravelDate}
                                max={offer.endDate}
                                value={travelDate}
                                onChange={handleTravelDateChange}
                            />

                            {dateError ? (
                                <div className="invalid-feedback d-block">{dateError}</div>
                            ) : (
                                <small className="text-muted">
                                    La date doit être entre {formatDisplayDate(minimumTravelDate)} et{" "}
                                    {formatDisplayDate(offer.endDate)}.
                                </small>
                            )}

                            <div className="mt-3">
                                <small className="text-muted">Prix du billet simple</small>
                                <h4 className="fw-bold mb-0">
                                    {formatPrice(offer.ticketPrice)} MAD
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="action-box h-100">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <WalletCards size={22} className="text-primary" />
                                <h5 className="fw-bold mb-0">S’abonner à la navette</h5>
                            </div>

                            <p className="text-muted mb-3">
                                L’abonnement couvre la période de l’offre. Le montant affiché ici
                                est différent du prix du billet simple.
                            </p>

                            <small className="text-muted">Période</small>
                            <p className="fw-bold mb-3">
                                {offer.startDate} / {offer.endDate}
                            </p>

                            <small className="text-muted">Prix abonnement</small>
                            <h4 className="fw-bold mb-0">{formatPrice(offer.price)} MAD</h4>
                        </div>
                    </div>
                </div>

                {isOfferFull && (
                    <div className="alert alert-warning" role="alert">
                        Cette navette est complète. Aucune nouvelle réservation ne peut être
                        demandée pour le moment.
                    </div>
                )}

                <div className="d-flex flex-wrap gap-3">
                    <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleReservation}
                        disabled={reservationLoading || isOfferFull || !isOfferOpen || Boolean(dateError)}
                    >
                        {reservationLoading
                            ? "Envoi de la demande..."
                            : "Demander le billet simple"}
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-primary btn-lg"
                        onClick={handleSubscription}
                        disabled={subscriptionLoading || isOfferFull || !isOfferOpen}
                    >
                        {subscriptionLoading ? "Abonnement..." : "S’abonner à la navette"}
                    </button>
                </div>

                <div className="mt-4 p-3 rounded border bg-light">
                    <small className="text-muted d-block mb-1">Rappel</small>
                    <p className="mb-0">
                        Le billet simple passe d’abord en statut <strong>EN_ATTENTE</strong>.
                        Il devient <strong>CONFIRMEE</strong> seulement après acceptation par
                        la société de transport.
                    </p>
                </div>
            </div>
        </div>
    );
}

function getMinimumTravelDate(startDate) {
    const today = new Date().toISOString().split("T")[0];

    if (!startDate) {
        return today;
    }

    return startDate > today ? startDate : today;
}

function formatDisplayDate(value) {
    if (!value) return "-";

    return new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR");
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

    return "bg-primary-subtle text-primary";
}