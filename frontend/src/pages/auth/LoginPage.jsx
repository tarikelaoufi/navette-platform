import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/api/auth/login", formData);

            const data = response.data;

            localStorage.setItem("token", data.token);
            localStorage.setItem("tokenType", data.tokenType);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("email", data.email);
            localStorage.setItem("role", data.role);

            if (data.role === "ROLE_ADMIN") {
                navigate("/admin/dashboard");
            } else if (data.role === "ROLE_COMPANY") {
                navigate("/company/dashboard");
            } else {
                navigate("/user/dashboard");
            }
        } catch (error) {
            console.error("LOGIN ERROR:", error);
            console.error("STATUS:", error.response?.status);
            console.error("DATA:", error.response?.data);

            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Email ou mot de passe incorrect."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="auth-card mx-auto">
                <h2 className="fw-bold mb-2">Connexion</h2>
                <p className="text-muted mb-4">Connectez-vous à votre compte.</p>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="********"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>
            </div>
        </div>
    );
}