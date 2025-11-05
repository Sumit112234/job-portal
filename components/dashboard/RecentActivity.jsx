"use client";
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

export default function RecentActivity({ activities }) {
  const iconMap = {
    applied: { Icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    viewed: { Icon: Eye, color: 'text-purple-600', bg: 'bg-purple-100' },
    shortlisted: { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    rejected: { Icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
      <div className="space-y-4">
        {activities?.map((activity, idx) => {
          const { Icon, color, bg } = iconMap[activity.type] || iconMap.applied;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition"
            >
              <div className={`p-2 ${bg} rounded-lg flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {activity.time}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}