import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const adminOperatorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: { 
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  contactNumber: { 
     type: String,
     required: [true, 'Contact number is required'],
     trim: true,
     match: [/^\d{10}$/, 'Please fill a valid 10-digit contact number']
  },
  avatar: {
      type: String, // url
      trim: true,
  },
  avatarPublicId: { 
      type: String,
  },
  role: { 
    type: String, 
    enum: {
      values: ['Admin', 'PortalOperator'],
      message: '{VALUE} is not a supported role'
    },
    default: 'PortalOperator' 
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  refreshToken: {
    type: String
  }
}, { timestamps: true });

// Hash password before saving
adminOperatorSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to check if password is correct
adminOperatorSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
};

// Method to generate Access Token
adminOperatorSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Method to generate Refresh Token
adminOperatorSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const AdminOperator = mongoose.model('AdminOperator', adminOperatorSchema);