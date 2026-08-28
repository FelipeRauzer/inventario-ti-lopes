import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <div className="loading">Carregando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
