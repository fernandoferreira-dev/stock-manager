
import { useState, useEffect } from "react";
import { X, RefreshCw, Save, Package } from "lucide-react";
import { getAPIURL } from "../utils/apiUrl";
import "../styles/resolveReportModal.css";

export default function ResolveReportModal({ report, onClose, onResolve }) {
    const [artigos, setArtigos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replacements, setReplacements] = useState({});
    const [nfcsByArtigo, setNfcsByArtigo] = useState({});

    useEffect(() => {
        fetchArtigosReserva();
    }, [report.id_reserva]);

    const fetchArtigosReserva = async () => {
        try {
            const res = await fetch(
                `${getAPIURL()}/reservas.php?id=${report.id_reserva}`
            );
            const data = await res.json();

            if (data && data.artigos && Array.isArray(data.artigos)) {
                setArtigos(data.artigos);
                await fetchNFCsForArtigos(data.artigos);
            } else {
                console.error(
                    "Artigos nÃ£o encontrados ou formato invÃ¡lido:",
                    data
                );
                setArtigos([]);
            }
        } catch (error) {
            console.error("Erro ao buscar artigos:", error);
            setArtigos([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchNFCsForArtigos = async (artigosList) => {
        const nfcsMap = {};

        for (const artigo of artigosList) {
            try {
                const res = await fetch(
                    `${getAPIURL()}/nfc_cards.php?id_artigo=${
                        artigo.id_artigo
                    }&ativos=true`
                );
                const data = await res.json();
                nfcsMap[artigo.id_artigo] = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error(
                    `Erro ao buscar NFCs para artigo ${artigo.id_artigo}:`,
                    error
                );
                nfcsMap[artigo.id_artigo] = [];
            }
        }

        setNfcsByArtigo(nfcsMap);
    };

    const handleNFCChange = (idArtigo, newNFCId) => {
        setReplacements({
            ...replacements,
            [idArtigo]: newNFCId,
        });
    };

    const handleResolve = async () => {
        if (Object.keys(replacements).length === 0) {
            if (
                !confirm(
                    "Nenhuma troca de NFC foi feita. Deseja marcar como resolvido assim mesmo?"
                )
            ) {
                return;
            }
        }

        try {
            if (Object.keys(replacements).length > 0) {
                const res = await fetch(`${getAPIURL()}/nfc_cards.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "replace_nfc",
                        replacements: replacements,
                        id_reserva: report.id_reserva,
                    }),
                });

                if (!res.ok) {
                    throw new Error("Erro ao processar trocas de NFC");
                }
            }
            const deleteRes = await fetch(
                `${getAPIURL()}/reports/${report.id_report}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }
            );

            const deleteResult = await deleteRes.json();

            if (!deleteRes.ok) {
                throw new Error(deleteResult.error || "Erro ao remover report");
            }

            alert("Report resolvido com sucesso!");
            onResolve();
        } catch (error) {
            console.error(error);
            alert("Erro ao resolver report: " + error.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="resolve-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Resolver Report #{report.id_report}</h2>
                        <p className="report-tipo">
                            <span className={`badge badge-${report.tipo}`}>
                                {report.tipo}
                            </span>
                            <span className="report-titulo">
                                {report.titulo}
                            </span>
                        </p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="report-details">
                        <p>
                            <strong>DescriÃ§Ã£o:</strong> {report.descricao}
                        </p>
                        <p>
                            <strong>Utilizador:</strong> {report.nome} (
                            {report.email})
                        </p>
                        <p>
                            <strong>Motivo Reserva:</strong>{" "}
                            {report.reserva_motivo}
                        </p>
                    </div>

                    <div className="artigos-section">
                        <h3>
                            <Package size={20} /> Artigos da Reserva
                        </h3>
                        {loading ? (
                            <p className="loading-text">
                                Carregando artigos...
                            </p>
                        ) : artigos.length === 0 ? (
                            <p className="no-artigos">
                                Nenhum artigo encontrado nesta reserva.
                            </p>
                        ) : (
                            <table className="artigos-table">
                                <thead>
                                    <tr>
                                        <th>Artigo</th>
                                        <th>Subcategoria</th>
                                        <th>NFC Atual</th>
                                        <th>Trocar por NFC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {artigos.map((artigo) => (
                                        <tr key={artigo.id_artigo}>
                                            <td>{artigo.nome_artigo}</td>
                                            <td>
                                                {artigo.nome_subcat ||
                                                    artigo.categoria ||
                                                    "-"}
                                            </td>
                                            <td>
                                                <span className="nfc-badge">
                                                    {artigo.uid_nfc ||
                                                        "Sem NFC"}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    className="nfc-select"
                                                    value={
                                                        replacements[
                                                            artigo.id_artigo
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleNFCChange(
                                                            artigo.id_artigo,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        NÃ£o trocar
                                                    </option>
                                                    {(
                                                        nfcsByArtigo[
                                                            artigo.id_artigo
                                                        ] || []
                                                    ).filter(
                                                        (nfc) =>
                                                            nfc.id_cartao_nfc !==
                                                            artigo.id_cartao_nfc
                                                    ).length === 0 ? (
                                                        <option disabled>
                                                            Sem NFCs disponÃ­veis
                                                        </option>
                                                    ) : (
                                                        nfcsByArtigo[
                                                            artigo.id_artigo
                                                        ]
                                                            .filter(
                                                                (nfc) =>
                                                                    nfc.id_cartao_nfc !==
                                                                    artigo.id_cartao_nfc
                                                            )
                                                            .map((nfc) => (
                                                                <option
                                                                    key={
                                                                        nfc.id_cartao_nfc
                                                                    }
                                                                    value={
                                                                        nfc.id_cartao_nfc
                                                                    }
                                                                >
                                                                    {
                                                                        nfc.codigo_uid
                                                                    }
                                                                </option>
                                                            ))
                                                    )}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="resolve-btn-submit"
                        onClick={handleResolve}
                    >
                        <Save size={18} />
                        Marcar como Resolvido
                    </button>
                </div>
            </div>
        </div>
    );
}

