const cron = require('node-cron');
const User = require('./../models/user'); 
const sendEmail = require('./../utils/sendEmail');
const sendPushNotification = require('./../utils/sendPushNotification'); 
const { sendNotification } = require('../utils/sendNotification');


cron.schedule('0 9 * * *', async () => {  
  console.log('Ejecutando tarea programada de recordatorio de planes.');

  const users = await User.find({
    planDuration: { $lte: 3, $gt: 0 }, 
  });

  users.forEach(async (user) => {
    const message = `Hola ${user.name}, tu plan "${user.plan}" está por expirar. ¡Renueva ahora para no perder acceso!`;

    // await sendEmail(user.email, 'Recordatorio de vencimiento de plan', message);
    // await sendWhatsApp(user.phonenumber, message);
    // await sendPushNotification(user._id, message);

      if (user.fcmToken) {
        await sendNotification(user.fcmToken, {
          title: "Tu plan está por expirar",
          body: message,
        });
    }
  });
});

cron.schedule('0 0 * * *', async () => {  
  console.log('Actualizando duración de planes de usuarios...');

  const users = await User.find({ planDuration: { $gt: 0 } });

  for (let user of users) {
    if (['4 clases', '1 clase'].includes(user.plan)) {
      const startDate = new Date(user.planStartDate);
      const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      if (new Date() > endOfMonth) {
        user.planDuration = 0; 
        await user.save();
      }
    } else {
      user.planDuration -= 1;
      if (user.planDuration < 0) user.planDuration = 0;
      await user.save();
    }
  }

  console.log('Duración de planes actualizada correctamente.');
});
