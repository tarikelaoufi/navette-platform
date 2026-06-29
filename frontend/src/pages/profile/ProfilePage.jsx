import { useEffect, useState } from "react";
import {
    Building2,
    KeyRound,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import api from "../../api/axios";

export default function ProfilePage() {
    const userId = localStorage.getItem("userId");

    const [profile, setProfile] = useState(null);

    const [personalForm, setPersonalForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    const [companyForm, setCompanyForm] = useState({
        companyName: "",
        professionalEmail: "",
        phone: "",
        address: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(true);
    const [savingPersonal, setSavingPersonal] = useState(false);
    const [savingCompany, setSavingCompany] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isCompany =
        profile?.role === "ROLE_COMPANY" ||
        Boolean(profile?.companyId);

    const loadProfile = async () => {
        setError("");

        if (!userId) {
            setError(
                "Utilisateur introuvable. Veuillez vous reconnecter."
            );
            setLoading(false);
            return;
        }

        try {
            const response = await api.get(
                "/api/profile",
                {
                    params: {
                        userId,
                    },
                }
            );

            const currentProfile = response.data;

            setProfile(currentProfile);

            setPersonalForm({
                firstName:
                    currentProfile.firstName || "",
                lastName:
                    currentProfile.lastName || "",
                email:
                    currentProfile.email || "",
                phone:
                    currentProfile.phone || "",
            });

            setCompanyForm({
                companyName:
                    currentProfile.companyName || "",
                professionalEmail:
                    currentProfile.professionalEmail || "",
                phone:
                    currentProfile.companyPhone || "",
                address:
                    currentProfile.address || "",
            });
        } catch (requestError) {
            console.error(
                "LOAD PROFILE ERROR:",
                requestError
            );

            setError(
                getApiErrorMessage(
                    requestError,
                    "Impossible de charger votre profil."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadProfile();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const handlePersonalChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setPersonalForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));
    };

    const handleCompanyChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setCompanyForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));
    };

    const handlePasswordChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setPasswordForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));
    };

    const handlePersonalSubmit = async (event) => {
        event.preventDefault();

        setSavingPersonal(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.put(
                `/api/profile/${userId}`,
                personalForm
            );

            setProfile(response.data);

            localStorage.setItem(
                "email",
                response.data.email
            );

            window.dispatchEvent(
                new Event("profile-updated")
            );

            setSuccess(
                "Informations personnelles modifiées avec succès."
            );
        } catch (requestError) {
            console.error(
                "UPDATE PERSONAL PROFILE ERROR:",
                requestError
            );

            setError(
                getApiErrorMessage(
                    requestError,
                    "Impossible de modifier vos informations personnelles."
                )
            );
        } finally {
            setSavingPersonal(false);
        }
    };

    const handleCompanySubmit = async (event) => {
        event.preventDefault();

        setSavingCompany(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.put(
                `/api/profile/${userId}/company`,
                companyForm
            );

            setProfile(response.data);

            setSuccess(
                "Informations de la société modifiées avec succès."
            );
        } catch (requestError) {
            console.error(
                "UPDATE COMPANY PROFILE ERROR:",
                requestError
            );

            setError(
                getApiErrorMessage(
                    requestError,
                    "Impossible de modifier les informations de la société."
                )
            );
        } finally {
            setSavingCompany(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {
            setError(
                "La confirmation du nouveau mot de passe est incorrecte."
            );
            return;
        }

        setSavingPassword(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.put(
                `/api/profile/${userId}/password`,
                passwordForm
            );

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setSuccess(
                response.data?.message ||
                "Mot de passe modifié avec succès."
            );
        } catch (requestError) {
            console.error(
                "UPDATE PASSWORD ERROR:",
                requestError
            );

            setError(
                getApiErrorMessage(
                    requestError,
                    "Impossible de modifier le mot de passe."
                )
            );
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div
                    className="spinner-border text-primary"
                    role="status"
                />

                <p className="text-muted mt-3">
                    Chargement de votre profil...
                </p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-page-header">
                <div>
                    <h1 className="fw-bold mb-1">
                        Mon profil
                    </h1>

                    <p className="text-muted mb-0">
                        Gérez vos informations personnelles
                        et la sécurité de votre compte.
                    </p>
                </div>

                <div className="dashboard-page-role">
                    <ShieldCheck size={18} />
                    {getRoleLabel(profile?.role)}
                </div>
            </div>

            {success && (
                <div
                    className="alert alert-success"
                    role="alert"
                >
                    {success}
                </div>
            )}

            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <section className="dashboard-section mb-4">
                <div className="section-header">
                    <div>
                        <h4 className="mb-1">
                            Informations personnelles
                        </h4>

                        <p className="text-muted mb-0">
                            Modifiez les informations liées
                            à votre compte.
                        </p>
                    </div>

                    <span>
                        <UserRound size={17} />
                    </span>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-4">
                    <span
                        className={`badge ${getUserStatusBadgeClass(
                            profile?.status
                        )}`}
                    >
                        Compte : {profile?.status}
                    </span>

                    {isCompany && (
                        <span
                            className={`badge ${getCompanyStatusBadgeClass(
                                profile?.companyStatus
                            )}`}
                        >
                            Société : {profile?.companyStatus}
                        </span>
                    )}
                </div>

                <form onSubmit={handlePersonalSubmit}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">
                                Prénom
                            </label>

                            <div className="input-icon-box">
                                <UserRound size={18} />

                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-control"
                                    value={personalForm.firstName}
                                    onChange={handlePersonalChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Nom
                            </label>

                            <div className="input-icon-box">
                                <UserRound size={18} />

                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-control"
                                    value={personalForm.lastName}
                                    onChange={handlePersonalChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Email de connexion
                            </label>

                            <div className="input-icon-box">
                                <Mail size={18} />

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={personalForm.email}
                                    onChange={handlePersonalChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Téléphone personnel
                            </label>

                            <div className="input-icon-box">
                                <Phone size={18} />

                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    placeholder="0600000000"
                                    value={personalForm.phone}
                                    onChange={handlePersonalChange}
                                />
                            </div>
                        </div>

                        <div className="col-12">
                            <button
                                type="submit"
                                className="btn btn-primary d-inline-flex align-items-center gap-2"
                                disabled={savingPersonal}
                            >
                                {savingPersonal ? (
                                    <span className="spinner-border spinner-border-sm" />
                                ) : (
                                    <Save size={17} />
                                )}

                                {savingPersonal
                                    ? "Enregistrement..."
                                    : "Enregistrer les modifications"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            {isCompany && (
                <section className="dashboard-section mb-4">
                    <div className="section-header">
                        <div>
                            <h4 className="mb-1">
                                Informations de la société
                            </h4>

                            <p className="text-muted mb-0">
                                Modifiez les coordonnées
                                professionnelles de la société.
                            </p>
                        </div>

                        <span>
                            <Building2 size={17} />
                        </span>
                    </div>

                    <form onSubmit={handleCompanySubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">
                                    Nom de la société
                                </label>

                                <div className="input-icon-box">
                                    <Building2 size={18} />

                                    <input
                                        type="text"
                                        name="companyName"
                                        className="form-control"
                                        value={companyForm.companyName}
                                        onChange={handleCompanyChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">
                                    Email professionnel
                                </label>

                                <div className="input-icon-box">
                                    <Mail size={18} />

                                    <input
                                        type="email"
                                        name="professionalEmail"
                                        className="form-control"
                                        value={companyForm.professionalEmail}
                                        onChange={handleCompanyChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">
                                    Téléphone de la société
                                </label>

                                <div className="input-icon-box">
                                    <Phone size={18} />

                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-control"
                                        placeholder="0500000000"
                                        value={companyForm.phone}
                                        onChange={handleCompanyChange}
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">
                                    Adresse
                                </label>

                                <div className="input-icon-box">
                                    <MapPin size={18} />

                                    <input
                                        type="text"
                                        name="address"
                                        className="form-control"
                                        value={companyForm.address}
                                        onChange={handleCompanyChange}
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <button
                                    type="submit"
                                    className="btn btn-primary d-inline-flex align-items-center gap-2"
                                    disabled={savingCompany}
                                >
                                    {savingCompany ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        <Save size={17} />
                                    )}

                                    {savingCompany
                                        ? "Enregistrement..."
                                        : "Enregistrer la société"}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            )}

            <section className="dashboard-section">
                <div className="section-header">
                    <div>
                        <h4 className="mb-1">
                            Modifier le mot de passe
                        </h4>

                        <p className="text-muted mb-0">
                            Saisissez votre mot de passe actuel
                            avant de choisir le nouveau.
                        </p>
                    </div>

                    <span>
                        <KeyRound size={17} />
                    </span>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">
                                Mot de passe actuel
                            </label>

                            <input
                                type="password"
                                name="currentPassword"
                                className="form-control"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">
                                Nouveau mot de passe
                            </label>

                            <input
                                type="password"
                                name="newPassword"
                                className="form-control"
                                minLength="6"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">
                                Confirmer le mot de passe
                            </label>

                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-control"
                                minLength="6"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="col-12">
                            <button
                                type="submit"
                                className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                                disabled={savingPassword}
                            >
                                {savingPassword ? (
                                    <span className="spinner-border spinner-border-sm" />
                                ) : (
                                    <KeyRound size={17} />
                                )}

                                {savingPassword
                                    ? "Modification..."
                                    : "Modifier le mot de passe"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </div>
    );
}

function getRoleLabel(role) {
    if (role === "ROLE_ADMIN") {
        return "Administrateur";
    }

    if (role === "ROLE_COMPANY") {
        return "Société";
    }

    return "Utilisateur";
}

function getUserStatusBadgeClass(status) {
    if (status === "ACTIF") {
        return "bg-success-subtle text-success";
    }

    if (status === "EN_ATTENTE") {
        return "bg-warning-subtle text-warning";
    }

    if (status === "BLOQUE") {
        return "bg-danger-subtle text-danger";
    }

    return "bg-secondary-subtle text-secondary";
}

function getCompanyStatusBadgeClass(status) {
    if (status === "VALIDEE") {
        return "bg-success-subtle text-success";
    }

    if (status === "EN_ATTENTE") {
        return "bg-warning-subtle text-warning";
    }

    if (status === "REFUSEE") {
        return "bg-danger-subtle text-danger";
    }

    if (status === "BLOQUEE") {
        return "bg-dark-subtle text-dark";
    }

    return "bg-secondary-subtle text-secondary";
}

function getApiErrorMessage(
    requestError,
    fallbackMessage
) {
    const responseData =
        requestError?.response?.data;

    if (typeof responseData === "string") {
        return responseData;
    }

    if (
        responseData &&
        typeof responseData === "object"
    ) {
        const validationMessage =
            Object.values(responseData)
                .find((value) =>
                    typeof value === "string"
                );

        if (validationMessage) {
            return validationMessage;
        }
    }

    return (
        responseData?.message ||
        responseData?.error ||
        requestError?.message ||
        fallbackMessage
    );
}
