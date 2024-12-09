const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

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
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    if (decoded.role !== 'profe') {
      return res.status(403).json({ error: 'Acceso denegado: no eres profesor.' });
    }
    
    req.user = decoded; // Guardar los datos decodificados del usuario en la petición
    next();
  } catch (error) {
    res.status(401).json({ error: 'Autenticación fallida.' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
  isProfesor
};
