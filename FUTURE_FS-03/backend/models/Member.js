const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  // Personal Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 10,
    max: 100
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },

  // Membership Info
  membershipPlan: {
    type: String,
    enum: ['Basic', 'Standard', 'Premium'],
    required: true,
    default: 'Basic'
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Left'],
    default: 'Active'
  },

  // Payment
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'UPI', 'Card', 'Bank Transfer'],
    default: 'Cash'
  },

  // Goals / Notes
  fitnessGoal: {
    type: String,
    enum: ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness'],
    default: 'General Fitness'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual: days remaining
memberSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const diff = this.expiryDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

memberSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Member', memberSchema);
