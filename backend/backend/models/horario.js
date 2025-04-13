const mongoose = require('mongoose');

// Definir el esquema para los horarios de clases
const classScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dayOfWeek: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  instructor: {
    type: String,
    required: true,
  }
});

// Crear el modelo basado en el esquema y especificar el nombre de la colección
const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema, 'classSchedules');

// Exportar el modelo
module.exports = ClassSchedule;
