const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

counterSchema.statics.getNextTicketNo = async function () {
  const counter = await this.findOneAndUpdate(
    { name: 'grievance' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `GUN-${new Date().getFullYear()}-${String(counter.seq).padStart(4, '0')}`;
};

module.exports = mongoose.model('Counter', counterSchema);
