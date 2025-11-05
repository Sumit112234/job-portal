"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';

export default function JobFilters({ onFilterChange, onClose }) {
  const [filters, setFilters] = useState({
    type: [],
    experience: [],
    salary: { min: 0, max: 200000 },
    location: '',
  });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const experienceLevels = ['Entry Level', '2-4 years', '5+ years', '10+ years'];

  const handleCheckbox = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleApply = () => {
    onFilterChange(filters);
    onClose?.();
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="bg-white h-full w-80 shadow-xl p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-xl font-bold">Filters</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Job Type */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Job Type</h4>
          {jobTypes.map((type, idx) => (
            <motion.label
              key={type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center mb-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.type.includes(type)}
                onChange={() => handleCheckbox('type', type)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-blue-600 transition">
                {type}
              </span>
            </motion.label>
          ))}
        </div>

        {/* Experience Level */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Experience Level</h4>
          {experienceLevels.map((exp, idx) => (
            <motion.label
              key={exp}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center mb-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.experience.includes(exp)}
                onChange={() => handleCheckbox('experience', exp)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-blue-600 transition">
                {exp}
              </span>
            </motion.label>
          ))}
        </div>

        {/* Salary Range */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Salary Range</h4>
          <input
            type="range"
            min="0"
            max="200000"
            step="10000"
            value={filters.salary.max}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              salary: { ...prev.salary, max: parseInt(e.target.value) }
            }))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>$0</span>
            <span className="font-semibold text-blue-600">
              ${filters.salary.max.toLocaleString()}
            </span>
            <span>$200k+</span>
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Location</h4>
          <input
            type="text"
            placeholder="Enter location..."
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Button className="w-full" onClick={handleApply}>
          Apply Filters
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setFilters({
            type: [],
            experience: [],
            salary: { min: 0, max: 200000 },
            location: '',
          })}
        >
          Reset All
        </Button>
      </div>
    </motion.div>
  );
}
