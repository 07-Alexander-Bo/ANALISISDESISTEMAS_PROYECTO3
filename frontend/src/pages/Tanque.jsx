import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Tanque() {
  const [tanque, setTanque] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nivel, setNivel] = useState('');
  const [msg, setMsg] = useState(null);

  async function load() {
    const [t, h] = await Promise.all([api.get('/tanque'), api.get('/tanque/historial')]);
    setTanque(t.data);
    setHistorial(h.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleRegistrar(e) {
    e.preventDefault();
    try {
      const res = await api.post('/tanque/lecturas', { nivel: parseFloat(nivel) });
      setMsg({ type: res.data.alerta === 'CRITICO' ? 'danger' : 'success', text: `Nivel registrado: ${res.data.porcentaje}% — Estado: ${res.data.alerta}` });
      setNivel('');
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: err.error === 'EXCEEDS_CAPACITY' ? 'El nivel supera la capacidad máxima del tanque.' : 'Error al registrar.' });
    }
  }

  if (loading) return <div className="loading">Cargando...</div>;

  const pct = tanque?.porcentaje ?? 0;
  const color = pct < 20 ? 'red' : pct < 40 ? 'yellow' : 'green';
  const label = pct < 20 ? 'CRÍTICO' : pct < 40 ? 'PRECAUCIÓN' : 'NORMAL';
  const badge = pct < 20 ? 'badge-red' : pct < 40 ? 'badge-yellow' : 'badge-green';

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">💧 Nivel Actual del Tanque</div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: pct < 20 ? 'var(--red)' : pct < 40 ? 'var(--yellow)' : 'var(--green)' }}>
              {pct}%
            </div>
            <span className={`badge ${badge}`}>{label}</span>
          </div>
          <div className="tank-bar" style={{ height: 28, marginBottom: 12 }}>
            <div className={`tank-fill ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666' }}>
            <span>Actual: {parseFloat(tanque.nivel_actual).toLocaleString()} L</span>
            <span>Capacidad: {parseFloat(tanque.capacidad).toLocaleString()} L</span>
          </div>
        </div>
        <div className="card">
          <div className="card-title">📝 Registrar Nueva Lectura</div>
          <form onSubmit={handleRegistrar}>
            <div className="form-group">
              <label className="form-label">Nivel actual (en litros) *</label>
              <input
                type="number"
                min={0}
                max={parseFloat(tanque.capacidad)}
                step={0.01}
                placeholder={`0 — ${parseFloat(tanque.capacidad).toLocaleString()} L`}
                value={nivel}
                onChange={e => setNivel(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Registrar Lectura</button>
          </form>
        </div>
      </div>
      <div className="card">
        <div className="card-title">📊 Historial de Lecturas</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Fecha y Hora</th><th>Nivel (L)</th><th>Porcentaje</th></tr>
            </thead>
            <tbody>
              {historial.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999', padding: 24 }}>Sin lecturas registradas.</td></tr>
              ) : historial.map(h => {
                const p = parseFloat(((h.nivel / tanque.capacidad) * 100).toFixed(1));
                const b = p < 20 ? 'badge-red' : p < 40 ? 'badge-yellow' : 'badge-green';
                return (
                  <tr key={h.id_historial}>
                    <td>{h.id_historial}</td>
                    <td>{new Date(h.fecha).toLocaleString('es-GT')}</td>
                    <td>{parseFloat(h.nivel).toLocaleString()} L</td>
                    <td><span className={`badge ${b}`}>{p}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
