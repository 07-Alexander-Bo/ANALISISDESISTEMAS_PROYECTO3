import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Familias() {
  const [familias, setFamilias] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre_responsable: '', direccion: '', telefono: '', id_sector: '' });
  const [msg, setMsg] = useState(null);

  async function load() {
    const [f, s] = await Promise.all([api.get('/familias'), api.get('/sectores')]);
    setFamilias(f.data);
    setSectores(s.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = familias.filter(f =>
    f.nombre_responsable.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/familias', form);
      setMsg({ type: 'success', text: 'Familia registrada correctamente.' });
      setShowModal(false);
      setForm({ nombre_responsable: '', direccion: '', telefono: '', id_sector: '' });
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: err.error === 'DUPLICATE_FAMILY' ? 'Ya existe una familia con ese nombre en este sector.' : 'Error al registrar familia.' });
    }
  }

  const estadoBadge = { ACTIVA: 'badge-green', SUSPENDIDA: 'badge-yellow', INACTIVA: 'badge-gray' };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="page-header">
        <h2>Padrón de Familias ({familias.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nueva Familia</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre Responsable</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Sector</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No se encontraron familias.</td></tr>
              ) : filtered.map(f => (
                <tr key={f.id_familia}>
                  <td style={{ color: '#999' }}>{f.id_familia}</td>
                  <td style={{ fontWeight: 500 }}>{f.nombre_responsable}</td>
                  <td>{f.direccion}</td>
                  <td>{f.telefono || '—'}</td>
                  <td>{f.sectores?.[0]?.sector?.nombre || '—'}</td>
                  <td><span className={`badge ${estadoBadge[f.estado] || 'badge-gray'}`}>{f.estado}</span></td>
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
              <span className="modal-title">Registrar Nueva Familia</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nombre del Responsable *</label>
                <input value={form.nombre_responsable} onChange={e => setForm({ ...form, nombre_responsable: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección *</label>
                <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sector *</label>
                  <select value={form.id_sector} onChange={e => setForm({ ...form, id_sector: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {sectores.map(s => <option key={s.id_sector} value={s.id_sector}>{s.nombre}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Registrar Familia
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
