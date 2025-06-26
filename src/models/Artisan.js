const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  contactNumber: { 
    type: String, 
    required: true 
  },
  aadhaarCardNumber: { 
    type: String 
  }, 
  agreementStatus: { 
    type: String, 
    enum: ['Pending', 'Signed'],
    default: 'Pending' 
  },
  registrationDate: { 
    type: Date, 
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Artisan', artisanSchema);