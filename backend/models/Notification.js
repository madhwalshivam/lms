const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    enum: ['new_lead', 'reminder', 'converted', 'summary'],
    default: 'new_lead',
  },
}, {
  timestamps: true,
});

// Generate custom unique ID before saving if not present
notificationSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
