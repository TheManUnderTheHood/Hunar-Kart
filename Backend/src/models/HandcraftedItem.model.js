import mongoose from 'mongoose';

const handcraftedItemSchema = new mongoose.Schema({
  artisanID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Artisan', 
    required: [true, 'Artisan ID is required'] 
  },
  name: { 
    type: String, 
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [3, 'Item name must be at least 3 characters long']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: { 
    type: String,
    trim: true
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value for quantity'
    }
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: {
      values: ['Available', 'Sold', 'Draft'],
      message: '{VALUE} is not a supported status'
    }, 
    default: 'Available' 
  }
}, { timestamps: true });

export const HandcraftedItem = mongoose.model('HandcraftedItem', handcraftedItemSchema);