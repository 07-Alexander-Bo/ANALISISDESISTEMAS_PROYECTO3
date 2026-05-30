const router = require('express').Router();
const prisma = require('../prisma');
const { auth, roles } = require('../middleware/auth.middleware');

router.get('/', auth, async (req, res) => {
  try {
    const mantenimientos = await prisma.mantenimiento.findMany({
      include: { incidencia: true, usuario: { select: { nombre: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json({ ok: true, data: mantenimientos });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.post('/', auth, roles('ADMIN', 'TECNICO'), async (req, res) => {
  try {
    const { tipo, descripcion, costo, fecha, id_incidencia } = req.body;
    if (!tipo || !descripcion || costo === undefined || !fecha)
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
    if (parseFloat(costo) < 0)
      return res.status(400).json({ ok: false, error: 'INVALID_COST' });

    const mant = await prisma.mantenimiento.create({
      data: {
        tipo,
        descripcion,
        costo: parseFloat(costo),
        fecha: new Date(fecha),
        id_usuario: req.user.id,
        id_incidencia: id_incidencia ? parseInt(id_incidencia) : null
      },
      include: { incidencia: true }
    });
    res.status(201).json({ ok: true, data: mant });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
