import mongoose from 'mongoose';

const platformListingSchema = new mongoose.Schema({
  itemID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HandcraftedItem', 
    required: [true, 'Item ID is required'] 
  },
  platformName: { 
    type: String, 
    required: [true, 'Platform name is required'],
    trim: true
  }, 
  listingURL: { 
    type: String,
    trim: true,
    match: [/(https?:\/\/[^\s]+)/, 'Please provide a valid URL for the listing']
  },
  listingDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: {
      values: ['Active', 'Inactive'],
      message: '{VALUE} is not a supported status'
    }, 
    default: 'Active' 
  }
}, { timestamps: true });

export const PlatformListing = mongoose.model('PlatformListing', platformListingSchema);