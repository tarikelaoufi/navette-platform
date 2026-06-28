import { Link } from "react-router-dom";

export default function RegisterPage() {

    return (

        <div className="container py-5">

            <div className="auth-card mx-auto">

                <h2 className="fw-bold mb-2">Créer un compte</h2>



                <p className="text-muted mb-4">

                    Inscrivez-vous comme utilisateur.

                </p>



                <form>

                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <label className="form-label">Prénom</label>



                            <input

                                type="text"

                                className="form-control"

                                placeholder="Tarik"

                            />

                        </div>



                        <div className="col-md-6 mb-3">

                            <label className="form-label">Nom</label>



                            <input

                                type="text"

                                className="form-control"

                                placeholder="El Amrani"

                            />

                        </div>

                    </div>



                    <div className="mb-3">

                        <label className="form-label">Email</label>



                        <input

                            type="email"

                            className="form-control"

                            placeholder="email@example.com"

                        />

                    </div>



                    <div className="mb-3">

                        <label className="form-label">Téléphone</label>



                        <input

                            type="tel"

                            className="form-control"

                            placeholder="0600000000"

                        />

                    </div>



                    <div className="mb-4">

                        <label className="form-label">Mot de passe</label>



                        <input

                            type="password"

                            className="form-control"

                            placeholder="********"

                        />

                    </div>



                    <button

                        type="button"

                        className="btn btn-primary w-100"

                    >

                        Créer le compte

                    </button>

                </form>



                <div className="border-top mt-4 pt-4 text-center">

                    <p className="text-muted mb-2">

                        Vous représentez une société de transport ?

                    </p>



                    <Link

                        to="/company/register"

                        className="fw-semibold text-primary text-decoration-none"

                    >

                        Devenir partenaire

                    </Link>

                </div>



                <div className="text-center mt-3">

                    <span className="text-muted">

                        Vous avez déjà un compte ?{" "}

                    </span>



                    <Link

                        to="/login"

                        className="fw-semibold text-primary text-decoration-none"

                    >

                        Se connecter

                    </Link>

                </div>

            </div>

        </div>

    );

}