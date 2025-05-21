const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance');
const User = require('../models/user');
const { authenticateToken, isAdmin, isProfesor } = require('../middleware/admin');
const { createNotification } = require('../controller/notificationcontroller');


router.post('/:userId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { date, attended } = req.body;
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.plan === 'No tienes un plan' || user.planDuration <= 0) {
      return res.status(400).json({ error: 'El usuario no tiene un plan activo o el plan ha expirado' });
    }

    const attendance = new Attendance({ userId, date, attended });
    await attendance.save();

    user.planDuration = Math.max(user.planDuration - 1, 0);

    if (user.planDuration === 0) {
      user.plan = 'No tienes un plan';
      await createNotification(user._id, 'Finalizó su plan', 'Ups, su plan ha finalizado, renueva tu plan.');
    }

    await createNotification(user._id, 'Asistencia a clase', `Tu asistencia ha sido registrada, tu número de clases restantes es: ${user.planDuration}`);
    await user.save();

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error al registrar la asistencia:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { date, attended } = req.body;
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.plan === 'No tienes un plan' || user.planDuration <= 0) {
      return res.status(400).json({ error: 'El usuario no tiene un plan activo o el plan ha expirado' });
    }

    const attendance = new Attendance({ userId, date, attended });
    await attendance.save();

    user.planDuration = Math.max(user.planDuration - 1, 0);

    if (user.planDuration === 0) {
      user.plan = 'No tienes un plan';
      await createNotification(user._id, 'Finalizó su plan', 'Ups, su plan ha finalizado, renueva tu plan.');
    }

    await createNotification(user._id, 'Asistencia a clase', `Tu asistencia ha sido registrada, tu número de clases restantes es: ${user.planDuration}`);
    await user.save();

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error al registrar la asistencia:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/all-registrations', authenticateToken, async (req, res) => {
  try {
    const registrations = await Attendance.find({ attended: false }) 
      .populate('userId', 'name email');

    if (!registrations.length) {
      return res.status(404).json({ message: 'No hay inscripciones registradas pendientes.' });
    }

    res.json(registrations);
  } catch (err) {
    console.error('Error al obtener las inscripciones:', err);
    res.status(500).json({ error: 'Error del servidor al obtener inscripciones.' });
  }
});


router.delete('/clear-registrations', authenticateToken, isProfesor, async (req, res) => {
  try {
    const result = await Attendance.deleteMany({ attended: false });
    console.log(`Documentos eliminados: ${result.deletedCount}`);
    res.status(200).json({ message: `Se eliminaron ${result.deletedCount} inscripciones.` });
  } catch (error) {
    console.error('Error al eliminar inscripciones:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar inscripciones.' });
  }
});



module.exports = router;
