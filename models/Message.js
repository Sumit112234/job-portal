import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  application: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Application' 
  },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
