const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  pair: { type: String, required: true },
  direction: { type: String, enum: ['LONG', 'SHORT'], required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  
  // 1. Updated Trigger Logic
  trigger: { type: String, required: true }, 

  // 2. Rule Adherence Removed
  
  // 3. New Scalp Toggle
  isScalp: { type: Boolean, default: false },

  // Standard Metrics
  plannedRisk: { type: Number, default: 0 },
  plannedReward: { type: Number, default: 0 },
  emotion: { type: String, default: 'Neutral' },
  mistake: { type: String, default: 'None' },
  grossPnL: { type: Number, required: true },
  netPnL: { type: Number, required: true },
  brokerage: { type: Number, default: 0 },

  // Images & Notes
  entryImage: { type: String },
  exitImage: { type: String },
  lesson: { type: String, maxLength: 140 },
  
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema);