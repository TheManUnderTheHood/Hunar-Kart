import mongoose from 'mongoose';

const adminOperatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  contactNumber: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'PortalOperator'], default: 'PortalOperator' }
}, { timestamps: true });

export const AdminOperator = mongoose.model('AdminOperator', adminOperatorSchema);