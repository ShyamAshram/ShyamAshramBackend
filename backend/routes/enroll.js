const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin, isProfesor } = require('../middleware/admin');
const Attendance = require('../models/attendance');
const User = require('../models/user');
const WeeklyAttendance = require('../models/enroll')

router.get('/all-registrations', authenticateToken, async (req, res) => {
  try {
    const instructorId = req.user.id;  

    const registrations = await Attendance.find({ 
        attended: false, 
        instructorId: instructorId 
      })
      .populate('userId', 'name email')
      .populate('classId', 'name dayOfWeek');

    if (!registrations.length) {
      return res.status(404).json({ message: 'No hay inscripciones registradas pendientes para este profesor.' });
    }

    res.json(registrations);
  } catch (err) {
    console.error('Error al obtener las inscripciones:', err);
    res.status(500).json({ error: 'Error del servidor al obtener inscripciones.' });
  }
});

  // Backend: Actualizar asistencia
router.put('/update-attendance/:studentId', (req, res) => {
    const { studentId } = req.params;
    const { attended } = req.body;
  
    Attendance.findByIdAndUpdate(studentId, { attended }, { new: true })
      .then((updatedRecord) => res.json(updatedRecord))
      .catch((error) => res.status(500).json({ error: 'Error updating attendance' }));
  });
  // Ruta en el backend para guardar la asistencia semanal
router.post('/api/teach/save-weekly-attendance', async (req, res) => {
  try {
    const { week, day, students } = req.body;

    // Guardar la asistencia en una nueva colección o tabla
    const savedAttendance = await WeeklyAttendance.create({
      week,
      day,
      students,
    });

    res.status(200).json({ message: 'Asistencia semanal guardada exitosamente', savedAttendance });
  } catch (error) {
    console.error('Error al guardar la asistencia semanal:', error);
    res.status(500).json({ message: 'Error al guardar la asistencia semanal' });
  }
});
router.delete('/clear-attendance/:dayOfWeek', async (req, res) => {
  const { dayOfWeek } = req.params;
  
  
  try {
    const existingRecords = await Attendance.find({});

    
    const result = await Attendance.deleteMany({ dayOfWeek });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: `No se encontraron inscripciones para ${dayOfWeek}.` });
    }

    res.status(200).json({ message: `Se eliminaron ${result.deletedCount} inscripciones para ${dayOfWeek}.` });
  } catch (error) {
    console.error('❌ Error al limpiar las inscripciones:', error);
    res.status(500).json({ message: 'Error al limpiar las inscripciones', details: error.message });
  }
});
  

  module.exports = router;