require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('./cron/cronJobs');

const userRoutes = require('./routes/user');
const horarioRoutes = require('./routes/horario');
const notisRoutes = require('./routes/notification');
const attendanceRoutes = require('./routes/attendance');
const listRoutes = require('./routes/teach');
const teacherRoutes = require('./routes/enroll');

const adminMiddleware = require('./middleware/admin');
const profeMiddleware = require('./middleware/profesores');

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
(async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1); // Salir si falla la conexión
  }
})();

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/notifications', notisRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', horarioRoutes);
app.use('/api/list', listRoutes);
app.use('/api/teach', teacherRoutes);

// Rutas protegidas
app.use('/api/admin', adminMiddleware.isAdmin, userRoutes);

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
