const mongoose = require('mongoose'); 

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gatewaySubscriptionId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'past_due', 'canceled'],
    default: 'pending',
  },
  planName: {
    type: String,
    required: true,
  },
  currentPeriodEnd: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);