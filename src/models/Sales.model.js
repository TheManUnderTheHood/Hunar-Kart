import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  itemID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HandcraftedItem', 
    required: [true, 'Item ID is required'] 
  },
  artisanID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Artisan', 
    required: [true, 'Artisan ID is required'] 
  },
  platformName: { 
    type: String, 
    required: [true, 'Platform name is required'],
    trim: true
  },
  quantitySold: { 
    type: Number, 
    required: [true, 'Quantity sold is required'],
    min: [1, 'Quantity sold must be at least 1'] 
  },
  totalRevenue: { 
    type: Number, 
    required: [true, 'Total revenue is required'],
    min: [0, 'Total revenue cannot be negative']
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, {timestamps: true});

export const Sale = mongoose.model('Sale', saleSchema);