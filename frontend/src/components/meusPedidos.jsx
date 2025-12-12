import { useEffect, useState } from "react";
import {
    Package,
    Calendar,
    AlertTriangle,
    User,
    Box,
    XCircle,
} from "lucide-react";
import { getAPIURL } from "../utils/apiUrl";
import ReportSidebar from "../components/reportsSidebar.jsx";
import "../styles/MeusPedidos.css";

export default function MeusPedidos() {
    const [reservas, setReservas] = useState([]);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState("correntes");

    const API_URL = `${getAPIURL()}/reservas.php`;

    useEffect(() => {
        fetchReservas();
    }, []);

    const fetchReservas = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL).then((r) => r.json());
            const data = response.data || response;
            setReservas(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError("Erro ao carregar as tuas reservas");
        } finally {
            setLoading(false);
        }
    };

    const openReport = (reserva) => {
        setSelectedReserva(reserva);
        setIsReportOpen(true);
    };

    const handleCancelar = async (idReserva) => {
        if (!confirm("Tens a certeza que queres cancelar esta reserva?"))
            return;

        try {
            const response = await fetch(`${API_URL}?id=${idReserva}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            const result = await response.json();

            if (result.success) {
                alert("Reserva cancelada com sucesso!");
                fetchReservas();
            } else {
                alert("Erro ao cancelar reserva");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao cancelar reserva");
        }
    };

    const handleReportSubmit = async (report) => {
        try {
            console.log("Enviando report:", report);
            const response = await fetch(`${getAPIURL()}/reports.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(report),
            });

            console.log("Response status:", response.status);
            const result = await response.json();
            console.log("Response data:", result);

            if (response.ok && (result.message || result.id_report)) {
                alert("Report enviado com sucesso!");
                setIsReportOpen(false);
            } else {
                alert(
                    "Erro ao enviar report: " +
                        (result.error ||
                            result.errors?.join(", ") ||
                            "Erro desconhecido")
                );
            }
        } catch (error) {
            console.error("Erro completo:", error);
            alert("Erro ao enviar report: " + error.message);
        }
    };
    const getEstadoNome = (estadoId) => {
        const estados = {
            1: "Pendente",
            2: "Aprovado",
            3: "Rejeitado",
            4: "Em Uso",
            5: "Devolvido",
        };
        return estados[estadoId] || `Estado ${estadoId}`;
    };
    const getEstadoClass = (estadoId) => {
        const classes = {
            1: "status-pendente",
            2: "status-aprovado",
            3: "status-rejeitado",
            4: "status-levantado",
            5: "status-devolvido",
        };
        return classes[estadoId] || "status-default";
    };
    const reservasFiltradas = reservas.filter((r) => {
        if (filtro === "correntes") {
            return [1, 2, 4].includes(r.id_estado);
        } else {
            return [3, 5].includes(r.id_estado);
        }
    });

    if (loading)
        return <p className="loading-text">Carregando as tuas reservas...</p>;
    if (error)
        return (
            <div className="error-box">
                <p>{error}</p>
                <button onClick={fetchReservas}>Tentar novamente</button>
            </div>
        );

    return (
        <div className="container">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                }}
            >
                <div>
                    <h1>Os Meus Pedidos</h1>
                    <p>
                        {reservasFiltradas.length}{" "}
                        {reservasFiltradas.length === 1
                            ? "reserva encontrada"
                            : "reservas encontradas"}
                    </p>
                </div>

                {}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={() => setFiltro("correntes")}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "1px solid #e5e7eb",
                            background:
                                filtro === "correntes" ? "#3b82f6" : "white",
                            color: filtro === "correntes" ? "white" : "#374151",
                            fontWeight: "500",
                            cursor: "pointer",
                        }}
                    >
                        Correntes
                    </button>
                    <button
                        onClick={() => setFiltro("antigos")}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "1px solid #e5e7eb",
                            background:
                                filtro === "antigos" ? "#3b82f6" : "white",
                            color: filtro === "antigos" ? "white" : "#374151",
                            fontWeight: "500",
                            cursor: "pointer",
                        }}
                    >
                        Antigos
                    </button>
                </div>
            </div>

            <div className="card-grid">
                {reservasFiltradas.length === 0 ? (
                    <div className="card empty-card">
                        <Package
                            style={{ width: 40, height: 40, color: "#888" }}
                        />
                        <p>
                            {filtro === "correntes"
                                ? "NÃ£o tens reservas correntes"
                                : "NÃ£o tens reservas antigas"}
                        </p>
                    </div>
                ) : (
                    reservasFiltradas.map((r) => (
                        <div key={r.id_reserva} className="card">
                            <div className="card-header">
                                <div className="card-header-left">
                                    <div className="icon-bg">
                                        <Package />
                                    </div>
                                    <div>
                                        <h3>Reserva #{r.id_reserva}</h3>
                                        <p>
                                            <Calendar />{" "}
                                            {new Date(
                                                r.data_reserva
                                            ).toLocaleDateString("pt-PT")}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`status-badge ${getEstadoClass(
                                        r.id_estado
                                    )}`}
                                >
                                    {getEstadoNome(r.id_estado)}
                                </span>
                            </div>

                            {}
                            {(r.user_name || r.user_email) && (
                                <div className="user-info">
                                    {r.user_name && (
                                        <div className="user-name">
                                            <User /> {r.user_name}
                                        </div>
                                    )}
                                    {r.user_email && (
                                        <div className="user-email">
                                            {r.user_email}
                                        </div>
                                    )}
                                </div>
                            )}

                            {}
                            {r.motivo && (
                                <div className="motivo-box">
                                    <p>
                                        <strong>Motivo:</strong> {r.motivo}
                                    </p>
                                </div>
                            )}

                            {}
                            {r.artigos && r.artigos.length > 0 && (
                                <div className="items-list">
                                    <h4 className="items-title">
                                        <Box size={16} /> Artigos Pedidos
                                    </h4>
                                    {r.artigos.map((artigo, index) => (
                                        <div key={index} className="item">
                                            <div className="item-info">
                                                <p>{artigo.nome_artigo}</p>
                                                {artigo.num_serial && (
                                                    <p className="italic">
                                                        S/N: {artigo.num_serial}
                                                    </p>
                                                )}
                                                {artigo.categoria && (
                                                    <p className="italic">
                                                        <Box size={12} />{" "}
                                                        {artigo.categoria}
                                                    </p>
                                                )}
                                            </div>
                                            {artigo.quantidade && (
                                                <span className="item-quantity">
                                                    x{artigo.quantidade}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {}
                            {r.data_entrega && (
                                <div className="dates-info">
                                    <p className="date-item">
                                        <strong>Entrega prevista:</strong>{" "}
                                        {new Date(
                                            r.data_entrega
                                        ).toLocaleDateString("pt-PT")}
                                    </p>
                                </div>
                            )}

                            {}
                            <div className="card-actions">
                                {}
                                {r.id_estado === 1 && (
                                    <button
                                        className="cancel"
                                        onClick={() =>
                                            handleCancelar(r.id_reserva)
                                        }
                                    >
                                        <XCircle /> Cancelar Pedido
                                    </button>
                                )}

                                {}
                                {r.id_estado === 4 && (
                                    <button
                                        className="report"
                                        onClick={() => openReport(r)}
                                    >
                                        <AlertTriangle /> Reportar Problema
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ReportSidebar
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                reserva={selectedReserva}
                onSubmit={handleReportSubmit}
            />
        </div>
    );
}

