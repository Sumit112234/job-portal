"use client";
import { motion } from 'framer-motion';

export default function Loading({ fullScreen = false }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className={`${fullScreen ? 'fixed inset-0 bg-white' : ''} flex items-center justify-center`}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex space-x-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            variants={item}
            animate={{
              y: [0, -20, 0],
              transition: {
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }
            }}
            className="w-4 h-4 bg-blue-600 rounded-full"
          />
        ))}
      </motion.div>
    </div>
  );
}