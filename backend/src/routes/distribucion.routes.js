const router = require('express').Router();
const prisma = require('../prisma');
const { auth, roles } = require('../middleware/auth.middleware');

router.get('/', auth, async (req, res) => {
  try {
    const { sector, fecha } = req.query;
    const where = {};
    if (sector) where.id_sector = parseInt(sector);
    if (fecha) where.fecha = new Date(fecha);
    const distribuciones = await prisma.distribucion.findMany({
      where,
      include: { sector: true },
      orderBy: [{ fecha: 'desc' }, { hora_inicio: 'asc' }]
    });
    res.json({ ok: true, data: distribuciones });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.post('/', auth, roles('ADMIN', 'OPERADOR'), async (req, res) => {
  try {
    const { id_sector, fecha, hora_inicio, hora_fin } = req.body;
    if (!id_sector || !fecha || !hora_inicio || !hora_fin)
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });

    // Check traslape
    const existing = await prisma.distribucion.findMany({
      where: {
        id_sector: parseInt(id_sector),
        fecha: new Date(fecha),
        estado: { not: 'CANCELADA' }
      }
    });

    const conflict = existing.find(d => {
      return hora_inicio < d.hora_fin && hora_fin > d.hora_inicio;
    });
    if (conflict)
      return res.status(409).json({ ok: false, error: 'SCHEDULE_CONFLICT', conflict });

    // Get first tanque
    const tanque = await prisma.tanque.findFirst();
    const dist = await prisma.distribucion.create({
      data: {
        id_sector: parseInt(id_sector),
        id_tanque: tanque.id_tanque,
        fecha: new Date(fecha),
        hora_inicio,
        hora_fin
      },
      include: { sector: true }
    });
    res.status(201).json({ ok: true, data: dist });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.put('/:id/estado', auth, roles('ADMIN', 'OPERADOR', 'TECNICO'), async (req, res) => {
  try {
    const { estado } = req.body;
    const dist = await prisma.distribucion.update({
      where: { id_distribucion: parseInt(req.params.id) },
      data: { estado }
    });
    res.json({ ok: true, data: dist });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
