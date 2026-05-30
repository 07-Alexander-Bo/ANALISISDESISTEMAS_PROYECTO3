const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { auth, roles } = require('../middleware/auth.middleware');

router.get('/', auth, roles('ADMIN'), async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id_usuario: true, nombre: true, username: true, rol: true, activo: true }
    });
    res.json({ ok: true, data: usuarios });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.post('/', auth, roles('ADMIN'), async (req, res) => {
  try {
    const { nombre, username, password, rol } = req.body;
    if (!nombre || !username || !password || !rol)
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });

    const hash = await bcrypt.hash(password, 12);
    const usuario = await prisma.usuario.create({
      data: { nombre, username, password: hash, rol },
      select: { id_usuario: true, nombre: true, username: true, rol: true, activo: true }
    });
    res.status(201).json({ ok: true, data: usuario });
  } catch (err) {
    if (err.code === 'P2002')
      return res.status(409).json({ ok: false, error: 'DUPLICATE_USER' });
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

router.put('/:id', auth, roles('ADMIN'), async (req, res) => {
  try {
    const { rol, activo } = req.body;
    const usuario = await prisma.usuario.update({
      where: { id_usuario: parseInt(req.params.id) },
      data: { rol, activo },
      select: { id_usuario: true, nombre: true, username: true, rol: true, activo: true }
    });
    res.json({ ok: true, data: usuario });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
