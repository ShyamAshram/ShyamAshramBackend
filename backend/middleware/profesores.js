const jwt = require('jsonwebtoken');


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

module.exports = isProfesor;
