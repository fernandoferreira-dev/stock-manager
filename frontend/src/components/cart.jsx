import { createContext, useContext, useState, useEffect } from "react";
import { X, Trash2, Send, ShoppingBag, User } from "lucide-react";
import { getAPIURL } from "../utils/apiUrl";
import "../styles/cart.css";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const savedCart = sessionStorage.getItem("cart");
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    useEffect(() => {
        if (cart.length > 0)
            sessionStorage.setItem("cart", JSON.stringify(cart));
        else sessionStorage.removeItem("cart");
    }, [cart]);

    const addToCart = (item) => {
        const existing = cart.find((i) => i.id_artigo === item.id_artigo);
        if (existing) {
            alert("Este artigo jÃ¡ estÃ¡ no carrinho!");
            return;
        }
        setCart([
            ...cart,
            {
                id_artigo: item.id_artigo,
                nome_artigo: item.nome_artigo,
                nome_cat: item.nome_cat,
            },
        ]);
    };

    const removeFromCart = (id_artigo) =>
        setCart(cart.filter((i) => i.id_artigo !== id_artigo));

    const clearCart = () => {
        if (window.confirm("Limpar todo o carrinho?")) {
            setCart([]);
        }
    };

    const getTotalItems = () => cart.length;

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const submitRequest = async (motivo, id_prof_pessoa) => {
        if (cart.length === 0) {
            alert("Carrinho vazio!");
            return;
        }

        if (!id_prof_pessoa) {
            alert("Por favor, selecione um professor responsÃ¡vel!");
            return;
        }

        try {
            const userId =
                sessionStorage.getItem("user_id") ||
                localStorage.getItem("user_id");
            const userType =
                sessionStorage.getItem("user_type") ||
                localStorage.getItem("user_type");

            if (!userId) {
                alert("VocÃª precisa estar logado para fazer uma reserva!");
                return;
            }

            const reservaData = {
                id_prof: id_prof_pessoa,
                id_aluno: userType === "aluno" ? userId : null,
                motivo: motivo || "RequisiÃ§Ã£o de material",
                data_reserva: new Date().toISOString().slice(0, 10),
                data_entrega: null,
                id_estado: "P",
                artigos: cart.map((item) => item.id_artigo),
            };

            console.log("Enviando reserva:", reservaData);

            const response = await fetch(`${getAPIURL()}/reservas.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reservaData),
            });

            const result = await response.json();

            if (result.success) {
                alert(
                    `${result.message}\nReserva #${result.id_reserva} criada!`
                );
                setCart([]);
                setIsCartOpen(false);
            } else {
                alert(`Erro: ${result.message}`);
            }
        } catch (error) {
            console.error("Erro ao enviar pedido:", error);
            alert("Erro ao enviar pedido. Tente novamente.");
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                isCartOpen,
                setIsCartOpen,
                toggleCart,
                addToCart,
                removeFromCart,
                clearCart,
                getTotalItems,
                submitRequest,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}

export function CartSidebar() {
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        clearCart,
        submitRequest,
        getTotalItems,
    } = useCart();

    const [motivo, setMotivo] = useState("");
    const [professores, setProfessores] = useState([]);
    const [professorSelecionado, setProfessorSelecionado] = useState("");
    const [loadingProfs, setLoadingProfs] = useState(false);
    const [userType, setUserType] = useState("");

    useEffect(() => {
        document.body.style.overflow = isCartOpen ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isCartOpen]);

    useEffect(() => {
        if (isCartOpen) {
            const type =
                sessionStorage.getItem("user_type") ||
                localStorage.getItem("user_type");
            setUserType(type);

            if (type === "aluno") {
                carregarProfessores();
            }
        }
    }, [isCartOpen]);

    const carregarProfessores = async () => {
        setLoadingProfs(true);
        try {
            const response = await fetch(`${getAPIURL()}/professores.php`);
            const data = await response.json();
            setProfessores(data);
        } catch (error) {
            console.error("Erro ao carregar professores:", error);
            alert("Erro ao carregar lista de professores");
        } finally {
            setLoadingProfs(false);
        }
    };

    const handleSubmit = () => {
        if (userType === "aluno" && !professorSelecionado) {
            alert("Por favor, selecione um professor responsÃ¡vel!");
            return;
        }

        const idProf =
            userType === "professor"
                ? sessionStorage.getItem("user_id") ||
                  localStorage.getItem("user_id")
                : professorSelecionado;

        submitRequest(motivo, idProf);
    };

    if (!isCartOpen) return null;

    return (
        <>
            <div
                className="cart-overlay"
                onClick={() => setIsCartOpen(false)}
            ></div>
            <div className="cart-sidebar">
                {}
                <div className="cart-header">
                    <div className="cart-title">
                        <ShoppingBag size={24} className="cart-icon" />
                        <h2>Carrinho ({getTotalItems()})</h2>
                    </div>
                    <button
                        className="close-btn"
                        onClick={() => setIsCartOpen(false)}
                        title="Fechar"
                    >
                        <X size={24} />
                    </button>
                </div>

                {}
                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-state">
                            <ShoppingBag size={80} />
                            <p>Seu carrinho estÃ¡ vazio</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div className="cart-item" key={item.id_artigo}>
                                <div className="item-info">
                                    <strong>{item.nome_artigo}</strong>
                                    {item.nome_cat && (
                                        <span className="item-category">
                                            {item.nome_cat}
                                        </span>
                                    )}
                                </div>
                                <button
                                    className="remove-btn-solo"
                                    onClick={() =>
                                        removeFromCart(item.id_artigo)
                                    }
                                    title="Remover item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {}
                {cart.length > 0 && (
                    <div className="cart-footer">
                        {userType === "aluno" && (
                            <div className="professor-section">
                                <label htmlFor="professor">
                                    <User size={16} />
                                    Professor ResponsÃ¡vel:{" "}
                                    <span className="required">*</span>
                                </label>
                                {loadingProfs ? (
                                    <div className="loading-select">
                                        Carregando professores...
                                    </div>
                                ) : (
                                    <select
                                        id="professor"
                                        value={professorSelecionado}
                                        onChange={(e) =>
                                            setProfessorSelecionado(
                                                e.target.value
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Selecione um professor
                                        </option>
                                        {professores.map((prof) => (
                                            <option
                                                key={prof.id_pessoa}
                                                value={prof.id_pessoa}
                                            >
                                                {prof.nome}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        <div className="motivo-section">
                            <label htmlFor="motivo">
                                Motivo da requisiÃ§Ã£o:
                            </label>
                            <textarea
                                id="motivo"
                                placeholder="Ex: Aula prÃ¡tica de redes, projeto final..."
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                rows="3"
                            />
                        </div>

                        <div className="total">
                            ðŸ“¦ Total: {getTotalItems()}{" "}
                            {getTotalItems() === 1 ? "item" : "itens"}
                        </div>

                        <div className="footer-buttons">
                            <button className="clear-btn" onClick={clearCart}>
                                <Trash2 size={16} /> Limpar
                            </button>
                            <button
                                className="submit-btn"
                                onClick={handleSubmit}
                            >
                                <Send size={16} /> Enviar Pedido
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

