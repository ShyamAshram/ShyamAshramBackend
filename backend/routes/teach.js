const express = require('express');
const router = express.Router();
const List = require('../models/list');
const jwt = require('jsonwebtoken'); // Necesario para manejar el token
const User = require('../models/user'); // Para obtener los datos del instructor

// Ruta para guardar lista de asistencia
router.post('/save-attendance', async (req, res) => {
    const { attendedStudents, instructorId } = req.body;
  
    if (!attendedStudents || attendedStudents.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron estudiantes.' });
    }
  
    try {
     
      const newList = new List({
        students: attendedStudents.map((student) => ({
          userId: student._id,
          userName: student.userName,
          userEmail: student.userEmail,
        }))
      });
  
      await newList.save();
  
      res.status(201).json({ message: 'Lista de asistencia guardada exitosamente.', attendance: newList });
    } catch (error) {
      console.error('Error al guardar la asistencia:', error);
      res.status(500).json({ message: 'Hubo un problema al guardar la asistencia.' });
    }
  });
  
module.exports = router;
