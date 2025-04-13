const mongoose = require('mongoose');

const weeklyAttendanceSchema = new mongoose.Schema({
  week: String,
  day: String,
  students: [
    {
      userId: String,
      userName: String,
      userEmail: String,
      attended: Boolean,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WeeklyAttendance = mongoose.model('WeeklyAttendance', weeklyAttendanceSchema);

module.exports = WeeklyAttendance;
