const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });

    const user = await prisma.usuario.findUnique({ where: { username } });
    if (!user || !user.activo)
      return res.status(401).json({ ok: false, error: 'INVALID_CREDENTIALS' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ ok: false, error: 'INVALID_CREDENTIALS' });

    const token = jwt.sign(
      { id: user.id_usuario, username: user.username, rol: user.rol },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    res.json({
      ok: true,
      data: { token, user: { id: user.id_usuario, nombre: user.nombre, username: user.username, rol: user.rol } }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
