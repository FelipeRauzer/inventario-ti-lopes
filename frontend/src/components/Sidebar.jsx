import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { section: 'PRINCIPAL', items: [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/ativos', label: 'Ativos', icon: '🖥️' },
    { path: '/ativos/novo', label: 'Novo Ativo', icon: '➕' },
    { path: '/movimentacoes', label: 'Movimentações', icon: '🔄' },
  ]},
  { section: 'CADASTROS', items: [
    { path: '/termos', label: 'Termos', icon: '📄' },
  ]},
];

const menuAdmin = [
  { section: 'ADMINISTRAÇÃO', items: [
    { path: '/usuarios', label: 'Usuários', icon: '👥' },
  ]},
];

function Sidebar() {
  const location = useLocation();
  const { usuario, fazerLogout } = useAuth();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/src/assets/logo-lopes.png" alt="Lopes" className="logo-img" />
        <div>
          <div className="logo-title">Lopes</div>
          <div className="logo-subtitle">Inventário TI</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((group) => (
          <div key={group.section} className="nav-group">
            <div className="nav-section">{group.section}</div>
            {group.items.map((item) => (
              <Link key={item.path} to={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}

        {/* Menu só pra admin */}
        {usuario?.admin && menuAdmin.map((group) => (
          <div key={group.section} className="nav-group">
            <div className="nav-section">{group.section}</div>
            {group.items.map((item) => (
              <Link key={item.path} to={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">👤</div>
          <div className="sidebar-user-email">{usuario?.email}</div>
        </div>
        <button onClick={fazerLogout} className="sidebar-logout">Sair</button>
      </div>

      <div className="sidebar-footer">
        <div className="footer-logo">Grupo Lopes</div>
        <div className="footer-text">Inventário TI v1.0</div>
      </div>
    </aside>
  );
}

export default Sidebar;