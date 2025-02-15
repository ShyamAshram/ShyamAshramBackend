const cron = require('node-cron');
const User = require('./../models/user'); // Asegúrate de importar el modelo
const sendEmail = require('./../utils/sendEmail'); // Función para enviar correos
const sendWhatsApp = require('./../utils/sendWhatsApp'); // Función para WhatsApp
const sendPushNotification = require('./../utils/sendPushNotification'); // Función para notificaciones push


cron.schedule('0 9 * * *', async () => {  // Se ejecuta todos los días a las 9 AM
  console.log('Ejecutando tarea programada de recordatorio de planes.');

  const users = await User.find({
    planDuration: { $lte: 3, $gt: 0 }, // Usuarios con menos de 3 días de plan restante
  });

  users.forEach(async (user) => {
    const message = `Hola ${user.name}, tu plan "${user.plan}" está por expirar. ¡Renueva ahora para no perder acceso!`;

    await sendEmail(user.email, 'Recordatorio de vencimiento de plan', message);
    await sendWhatsApp(user.phonenumber, message);
    await sendPushNotification(user._id, message);
  });
});
