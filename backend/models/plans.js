const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    price2:{
      type:Number,
      require:true,
      min:0
    },

    currency: {
      type: String,
      default: 'COP',
    },

    interval: {
      type: String,
      enum: ['day', 'month', 'year'],
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);