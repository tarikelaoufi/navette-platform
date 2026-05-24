import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Bus,
    CalendarDays,
    Clock,
    Users,
    Building2,
} from "lucide-react";
import api from "../../api/axios";

export default function OfferDetailsPage() {
    const { id } = useParams();

    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        api
            .get(`/api/offers/${id}`)
            .then((response) => {
                if (isMounted) {
                    setOffer(response.data);
                }
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

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-muted mt-3">Chargement de l’offre...</p>
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    {error || "Offre introuvable."}
                </div>

                <Link to="/offers" className="btn btn-outline-primary">
                    Retour aux offres
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <Link to="/offers" className="btn btn-link text-decoration-none mb-4 px-0">
                <ArrowLeft size={18} />
                Retour aux offres
            </Link>

            <div className="offer-details-card">
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-4 mb-4">
                    <div>
            <span className="badge bg-success-subtle text-success mb-3">
              {offer.status}
            </span>

                        <h1 className="fw-bold mb-2">{offer.title}</h1>

                        <p className="text-muted mb-0">
                            {offer.description || "Aucune description disponible."}
                        </p>
                    </div>

                    <div className="price-box">
                        <small>Prix</small>
                        <strong>{offer.price} MAD</strong>
                    </div>
                </div>

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
                            <small>Période</small>
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
                            <strong>{offer.shuttleName}</strong>
                        </div>
                    </div>
                </div>

                <div className="company-box mb-4">
                    <Building2 size={24} />

                    <div>
                        <small>Société de transport</small>
                        <strong>{offer.companyName}</strong>
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-3">
                    <Link to="/login" className="btn btn-primary btn-lg">
                        Se connecter pour réserver
                    </Link>

                    <Link to="/login" className="btn btn-outline-primary btn-lg">
                        Se connecter pour s’abonner
                    </Link>
                </div>
            </div>
        </div>
    );
}