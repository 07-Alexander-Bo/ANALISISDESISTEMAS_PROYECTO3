import React, { useState } from 'react';
import { api } from '../services/api';

export default function Reportes() {
  const [reportePagos, setReportePagos] = useState(null);
  const [reporteInc, setReporteInc] = useState(null);
  const [reporteTanque, setReporteTanque] = useState(null);
  const [loading, setLoading] = useState({ pagos: false, inc: false, tanque: false });
  const [msg, setMsg] = useState(null);

  async function loadPagos() {
    setLoading(l => ({ ...l, pagos: true }));
    try {
      const res = await api.get('/reportes/pagos');
      setReportePagos(res);
    } catch { setMsg({ type: 'danger', text: 'Error al generar reporte de pagos.' }); }
    setLoading(l => ({ ...l, pagos: false }));
  }

  async function loadInc() {
    setLoading(l => ({ ...l, inc: true }));
    try {
      const res = await api.get('/reportes/incidencias');
      setReporteInc(res);
    } catch { setMsg({ type: 'danger', text: 'Error al generar reporte de incidencias.' }); }
    setLoading(l => ({ ...l, inc: false }));
  }

  async function loadTanque() {
    setLoading(l => ({ ...l, tanque: true }));
    try {
      const res = await api.get('/reportes/almacenamiento');
      setReporteTanque(res);
    } catch { setMsg({ type: 'danger', text: 'Error al generar reporte de almacenamiento.' }); }
    setLoading(l => ({ ...l, tanque: false }));
  }

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="page-header">
        <h2>Centro de Reportes</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        {[
          { label: 'Reporte de Pagos', icon: '💰', action: loadPagos, loading: loading.pagos },
          { label: 'Reporte de Incidencias', icon: '⚠️', action: loadInc, loading: loading.inc },
          { label: 'Reporte de Almacenamiento', icon: '💧', action: loadTanque, loading: loading.tanque },
        ].map(r => (
          <div className="card" key={r.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{r.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>{r.label}</div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={r.action} disabled={r.loading}>
              {r.loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        ))}
      </div>

      {/* Reporte Pagos */}
      {reportePagos && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">💰 Reporte de Pagos — Total: Q{reportePagos.total} ({reportePagos.cantidad} registros)</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Recibo</th><th>Familia</th><th>Mes</th><th>Monto</th><th>Estado</th></tr></thead>
              <tbody>
                {reportePagos.data.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: 24 }}>Sin datos.</td></tr>
                ) : reportePagos.data.map(p => (
                  <tr key={p.id_pago}>
                    <td style={{ fontFamily: 'monospace' }}>REC-{String(p.id_pago).padStart(5, '0')}</td>
                    <td>{p.familia?.nombre_responsable}</td>
                    <td>{p.mes_correspondiente}</td>
                    <td>Q{parseFloat(p.monto).toFixed(2)}</td>
                    <td><span className={`badge ${p.estado === 'PAGADO' ? 'badge-green' : 'badge-red'}`}>{p.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reporte Incidencias */}
      {reporteInc && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">⚠️ Reporte de Incidencias — Total: {reporteInc.cantidad}</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {Object.entries(reporteInc.resumen).map(([k, v]) => (
              <div key={k} className="stat-card" style={{ flex: 1 }}>
                <span className="stat-value" style={{ fontSize: 20 }}>{v}</span>
                <span className="stat-label">{k}</span>
              </div>
            ))}
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Tipo</th><th>Descripción</th><th>Fecha</th><th>Estado</th></tr></thead>
              <tbody>
                {reporteInc.data.map(i => (
                  <tr key={i.id_incidencia}>
                    <td>INC-{String(i.id_incidencia).padStart(4, '0')}</td>
                    <td>{i.tipo}</td>
                    <td style={{ maxWidth: 260 }}>{i.descripcion}</td>
                    <td>{new Date(i.fecha_reporte).toLocaleDateString('es-GT')}</td>
                    <td>{i.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reporte Tanque */}
      {reporteTanque && (
        <div className="card">
          <div className="card-title">💧 Reporte de Almacenamiento — Nivel actual: {reporteTanque.tanque.porcentaje}%</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Fecha</th><th>Nivel (L)</th><th>Porcentaje</th></tr></thead>
              <tbody>
                {reporteTanque.historial.map(h => {
                  const p = parseFloat(((h.nivel / reporteTanque.tanque.capacidad) * 100).toFixed(1));
                  return (
                    <tr key={h.id_historial}>
                      <td>{new Date(h.fecha).toLocaleString('es-GT')}</td>
                      <td>{parseFloat(h.nivel).toLocaleString()} L</td>
                      <td><span className={`badge ${p < 20 ? 'badge-red' : p < 40 ? 'badge-yellow' : 'badge-green'}`}>{p}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
