import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const initialFormData = {
    managerFirstName: "",
    managerLastName: "",
    companyName: "",
    professionalEmail: "",
    phone: "",
    address: "",
    password: "",
    passwordConfirmation: "",
};

export default function CompanyRegisterPage() {
    const [formData, setFormData] = useState(initialFormData);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        setMessage("");
        setError("");
    }

    function validateForm() {
        if (
            !formData.managerFirstName.trim() ||
            !formData.managerLastName.trim() ||
            !formData.companyName.trim() ||
            !formData.professionalEmail.trim() ||
            !formData.phone.trim() ||
            !formData.address.trim() ||
            !formData.password ||
            !formData.passwordConfirmation
        ) {
            setError("Veuillez remplir tous les champs.");
            return false;
        }

        if (formData.password.length < 6) {
            setError(
                "Le mot de passe doit contenir au moins 6 caractères."
            );
            return false;
        }

        if (
            formData.password !==
            formData.passwordConfirmation
        ) {
            setError(
                "Les mots de passe ne correspondent pas."
            );
            return false;
        }

        return true;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await api.post(
                "/api/auth/register-company",
                {
                    firstName:
                        formData.managerFirstName.trim(),
                    lastName:
                        formData.managerLastName.trim(),
                    companyName:
                        formData.companyName.trim(),
                    professionalEmail:
                        formData.professionalEmail
                            .trim()
                            .toLowerCase(),
                    phone: formData.phone.trim(),
                    address: formData.address.trim(),
                    password: formData.password,
                }
            );

            setMessage(
                response.data?.message ||
                "Votre demande de partenariat a été envoyée avec succès. Elle sera examinée par l’administrateur."
            );

            setFormData(initialFormData);
        } catch (requestError) {
            console.error(
                "COMPANY REGISTER ERROR:",
                requestError
            );

            const responseData =
                requestError.response?.data;

            if (typeof responseData === "string") {
                setError(responseData);
            } else {
                setError(
                    responseData?.message ||
                    responseData?.error ||
                    "Impossible d’envoyer la demande de partenariat."
                );
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="container py-5">
            <div
                className="auth-card mx-auto"
                style={{ maxWidth: "720px" }}
            >
                <div className="text-center mb-4">
                    <h2 className="fw-bold mb-2">
                        Devenir partenaire
                    </h2>

                    <p className="text-muted mb-0">
                        Inscrivez votre société de transport
                        sur la plateforme.
                    </p>
                </div>

                {error && (
                    <div
                        className="alert alert-danger"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {message && (
                    <div
                        className="alert alert-success"
                        role="alert"
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <h5 className="fw-bold mb-3">
                        Informations du responsable
                    </h5>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label
                                htmlFor="managerFirstName"
                                className="form-label"
                            >
                                Prénom
                            </label>

                            <input
                                id="managerFirstName"
                                name="managerFirstName"
                                type="text"
                                className="form-control"
                                placeholder="Ahmed"
                                value={
                                    formData.managerFirstName
                                }
                                onChange={handleChange}
                                disabled={submitting}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label
                                htmlFor="managerLastName"
                                className="form-label"
                            >
                                Nom
                            </label>

                            <input
                                id="managerLastName"
                                name="managerLastName"
                                type="text"
                                className="form-control"
                                placeholder="El Amrani"
                                value={
                                    formData.managerLastName
                                }
                                onChange={handleChange}
                                disabled={submitting}
                                required
                            />
                        </div>
                    </div>

                    <h5 className="fw-bold mt-3 mb-3">
                        Informations de la société
                    </h5>

                    <div className="mb-3">
                        <label
                            htmlFor="companyName"
                            className="form-label"
                        >
                            Nom de la société
                        </label>

                        <input
                            id="companyName"
                            name="companyName"
                            type="text"
                            className="form-control"
                            placeholder="Navette Express"
                            value={formData.companyName}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="professionalEmail"
                            className="form-label"
                        >
                            Email professionnel
                        </label>

                        <input
                            id="professionalEmail"
                            name="professionalEmail"
                            type="email"
                            className="form-control"
                            placeholder="contact@navetteexpress.ma"
                            value={
                                formData.professionalEmail
                            }
                            onChange={handleChange}
                            disabled={submitting}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="phone"
                            className="form-label"
                        >
                            Téléphone
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            className="form-control"
                            placeholder="0600000000"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="address"
                            className="form-label"
                        >
                            Adresse
                        </label>

                        <textarea
                            id="address"
                            name="address"
                            className="form-control"
                            rows="3"
                            placeholder="Tanger, Maroc"
                            value={formData.address}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                        />
                    </div>

                    <h5 className="fw-bold mt-4 mb-3">
                        Informations de connexion
                    </h5>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label
                                htmlFor="password"
                                className="form-label"
                            >
                                Mot de passe
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="form-control"
                                placeholder="********"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={submitting}
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-4">
                            <label
                                htmlFor="passwordConfirmation"
                                className="form-label"
                            >
                                Confirmer le mot de passe
                            </label>

                            <input
                                id="passwordConfirmation"
                                name="passwordConfirmation"
                                type="password"
                                className="form-control"
                                placeholder="********"
                                value={
                                    formData.passwordConfirmation
                                }
                                onChange={handleChange}
                                disabled={submitting}
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    <div className="alert alert-info">
                        La demande sera examinée par
                        l’administrateur avant l’activation du
                        compte société.
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                        disabled={submitting}
                    >
                        {submitting && (
                            <span
                                className="spinner-border spinner-border-sm"
                                aria-hidden="true"
                            />
                        )}

                        {submitting
                            ? "Envoi en cours..."
                            : "Envoyer la demande"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <span className="text-muted">
                        Vous avez déjà un compte société ?{" "}
                    </span>

                    <Link
                        to="/login"
                        className="fw-semibold text-primary text-decoration-none"
                    >
                        Se connecter
                    </Link>
                </div>

                <div className="text-center mt-2">
                    <Link
                        to="/register"
                        className="text-muted text-decoration-none"
                    >
                        Retour à l’inscription utilisateur
                    </Link>
                </div>
            </div>
        </div>
    );
}