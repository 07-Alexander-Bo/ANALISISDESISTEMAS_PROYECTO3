const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ ok: false, error: 'NO_TOKEN' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'INVALID_TOKEN' });
  }
}

function roles(...allowed) {
  return (req, res, next) => {
    if (!allowed.includes(req.user.rol))
      return res.status(403).json({ ok: false, error: 'FORBIDDEN' });
    next();
  };
}

module.exports = { auth, roles };
