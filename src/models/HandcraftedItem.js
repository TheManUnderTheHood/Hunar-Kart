import mongoose from 'mongoose';

const handcraftedItemSchema = new mongoose.Schema({
  artisanID: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Available', 'Sold', 'Draft'], default: 'Available' }
}, { timestamps: true });

export const HandcraftedItem = mongoose.model('HandcraftedItem', handcraftedItemSchema);