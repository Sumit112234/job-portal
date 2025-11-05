import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  job: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  applicant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  resume: { type: String, required: true },
  coverLetter: String,
  status: { 
    type: String, 
    enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  notes: String,
}, { timestamps: true });

export const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
