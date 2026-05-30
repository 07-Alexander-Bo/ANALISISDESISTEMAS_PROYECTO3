const router = require('express').Router();
const prisma = require('../prisma');
const { auth, roles } = require('../middleware/auth.middleware');

router.get('/', auth, async (req, res) => {
  try {
    const sectores = await prisma.sector.findMany({
      include: { _count: { select: { familias: true } } },
      orderBy: { prioridad: 'asc' }
    });
    res.json({ ok: true, data: sectores });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.post('/', auth, roles('ADMIN'), async (req, res) => {
  try {
    const { nombre, descripcion, prioridad } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
    const sector = await prisma.sector.create({ data: { nombre, descripcion, prioridad: prioridad || 1 } });
    res.status(201).json({ ok: true, data: sector });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ ok: false, error: 'DUPLICATE_SECTOR' });
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.put('/:id', auth, roles('ADMIN'), async (req, res) => {
  try {
    const { nombre, descripcion, prioridad } = req.body;
    const sector = await prisma.sector.update({
      where: { id_sector: parseInt(req.params.id) },
      data: { nombre, descripcion, prioridad }
    });
    res.json({ ok: true, data: sector });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
