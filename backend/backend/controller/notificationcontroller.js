const Notification = require('../models/notification');

const createNotification = async (userId, title, description) => {
  const notification = new Notification({
    title,
    description,
    userId,
    date: new Date()
  });

  await notification.save();
};

module.exports = { createNotification };
