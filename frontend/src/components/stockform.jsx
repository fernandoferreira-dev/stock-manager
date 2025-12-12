import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { getAPIURL } from "../utils/apiUrl";
import "../styles/stockform.css";

export default function InventoryFormModal({
    isOpen,
    onClose,
    onSave,
    editItem = null,
}) {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        quantity: 0,
        status: "available",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = getAPIURL();
    const token = localStorage.getItem("auth_token");

    useEffect(() => {
        if (editItem) {
            const { name, category, quantity, status } = editItem;
            setFormData({ name, category, quantity, status });
        } else {
            setFormData({
                name: "",
                category: "",
                quantity: 0,
                status: "available",
            });
        }
        setError(null);
    }, [editItem, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "quantity" ? parseInt(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = editItem
                ? `${API_URL}/inventory/${editItem.id}`
                : `${API_URL}/inventory`;
            const method = editItem ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao guardar item");
            }

            const data = await response.json();
            onSave(data.item);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="u-modal-backdrop">
            <div className="inventory-modal">
                <div className="inventory-modal__header">
                    <h2 className="inventory-modal__title">
                        {editItem ? "Editar Item" : "Adicionar Item"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="inventory-modal__close"
                        aria-label="Fechar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="inventory-modal__body u-form"
                >
                    {error && (
                        <div className="u-alert u-alert-danger">{error}</div>
                    )}

                    <div className="u-grid-2">
                        <div>
                            <label htmlFor="name" className="u-field-label">
                                Nome{" "}
                                <span className="inventory-modal__required">
                                    *
                                </span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="u-field-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="u-field-label">
                                Categoria{" "}
                                <span className="inventory-modal__required">
                                    *
                                </span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="u-field-select"
                            >
                                <option value="">Selecionar categoria</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Software">Software</option>
                                <option value="Peripherals">PerifÃ©ricos</option>
                                <option value="Networking">Rede</option>
                                <option value="Accessories">AcessÃ³rios</option>
                                <option value="Other">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="quantity" className="u-field-label">
                                Quantidade{" "}
                                <span className="inventory-modal__required">
                                    *
                                </span>
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="0"
                                required
                                className="u-field-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="u-field-label">
                                Estado{" "}
                                <span className="inventory-modal__required">
                                    *
                                </span>
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="u-field-select"
                            >
                                <option value="available">DisponÃ­vel</option>
                                <option value="low">Stock Baixo</option>
                                <option value="out">Fora de Stock</option>
                            </select>
                        </div>
                    </div>

                    <div className="inventory-modal__actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="u-btn u-btn-ghost"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="u-btn u-btn-primary"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    A guardar...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {editItem ? "Atualizar" : "Adicionar"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

