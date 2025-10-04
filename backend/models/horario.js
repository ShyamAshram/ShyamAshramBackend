const mongoose = require('mongoose');

const classScheduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dayOfWeek: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});


const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema, 'classSchedules');

module.exports = ClassSchedule;
