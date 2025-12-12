import { useState, useEffect, Suspense, lazy } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/footer.jsx";
import { LoginForm } from "./components/login-form.jsx";
import { CartProvider, CartSidebar } from './components/cart.jsx';
import { jwtDecode } from "jwt-decode";

import "./styles/App.css";
import "./styles/globals.css";

const InventoryTable = lazy(() => import("./components/tableges.jsx"));
const UserInventoryTable = lazy(() => import("./components/tableuser.jsx"));
const Pedidos = lazy(() => import("./components/pedidos.jsx"));
const MeusPedidos = lazy(() => import("./components/meusPedidos.jsx"));
const ReportsTable = lazy(() => import("./components/reportsges.jsx"));
const HistoricoDevolucoes = lazy(() => import("./components/historicoDevolucoes.jsx"));

const PAGES = {
  HOME: "home",
  REQUEST: "request",
  MY_REQUESTS: "myRequests",
  HISTORY: "history",
  STOCK: "stock",
  REQUISITADOS: "requisitados",
  REPORTS: "reports",
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFooter, setShowFooter] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAuthenticated(true);
        setUserName(decoded.nome || decoded.email?.split("@")[0] || "Utilizador");
        setUserRole(decoded.role);

        sessionStorage.setItem('user_id', decoded.id_pessoa || decoded.id);
        sessionStorage.setItem('user_type', decoded.role === 'administrador' ? 'professor' : 'aluno');
      } catch (err) {
        console.error("Token invÃ¡lido ou expirado", err);
        localStorage.removeItem("auth_token");
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.body.offsetHeight;
      setShowFooter(scrollPosition >= pageHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem("auth_token", token);
    setIsAuthenticated(true);
    setUserName(user.nome_pessoa || user.email?.split("@")[0] || "Utilizador");
    setUserRole(user.role);
    setCurrentPage(PAGES.HOME);

    sessionStorage.setItem('user_id', user.id_pessoa || user.id);
    sessionStorage.setItem('user_type', user.role === 'administrador' ? 'professor' : 'aluno');
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_type');
    sessionStorage.removeItem('cart'); 
    setIsAuthenticated(false);
    setUserName(null);
    setUserRole(null);
    setCurrentPage(PAGES.HOME);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const AccessDenied = () => (
    <div className="access-denied">
      <h1 className="access-denied-title">Acesso Negado</h1>
      <p className="access-denied-text">NÃ£o tens permissÃ£o para ver esta pÃ¡gina.</p>
      <p className="access-denied-role">
        Role atual: <strong>{userRole || "indefinido"}</strong>
      </p>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case PAGES.HOME:
        return (
          <div className="home-page">
            <h1 className="home-title">
              Bem-vindo ao gestor de stock da ESTS
            </h1>
            <p className="home-description">
              Plataforma criada para facilitar a gestÃ£o de stock e garantir melhor organizaÃ§Ã£o do inventÃ¡rio da ESTS.
            </p>
            <p className="home-instruction">
              Usa o menu no canto para navegar.
            </p>
            <p className="home-user-info">
              Nome: <strong>{userName}</strong>  |  Cargo: <strong>{userRole || "indefinido"}</strong>
            </p>
            <img src="/Logoests.png" alt="Logo ESTS" className="home-logo" loading="lazy" />
          </div>
        );

      case PAGES.REQUEST:
        return (
          <Suspense fallback={<div>Carregando UserInventoryTable...</div>}>
            <UserInventoryTable />
          </Suspense>
        );

      case PAGES.MY_REQUESTS:
        return (
          <Suspense fallback={<div>Carregando MeusPedidos...</div>}>
            <MeusPedidos />
          </Suspense>
        );

      case PAGES.HISTORY:
        return userRole === "administrador" ? (
          <Suspense fallback={<div>Carregando HistÃ³rico...</div>}>
            <HistoricoDevolucoes />
          </Suspense>
        ) : (
          <AccessDenied />
        );

      case PAGES.REQUISITADOS:
        return userRole === "administrador" ? (
          <Suspense fallback={<div>Carregando Pedidos...</div>}>
            <Pedidos />
          </Suspense>
        ) : (
          <AccessDenied />
        );

      case PAGES.REPORTS:
        return userRole === "administrador" ? (
          <Suspense fallback={<div>Carregando Reports...</div>}>
            <ReportsTable />
          </Suspense>
        ) : (
          <AccessDenied />
        );

      case PAGES.STOCK:
        return userRole === "administrador" ? (
          <Suspense fallback={<div>Carregando InventoryTable...</div>}>
            <InventoryTable />
          </Suspense>
        ) : (
          <AccessDenied />
        );

      default:
        return <div>PÃ¡gina nÃ£o encontrada</div>;
    }
  };

  return (
    <CartProvider>
      <Navbar onLogout={handleLogout} userName={userName} />

      {}
      <CartSidebar />

      <Sidebar 
        onNavigate={handleNavigation} 
        userRole={userRole} 
        onToggle={setSidebarOpen}
      />
      <div className={`app-container ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
      <div className={`footer-wrapper ${showFooter ? 'footer-visible' : 'footer-hidden'} ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <Footer />
      </div>
    </CartProvider>
  );
};

export default App;
