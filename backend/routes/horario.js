const express = require('express');
const router = express.Router();
const ClassSchedule = require('./../models/horario'); // Modelo de clases
const Attendance = require('./../models/attendance'); // Modelo de inscripciones
const User = require('../models/user');
const { authenticateToken } = require('../middleware/admin');
const isProfesor = require('../middleware/profesores');

// Obtener todas las clases
router.get('/all', async (req, res) => {
  try {
    const classes = await ClassSchedule.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo las clases' });
  }
});

router.get('/:dayOfWeek', async (req, res) => {
  try {
    const { dayOfWeek } = req.params;

    const classes = await ClassSchedule.find({ dayOfWeek })
      .populate('instructorId', 'name email'); 

    if (classes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron horarios para ese día.' });
    }

    res.json(classes);
  } catch (err) {
    console.error('Error al obtener los horarios:', err);
    res.status(500).json({ message: 'Error al obtener los horarios' });
  }
});


router.post('/registerClass', authenticateToken, async (req, res) => {
  try {
    const { classId, dayOfWeek } = req.body;
    const userId = req.user.id; 

    const classInfo = await ClassSchedule.findById(classId);
    if (!classInfo) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    const userInfo = await User.findById(userId);
    if (!userInfo) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (!userInfo.plan || userInfo.planDuration <= 0) { 
      return res.status(400).json({ error: 'Debes tener un plan activo para inscribirte en esta clase' }); 
    }

    const today = new Date();
    const dayNumber = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].indexOf(dayOfWeek);
    const daysToAdd = (dayNumber + 7 - today.getDay()) % 7 || 7;
    const closestDate = new Date(today.setDate(today.getDate() + daysToAdd));


    const existingRegistration = await Attendance.findOne({
      userId,
      classId,
      date: closestDate
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'Ya estás inscrito en esta clase para la fecha seleccionada' });
    }


    if (existingRegistration) {
      return res.status(400).json({ error: 'Ya estás inscrito en esta clase para la fecha seleccionada' });
    }

    const attendance = new Attendance({
      classId,
      userId,
      dayOfWeek: classInfo.dayOfWeek,
      instructorId: classInfo.instructorId,
      date: closestDate,
      userName: userInfo.name,
      userEmail: userInfo.email,
    });

    await attendance.save();

    // Notificar al usuario
    res.json({ message: 'Inscripción exitosa', classInfo, date: closestDate });
  } catch (error) {
    console.error('Error al registrar en la clase:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/registerStudent', authenticateToken, async (req, res) => {
  try {
    const { classId, dayOfWeek, studentId } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'profe') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const classInfo = await ClassSchedule.findById(classId);
    if (!classInfo) {
      console.log("❌ Clase no encontrada con ID:", classId);
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      console.log("❌ Estudiante no encontrado con ID:", studentId);
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    if (!student.plan || student.planDuration <= 0) {
      return res.status(400).json({ error: 'El estudiante no tiene un plan activo' });
    }

    const today = new Date();
    const dayNumber = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].indexOf(dayOfWeek);
    const daysToAdd = (dayNumber + 7 - today.getDay()) % 7 || 7;
    const closestDate = new Date(today.setDate(today.getDate() + daysToAdd));

    // Verificar si ya está inscrito
    const existingRegistration = await Attendance.findOne({
      userId: studentId,
      classId,
      date: closestDate,
    });
    if (existingRegistration) {
      return res.status(400).json({ error: 'El estudiante ya está inscrito en esta clase para esa fecha' });
    }

    // Crear la inscripción
     const attendance = new Attendance({
      classId,
      userId:studentId,
      dayOfWeek: classInfo.dayOfWeek,
      instructorId: classInfo.instructorId,
      date: closestDate,
      userName: student.name,
      userEmail: student.email
    });

    await attendance.save();

    res.json({ message: 'Estudiante inscrito con éxito', classInfo, date: closestDate });
  } catch (error) {
    console.error('Error al registrar estudiante en clase:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


router.get('/all-registrations', async (req, res) => {
  try {
    const registrations = await Attendance.find().populate('userId', 'name email'); // Popular con datos de usuario si es necesario

    if (registrations.length === 0) {
      return res.status(404).json({ message: 'No hay inscripciones registradas.' });
    }

    res.json(registrations);
  } catch (err) {
    console.error('Error al obtener las inscripciones:', err);
    res.status(500).json({ error: 'Error del servidor al obtener inscripciones' });
  }
});
router.put('/confirm-attendance/:attendanceId', authenticateToken, isProfesor, async (req, res) => {
  try {
    const attendanceId = req.params.attendanceId;
    
    // Busca el registro de asistencia y marca como asistido
    const attendance = await Attendance.findById(attendanceId);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Registro de asistencia no encontrado' });
    }

    attendance.attended = true;
    await attendance.save();

    // Opcional: actualiza el usuario o el plan según sea necesario
    const user = await User.findById(attendance.userId);

    if (user) {
      // Restablece la cantidad de clases del plan o realiza algún ajuste necesario
      user.planDuration = user.planDurationInicial; // Reinicia según el plan original
      await user.save();
    }

    res.json({ message: 'Asistencia confirmada y plan actualizado', attendance });
  } catch (error) {
    console.error('Error al confirmar asistencia:', error);
    res.status(500).json({ error: 'Error del servidor al confirmar asistencia' });
  }
});


module.exports = router;



