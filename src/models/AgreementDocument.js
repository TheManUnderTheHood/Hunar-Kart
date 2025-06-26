const mongoose = require('mongoose');

const agreementDocumentSchema = new mongoose.Schema({
  artisanID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Artisan', 
    required: true 
  },
  filePath: { 
    type: String, 
    required: true 
  }, 
  dateSigned: { 
    type: Date, 
    required: true 
  },
  validUntil: { 
    type: Date 
  }
}, { timestamps: true });

module.exports = mongoose.model('AgreementDocument', agreementDocumentSchema);