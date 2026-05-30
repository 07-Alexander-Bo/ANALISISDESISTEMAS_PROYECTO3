import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../services/AuthContext';

const ROL_BADGE = { ADMIN: 'badge-red', OPERADOR: 'badge-blue', TESORERO: 'badge-green', TECNICO: 'badge-yellow' };

export default function Usuarios() {
  const { user: me } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', username: '', password: '', rol: 'OPERADOR' });
  const [msg, setMsg] = useState(null);

  async function load() {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch { setMsg({ type: 'danger', text: 'Sin permisos para ver usuarios.' }); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/usuarios', form);
      setMsg({ type: 'success', text: 'Usuario creado correctamente.' });
      setShowModal(false);
      setForm({ nombre: '', username: '', password: '', rol: 'OPERADOR' });
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: err.error === 'DUPLICATE_USER' ? 'El nombre de usuario ya existe.' : 'Error al crear usuario.' });
    }
  }

  async function toggleActivo(u) {
    try {
      await api.put(`/usuarios/${u.id_usuario}`, { activo: !u.activo, rol: u.rol });
      load();
    } catch { setMsg({ type: 'danger', text: 'Error al actualizar usuario.' }); }
  }

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="page-header">
        <h2>Gestión de Usuarios ({usuarios.length})</h2>
        {me?.rol === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Usuario</button>
        )}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id_usuario}>
                  <td>{u.id_usuario}</td>
                  <td style={{ fontWeight: 500 }}>{u.nombre}</td>
                  <td style={{ fontFamily: 'monospace' }}>{u.username}</td>
                  <td><span className={`badge ${ROL_BADGE[u.rol] || 'badge-gray'}`}>{u.rol}</span></td>
                  <td><span className={`badge ${u.activo ? 'badge-green' : 'badge-gray'}`}>{u.activo ? 'ACTIVO' : 'INACTIVO'}</span></td>
                  <td>
                    {me?.rol === 'ADMIN' && u.username !== 'admin' && (
                      <button
                        className={`btn btn-sm ${u.activo ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleActivo(u)}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
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
              <span className="modal-title">Crear Nuevo Usuario</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nombre completo *</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre de usuario *</label>
                  <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña *</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Rol *</label>
                <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                  <option value="OPERADOR">Operador</option>
                  <option value="TESORERO">Tesorero</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Crear Usuario</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
