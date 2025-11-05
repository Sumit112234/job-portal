"use client";
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

export default function ProfileCompletion({ percentage, steps }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Profile Completion</h3>
        <span className="text-3xl font-bold">{percentage}%</span>
      </div>

      <div className="w-full bg-white/20 rounded-full h-3 mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="bg-white h-full rounded-full"
        />
      </div>

      <div className="space-y-3">
        {steps?.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center"
          >
            {step.completed ? (
              <CheckCircle className="w-5 h-5 text-green-300 mr-3 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-white/50 mr-3 flex-shrink-0" />
            )}
            <span className={step.completed ? 'text-white' : 'text-white/70'}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}