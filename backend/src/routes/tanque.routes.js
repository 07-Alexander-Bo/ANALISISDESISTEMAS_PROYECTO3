const router = require('express').Router();
const prisma = require('../prisma');
const { auth, roles } = require('../middleware/auth.middleware');

router.get('/', auth, async (req, res) => {
  try {
    const tanque = await prisma.tanque.findFirst();
    if (!tanque) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    const porcentaje = parseFloat(((tanque.nivel_actual / tanque.capacidad) * 100).toFixed(1));
    res.json({ ok: true, data: { ...tanque, porcentaje } });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.post('/lecturas', auth, roles('ADMIN', 'TECNICO'), async (req, res) => {
  try {
    const { nivel } = req.body;
    if (nivel === undefined || nivel === null)
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });

    const tanque = await prisma.tanque.findFirst();
    if (parseFloat(nivel) > parseFloat(tanque.capacidad))
      return res.status(400).json({ ok: false, error: 'EXCEEDS_CAPACITY' });

    const updated = await prisma.tanque.update({
      where: { id_tanque: tanque.id_tanque },
      data: { nivel_actual: parseFloat(nivel) }
    });

    await prisma.historialTanque.create({
      data: { id_tanque: tanque.id_tanque, nivel: parseFloat(nivel) }
    });

    const porcentaje = parseFloat(((parseFloat(nivel) / parseFloat(tanque.capacidad)) * 100).toFixed(1));
    const alerta = porcentaje < 20 ? 'CRITICO' : porcentaje < 40 ? 'PRECAUCION' : 'NORMAL';

    if (porcentaje < 20) {
      await prisma.notificacion.create({
        data: {
          id_tanque: tanque.id_tanque,
          mensaje: `⚠️ ALERTA CRÍTICA: Nivel del tanque al ${porcentaje}%. Capacidad insuficiente.`
        }
      });
    }

    res.status(201).json({ ok: true, data: { ...updated, porcentaje, alerta } });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.get('/historial', auth, async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const where = {};
    if (desde) where.fecha = { gte: new Date(desde) };
    if (hasta) where.fecha = { ...where.fecha, lte: new Date(hasta) };
    const historial = await prisma.historialTanque.findMany({
      where,
      orderBy: { fecha: 'desc' },
      take: 100
    });
    res.json({ ok: true, data: historial });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
