const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const List = require('../models/list');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

// Ruta para guardar lista de asistencia
router.post('/save-attendance', async (req, res) => {
  const { attendedStudents, instructorId } = req.body;

  if (!attendedStudents || attendedStudents.length === 0) {
    return res.status(400).json({ message: 'No se proporcionaron estudiantes.' });
  }

  try {
    console.log('📝 Lista recibida:', attendedStudents);
    console.log('👨‍🏫 Instructor ID:', instructorId);

    // ✅ Formatear estudiantes para guardar
    const studentsFormatted = attendedStudents.map((student) => {
      if (!mongoose.Types.ObjectId.isValid(student._id)) {
        throw new Error(`ID inválido: ${student._id}`);
      }

      return {
        userId: new mongoose.Types.ObjectId(student._id),
        userName: student.userName,
        userEmail: student.userEmail,
        attended: student.attended
      };
    });

    // 🧾 Crear y guardar nueva lista
    const newList = new List({
      students: studentsFormatted,
      instructorId: instructorId,
    });

    await newList.save();

    // 🧮 Actualizar duración de planes por clase
    for (const student of attendedStudents) {
      const user = await User.findById(student._id);
      if (!user) continue;

      if (['4 clases', '1 clase'].includes(user.plan)) {
        user.planDuration -= 1;
        if (user.planDuration < 0) user.planDuration = 0;

        if (user.planDuration === 0) {
          user.plan = 'No tienes un plan';
        }

        // Guardar cambios
        await user.save();
        console.log(`📉 Se restó una clase a ${user.name}. Clases restantes: ${user.planDuration}`);
      }
    }

    res.status(201).json({
      message: 'Lista de asistencia guardada exitosamente y planes actualizados.',
      attendance: newList,
    });

  } catch (error) {
    console.error('❌ Error al guardar la asistencia:', error);
    res.status(500).json({
      message: 'Hubo un problema al guardar la asistencia.',
      error: error.message,
    });
  }
});

module.exports = router;

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
    
    for (const section of lists) {
      for (const list of section.lists) {
    console.log(list)


        const instructor = await User.findOne({ id: list._id })
          .select('name email');

        list.instructor = instructor || null;
      }
    }

    res.status(200).json(lists);

  } catch (error) {
    console.error('Error al obtener listas:', error);
    res.status(500).json({ message: 'Error al obtener listas' });
  }
});
  
  
module.exports = router;
