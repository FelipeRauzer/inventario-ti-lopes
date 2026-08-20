import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AtivosList from './pages/AtivosList';
import AtivoForm from './pages/AtivoForm';
import AtivoDetalhes from './pages/AtivoDetalhes';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
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
