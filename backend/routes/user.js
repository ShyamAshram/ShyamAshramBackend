const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, isAdmin } = require('../middleware/admin');
const Notification = require('../models/notification');
const { createNotification } = require('../controller/notificationcontroller');
const { now } = require('mongoose');
const Attendance = require('../models/attendance')
const isProfesor = require('../middleware/profesores');

require('dotenv').config();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phonenumber, birthDate } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phonenumber, birthDate });
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: 'Correo incorrecto' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    res.send({ token, user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send({ error: 'Error del servidor' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const notifications = await Notification.find({ userId: userId });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      progress: user.progress,
      planStartDate: user.planStartDate,
      planDuration: user.planDuration,
      notifications
    });
  } catch (error) {
    console.error('Error al obtener los detalles del usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }, 'name email plan planDuration role phonenumber');
    res.json(users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});
router.get('/attendance/students', authenticateToken, isProfesor, async (req, res) => {
  try {
    // Aquí iría la lógica para obtener los estudiantes inscritos para la clase del día
    const students = await User.find({ /* Filtrar estudiantes según el día o clase */ });
    
    res.json(students);
  } catch (error) {
    console.error('Error al obtener los estudiantes:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/search', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const users = await User.find(query, 'name email plan planDuration');
    res.json(users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { plan, planDuration } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { plan, planDuration, planStartDate: new Date() }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await createNotification( user._id,'Plan Actualizado', `Tu nuevo plan es ${plan}`);

    
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id/attendance', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { date, attended } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      console.error('Usuario no encontrado:', req.params.id);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }


    if (user.plan === 'No tienes un plan' || user.planDuration <= 0) {
      console.log('El usuario no tiene un plan activo o el plan ha expirado:', req.params.id);
      return res.status(400).json({ error: 'El usuario no tiene un plan activo o el plan ha expirado' });
      
      
    }
    if (!user.attendance) {
      user.attendance = [date];

    }

    user.attendance.push({ date, attended });
    user.planDuration = Math.max(user.planDuration - 1, 0); 

    if (user.planDuration === 0) {
      user.plan = 'No tienes un plan';
      await createNotification(user._id, 'Finalizó su plan,','Ups, su plan ha finalizado, renueva tu plan.')
      
    }
    await createNotification(user._id, 'Asistencia a clase', `Tu asistencia ha sido registrada, tu número de clases restantes es: ${user.planDuration}`);

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar la asistencia:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/date/', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user.attendance);
  } catch (error) {
    console.error('Error al obtener las fechas de asistencia:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
  
});




module.exports = router;

