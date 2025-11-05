"use client";
import { motion } from 'framer-motion';
import { MapPin, Users, Briefcase, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/Button';

export default function CompanyCard({ company }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-3xl text-white font-bold"
        >
          {company.logo || company.name?.[0]}
        </motion.div>
        {company.isVerified && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"
          >
            ✓ Verified
          </motion.span>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{company.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {company.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          {company.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2 text-purple-600" />
          {company.size} employees
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="w-4 h-4 mr-2 text-green-600" />
          {company.jobCount || 0} open positions
        </div>
      </div>

      <div className="flex space-x-2">
        <Link href={`/companies/${company._id}`} className="flex-1">
          <Button className="w-full" size="sm">
            View Jobs
          </Button>
        </Link>
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
}