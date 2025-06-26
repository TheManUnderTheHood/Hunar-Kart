import mongoose from 'mongoose';

const platformListingSchema = new mongoose.Schema({
  itemID: { type: mongoose.Schema.Types.ObjectId, ref: 'HandcraftedItem', required: true },
  platformName: { type: String, required: true }, 
  listingURL: { type: String },
  listingDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export const PlatformListing = mongoose.model('PlatformListing', platformListingSchema);