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
    // 📥 Ver datos entrantes
    console.log('📝 Lista recibida:', attendedStudents);
    console.log('👨‍🏫 Instructor ID:', instructorId);

    // ✅ Formatear estudiantes para guardar en el modelo
    const studentsFormatted = attendedStudents.map((student) => {
      if (!mongoose.Types.ObjectId.isValid(student._id)) {
        throw new Error(`ID inválido: ${student._id}`);
      }

      return {
        userId: new mongoose.Types.ObjectId(student._id),
        userName: student.userName,
        userEmail: student.userEmail,
      };
    });

    // 🧾 Crear nueva lista de asistencia
    const newList = new List({
      students: studentsFormatted,
      instructorId: instructorId // Solo si lo tienes definido en el modelo
    });

    // 💾 Guardar en la base de datos
    await newList.save();

    // ✅ Respuesta exitosa
    res.status(201).json({
      message: 'Lista de asistencia guardada exitosamente.',
      attendance: newList
    });

  } catch (error) {
    console.error('❌ Error al guardar la asistencia:', error);
    res.status(500).json({
      message: 'Hubo un problema al guardar la asistencia.',
      error: error.message
    });
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
