import React, { useState } from "react";
import "../styles/globals.css";
import "../styles/auth.css";
import { Eye, EyeOff } from "lucide-react";

import { getAPIURL } from "../utils/apiUrl";

export function LoginForm({ apiEndpoint }) {
    const endpoint = apiEndpoint || `${getAPIURL()}/auth.php?action=login`;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            setEmailError("Email Ã© obrigatÃ³rio");
            return false;
        }

        if (!emailRegex.test(email)) {
            setEmailError("Insira um email vÃ¡lido");
            return false;
        }

        const allowedDomains = ["estssetubal.ips.pt", "@estudantes.ips.pt"];
        const isValidDomain = allowedDomains.some((domain) =>
            email.toLowerCase().endsWith(domain)
        );

        if (!isValidDomain) {
            setEmailError(
                "Apenas emails (@ips.pt ou @estssetubal.ips.pt) sÃ£o permitidos"
            );
            return false;
        }

        setEmailError("");
        return true;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateEmail(email)) return;

        setIsLoading(true);

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            let data = {};
            try {
                data = await res.json();
            } catch (err) {
                throw new Error("Erro ao processar resposta do servidor");
            }

            if (!res.ok)
                throw new Error(data.message || "Erro ao efetuar login");
            if (!data.token || !data.user || !data.role)
                throw new Error("Resposta do servidor incompleta");
            localStorage.setItem("auth_token", data.token);
            localStorage.setItem("auth_user", JSON.stringify(data.user));
            localStorage.setItem("auth_role", data.role);
            if (data.role === "administrador") {
                window.location.href = "/admin/dashboard";
            } else {
                window.location.href = "/user/dashboard";
            }
        } catch (err) {
            setError(err.message || "Ocorreu um erro ao efetuar login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-screen">
            <div className="auth-card">
                <h1 className="auth-title">Bem-Vindo</h1>
                <p className="auth-subtitle">Aceda Ã  sua conta</p>

                {error && <div className="auth-alert">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div>
                        <label htmlFor="email" className="auth-label">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                validateEmail(e.target.value);
                            }}
                            required
                            className={`auth-input-field ${
                                emailError ? "is-invalid" : ""
                            }`}
                            placeholder="exemplo@ips.pt"
                        />
                        {emailError && (
                            <p className="auth-error-text">{emailError}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="auth-label">
                            Palavra-passe
                        </label>
                        <div className="auth-input">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="auth-input-field"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="auth-input-toggle"
                                aria-label={
                                    showPassword
                                        ? "Ocultar palavra-passe"
                                        : "Mostrar palavra-passe"
                                }
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="u-btn u-btn-dark auth-submit"
                    >
                        {isLoading ? "A entrar..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

