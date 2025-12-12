
import { useState, useEffect } from "react";
import {
    Package,
    User,
    Calendar,
    FileText,
    Search,
    CheckCircle,
    XCircle,
    TruckIcon,
    PackageCheck,
} from "lucide-react";
import { getAPIURL } from "../utils/apiUrl";

import "../styles/pedidos.css";

export default function Pedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const API_URL = getAPIURL();
    const [cartoesDisponiveis, setCartoesDisponiveis] = useState({});

    useEffect(() => {
        fetchPedidos();
    }, []);
    const fetchCartoesDisponiveis = async (idArtigo) => {
        try {
            const response = await fetch(
                `${API_URL}/rfid.php?artigo=${idArtigo}`
            );
            const data = await response.json();
            return Array.isArray(data)
                ? data.filter((c) => c.estado === "disponivel").length
                : 0;
        } catch (err) {
            console.error("Erro ao buscar cartÃµes:", err);
            return 0;
        }
    };

    const fetchPedidos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/reservas.php`).then((r) =>
                r.json()
            );
            const data = response.data || response;

            if (!Array.isArray(data)) {
                console.error("Expected array, got:", data);
                setPedidos([]);
                setError("Resposta invÃ¡lida do servidor");
                return;
            }

            const mapped = await Promise.all(
                data.map(async (reserva) => {
                    const artigos = reserva.artigos || [];
                    const artigosComCartoes = await Promise.all(
                        artigos.map(async (artigo) => {
                            const numDisponiveis =
                                await fetchCartoesDisponiveis(artigo.id_artigo);
                            return {
                                ...artigo,
                                cartoesDisponiveis: numDisponiveis,
                            };
                        })
                    );

                    return {
                        id: reserva.id_reserva,
                        id_prof: reserva.id_prof,
                        id_aluno: reserva.id_aluno,
                        motivo: reserva.motivo_reserva,
                        data_reserva: reserva.data_reserva,
                        data_entrega_reserva: reserva.data_entrega_reserva,
                        id_estado: reserva.id_estado,
                        nome_estado: reserva.nome_estado,
                        nome_aluno: reserva.nome_aluno,
                        email_aluno: reserva.email_aluno,
                        nome_prof: reserva.nome_prof,
                        email_prof: reserva.email_prof,
                        artigos: artigosComCartoes,
                    };
                })
            );

            setPedidos(mapped);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Erro ao buscar reservas", err);
        } finally {
            setLoading(false);
        }
    };
    const handleUpdateStatus = async (pedidoId, acao) => {
        const messages = {
            aprovar: "Tem certeza que deseja aprovar esta reserva?",
            rejeitar: "Tem certeza que deseja rejeitar esta reserva?",
            marcar_levantado: "Confirmar que os materiais foram levantados?",
            devolver: "Confirmar devoluÃ§Ã£o dos materiais?",
        };

        if (!confirm(messages[acao])) return;

        try {
            const response = await fetch(`${API_URL}/reservas.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    acao: acao,
                    id_reserva: pedidoId,
                }),
            });

            const result = await response.json();
            if (!result.success)
                throw new Error(
                    result.message || "Falha ao atualizar reserva."
                );

            alert(result.message || "Reserva atualizada!");
            await fetchPedidos();
        } catch (err) {
            alert(`Erro: ${err.message}`);
        }
    };
    const getStatusInfo = (id_estado, nome_estado) => {
        const statusMap = {
            1: { label: "Pendente", class: "pendente", icon: Calendar },
            2: { label: "Aprovado", class: "aprovado", icon: CheckCircle },
            3: { label: "Rejeitado", class: "rejeitado", icon: XCircle },
            4: { label: "Em Uso", class: "levantado", icon: TruckIcon },
            5: { label: "Devolvido", class: "devolvido", icon: PackageCheck },
        };

        return (
            statusMap[id_estado] || {
                label: nome_estado || "Desconhecido",
                class: "pendente",
                icon: Calendar,
            }
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "â€”";
        return new Date(dateString).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const filteredPedidos = pedidos.filter((pedido) => {
        const matchesFilter = filter === "all" || pedido.id_estado === filter;
        const matchesSearch =
            pedido.id?.toString().includes(searchTerm) ||
            pedido.id_aluno?.toString().includes(searchTerm) ||
            pedido.motivo?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return <p className="loading-text">Carregando reservas...</p>;
    if (error)
        return (
            <div className="error-box">
                <p>Erro: {error}</p>
                <button onClick={fetchPedidos}>Tentar novamente</button>
            </div>
        );

    return (
        <div className="container">
            <h1>GestÃ£o de Reservas</h1>
            <p>AdministraÃ§Ã£o Â· {pedidos.length} reservas totais</p>

            <div className="filters-container">
                <div>
                    <button
                        className={filter === "all" ? "active all" : "all"}
                        onClick={() => setFilter("all")}
                    >
                        Todas ({pedidos.length})
                    </button>
                    <button
                        className={
                            filter === 1 ? "active pendente" : "pendente"
                        }
                        onClick={() => setFilter(1)}
                    >
                        Pendentes (
                        {pedidos.filter((p) => p.id_estado === 1).length})
                    </button>
                    <button
                        className={
                            filter === 2 ? "active aprovado" : "aprovado"
                        }
                        onClick={() => setFilter(2)}
                    >
                        Aprovadas (
                        {pedidos.filter((p) => p.id_estado === 2).length})
                    </button>
                    <button
                        className={
                            filter === 4 ? "active levantado" : "levantado"
                        }
                        onClick={() => setFilter(4)}
                    >
                        Em Uso (
                        {pedidos.filter((p) => p.id_estado === 4).length})
                    </button>
                    <button
                        className={
                            filter === 5 ? "active devolvido" : "devolvido"
                        }
                        onClick={() => setFilter(5)}
                    >
                        Devolvidas (
                        {pedidos.filter((p) => p.id_estado === 5).length})
                    </button>
                    <button
                        className={
                            filter === 3 ? "active rejeitado" : "rejeitado"
                        }
                        onClick={() => setFilter(3)}
                    >
                        Rejeitadas (
                        {pedidos.filter((p) => p.id_estado === 3).length})
                    </button>
                </div>

                <div className="search-input">
                    <input
                        type="text"
                        placeholder="Pesquisar por ID, aluno ou motivo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search />
                </div>
            </div>

            <div className="card-grid">
                {filteredPedidos.length === 0 ? (
                    <div className="card">
                        <Package
                            style={{
                                width: "40px",
                                height: "40px",
                                color: "#888",
                            }}
                        />
                        <p>Nenhuma reserva encontrada</p>
                    </div>
                ) : (
                    filteredPedidos.map((pedido) => {
                        const statusInfo = getStatusInfo(
                            pedido.id_estado,
                            pedido.nome_estado
                        );
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div key={pedido.id} className="card">
                                <div className="card-header">
                                    <div className="card-header-left">
                                        <div className="icon-bg">
                                            <Package />
                                        </div>
                                        <div>
                                            <h3>Reserva #{pedido.id}</h3>
                                            <p>
                                                <Calendar />{" "}
                                                {formatDate(
                                                    pedido.data_reserva
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`status-badge status-${statusInfo.class}`}
                                    >
                                        <StatusIcon size={16} />
                                        {statusInfo.label}
                                    </span>
                                </div>

                                <div className="user-info">
                                    <div className="user-name">
                                        <User /> Aluno:{" "}
                                        {pedido.nome_aluno || "N/A"}
                                    </div>
                                    <div className="user-email">
                                        {pedido.email_aluno || ""}
                                    </div>
                                </div>

                                {pedido.nome_prof && (
                                    <div className="user-info">
                                        <div className="user-name">
                                            Professor ResponsÃ¡vel:{" "}
                                            {pedido.nome_prof}
                                        </div>
                                        {pedido.email_prof && (
                                            <div className="user-email">
                                                {pedido.email_prof}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="items-list">
                                    <h4
                                        style={{
                                            margin: "10px 0 5px 0",
                                            fontSize: "14px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Artigos Pedidos:
                                    </h4>
                                    {pedido.artigos &&
                                    pedido.artigos.length > 0 ? (
                                        pedido.artigos.map((artigo, idx) => (
                                            <div key={idx} className="item">
                                                <div className="item-info">
                                                    <p
                                                        style={{
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        {artigo.nome_artigo ||
                                                            artigo.nome}
                                                    </p>
                                                    {}
                                                    {pedido.id_estado === 1 &&
                                                        (artigo.cartoesDisponiveis >
                                                        0 ? (
                                                            <p
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                    color: "#059669",
                                                                }}
                                                            >
                                                                âœ“{" "}
                                                                {
                                                                    artigo.cartoesDisponiveis
                                                                }{" "}
                                                                {artigo.cartoesDisponiveis ===
                                                                1
                                                                    ? "cartÃ£o disponÃ­vel"
                                                                    : "cartÃµes disponÃ­veis"}
                                                            </p>
                                                        ) : (
                                                            <p
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                    color: "#dc2626",
                                                                }}
                                                            >
                                                                âš ï¸ Sem cartÃ£o
                                                                NFC disponÃ­vel
                                                            </p>
                                                        ))}
                                                    {}
                                                    {pedido.id_estado === 2 &&
                                                        artigo.uid_nfc && (
                                                            <p
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                    color: "#3b82f6",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: "4px",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        display:
                                                                            "inline-block",
                                                                        width: "8px",
                                                                        height: "8px",
                                                                        borderRadius:
                                                                            "50%",
                                                                        backgroundColor:
                                                                            "#3b82f6",
                                                                    }}
                                                                ></span>
                                                                CartÃ£o
                                                                reservado:{" "}
                                                                {artigo.uid_nfc}
                                                            </p>
                                                        )}
                                                    {}
                                                    {pedido.id_estado === 4 &&
                                                        artigo.uid_nfc && (
                                                            <p
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                    color: "#059669",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: "4px",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        display:
                                                                            "inline-block",
                                                                        width: "8px",
                                                                        height: "8px",
                                                                        borderRadius:
                                                                            "50%",
                                                                        backgroundColor:
                                                                            "#059669",
                                                                    }}
                                                                ></span>
                                                                CartÃ£o
                                                                associado:{" "}
                                                                {artigo.uid_nfc}
                                                            </p>
                                                        )}
                                                    {}
                                                    {pedido.id_estado === 5 &&
                                                        artigo.uid_nfc && (
                                                            <p
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                    color: "#6b7280",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: "4px",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        display:
                                                                            "inline-block",
                                                                        width: "8px",
                                                                        height: "8px",
                                                                        borderRadius:
                                                                            "50%",
                                                                        backgroundColor:
                                                                            "#6b7280",
                                                                    }}
                                                                ></span>
                                                                CartÃ£o
                                                                previamente
                                                                associado:{" "}
                                                                {artigo.uid_nfc}
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p
                                            style={{
                                                fontSize: "12px",
                                                color: "#888",
                                            }}
                                        >
                                            Sem artigos associados
                                        </p>
                                    )}
                                </div>

                                {}
                                {pedido.id_estado === 1 && (
                                    <div className="card-actions">
                                        <button
                                            className="approve"
                                            onClick={() =>
                                                handleUpdateStatus(
                                                    pedido.id,
                                                    "aprovar"
                                                )
                                            }
                                            disabled={pedido.artigos.some(
                                                (a) =>
                                                    a.cartoesDisponiveis === 0
                                            )}
                                            style={{
                                                opacity: pedido.artigos.some(
                                                    (a) =>
                                                        a.cartoesDisponiveis ===
                                                        0
                                                )
                                                    ? 0.5
                                                    : 1,
                                                cursor: pedido.artigos.some(
                                                    (a) =>
                                                        a.cartoesDisponiveis ===
                                                        0
                                                )
                                                    ? "not-allowed"
                                                    : "pointer",
                                            }}
                                            title={
                                                pedido.artigos.some(
                                                    (a) =>
                                                        a.cartoesDisponiveis ===
                                                        0
                                                )
                                                    ? "NÃ£o Ã© possÃ­vel aprovar: sem cartÃµes NFC disponÃ­veis"
                                                    : ""
                                            }
                                        >
                                            Aprovar
                                        </button>
                                        <button
                                            className="reject"
                                            onClick={() =>
                                                handleUpdateStatus(
                                                    pedido.id,
                                                    "rejeitar"
                                                )
                                            }
                                        >
                                            Rejeitar
                                        </button>
                                    </div>
                                )}

                                {pedido.id_estado === 2 && (
                                    <div className="card-actions">
                                        <button
                                            className="collect"
                                            onClick={() =>
                                                handleUpdateStatus(
                                                    pedido.id,
                                                    "marcar_levantado"
                                                )
                                            }
                                        >
                                            Marcar como Levantado
                                        </button>
                                    </div>
                                )}

                                {pedido.id_estado === 4 && (
                                    <div className="card-actions">
                                        <button
                                            className="return"
                                            onClick={() =>
                                                handleUpdateStatus(
                                                    pedido.id,
                                                    "devolver"
                                                )
                                            }
                                        >
                                            Marcar como Devolvido
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

