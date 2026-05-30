const router = require('express').Router();
const prisma = require('../prisma');
const { auth, roles } = require('../middleware/auth.middleware');

router.get('/', auth, async (req, res) => {
  try {
    const { estado, tipo } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;
    const incidencias = await prisma.incidencia.findMany({
      where,
      include: { familia: true },
      orderBy: { fecha_reporte: 'desc' }
    });
    res.json({ ok: true, data: incidencias });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { tipo, descripcion, id_familia } = req.body;
    if (!tipo || !descripcion)
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });

    const incidencia = await prisma.incidencia.create({
      data: {
        tipo,
        descripcion,
        id_familia: id_familia ? parseInt(id_familia) : null
      },
      include: { familia: true }
    });
    res.status(201).json({ ok: true, data: incidencia });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.put('/:id/estado', auth, roles('ADMIN', 'OPERADOR', 'TECNICO'), async (req, res) => {
  try {
    const { estado } = req.body;
    const incidencia = await prisma.incidencia.update({
      where: { id_incidencia: parseInt(req.params.id) },
      data: { estado }
    });
    res.json({ ok: true, data: incidencia });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
