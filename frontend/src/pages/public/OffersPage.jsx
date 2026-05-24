export default function OffersPage() {
    return (
        <div className="container py-5">
            <div className="mb-4">
                <h1 className="fw-bold">Offres disponibles</h1>
                <p className="text-muted">
                    Ici on affichera les offres depuis Spring Boot avec Axios.
                </p>
            </div>

            <div className="alert alert-info">
                Next step: connecter cette page à <strong>GET /api/offers</strong>.
            </div>
        </div>
    );
}