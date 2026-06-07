import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Bus,
    CalendarDays,
    Clock,
    Mail,
    MapPin,
    Phone,
    Search,
    ShieldCheck,
    Ticket,
    WalletCards,
} from "lucide-react";
import api from "../../api/axios";

const marketingMessages = [
    {
        badge: "Plateforme de navettes des autocars",
        title: "Trouvez une navette adaptée à vos trajets quotidiens.",
        description:
            "Cherchez les offres disponibles, achetez un billet simple, ou planifiez une demande de navette régulière selon votre besoin.",
    },
    {
        badge: "Réservation simple et rapide",
        title: "Achetez votre billet en quelques clics.",
        description:
            "Choisissez votre trajet, sélectionnez une date, puis envoyez votre demande à la société de transport pour confirmation.",
    },
    {
        badge: "Trajets réguliers",
        title: "Planifiez vos déplacements entre villes facilement.",
        description:
            "Pour le travail, les études ou les trajets fréquents, créez une demande de navette avec horaires, places et options souhaitées.",
    },
    {
        badge: "Offres et abonnements",
        title: "Billet simple ou abonnement, choisissez ce qui vous convient.",
        description:
            "Comparez le prix du billet ponctuel et le prix d’abonnement afin de mieux organiser vos déplacements.",
    },
];

export default function HomePage() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const isLoggedIn = Boolean(token);

    const [messageIndex] = useState(() => getRandomIndex(marketingMessages.length));
    const [offers, setOffers] = useState([]);
    const [visibleOfferStart, setVisibleOfferStart] = useState(0);
    const [loadingOffers, setLoadingOffers] = useState(true);

    const currentMessage = marketingMessages[messageIndex];

    const visibleOffers = useMemo(() => {
        if (offers.length === 0) {
            return [];
        }

        const maxVisibleOffers = Math.min(3, offers.length);

        return Array.from({ length: maxVisibleOffers }, (_, index) => {
            const offerIndex = (visibleOfferStart + index) % offers.length;
            return offers[offerIndex];
        });
    }, [offers, visibleOfferStart]);

    useEffect(() => {
        let isMounted = true;

        api
            .get("/api/offers")
            .then((response) => {
                if (!isMounted) return;

                const openOffers = response.data
                    .filter((offer) => offer.status === "OUVERTE")
                    .sort(() => Math.random() - 0.5);

                setOffers(openOffers);
            })
            .catch((error) => {
                console.error("HOME OFFERS ERROR:", error);

                if (isMounted) {
                    setOffers([]);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingOffers(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (offers.length <= 1) return undefined;

        const offersInterval = setInterval(() => {
            setVisibleOfferStart((previousStart) =>
                previousStart + 1 >= offers.length ? 0 : previousStart + 1
            );
        }, 3000);

        return () => clearInterval(offersInterval);
    }, [offers.length]);

    const getDashboardPath = () => {
        if (role === "ROLE_ADMIN") {
            return "/admin/dashboard";
        }

        if (role === "ROLE_COMPANY") {
            return "/company/dashboard";
        }

        return "/user/dashboard";
    };

    const heroOffer = visibleOffers[0];

    return (
        <div>
            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center min-vh-75 py-5">
                        <div className="col-lg-7">
                            <span className="badge bg-primary-subtle text-primary mb-3">
                                {currentMessage.badge}
                            </span>

                            <h1 className="display-4 fw-bold mb-4">
                                {currentMessage.title}
                            </h1>

                            <p className="lead text-muted mb-4">
                                {currentMessage.description}
                            </p>

                            <div className="d-flex gap-3 flex-wrap">
                                <Link
                                    to="/simple-reservation"
                                    className="btn btn-primary btn-lg d-flex align-items-center gap-2"
                                >
                                    Acheter un billet
                                    <ArrowRight size={20} />
                                </Link>

                                <Link
                                    to="/offers"
                                    className="btn btn-outline-primary btn-lg d-flex align-items-center gap-2"
                                >
                                    Voir les navettes
                                </Link>

                                {!isLoggedIn ? (
                                    <Link
                                        to="/register"
                                        className="btn btn-outline-primary btn-lg d-flex align-items-center gap-2"
                                    >
                                        Créer un compte
                                    </Link>
                                ) : (
                                    <Link
                                        to={getDashboardPath()}
                                        className="btn btn-outline-primary btn-lg d-flex align-items-center gap-2"
                                    >
                                        Accéder au dashboard
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-5 mt-5 mt-lg-0">
                            {heroOffer ? (
                                <div className="hero-card shadow-sm">
                                    <div className="icon-box bg-primary text-white">
                                        <Bus size={32} />
                                    </div>

                                    <span className="badge bg-success-subtle text-success mt-4 mb-2">
                                        Navette disponible
                                    </span>

                                    <h4 className="fw-bold mb-1">
                                        {heroOffer.departureCityName} →{" "}
                                        {heroOffer.arrivalCityName}
                                    </h4>

                                    <p className="text-muted mb-4">{heroOffer.title}</p>

                                    <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                                        <span>Départ</span>
                                        <strong>{formatTime(heroOffer.departureTime)}</strong>
                                    </div>

                                    <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                                        <span>Arrivée</span>
                                        <strong>{formatTime(heroOffer.arrivalTime)}</strong>
                                    </div>

                                    <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                                        <span>Billet simple</span>
                                        <strong>{formatPrice(heroOffer.ticketPrice)} MAD</strong>
                                    </div>

                                    <div className="d-flex justify-content-between mb-4">
                                        <span>Abonnement</span>
                                        <strong>{formatPrice(heroOffer.price)} MAD</strong>
                                    </div>

                                    <Link
                                        to={`/offers/${heroOffer.id}`}
                                        className="btn btn-primary w-100"
                                    >
                                        Voir détails
                                    </Link>
                                </div>
                            ) : (
                                <div className="hero-card shadow-sm">
                                    <div className="icon-box bg-primary text-white">
                                        <Bus size={32} />
                                    </div>

                                    <h4 className="fw-bold mt-4">Tanger → Tétouan</h4>

                                    <p className="text-muted mb-4">
                                        {loadingOffers
                                            ? "Chargement des navettes disponibles..."
                                            : "Recherchez une navette disponible selon votre trajet."}
                                    </p>

                                    <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                                        <span>Billet simple</span>
                                        <strong>À partir de 25 MAD</strong>
                                    </div>

                                    <div className="d-flex justify-content-between">
                                        <span>Abonnement</span>
                                        <strong>Disponible</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="row g-4 pb-4">
                        <div className="col-md-4">
                            <div className="feature-card">
                                <Search size={28} />
                                <h5>Recherche rapide</h5>
                                <p>Trouvez les navettes disponibles entre deux villes.</p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="feature-card">
                                <Ticket size={28} />
                                <h5>Billet simple</h5>
                                <p>Achetez un billet ponctuel avec validation par la société.</p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="feature-card">
                                <ShieldCheck size={28} />
                                <h5>Gestion sécurisée</h5>
                                <p>Espaces séparés pour utilisateur, société et administrateur.</p>
                            </div>
                        </div>
                    </div>

                    <section className="pb-5">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
                            <div>
                                <span className="badge bg-primary-subtle text-primary mb-2">
                                    Suggestions
                                </span>

                                <h2 className="fw-bold mb-1">Navettes disponibles</h2>

                                <p className="text-muted mb-0">
                                    Les offres changent automatiquement pour mettre en avant plusieurs
                                    trajets disponibles.
                                </p>
                            </div>

                            <Link to="/offers" className="btn btn-outline-primary">
                                Voir toutes les navettes
                            </Link>
                        </div>

                        {loadingOffers ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status" />
                                <p className="text-muted mt-3">Chargement des navettes...</p>
                            </div>
                        ) : visibleOffers.length === 0 ? (
                            <div className="empty-state">
                                <Bus size={44} />
                                <h4>Aucune navette disponible</h4>
                                <p>Les offres ouvertes seront affichées ici dès leur publication.</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {visibleOffers.map((offer) => (
                                    <div className="col-md-6 col-xl-4" key={offer.id}>
                                        <article className="offer-card h-100">
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
                                                    {formatTime(offer.departureTime)} →{" "}
                                                    {formatTime(offer.arrivalTime)}
                                                </span>

                                                <span>
                                                    <CalendarDays size={17} />
                                                    {offer.startDate} / {offer.endDate}
                                                </span>

                                                <span>
                                                    <Ticket size={17} />
                                                    Billet : {formatPrice(offer.ticketPrice)} MAD
                                                </span>

                                                <span>
                                                    <WalletCards size={17} />
                                                    Abonnement : {formatPrice(offer.price)} MAD
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center gap-3 mt-4">
                                                <small className="text-muted">
                                                    {offer.availablePlaces} places disponibles
                                                </small>

                                                <Link
                                                    to={`/offers/${offer.id}`}
                                                    className="btn btn-primary"
                                                >
                                                    Détails
                                                </Link>
                                            </div>
                                        </article>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="homepage-contact-section mb-5">
                        <div className="row align-items-center g-4">
                            <div className="col-lg-7">
                                <span className="badge bg-primary-subtle text-primary mb-3">
                                    Contact
                                </span>

                                <h2 className="fw-bold mb-3">
                                    Besoin d’aide ou d’informations ?
                                </h2>

                                <p className="text-muted mb-4">
                                    Notre équipe est disponible pour accompagner les utilisateurs,
                                    les sociétés de transport et les administrateurs dans
                                    l’utilisation de la plateforme Navette.
                                </p>

                                <div className="d-flex flex-wrap gap-3">
                                    <a
                                        href="mailto:contact@navette-platform.ma"
                                        className="btn btn-primary d-flex align-items-center gap-2"
                                    >
                                        <Mail size={18} />
                                        Nous contacter
                                    </a>

                                    <Link
                                        to="/register"
                                        className="btn btn-outline-primary d-flex align-items-center gap-2"
                                    >
                                        Devenir partenaire
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </div>

                            <div className="col-lg-5">
                                <div className="contact-info-card">
                                    <div className="contact-info-item">
                                        <div className="contact-info-icon">
                                            <Mail size={20} />
                                        </div>

                                        <div>
                                            <small>Email</small>
                                            <strong>contact@navette-platform.ma</strong>
                                        </div>
                                    </div>

                                    <div className="contact-info-item">
                                        <div className="contact-info-icon">
                                            <Phone size={20} />
                                        </div>

                                        <div>
                                            <small>Téléphone</small>
                                            <strong>+212 5 39 00 00 00</strong>
                                        </div>
                                    </div>

                                    <div className="contact-info-item">
                                        <div className="contact-info-icon">
                                            <MapPin size={20} />
                                        </div>

                                        <div>
                                            <small>Adresse</small>
                                            <strong>
                                                Gare routière de Kénitra <br />
                                                Quartier El Mellah, Kénitra, Maroc
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
}

function getRandomIndex(length) {
    if (!length) return 0;

    return Math.floor(Math.random() * length);
}

function formatTime(value) {
    if (!value) return "-";

    return value.toString().slice(0, 5);
}

function formatPrice(value) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    return Number(value).toFixed(2);
}