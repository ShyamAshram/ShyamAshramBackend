const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }
  next();
};

const isProfesor = (req, res, next) => {
  if (req.user.role !== 'profe') {
    return res.status(403).json({ error: 'Acceso denegado: no eres profesor.' });
  }
  next();
};

const isAdminOrProfesor = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'profe') {
    return next();
  }
  return res.status(403).json({ error: 'No tienes permisos' });
};

module.exports = {
  authenticateToken,
  isAdmin,
  isProfesor,
  isAdminOrProfesor
};
