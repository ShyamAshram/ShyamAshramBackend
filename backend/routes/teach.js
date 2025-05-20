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
    // Solo imprime los datos que llegan
    console.log('📝 Lista recibida:', attendedStudents);
    console.log('👨‍🏫 Instructor ID:', instructorId);

    // Puedes opcionalmente formatearlos si quieres verificar los ObjectId
    const studentsFormatted = attendedStudents.map((student) => ({
      userId: student._id,
      userName: student.userName,
      userEmail: student.userEmail,
    }));

    console.log('✅ Formato para guardar:', studentsFormatted);

    // Respuesta de prueba sin guardar en DB
    res.status(200).json({ message: 'Datos recibidos correctamente.', students: studentsFormatted });
  } catch (error) {
    console.error('Error al procesar la asistencia en Debug:', error);
    res.status(500).json({ message: 'Hubo un problema procesando la asistencia.', error: error.message });
  }
});

  router.get('/attendance-lists', async (req, res) => {
    try {
        const lists = await List.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                lists: { $push: "$$ROOT" }
              }
            },
            { $sort: { _id: -1 } }
          ]);

        res.status(200).json(lists);
    } catch (error) {
        console.error('Error al obtener las listas de asistencia:', error);
        res.status(500).json({ message: 'Hubo un problema al obtener las listas de asistencia.' });
    }
});
  
  
module.exports = router;
