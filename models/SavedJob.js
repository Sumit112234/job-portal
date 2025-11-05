import mongoose from 'mongoose';

const SavedJobSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  job: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
}, { timestamps: true });

SavedJobSchema.index({ user: 1, job: 1 }, { unique: true });

export const SavedJob = mongoose.models.SavedJob || mongoose.model('SavedJob', SavedJobSchema);
