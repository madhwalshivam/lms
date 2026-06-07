const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true },
  author: { type: String, required: true },
});

const activityLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, required: true },
});

const followUpSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, enum: ['Call', 'WhatsApp', 'Email', 'Meeting'], default: 'Call' },
  completed: { type: Boolean, default: false },
});

const leadSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  budget: {
    type: String,
    default: 'Not Specified',
  },
  travelDate: {
    type: String,
    default: '',
  },
  pax: {
    type: Number,
    default: 1,
  },
  leadSource: {
    type: String,
    enum: ['Website', 'Facebook Ads', 'Instagram Ads', 'Google Ads', 'Manual'],
    default: 'Manual',
  },
  assignedExecutive: {
    type: String,
    default: 'Unassigned',
  },
  leadStatus: {
    type: String,
    enum: ['New', 'Contacted', 'Follow-Up', 'Converted', 'Rejected'],
    default: 'New',
  },
  notes: {
    type: [noteSchema],
    default: [],
  },
  activityHistory: {
    type: [activityLogSchema],
    default: [],
  },
  followUpHistory: {
    type: [followUpSchema],
    default: [],
  },
  createdDate: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Auto-increment custom lead ID (e.g. LMS-10001) before saving
leadSchema.pre('save', async function (next) {
  if (!this.id) {
    const LeadModel = mongoose.model('Lead');
    const count = await LeadModel.countDocuments();
    this.id = `LMS-${10000 + count + 1}`;
  }
  next();
});

const Lead = mongoose.model('Lead', leadSchema);
module.exports = Lead;
