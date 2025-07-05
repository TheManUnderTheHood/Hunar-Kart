import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const adminOperatorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true 
  },
  contactNumber: { type: String,
     required: true 
    },
  avatar: {
        type: String, //url
        // required: true,
    },
  role: { 
    type: String, 
    enum: ['Admin', 'PortalOperator'], 
    default: 'PortalOperator' 
  },
  password: {
    type: String,
    required: [true, 'Password is required']
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