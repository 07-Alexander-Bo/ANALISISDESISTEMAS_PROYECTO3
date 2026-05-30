const router = require('express').Router();
const prisma = require('../prisma');
const { auth, roles } = require('../middleware/auth.middleware');

router.get('/pagos', auth, roles('ADMIN', 'TESORERO'), async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const where = {};
    if (desde) where.fecha = { gte: new Date(desde) };
    if (hasta) where.fecha = { ...where.fecha, lte: new Date(hasta) };

    const pagos = await prisma.pago.findMany({
      where,
      include: { familia: true },
      orderBy: { fecha: 'desc' }
    });
    const total = pagos.reduce((s, p) => s + parseFloat(p.monto), 0);
    res.json({ ok: true, tipo: 'PAGOS', total: total.toFixed(2), cantidad: pagos.length, data: pagos });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.get('/incidencias', auth, roles('ADMIN', 'OPERADOR', 'TECNICO'), async (req, res) => {
  try {
    const incidencias = await prisma.incidencia.findMany({
      include: { familia: true },
      orderBy: { fecha_reporte: 'desc' }
    });
    const resumen = {
      ABIERTA: 0, EN_PROCESO: 0, RESUELTA: 0, CERRADA: 0
    };
    incidencias.forEach(i => resumen[i.estado]++);
    res.json({ ok: true, tipo: 'INCIDENCIAS', resumen, cantidad: incidencias.length, data: incidencias });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.get('/almacenamiento', auth, roles('ADMIN', 'TECNICO', 'OPERADOR'), async (req, res) => {
  try {
    const tanque = await prisma.tanque.findFirst();
    const historial = await prisma.historialTanque.findMany({
      orderBy: { fecha: 'desc' },
      take: 30
    });
    const porcentaje = parseFloat(((tanque.nivel_actual / tanque.capacidad) * 100).toFixed(1));
    res.json({ ok: true, tipo: 'ALMACENAMIENTO', tanque: { ...tanque, porcentaje }, historial });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
