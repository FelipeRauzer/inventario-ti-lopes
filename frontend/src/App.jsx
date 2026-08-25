import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AtivosList from './pages/AtivosList';
import AtivoForm from './pages/AtivoForm';
import AtivoDetalhes from './pages/AtivoDetalhes';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ativos" element={<AtivosList />} />
            <Route path="/ativos/novo" element={<AtivoForm />} />
            <Route path="/ativos/:id" element={<AtivoDetalhes />} />
            <Route path="/ativos/:id/editar" element={<AtivoForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
