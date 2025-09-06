const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, isAdmin, isAdminOrProfesor, isProfesor } = require('../middleware/admin');
const Notification = require('../models/notification');
const { createNotification } = require('../controller/notificationcontroller');
const { now } = require('mongoose');
const Attendance = require('../models/attendance')
const nodemailer = require('nodemailer');

require('dotenv').config();
if (!process.env.JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY no está definido en las variables de entorno');
}

const token = jwt.sign({ id: User._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

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

router.put('/:id', authenticateToken, isAdminOrProfesor,  async (req, res) => {
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
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
  },
});

// Función para enviar correo electrónico
const sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">${resetLink}</a>`,
  };

  await transporter.sendMail(mailOptions);
};

// Ruta para recuperar contraseña
router.post('/recover-password', async (req, res) => {
  const { email } = req.body;

  try {
      // Buscar al usuario por su correo electrónico
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ error: 'El correo no está registrado' });
      }

      // Verificar que JWT_SECRET esté definido
      if (!process.env.JWT_SECRET_KEY) {
          throw new Error('JWT_SECRET no está definido en las variables de entorno');
      }

      // Generar un token JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

      // Crear el enlace de recuperación
      const resetLink = `http://192.168.128.15:3001/reset-password?token=${token}`;

      // Enviar el correo electrónico
      await sendPasswordResetEmail(email, resetLink);

      res.json({ message: 'Correo enviado' });
  } catch (error) {
      console.error('Error en la recuperación de contraseña:', error);
      res.status(500).json({ error: error.message });
  }
});

router.get('/reset-password', (req, res) => {
  const token = req.query.token;

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Renderizar la página de restablecimiento de contraseña
    res.render('reset-password', { token });
  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(400).json({ error: 'Token inválido o expirado' });
  }
});

module.exports = router;

