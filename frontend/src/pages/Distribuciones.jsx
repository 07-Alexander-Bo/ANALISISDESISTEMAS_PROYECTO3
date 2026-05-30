import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const ESTADO_BADGE = { PROGRAMADA: 'badge-blue', EN_CURSO: 'badge-green', COMPLETADA: 'badge-gray', CANCELADA: 'badge-red' };

export default function Distribuciones() {
  const [items, setItems] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id_sector: '', fecha: '', hora_inicio: '06:00', hora_fin: '09:00' });
  const [msg, setMsg] = useState(null);

  async function load() {
    const [d, s] = await Promise.all([api.get('/distribuciones'), api.get('/sectores')]);
    setItems(d.data);
    setSectores(s.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/distribuciones', form);
      setMsg({ type: 'success', text: 'Turno programado correctamente.' });
      setShowModal(false);
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: err.error === 'SCHEDULE_CONFLICT' ? 'Conflicto de horario con otro turno existente.' : 'Error al programar turno.' });
    }
  }

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="page-header">
        <h2>Programación de Distribución</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Programar Turno</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Sector</th><th>Fecha</th><th>Horario</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No hay turnos registrados.</td></tr>
              ) : items.map(d => (
                <tr key={d.id_distribucion}>
                  <td>{d.id_distribucion}</td>
                  <td style={{ fontWeight: 500 }}>{d.sector?.nombre}</td>
                  <td>{new Date(d.fecha).toLocaleDateString('es-GT')}</td>
                  <td>{d.hora_inicio} — {d.hora_fin}</td>
                  <td><span className={`badge ${ESTADO_BADGE[d.estado]}`}>{d.estado}</span></td>
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
              <span className="modal-title">Programar Turno de Distribución</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Sector *</label>
                <select value={form.id_sector} onChange={e => setForm({ ...form, id_sector: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {sectores.map(s => <option key={s.id_sector} value={s.id_sector}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha *</label>
                <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hora inicio *</label>
                  <input type="time" value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora fin *</label>
                  <input type="time" value={form.hora_fin} onChange={e => setForm({ ...form, hora_fin: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Confirmar Programación</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
