import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Sectores() {
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '', prioridad: 1 });
  const [msg, setMsg] = useState(null);

  async function load() {
    const res = await api.get('/sectores');
    setSectores(res.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/sectores', form);
      setMsg({ type: 'success', text: 'Sector creado correctamente.' });
      setShowModal(false);
      setForm({ nombre: '', descripcion: '', prioridad: 1 });
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Error al crear sector.' });
    }
  }

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="page-header">
        <h2>Control de Sectores ({sectores.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Sector</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Prioridad</th><th>Familias</th></tr>
            </thead>
            <tbody>
              {sectores.map(s => (
                <tr key={s.id_sector}>
                  <td>{s.id_sector}</td>
                  <td style={{ fontWeight: 600 }}>{s.nombre}</td>
                  <td>{s.descripcion || '—'}</td>
                  <td><span className="badge badge-blue">{s.prioridad}</span></td>
                  <td>{s._count?.familias ?? 0}</td>
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
              <span className="modal-title">Nuevo Sector</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Prioridad (1 = más alta)</label>
                <input type="number" min={1} value={form.prioridad} onChange={e => setForm({ ...form, prioridad: parseInt(e.target.value) })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Crear Sector</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
