const router = require('express').Router();
const prisma = require('../prisma');
const { auth, roles } = require('../middleware/auth.middleware');

// GET /api/familias
router.get('/', auth, async (req, res) => {
  try {
    const { sector, estado, q } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (q) where.nombre_responsable = { contains: q, mode: 'insensitive' };
    if (sector) {
      where.sectores = { some: { id_sector: parseInt(sector) } };
    }
    const familias = await prisma.familia.findMany({
      where,
      include: { sectores: { include: { sector: true } } },
      orderBy: { nombre_responsable: 'asc' }
    });
    res.json({ ok: true, data: familias });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

// GET /api/familias/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const familia = await prisma.familia.findUnique({
      where: { id_familia: parseInt(req.params.id) },
      include: { sectores: { include: { sector: true } }, pagos: { orderBy: { fecha: 'desc' }, take: 12 } }
    });
    if (!familia) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    res.json({ ok: true, data: familia });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

// POST /api/familias
router.post('/', auth, roles('ADMIN', 'OPERADOR'), async (req, res) => {
  try {
    const { nombre_responsable, direccion, telefono, id_sector } = req.body;
    if (!nombre_responsable || !direccion || !id_sector)
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });

    // Check duplicate in same sector
    const exists = await prisma.familia.findFirst({
      where: {
        nombre_responsable: { equals: nombre_responsable, mode: 'insensitive' },
        sectores: { some: { id_sector: parseInt(id_sector) } }
      }
    });
    if (exists)
      return res.status(409).json({ ok: false, error: 'DUPLICATE_FAMILY' });

    const familia = await prisma.familia.create({
      data: {
        nombre_responsable,
        direccion,
        telefono,
        sectores: { create: { id_sector: parseInt(id_sector) } }
      },
      include: { sectores: { include: { sector: true } } }
    });
    res.status(201).json({ ok: true, data: familia });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

// PUT /api/familias/:id
router.put('/:id', auth, roles('ADMIN', 'OPERADOR'), async (req, res) => {
  try {
    const { nombre_responsable, direccion, telefono, estado } = req.body;
    const familia = await prisma.familia.update({
      where: { id_familia: parseInt(req.params.id) },
      data: { nombre_responsable, direccion, telefono, estado }
    });
    res.json({ ok: true, data: familia });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

// DELETE /api/familias/:id  (soft delete)
router.delete('/:id', auth, roles('ADMIN'), async (req, res) => {
  try {
    const familia = await prisma.familia.update({
      where: { id_familia: parseInt(req.params.id) },
      data: { estado: 'INACTIVA' }
    });
    res.json({ ok: true, data: familia });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
