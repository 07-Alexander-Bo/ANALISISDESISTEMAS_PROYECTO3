import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const NAV = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/familias', icon: '👨‍👩‍👧', label: 'Familias' },
  { path: '/sectores', icon: '🗺️', label: 'Sectores' },
  { path: '/distribuciones', icon: '🕐', label: 'Distribución' },
  { path: '/tanque', icon: '💧', label: 'Almacenamiento' },
  { path: '/pagos', icon: '💰', label: 'Aportes' },
  { path: '/incidencias', icon: '⚠️', label: 'Incidencias' },
  { path: '/mantenimiento', icon: '🔧', label: 'Mantenimiento' },
  { path: '/reportes', icon: '📄', label: 'Reportes' },
  { path: '/usuarios', icon: '👤', label: 'Usuarios' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const titles = {
    '/': 'Dashboard', '/familias': 'Familias', '/sectores': 'Sectores',
    '/distribuciones': 'Distribución de Agua', '/tanque': 'Control de Almacenamiento',
    '/pagos': 'Aportes Económicos', '/incidencias': 'Incidencias',
    '/mantenimiento': 'Mantenimiento', '/reportes': 'Reportes', '/usuarios': 'Usuarios'
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>💧 AquaControl</h2>
          <span>San Miguel v1.0.0</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 4 }}>{user?.nombre}</div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>{titles[location.pathname] || 'AquaControl'}</h1>
          <div className="topbar-user">
            <span>{user?.username}</span>
            <span className="badge-rol">{user?.rol}</span>
          </div>
        </header>
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
