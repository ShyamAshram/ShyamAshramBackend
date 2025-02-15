const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSchedule',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dayOfWeek: {
    type: String, // Cambiar de ObjectId a String
    required: true,
  },
  instructorName: {
    type: String, // El nombre del instructor es un string
    required: true,
  },
  date: {
    type: Date, // La fecha calculada para la clase
    required: true,
  },
  userName: {
    type: String, // El nombre del usuario inscrito
    required: true,
  },
  userEmail: {
    type: String, // El correo del usuario inscrito
    required: true,
  },
  attended: {
    type: Boolean,
    default: false,
  },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
