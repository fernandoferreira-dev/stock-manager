
import { useState, useEffect } from "react";
import {
    Package,
    User,
    Mail,
    Calendar,
    CreditCard,
    AlertCircle,
    Clock,
} from "lucide-react";
import { getAPIURL } from "../utils/apiUrl";
import "../styles/admintb.css";

export default function HistoricoDevolucoes() {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtroNome, setFiltroNome] = useState("");
    const [filtroEmail, setFiltroEmail] = useState("");
    const itemsPerPage = 15;

    const API_URL = getAPIURL();

    useEffect(() => {
        fetchHistorico();
    }, []);

    const fetchHistorico = async () => {
        try {
            setLoading(true);
            const url = `${API_URL}/historico_devolucoes.php`;
            console.log("Fetching from:", url);

            const response = await fetch(url);
            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response:", errorText);
                throw new Error(
                    `Erro ao carregar histÃ³rico: ${response.status}`
                );
            }

            const data = await response.json();
            setHistorico(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Erro ao buscar histÃ³rico:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatarData = (data) => {
        if (!data) return "â€”";
        const date = new Date(data + "T00:00:00");
        return date.toLocaleDateString("pt-PT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const historicoFiltrado = historico.filter((item) => {
        const matchNome =
            !filtroNome ||
            item.nome_utilizador
                ?.toLowerCase()
                .includes(filtroNome.toLowerCase()) ||
            item.nome_professor
                ?.toLowerCase()
                .includes(filtroNome.toLowerCase()) ||
            item.codigo_uid?.toLowerCase().includes(filtroNome.toLowerCase());
        const matchEmail =
            !filtroEmail ||
            item.email_utilizador
                ?.toLowerCase()
                .includes(filtroEmail.toLowerCase()) ||
            item.email_professor
                ?.toLowerCase()
                .includes(filtroEmail.toLowerCase());

        return matchNome && matchEmail;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = historicoFiltrado.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(historicoFiltrado.length / itemsPerPage);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="spinner"></div>
                    <p className="loading-text">
                        Carregando histÃ³rico de devoluÃ§Ãµes...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-box">
                    <div className="error-header">
                        <AlertCircle size={24} />
                        <h3>Erro ao carregar dados</h3>
                    </div>
                    <p className="error-message">{error}</p>
                    <button onClick={fetchHistorico} className="retry-button">
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <h1 className="inventory-title">HistÃ³rico de DevoluÃ§Ãµes</h1>
                <p className="inventory-subtitle">
                    {historicoFiltrado.length}{" "}
                    {historicoFiltrado.length === 1
                        ? "devoluÃ§Ã£o registada"
                        : "devoluÃ§Ãµes registadas"}
                </p>
            </div>

            {}
            <div className="historico-filters">
                <input
                    type="text"
                    placeholder="Filtrar por nome de pessoa ou produto..."
                    value={filtroNome}
                    onChange={(e) => {
                        setFiltroNome(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="historico-filter-input"
                />
                <input
                    type="text"
                    placeholder="Filtrar por email..."
                    value={filtroEmail}
                    onChange={(e) => {
                        setFiltroEmail(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="historico-filter-input"
                />
            </div>

            {}
            <div className="historico-content">
                {}
                <div className="historico-table-desktop">
                    <div className="table-container">
                        <div className="table-wrapper">
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>CÃ³digo UID</th>
                                        <th>Utilizador</th>
                                        <th>Email Utilizador</th>
                                        <th>Professor ResponsÃ¡vel</th>
                                        <th>Email Professor</th>
                                        <th>Data DevoluÃ§Ã£o</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "2rem",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                {filtroNome || filtroEmail
                                                    ? "Nenhum resultado encontrado"
                                                    : "Nenhuma devoluÃ§Ã£o registada"}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((item) => (
                                            <tr
                                                key={item.id_historico}
                                                className="table-row"
                                            >
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "0.5rem",
                                                        }}
                                                    >
                                                        <CreditCard
                                                            size={16}
                                                            style={{
                                                                color: "#6b7280",
                                                            }}
                                                        />
                                                        <code
                                                            style={{
                                                                fontSize:
                                                                    "0.875rem",
                                                                backgroundColor:
                                                                    "#f3f4f6",
                                                                padding:
                                                                    "0.125rem 0.375rem",
                                                                borderRadius:
                                                                    "0.25rem",
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            {item.codigo_uid ||
                                                                "â€”"}
                                                        </code>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "0.5rem",
                                                        }}
                                                    >
                                                        <User
                                                            size={16}
                                                            style={{
                                                                color: "#3b82f6",
                                                            }}
                                                        />
                                                        <div
                                                            style={{
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            {item.nome_utilizador ||
                                                                "â€”"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "0.5rem",
                                                        }}
                                                    >
                                                        <Mail
                                                            size={16}
                                                            style={{
                                                                color: "#6b7280",
                                                            }}
                                                        />
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "0.875rem",
                                                                color: "#6b7280",
                                                            }}
                                                        >
                                                            {item.email_utilizador ||
                                                                "â€”"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "0.5rem",
                                                        }}
                                                    >
                                                        <User
                                                            size={16}
                                                            style={{
                                                                color: "#059669",
                                                            }}
                                                        />
                                                        <div
                                                            style={{
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            {item.nome_professor ||
                                                                "â€”"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "0.5rem",
                                                        }}
                                                    >
                                                        <Mail
                                                            size={16}
                                                            style={{
                                                                color: "#6b7280",
                                                            }}
                                                        />
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "0.875rem",
                                                                color: "#6b7280",
                                                            }}
                                                        >
                                                            {item.email_professor ||
                                                                "â€”"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "0.5rem",
                                                        }}
                                                    >
                                                        <Calendar
                                                            size={16}
                                                            style={{
                                                                color: "#15803d",
                                                            }}
                                                        />
                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    "0.875rem",
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            {formatarData(
                                                                item.data_devolucao
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {}
                <div className="historico-cards-mobile">
                    {currentItems.length === 0 ? (
                        <div className="historico-empty">
                            {filtroNome || filtroEmail
                                ? "Nenhum resultado encontrado"
                                : "Nenhuma devoluÃ§Ã£o registada"}
                        </div>
                    ) : (
                        currentItems.map((item) => (
                            <div
                                key={item.id_historico}
                                className="historico-card"
                            >
                                <div className="historico-card-header">
                                    <div className="historico-card-title">
                                        <CreditCard size={20} />
                                        <span>{item.codigo_uid}</span>
                                    </div>
                                </div>

                                <div className="historico-card-body">
                                    <div className="historico-card-row">
                                        <div className="historico-card-label">
                                            <User size={16} />
                                            <span>Utilizador</span>
                                        </div>
                                        <span className="historico-card-value">
                                            {item.nome_utilizador || "â€”"}
                                        </span>
                                    </div>

                                    <div className="historico-card-row">
                                        <div className="historico-card-label">
                                            <Mail size={16} />
                                            <span>Email Utilizador</span>
                                        </div>
                                        <span
                                            className="historico-card-value"
                                            style={{ fontSize: "0.875rem" }}
                                        >
                                            {item.email_utilizador || "â€”"}
                                        </span>
                                    </div>

                                    <div className="historico-card-row">
                                        <div className="historico-card-label">
                                            <User size={16} />
                                            <span>Professor ResponsÃ¡vel</span>
                                        </div>
                                        <span className="historico-card-value">
                                            {item.nome_professor || "â€”"}
                                        </span>
                                    </div>

                                    <div className="historico-card-row">
                                        <div className="historico-card-label">
                                            <Mail size={16} />
                                            <span>Email Professor</span>
                                        </div>
                                        <span
                                            className="historico-card-value"
                                            style={{ fontSize: "0.875rem" }}
                                        >
                                            {item.email_professor || "â€”"}
                                        </span>
                                    </div>

                                    <div className="historico-card-row">
                                        <div className="historico-card-label">
                                            <Calendar size={16} />
                                            <span>Data DevoluÃ§Ã£o</span>
                                        </div>
                                        <span className="historico-card-value historico-card-highlight">
                                            {formatarData(item.data_devolucao)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <p className="pagination-info">
                        Mostrando {indexOfFirstItem + 1} a{" "}
                        {Math.min(indexOfLastItem, historicoFiltrado.length)} de{" "}
                        {historicoFiltrado.length} registos
                    </p>
                    <div className="pagination-controls">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="pagination-button"
                        >
                            â† Anterior
                        </button>
                        <span className="pagination-text">
                            PÃ¡gina {currentPage} de {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="pagination-button"
                        >
                            Seguinte â†’
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

