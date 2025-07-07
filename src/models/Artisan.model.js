import mongoose from 'mongoose';

const artisanSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Artisan name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  address: { 
    type: String, 
    required: [true, 'Address is required'],
    trim: true,
    minlength: [10, 'Address must be at least 10 characters long']
  },
  contactNumber: { 
    type: String, 
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^\d{10}$/, 'Please fill a valid 10-digit contact number']
  },
  aadhaarCardNumber: { 
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allows multiple null values, but ensures uniqueness for documents that have this field.
    match: [/^\d{12}$/, 'Please fill a valid 12-digit Aadhaar number']
  }, 
  agreementStatus: { 
    type: String, 
    enum: {
      values: ['Pending', 'Signed'],
      message: '{VALUE} is not a supported agreement status'
    }, 
    default: 'Pending' 
  },
  registrationDate: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export const Artisan = mongoose.model('Artisan', artisanSchema);