"use client";
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Building2, Briefcase } from 'lucide-react';
import Button from '../ui/Button';

export default function ApprovalCard({ item, type, onApprove, onReject }) {
  const isJob = type === 'job';
  const Icon = isJob ? Briefcase : Building2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">
            {isJob ? item.title : item.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {isJob ? item.company?.name : item.industry}
          </p>
          <div className="flex items-center text-xs text-gray-500">
            <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
          Pending
        </span>
      </div>

      <div className="mt-4 flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          variant="success"
          onClick={() => onApprove(item._id)}
          className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => onReject(item._id)}
          className="flex-1 flex items-center justify-center"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject
        </Button>
      </div>
    </motion.div>
  );
}
