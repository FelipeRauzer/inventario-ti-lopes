import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">📦 Inventário TI</span>
            <span className="text-xs text-gray-400">Lopes Distribuidora</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/" className={linkStyle('/')}>Dashboard</Link>
            <Link to="/ativos" className={linkStyle('/ativos')}>Ativos</Link>
            <Link to="/ativos/novo" className={linkStyle('/ativos/novo')}>+ Novo Ativo</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
