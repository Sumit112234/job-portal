"use client";
import { motion } from 'framer-motion';
import { Calendar, MapPin, Building2 } from 'lucide-react';
import Button from '../ui/Button';

export default function ApplicationCard({ application }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewing: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    accepted: 'bg-purple-100 text-purple-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {application.job?.title}
          </h3>
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <Building2 className="w-4 h-4 mr-1" />
            {application.job?.company?.name}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            {application.job?.location}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[application.status]}`}>
          {application.status}
        </span>
      </div>

      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Calendar className="w-4 h-4 mr-1" />
        Applied on {new Date(application.createdAt).toLocaleDateString()}
      </div>

      <div className="flex space-x-2">
        <Button size="sm" variant="outline" className="flex-1">
          View Details
        </Button>
        <Button size="sm" className="flex-1">
          Message Employer
        </Button>
      </div>
    </motion.div>
  );
}
