const mongoose = require('mongoose');

const adminOperatorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String 
  },
  contactNumber: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['Admin', 'PortalOperator'], 
    default: 'PortalOperator' 
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminOperator', adminOperatorSchema);