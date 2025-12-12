import { useState, useEffect } from "react";
import { useCart } from "./cart.jsx";
import { getAPIURL } from "../utils/apiUrl";
import "../styles/user.css";

export default function UserTable() {
    const { addToCart } = useCart();
    const [data, setData] = useState({ artigos: [], labs: [], categorias: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        lab: "all",
        categoria: "all",
        search: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [cartoesDisponiveis, setCartoesDisponiveis] = useState({});
    const itemsPerPage = 10;

    const API_URL = getAPIURL();

    useEffect(() => {
        fetchData();
    }, []);
    const fetchCartoesArtigo = async (idArtigo) => {
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

    const fetchData = async () => {
        try {
            setLoading(true);
            const [artigos, labs, categorias] = await Promise.all([
                fetch(`${API_URL}/artigo.php`).then((r) => r.json()),
                fetch(`${API_URL}/labs.php`).then((r) => r.json()),
                fetch(`${API_URL}/categorias.php`).then((r) => r.json()),
            ]);
            const cartoesMap = {};
            await Promise.all(
                artigos.map(async (artigo) => {
                    cartoesMap[artigo.id_artigo] = await fetchCartoesArtigo(
                        artigo.id_artigo
                    );
                })
            );

            setCartoesDisponiveis(cartoesMap);
            setData({ artigos, labs, categorias });
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const filtered = data.artigos.filter((a) => {
        const matchLab = filters.lab === "all" || a.id_lab == filters.lab;
        const matchCat =
            filters.categoria === "all" || a.id_cat == filters.categoria;
        const matchSearch =
            !filters.search ||
            a.nome_artigo
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
            (a.num_serial &&
                a.num_serial
                    .toLowerCase()
                    .includes(filters.search.toLowerCase()));
        return matchLab && matchCat && matchSearch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const current = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0)
            setCurrentPage(totalPages);
    }, [filtered.length, totalPages, currentPage]);

    if (loading)
        return <p className="loading-text">Carregando inventÃ¡rio...</p>;
    if (error)
        return (
            <div className="error-box">
                <p>Erro: {error}</p>
                <button className="retry-button" onClick={fetchData}>
                    Tentar novamente
                </button>
            </div>
        );

    return (
        <div className="container">
            <h1 className="title">InventÃ¡rio Stock Manager</h1>
            <p className="subtitle">{filtered.length} artigos encontrados</p>

            {}
            <div className="filters-container">
                <div className="filters-left">
                    <select
                        value={filters.lab}
                        onChange={(e) => updateFilter("lab", e.target.value)}
                    >
                        <option value="all">Todos os Labs</option>
                        {data.labs.map((l) => (
                            <option key={l.id_lab} value={l.id_lab}>
                                Lab {l.num_lab}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.categoria}
                        onChange={(e) =>
                            updateFilter("categoria", e.target.value)
                        }
                    >
                        <option value="all">Todas as Categorias</option>
                        {data.categorias.map((c) => (
                            <option key={c.id_cat} value={c.id_cat}>
                                {c.nome_cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filters-right">
                    <input
                        type="text"
                        placeholder="Pesquisar artigos..."
                        value={filters.search}
                        onChange={(e) => updateFilter("search", e.target.value)}
                    />
                </div>
            </div>

            {}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome do Artigo</th>
                            <th>Serial</th>
                            <th>Categoria</th>
                            <th>LaboratÃ³rio</th>
                            <th>Disponibilidade</th>
                            <th>AÃ§Ã£o</th>
                        </tr>
                    </thead>
                    <tbody>
                        {current.map((a) => {
                            const qtdDisponivel =
                                cartoesDisponiveis[a.id_artigo] || 0;
                            const disponivel = qtdDisponivel > 0;

                            return (
                                <tr key={a.id_artigo}>
                                    <td>{a.nome_artigo}</td>
                                    <td>{a.num_serial || "â€”"}</td>
                                    <td>{a.nome_cat || "â€”"}</td>
                                    <td>Lab {a.num_lab}</td>
                                    <td>
                                        <span
                                            style={{
                                                color: disponivel
                                                    ? "#16a34a"
                                                    : "#dc2626",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {qtdDisponivel}{" "}
                                            {qtdDisponivel === 1
                                                ? "disponÃ­vel"
                                                : "disponÃ­veis"}
                                        </span>
                                    </td>
                                    <td>
                                        {disponivel ? (
                                            <button
                                                className="add-button"
                                                onClick={() =>
                                                    addToCart({
                                                        id_artigo: a.id_artigo,
                                                        nome_artigo:
                                                            a.nome_artigo,
                                                        num_serial:
                                                            a.num_serial,
                                                    })
                                                }
                                            >
                                                Adicionar
                                            </button>
                                        ) : (
                                            <button
                                                className="add-button"
                                                disabled
                                                style={{
                                                    opacity: 0.5,
                                                    cursor: "not-allowed",
                                                }}
                                                title="Sem cartÃµes NFC disponÃ­veis"
                                            >
                                                IndisponÃ­vel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        â† Anterior
                    </button>
                    <span>
                        PÃ¡gina {currentPage} de {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Seguinte â†’
                    </button>
                </div>
            )}
        </div>
    );
}

