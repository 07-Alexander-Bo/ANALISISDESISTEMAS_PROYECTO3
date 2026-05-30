const router = require('express').Router();
const prisma = require('../prisma');
const { auth, roles } = require('../middleware/auth.middleware');

router.get('/', auth, roles('ADMIN', 'TESORERO'), async (req, res) => {
  try {
    const { familia, mes, estado } = req.query;
    const where = {};
    if (familia) where.id_familia = parseInt(familia);
    if (mes) where.mes_correspondiente = mes;
    if (estado) where.estado = estado;
    const pagos = await prisma.pago.findMany({
      where,
      include: { familia: true, usuario: { select: { nombre: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json({ ok: true, data: pagos });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.post('/', auth, roles('ADMIN', 'TESORERO'), async (req, res) => {
  try {
    const { id_familia, monto, fecha, mes_correspondiente } = req.body;
    if (!id_familia || !monto || !fecha || !mes_correspondiente)
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });

    const familia = await prisma.familia.findUnique({ where: { id_familia: parseInt(id_familia) } });
    if (!familia) return res.status(404).json({ ok: false, error: 'FAMILIA_NOT_FOUND' });

    const pago = await prisma.pago.create({
      data: {
        id_familia: parseInt(id_familia),
        id_usuario: req.user.id,
        fecha: new Date(fecha),
        monto: parseFloat(monto),
        mes_correspondiente
      },
      include: { familia: true }
    });

    res.status(201).json({
      ok: true,
      data: { ...pago, recibo_url: `/api/pagos/${pago.id_pago}/recibo` }
    });
  } catch (err) {
    if (err.code === 'P2002')
      return res.status(409).json({ ok: false, error: 'DUPLICATE_PAYMENT', message: `La familia ya tiene un pago registrado para ${req.body.mes_correspondiente}` });
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.get('/:id/recibo', auth, async (req, res) => {
  try {
    const pago = await prisma.pago.findUnique({
      where: { id_pago: parseInt(req.params.id) },
      include: { familia: true, usuario: { select: { nombre: true } } }
    });
    if (!pago) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });

    // Simple PDF generation as text (jsPDF not available in Node easily; return JSON receipt)
    res.json({
      ok: true,
      recibo: {
        numero: `REC-${String(pago.id_pago).padStart(5, '0')}`,
        fecha_emision: new Date().toLocaleDateString('es-GT'),
        familia: pago.familia.nombre_responsable,
        mes: pago.mes_correspondiente,
        monto: `Q${parseFloat(pago.monto).toFixed(2)}`,
        estado: pago.estado,
        registrado_por: pago.usuario.nombre,
        sistema: 'AquaControl v1.0.0 - San Miguel'
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

// GET morosos del mes actual
router.get('/morosos/mes', auth, roles('ADMIN', 'TESORERO'), async (req, res) => {
  try {
    const now = new Date();
    const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const familias = await prisma.familia.findMany({
      where: {
        estado: 'ACTIVA',
        pagos: { none: { mes_correspondiente: mes } }
      },
      include: { sectores: { include: { sector: true } } }
    });
    res.json({ ok: true, data: familias, mes });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
