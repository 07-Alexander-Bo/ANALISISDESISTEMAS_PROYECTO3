import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Dashboard() {
  const [tanque, setTanque] = useState(null);
  const [familias, setFamilias] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [distribuciones, setDistribuciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tanque'),
      api.get('/familias'),
      api.get('/incidencias?estado=ABIERTA'),
      api.get('/distribuciones')
    ]).then(([t, f, i, d]) => {
      setTanque(t.data);
      setFamilias(f.data);
      setIncidencias(i.data);
      setDistribuciones(d.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">⏳ Cargando dashboard...</div>;

  const pct = tanque?.porcentaje ?? 0;
  const tankColor = pct < 20 ? 'red' : pct < 40 ? 'yellow' : 'green';
  const tankLabel = pct < 20 ? 'CRÍTICO' : pct < 40 ? 'PRECAUCIÓN' : 'NORMAL';
  const tankBadge = pct < 20 ? 'badge-red' : pct < 40 ? 'badge-yellow' : 'badge-green';

  const proximos = distribuciones
    .filter(d => d.estado === 'PROGRAMADA')
    .slice(0, 3);

  return (
    <div>
      {pct < 20 && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          ⚠️ <strong>ALERTA CRÍTICA:</strong> El nivel del tanque está al {pct}%. Se requiere atención inmediata.
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">👨‍👩‍👧</span>
          <span className="stat-value">{familias.length}</span>
          <span className="stat-label">Familias Registradas</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚠️</span>
          <span className="stat-value" style={{ color: incidencias.length > 0 ? 'var(--red)' : 'inherit' }}>
            {incidencias.length}
          </span>
          <span className="stat-label">Incidencias Abiertas</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🕐</span>
          <span className="stat-value">{proximos.length}</span>
          <span className="stat-label">Turnos Programados</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💧</span>
          <span className="stat-value" style={{ color: pct < 20 ? 'var(--red)' : pct < 40 ? 'var(--yellow)' : 'var(--green)' }}>
            {pct}%
          </span>
          <span className="stat-label">Nivel del Tanque</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Tanque card */}
        <div className="card">
          <div className="card-title">💧 Estado del Tanque Principal</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span>Nivel actual</span>
              <span style={{ fontWeight: 700 }}>{parseFloat(tanque?.nivel_actual).toLocaleString()} L de {parseFloat(tanque?.capacidad).toLocaleString()} L</span>
            </div>
            <div className="tank-bar">
              <div className={`tank-fill ${tankColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <span className={`badge ${tankBadge}`}>{tankLabel} — {pct}%</span>
            </div>
          </div>
        </div>

        {/* Próximas distribuciones */}
        <div className="card">
          <div className="card-title">🕐 Próximas Distribuciones</div>
          {proximos.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}>
              <div>No hay turnos programados</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Sector</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                </tr>
              </thead>
              <tbody>
                {proximos.map(d => (
                  <tr key={d.id_distribucion}>
                    <td>{d.sector?.nombre}</td>
                    <td>{new Date(d.fecha).toLocaleDateString('es-GT')}</td>
                    <td>{d.hora_inicio} - {d.hora_fin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Incidencias recientes */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title">⚠️ Incidencias Abiertas</div>
          {incidencias.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <div>No hay incidencias abiertas</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {incidencias.map(i => (
                    <tr key={i.id_incidencia}>
                      <td>INC-{String(i.id_incidencia).padStart(4, '0')}</td>
                      <td><span className="badge badge-yellow">{i.tipo}</span></td>
                      <td style={{ maxWidth: 300 }}>{i.descripcion}</td>
                      <td>{new Date(i.fecha_reporte).toLocaleDateString('es-GT')}</td>
                      <td><span className="badge badge-red">{i.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
