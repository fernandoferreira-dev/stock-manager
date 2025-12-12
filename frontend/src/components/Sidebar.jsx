import React, { useState, useEffect } from "react";
import { Menu, X, Home, FileText, Package, History, ClipboardList, BarChart3 } from "lucide-react";
import "../styles/Sidebar.css";

const Sidebar = ({ onNavigate, userRole, onToggle }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeId, setActiveId] = useState("home");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) onToggle(newState);
  };

  const userMenu = [
    { id: "home", label: "Home", icon: Home },
    { id: "request", label: "Requisitar", icon: FileText },
    { id: "myRequests", label: "Meus Pedidos", icon: ClipboardList },
  ];

  const adminMenu = [
    { id: "home", label: "Home", icon: Home },
    { id: "stock", label: "Stock", icon: Package },
    { id: "history", label: "HistÃ³rico", icon: History },
    { id: "requisitados", label: "Requisitados", icon: ClipboardList },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  const menuItems = userRole === "administrador" ? adminMenu : userMenu;
  const displayRole = userRole === "administrador" ? "Administrador" : "Utilizador";

  const handleNavigate = (id) => {
    setActiveId(id);
    onNavigate(id);
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {}
      <button
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        onClick={toggleSidebar}
        className="sidebar-toggle"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {}
      {isOpen && isMobile && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      {}
      <aside className={`sidebar ${!isOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">
          <p className="sidebar-role">{displayRole}</p>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.id)}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} className="sidebar-item-icon" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          ESTS Stock Manager
        </div>
      </aside>

      {}
      <div className="sidebar-spacer" style={{ display: isMobile ? 'none' : 'block' }} />
    </>
  );
};

export default Sidebar;
