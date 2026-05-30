import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const ESTADO_BADGE = { ABIERTA: 'badge-red', EN_PROCESO: 'badge-yellow', RESUELTA: 'badge-green', CERRADA: 'badge-gray' };

export default function Incidencias() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tipo: 'FUGA', descripcion: '', id_familia: '' });
  const [familias, setFamilias] = useState([]);
  const [msg, setMsg] = useState(null);

  async function load() {
    const [i, f] = await Promise.all([api.get('/incidencias'), api.get('/familias')]);
    setItems(i.data);
    setFamilias(f.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/incidencias', form);
      setMsg({ type: 'success', text: 'Incidencia reportada correctamente.' });
      setShowModal(false);
      setForm({ tipo: 'FUGA', descripcion: '', id_familia: '' });
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Error al reportar incidencia.' });
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await api.put(`/incidencias/${id}/estado`, { estado });
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Error al actualizar estado.' });
    }
  }

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="page-header">
        <h2>Gestión de Incidencias ({items.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Reportar Incidencia</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Tipo</th><th>Descripción</th><th>Familia</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No hay incidencias registradas.</td></tr>
              ) : items.map(i => (
                <tr key={i.id_incidencia}>
                  <td style={{ fontFamily: 'monospace' }}>INC-{String(i.id_incidencia).padStart(4, '0')}</td>
                  <td><span className="badge badge-yellow">{i.tipo}</span></td>
                  <td style={{ maxWidth: 250 }}>{i.descripcion}</td>
                  <td>{i.familia?.nombre_responsable || '—'}</td>
                  <td>{new Date(i.fecha_reporte).toLocaleDateString('es-GT')}</td>
                  <td><span className={`badge ${ESTADO_BADGE[i.estado]}`}>{i.estado}</span></td>
                  <td>
                    {i.estado === 'ABIERTA' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => cambiarEstado(i.id_incidencia, 'EN_PROCESO')}>En proceso</button>
                    )}
                    {i.estado === 'EN_PROCESO' && (
                      <button className="btn btn-success btn-sm" onClick={() => cambiarEstado(i.id_incidencia, 'RESUELTA')}>Resolver</button>
                    )}
                    {i.estado === 'RESUELTA' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => cambiarEstado(i.id_incidencia, 'CERRADA')}>Cerrar</button>
                    )}
                  </td>
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
              <span className="modal-title">Reportar Incidencia</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Tipo de incidencia *</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} required>
                  <option value="FUGA">Fuga</option>
                  <option value="AVERIA">Avería</option>
                  <option value="RECLAMO">Reclamo</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Familia que reporta</label>
                <select value={form.id_familia} onChange={e => setForm({ ...form, id_familia: e.target.value })}>
                  <option value="">— Sin familia asociada —</option>
                  {familias.map(f => <option key={f.id_familia} value={f.id_familia}>{f.nombre_responsable}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Descripción *</label>
                <textarea rows={4} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} required placeholder="Describa el problema con el mayor detalle posible..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Enviar Reporte</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
