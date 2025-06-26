import mongoose from 'mongoose';

const agreementDocumentSchema = new mongoose.Schema({
  artisanID: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true },
  filePath: { type: String, required: true }, 
  dateSigned: { type: Date, required: true },
  validUntil: { type: Date }
}, { timestamps: true });

export const AgreementDocument = mongoose.model('AgreementDocument', agreementDocumentSchema);