
import { useEffect, useState } from "react";
import {
    Trash2,
    FileText,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Search,
} from "lucide-react";
import { getAPIURL } from "../utils/apiUrl";
import ResolveReportModal from "./resolveReportModal";
import "../styles/reportsges.css";

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const API_URL = `${getAPIURL()}/reports.php`;

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_URL);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            setReports(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Erro ao carregar reports.");
        } finally {
            setLoading(false);
        }
    };

    const deleteReport = async (id_report) => {
        if (!confirm("Tem certeza que deseja remover este report?")) return;

        try {
            const res = await fetch(`${API_URL}/${id_report}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();

            if (result.message) {
                alert("Report removido com sucesso!");
                setReports(reports.filter((r) => r.id_report !== id_report));
            } else {
                alert("Falha ao remover report");
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao remover report: " + err.message);
        }
    };

    const openResolveModal = (report) => {
        setSelectedReport(report);
        setIsResolveModalOpen(true);
    };

    const closeResolveModal = () => {
        setSelectedReport(null);
        setIsResolveModalOpen(false);
    };

    const handleResolve = async () => {
        await fetchReports();
        closeResolveModal();
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const translateTipo = (tipo) => {
        const tipos = {
            quebrado: "Avariado",
            faltando: "Em falta",
            funcionamento: "Mau funcionamento",
            outro: "Outro",
        };
        return tipos[tipo] || tipo;
    };

    const filteredReports = reports.filter((report) => {
        const matchesFilter =
            filter === "all" || (filter === "resolvido" ? false : true);

        const matchesSearch =
            report.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.descricao
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            report.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.email?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    if (loading) return <div className="loading">Carregando reports...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-reports-container">
            <header className="reports-header">
                <div>
                    <h1>
                        <FileText size={28} /> GestÃ£o de Reports
                    </h1>
                    <p className="total-reports">
                        Total: {reports.length} reports
                    </p>
                </div>
            </header>

            <div className="filters-search-container">
                <div className="filters-buttons">
                    <button
                        className={
                            filter === "all"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() => setFilter("all")}
                    >
                        Todos ({reports.length})
                    </button>
                    <button
                        className={
                            filter === "por_resolver"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() => setFilter("por_resolver")}
                    >
                        Por Resolver ({reports.length})
                    </button>
                    <button
                        className={
                            filter === "resolvido"
                                ? "filter-btn active disabled"
                                : "filter-btn disabled"
                        }
                        disabled
                    >
                        Resolvidos (0)
                    </button>
                </div>

                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar por tÃ­tulo, descriÃ§Ã£o, nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredReports.length === 0 ? (
                <div className="no-reports">
                    <FileText size={48} />
                    <p>Nenhum report encontrado.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th style={{ width: "50px" }}></th>
                                <th>Tipo</th>
                                <th>TÃ­tulo</th>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Motivo Reserva</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((r) => (
                                <>
                                    <tr
                                        key={r.id_report}
                                        className={
                                            expandedRows.has(r.id_report)
                                                ? "expanded-row"
                                                : ""
                                        }
                                    >
                                        <td>
                                            <button
                                                className="expand-btn"
                                                onClick={() =>
                                                    toggleRow(r.id_report)
                                                }
                                                title="Ver descriÃ§Ã£o"
                                            >
                                                {expandedRows.has(
                                                    r.id_report
                                                ) ? (
                                                    <ChevronUp size={18} />
                                                ) : (
                                                    <ChevronDown size={18} />
                                                )}
                                            </button>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge badge-${r.tipo}`}
                                            >
                                                {translateTipo(r.tipo)}
                                            </span>
                                        </td>
                                        <td className="titulo-cell">
                                            {r.titulo}
                                        </td>
                                        <td>{r.nome || "-"}</td>
                                        <td className="email-cell">
                                            {r.email || "-"}
                                        </td>
                                        <td>{r.reserva_motivo || "-"}</td>
                                        <td className="date-cell">
                                            {r.data_reserva
                                                ? new Date(
                                                      r.data_reserva
                                                  ).toLocaleString("pt-PT")
                                                : "-"}
                                        </td>
                                    </tr>
                                    {expandedRows.has(r.id_report) && (
                                        <tr
                                            key={`${r.id_report}-details`}
                                            className="details-row"
                                        >
                                            <td></td>
                                            <td colSpan="6">
                                                <div className="report-details-expanded">
                                                    <h3 className="details-title">
                                                        DescriÃ§Ã£o
                                                    </h3>
                                                    <div className="description-box">
                                                        <p>{r.descricao}</p>
                                                    </div>
                                                    <div className="action-buttons-expanded">
                                                        <button
                                                            className="resolve-btn-full"
                                                            onClick={() =>
                                                                openResolveModal(
                                                                    r
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle
                                                                size={18}
                                                            />
                                                            Resolver
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isResolveModalOpen && selectedReport && (
                <ResolveReportModal
                    report={selectedReport}
                    onClose={closeResolveModal}
                    onResolve={handleResolve}
                />
            )}
        </div>
    );
}

