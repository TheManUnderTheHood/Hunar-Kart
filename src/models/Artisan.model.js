import mongoose from 'mongoose';

const artisanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  aadhaarCardNumber: { type: String }, 
  agreementStatus: { type: String, enum: ['Pending', 'Signed'], default: 'Pending' },
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const Artisan = mongoose.model('Artisan', artisanSchema);