import mongoose from 'mongoose';

const agreementDocumentSchema = new mongoose.Schema({
  artisanID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Artisan', 
    required: [true, 'Artisan ID is required'] 
  },
  filePath: { 
    type: String, 
    required: [true, 'File path is required'],
    trim: true
  }, 
  filePathPublicId: {
    type: String
  },
  dateSigned: { 
    type: Date, 
    required: [true, 'Date signed is required'] 
  },
  validUntil: { 
    type: Date,
    validate: {
        validator: function(value) {
            // 'this' refers to the document being validated.
            // Validation passes if validUntil is not set, or if it's after the signed date.
            return !value || this.dateSigned < value;
        },
        message: 'Valid until date must be after the date signed.'
    }
  }
}, { timestamps: true });

export const AgreementDocument = mongoose.model('AgreementDocument', agreementDocumentSchema);