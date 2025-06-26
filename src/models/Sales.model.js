import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  itemID: { type: mongoose.Schema.Types.ObjectId, ref: 'HandcraftedItem', required: true },
  artisanID: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true },
  platformName: { type: String, required: true },
  quantitySold: { type: Number, required: true },
  totalRevenue: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, {timestamps: true}); // Added timestamps

export const Sale = mongoose.model('Sale', saleSchema);