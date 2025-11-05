import mongoose from 'mongoose';

const JobAlertSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  keywords: [{ type: String }],
  location: String,
  type: String,
  minSalary: Number,
  frequency: { 
    type: String, 
    enum: ['daily', 'weekly'], 
    default: 'daily' 
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const JobAlert = mongoose.models.JobAlert || mongoose.model('JobAlert', JobAlertSchema);
