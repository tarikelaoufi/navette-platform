export default function RegisterPage() {
    return (
        <div className="container py-5">
            <div className="auth-card mx-auto">
                <h2 className="fw-bold mb-2">Créer un compte</h2>
                <p className="text-muted mb-4">Inscrivez-vous comme utilisateur.</p>

                <form>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Prénom</label>
                            <input className="form-control" placeholder="Tarik" />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Nom</label>
                            <input className="form-control" placeholder="E" />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" placeholder="email@example.com" />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Téléphone</label>
                        <input className="form-control" placeholder="0600000000" />
                    </div>

                    <div className="mb-4">
                        <label className="form-label">Mot de passe</label>
                        <input type="password" className="form-control" placeholder="********" />
                    </div>

                    <button type="button" className="btn btn-primary w-100">
                        Créer le compte
                    </button>
                </form>
            </div>
        </div>
    );
}