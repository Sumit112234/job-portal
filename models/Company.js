import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  logo: String,
  website: String,
  location: { type: String, required: true },
  size: { type: String, required: true },
  industry: { type: String, required: true },
  owner: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }],
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
