import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TopBar({ title }) {
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  const handleBusca = (e) => {
    e.preventDefault();
    if (busca.trim()) {
      navigate(`/ativos?busca=${busca}`);
    }
  };

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>

      <form className="topbar-search" onSubmit={handleBusca}>
        <input
          type="text"
          placeholder="Buscar ativo por hostname, IP, serial..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

      <div className="topbar-user">
        <div className="user-avatar">👤</div>
        <div>
          <div className="user-name">Felipe</div>
          <div className="user-role">Administrador</div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
