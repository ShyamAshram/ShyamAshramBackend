const cron = require('node-cron');
const User = require('./../models/user'); 
const sendEmail = require('./../utils/sendEmail');
const sendWhatsApp = require('./../utils/sendWhatsApp'); 
const sendPushNotification = require('./../utils/sendPushNotification'); 


cron.schedule('0 9 * * *', async () => {  
  console.log('Ejecutando tarea programada de recordatorio de planes.');

  const users = await User.find({
    planDuration: { $lte: 3, $gt: 0 }, 
  });

  users.forEach(async (user) => {
    const message = `Hola ${user.name}, tu plan "${user.plan}" está por expirar. ¡Renueva ahora para no perder acceso!`;

    await sendEmail(user.email, 'Recordatorio de vencimiento de plan', message);
    await sendWhatsApp(user.phonenumber, message);
    await sendPushNotification(user._id, message);
  });
});
