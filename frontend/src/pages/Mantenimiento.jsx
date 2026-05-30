import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Mantenimiento() {
  const [items, setItems] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tipo: 'PREVENTIVO', descripcion: '', costo: '0', fecha: new Date().toISOString().split('T')[0], id_incidencia: '' });
  const [msg, setMsg] = useState(null);

  async function load() {
    const [m, i] = await Promise.all([api.get('/mantenimiento'), api.get('/incidencias')]);
    setItems(m.data);
    setIncidencias(i.data.filter(i => i.estado !== 'CERRADA'));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/mantenimiento', { ...form, costo: parseFloat(form.costo), id_incidencia: form.id_incidencia || null });
      setMsg({ type: 'success', text: 'Mantenimiento registrado correctamente.' });
      setShowModal(false);
      setForm({ tipo: 'PREVENTIVO', descripcion: '', costo: '0', fecha: new Date().toISOString().split('T')[0], id_incidencia: '' });
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Error al registrar mantenimiento.' });
    }
  }

  if (loading) return <div className="loading">Cargando...</div>;

  const totalCosto = items.reduce((s, m) => s + parseFloat(m.costo), 0);

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="page-header">
        <h2>Registro de Mantenimiento</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Registrar Mantenimiento</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <span className="stat-icon">🔧</span>
          <span className="stat-value">{items.length}</span>
          <span className="stat-label">Intervenciones totales</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💸</span>
          <span className="stat-value">Q{totalCosto.toFixed(2)}</span>
          <span className="stat-label">Costo acumulado</span>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Tipo</th><th>Descripción</th><th>Costo</th><th>Fecha</th><th>Responsable</th><th>Incidencia</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No hay registros de mantenimiento.</td></tr>
              ) : items.map(m => (
                <tr key={m.id_mantenimiento}>
                  <td>{m.id_mantenimiento}</td>
                  <td><span className={`badge ${m.tipo === 'PREVENTIVO' ? 'badge-blue' : 'badge-yellow'}`}>{m.tipo}</span></td>
                  <td style={{ maxWidth: 280 }}>{m.descripcion}</td>
                  <td style={{ fontWeight: 600 }}>Q{parseFloat(m.costo).toFixed(2)}</td>
                  <td>{new Date(m.fecha).toLocaleDateString('es-GT')}</td>
                  <td>{m.usuario?.nombre || '—'}</td>
                  <td>{m.id_incidencia ? `INC-${String(m.id_incidencia).padStart(4, '0')}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Registrar Mantenimiento</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    <option value="PREVENTIVO">Preventivo</option>
                    <option value="CORRECTIVO">Correctivo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descripción *</label>
                <textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Costo (Q) *</label>
                  <input type="number" step="0.01" min="0" value={form.costo} onChange={e => setForm({ ...form, costo: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Incidencia relacionada</label>
                  <select value={form.id_incidencia} onChange={e => setForm({ ...form, id_incidencia: e.target.value })}>
                    <option value="">— Ninguna —</option>
                    {incidencias.map(i => <option key={i.id_incidencia} value={i.id_incidencia}>INC-{String(i.id_incidencia).padStart(4, '0')} — {i.tipo}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Registrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
