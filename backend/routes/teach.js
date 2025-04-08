const express = require('express');
const router = express.Router();
const List = require('../models/list');
const jwt = require('jsonwebtoken'); 
const User = require('../models/user'); 
const mongoose = require('mongoose');



router.post('/save-attendance', async (req, res) => {
  const { attendedStudents, instructorId } = req.body;

  if (!attendedStudents || attendedStudents.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron estudiantes.' });
  }

  try {
      // ✅ Verifica y convierte `_id` a ObjectId
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

      const newList = new List({ students: studentsFormatted });
      await newList.save();

      res.status(201).json({ message: 'Lista de asistencia guardada exitosamente.', attendance: newList });
  } catch (error) {
      console.error('Error al guardar la asistencia:', error);
      res.status(500).json({ message: 'Hubo un problema al guardar la asistencia.', error: error.message });
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
