const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user');
const horarioRoutes = require('./routes/horario')
const notisRoutes= require('./routes/notification')
const adminMiddleware = require('./middleware/admin');
const profeMiddleware = require('./middleware/profesores');
const attendanceRoutes = require('./routes/attendance');
const listRoutes = require('./routes/teach')
const teacherRoutes = require('./routes/enroll');
const connectDB = require('./db'); 


const app = express();
const PORT = process.env.PORT || 3001;


// Conectar a MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/list', listRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notisRoutes);
app.use('/api/attendance', attendanceRoutes); 
app.use('/api/admin', adminMiddleware.isAdmin, userRoutes);
app.use('/api/classes', horarioRoutes);
app.use('/api/teach', teacherRoutes )



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
