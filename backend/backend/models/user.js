const mongoose = require('mongoose'); 

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  attended: { type: Boolean, required: true, default: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowecase:true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin', 'profe'] },
  plan: { type: String, default: 'No tienes un plan', enum:['Ilimitado', '4 clases', '1 clase', 'Anualidad', 'No tienes un plan'] },
  planDuration: { type: Number, default: 0 },
  planStartDate: { type: Date, default: Date.now },
  attendance: { type: [attendanceSchema], default: [] },
  phonenumber: {type:String, required:true},
  birthDate: {type:Date, require:true}
  
});

const User = mongoose.model('User', userSchema);
module.exports = User;

