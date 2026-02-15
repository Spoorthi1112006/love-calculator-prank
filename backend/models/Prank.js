const mongoose = require('mongoose');

const PrankSchema = new mongoose.Schema({
  prankId: {
    type: String,
    required: true,
    unique: true
  },
  creatorName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prank', PrankSchema);
