import { ShoppingCart } from "lucide-react";
import { useCart } from "./cart.jsx";
import { getAPIURL } from "../utils/apiUrl";
import "../styles/Navbar.css";

const Navbar = ({ onLogout, userName, userRole }) => {
    const { toggleCart, getTotalItems } = useCart();

    const handleLogout = async () => {
        try {
            await fetch(`${getAPIURL()}/auth/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "auth_token"
                    )}`,
                },
            });
        } catch (err) {
            console.log(err);
        }
        if (onLogout) onLogout();
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <a href="/">InforEstudantes</a>
            </div>

            <ul className="navbar-menu">
                {}
                {userRole !== "administrador" && (
                    <li>
                        <button
                            className="cart-btn"
                            onClick={toggleCart}
                            title="Ver Carrinho"
                        >
                            <ShoppingCart />
                            {getTotalItems() > 0 && (
                                <span className="cart-badge">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>
                    </li>
                )}

                <li>
                    <span className="user-name">{userName || "PERFIL"}</span>
                </li>

                <li>
                    <button className="logout-btn" onClick={handleLogout}>
                        SAIR
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;

