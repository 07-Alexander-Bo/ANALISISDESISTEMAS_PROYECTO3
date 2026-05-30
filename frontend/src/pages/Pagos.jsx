import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const ESTADO_BADGE = { PAGADO: 'badge-green', PENDIENTE: 'badge-yellow', VENCIDO: 'badge-red', ANULADO: 'badge-gray' };

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id_familia: '', monto: '25.00', fecha: new Date().toISOString().split('T')[0], mes_correspondiente: '' });
  const [msg, setMsg] = useState(null);

  const mesActual = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  async function load() {
    const [p, f] = await Promise.all([api.get('/pagos'), api.get('/familias')]);
    setPagos(p.data);
    setFamilias(f.data.filter(f => f.estado === 'ACTIVA'));
    setLoading(false);
  }
  useEffect(() => {
    setForm(f => ({ ...f, mes_correspondiente: mesActual }));
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const res = await api.post('/pagos', form);
      setMsg({ type: 'success', text: `Pago registrado. Recibo: REC-${String(res.data.id_pago).padStart(5, '0')}` });
      setShowModal(false);
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: err.error === 'DUPLICATE_PAYMENT' ? err.message : 'Error al registrar pago.' });
    }
  }

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="page-header">
        <h2>Aportes Económicos ({pagos.length} registros)</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Registrar Pago</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Recibo</th><th>Familia</th><th>Mes</th><th>Monto</th><th>Fecha</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {pagos.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No hay pagos registrados.</td></tr>
              ) : pagos.map(p => (
                <tr key={p.id_pago}>
                  <td style={{ fontFamily: 'monospace' }}>REC-{String(p.id_pago).padStart(5, '0')}</td>
                  <td>{p.familia?.nombre_responsable}</td>
                  <td>{p.mes_correspondiente}</td>
                  <td style={{ fontWeight: 600 }}>Q{parseFloat(p.monto).toFixed(2)}</td>
                  <td>{new Date(p.fecha).toLocaleDateString('es-GT')}</td>
                  <td><span className={`badge ${ESTADO_BADGE[p.estado]}`}>{p.estado}</span></td>
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
              <span className="modal-title">Registrar Aporte Económico</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Familia *</label>
                <select value={form.id_familia} onChange={e => setForm({ ...form, id_familia: e.target.value })} required>
                  <option value="">Seleccionar familia...</option>
                  {familias.map(f => <option key={f.id_familia} value={f.id_familia}>{f.nombre_responsable}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Monto (Q) *</label>
                  <input type="number" step="0.01" min="0" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mes (YYYY-MM) *</label>
                  <input type="month" value={form.mes_correspondiente} onChange={e => setForm({ ...form, mes_correspondiente: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de pago *</label>
                <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Procesar Pago</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
