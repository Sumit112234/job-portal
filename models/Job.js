import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  benefits: String,
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  location: { type: String, required: true },
  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  type: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship'], 
    required: true 
  },
  experience: { type: String, required: true },
  category: { type: String, required: true },
  skills: [{ type: String }],
  status: { 
    type: String, 
    enum: ['active', 'closed', 'pending'], 
    default: 'pending' 
  },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 },
  applicants : [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  expiresAt: Date,
}, { timestamps: true });

export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
