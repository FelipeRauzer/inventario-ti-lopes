import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AtivosList from './pages/AtivosList';
import AtivoForm from './pages/AtivoForm';
import AtivoDetalhes from './pages/AtivoDetalhes';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/ativos" element={
            <PrivateRoute>
              <Layout><AtivosList /></Layout>
            </PrivateRoute>
          } />
          <Route path="/ativos/novo" element={
            <PrivateRoute>
              <Layout><AtivoForm /></Layout>
            </PrivateRoute>
          } />
          <Route path="/ativos/:id" element={
            <PrivateRoute>
              <Layout><AtivoDetalhes /></Layout>
            </PrivateRoute>
          } />
          <Route path="/ativos/:id/editar" element={
            <PrivateRoute>
              <Layout><AtivoForm /></Layout>
            </PrivateRoute>
          } />

          {/* Redireciona qualquer rota desconhecida */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
