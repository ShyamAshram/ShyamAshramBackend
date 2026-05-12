const cron = require('node-cron');
const User = require('./../models/user'); 
const Attendance = require('./../models/attendance')
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
    // nuevo 

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

  const today = new Date();

  const users = await User.find({
    planTotalDuration: { $gt: 0 }
  });

  for (let user of users) {
    if (!user.planStartDate) continue;

    const startDate = new Date(user.planStartDate);

    if (['4 clases', '1 clase'].includes(user.plan)) {
      const endOfMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      );

      if (today > endOfMonth) {
        user.planDuration = 0;
      } else {
        user.planDuration = user.planTotalDuration;
      }

      await user.save();
      continue;
    }

    const diffTime = today - startDate;

    const daysPassed = Math.floor(
      diffTime / (1000 * 60 * 60 * 24)
    );

    if (daysPassed <= 0) {
      user.planDuration = user.planTotalDuration;
    } else {
      user.planDuration = Math.max(
        user.planTotalDuration - daysPassed,
        0
      );
    }

    await user.save();
  }

  console.log('Duración de planes actualizada correctamente.');
});

cron.schedule('0 2 * * *', async () => {
  console.log('Ejecutando cronjob de archivado de inscripciones pasadas...');

  try {
    const today = new Date();

    const result = await Attendance.updateMany(
      { date: { $lt: today }, archived: false },
      { $set: { archived: true } }
    );

    console.log(`📦 ${result.modifiedCount} inscripciones archivadas correctamente.`);
  } catch (error) {
    console.error('❌ Error al archivar inscripciones pasadas:', error);
  }
});
