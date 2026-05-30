import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Familias from './pages/Familias';
import Sectores from './pages/Sectores';
import Distribuciones from './pages/Distribuciones';
import Tanque from './pages/Tanque';
import Pagos from './pages/Pagos';
import Incidencias from './pages/Incidencias';
import Mantenimiento from './pages/Mantenimiento';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="familias" element={<Familias />} />
            <Route path="sectores" element={<Sectores />} />
            <Route path="distribuciones" element={<Distribuciones />} />
            <Route path="tanque" element={<Tanque />} />
            <Route path="pagos" element={<Pagos />} />
            <Route path="incidencias" element={<Incidencias />} />
            <Route path="mantenimiento" element={<Mantenimiento />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
