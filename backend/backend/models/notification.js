const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, default:'no title' },
  description: { type: String, required: true, default:'no sub'  },
  date: { type: Date, default: Date.now },
  userId:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true}
});

module.exports = mongoose.model('Notification', notificationSchema);
