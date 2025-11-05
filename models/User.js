import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { 
    type: String, 
    enum: ['seeker', 'employer', 'admin'], 
    default: 'seeker' 
  },
  phone: String,
  location: String,
  avatar: String,
  resume: String,
  skills: [{ type: String }],
  experience: String,
  education: String,
  bio: String,
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company' 
  },
  isCompanyVerified: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  emailVerified: Date,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
