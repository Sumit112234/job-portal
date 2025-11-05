"use client";
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock, Bookmark, Star } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';
// import Router, { useRouter } from 'next/router';

export default function JobCard({ job, onSave, isSaved = false }) {
  const [saved, setSaved] = useState(isSaved);
  const router = useRouter();
 
  function getTimeAgo(createdAt) {
    const now = new Date();
    const createdTime = new Date(createdAt);
    const seconds = Math.floor((now - createdTime) / 1000);

    let interval = Math.floor(seconds / 31536000); // years
    if (interval >= 1) return `posted ${interval} year${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 2592000); // months
    if (interval >= 1) return `posted ${interval} month${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 86400); // days
    if (interval >= 1) return `posted ${interval} day${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 3600); // hours
    if (interval >= 1) return `posted ${interval} hour${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 60); // minutes
    if (interval >= 1) return `posted ${interval} minute${interval > 1 ? 's' : ''} ago`;

    return 'posted just now';
  }

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(job._id);
  };

  return (
    <Link href={`/jobs/${job._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
        className="bg-white rounded-xl shadow-md p-6 cursor-pointer border border-gray-100 relative overflow-hidden"
      >
        {job.featured && (
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold"
          >
            <Star className="w-3 h-3 inline mr-1" />
            FEATURED
          </motion.div>
        )}

        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-2xl text-white font-bold flex-shrink-0"
            >
              {job.company?.logo || job.company?.name?.[0] || 'C'}
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
              <p className="text-gray-600">{job.company?.name}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className="text-gray-400 hover:text-blue-600 transition"
          >
            <Bookmark
              className={`w-5 h-5 ${saved ? 'fill-blue-600 text-blue-600' : ''}`}
            />
          </motion.button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
            {job.location}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
            ${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-2 text-purple-600" />
            {job.type} • {job.experience}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills?.slice(0, 3).map((skill, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold"
            >
              {skill}
            </motion.span>
          ))}
          {job.skills?.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
          {/* {console.log('Job Data in JobCard:', job)} */}
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-xs text-gray-500">{getTimeAgo(job.createdAt)}</span>
          <Button size="sm" onClick={(e) => {e.preventDefault();  router.push(`/jobs/${job._id}`)}}>
            Apply Now
          </Button>
        </div>
      </motion.div>
    </Link>
  );
}
