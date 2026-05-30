require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const familiaRoutes = require('./routes/familia.routes');
const sectorRoutes = require('./routes/sector.routes');
const distribucionRoutes = require('./routes/distribucion.routes');
const tanqueRoutes = require('./routes/tanque.routes');
const pagoRoutes = require('./routes/pago.routes');
const incidenciaRoutes = require('./routes/incidencia.routes');
const mantenimientoRoutes = require('./routes/mantenimiento.routes');
const reporteRoutes = require('./routes/reporte.routes');
const usuarioRoutes = require('./routes/usuario.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/familias', familiaRoutes);
app.use('/api/sectores', sectorRoutes);
app.use('/api/distribuciones', distribucionRoutes);
app.use('/api/tanque', tanqueRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/mantenimiento', mantenimientoRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, version: '1.0.0' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AquaControl API running on port ${PORT}`));
