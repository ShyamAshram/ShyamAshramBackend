const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  students: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      userName: { type: String, required: true },
      userEmail: { type: String, required: true },
    },
  ],
  instructorId: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('List', ListSchema);
