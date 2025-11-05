'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Star,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Download,
  Filter,
  Search,
  ChevronDown,
  Calendar,
  DollarSign,
  Award
} from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [filter, selectedJob]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (selectedJob !== 'all') params.append('jobId', selectedJob);
      
      const res = await fetch(`/api/employer/application?${params}`);
      const data = await res.json();
      setApplications(data.applications || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await fetch(`/api/employer/application/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchApplications();
      if (selectedApplication?._id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-500', label: 'Pending', icon: Clock },
    reviewing: { color: 'bg-blue-500', label: 'Reviewing', icon: Eye },
    shortlisted: { color: 'bg-purple-500', label: 'Shortlisted', icon: Star },
    accepted: { color: 'bg-green-500', label: 'Accepted', icon: CheckCircle },
    rejected: { color: 'bg-red-500', label: 'Rejected', icon: XCircle }
  };

  const filteredApplications = applications.filter(app =>
    app.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}

      <Navbar/>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Applications Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage and review candidate applications</p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <div className="text-sm font-medium">Total Applications</div>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(statusConfig).map(([key, config], idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => setFilter(key)}
              className={`bg-white rounded-2xl p-6 shadow-md cursor-pointer transition-all ${
                filter === key ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-xl' : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${config.color} p-3 rounded-xl text-white`}>
                  <config.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats[key] || 0}</div>
              <div className="text-sm text-gray-600 mt-1">{config.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by candidate name or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setFilter('all')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center gap-2 font-medium"
            >
              <Filter className="w-5 h-5" />
              Clear Filters
            </button>
          </div>
        </motion.div>

        {/* Applications List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1 space-y-4">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div className="flex justify-center items-center h-64">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </motion.div>
              ) : filteredApplications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-12 text-center shadow-md"
                >
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No applications found</p>
                </motion.div>
              ) : (
                filteredApplications.map((app, idx) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedApplication(app)}
                    className={`bg-white rounded-2xl p-6 shadow-md cursor-pointer transition-all ${
                      selectedApplication?._id === app._id 
                        ? 'ring-2 ring-indigo-500 shadow-xl' 
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {app.applicant?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {app.applicant?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {app.job?.title || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusConfig[app.status]?.color}`}>
                            {statusConfig[app.status]?.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Application Detail */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedApplication ? (
                <motion.div
                  key={selectedApplication._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                        {selectedApplication.applicant?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold">{selectedApplication.applicant?.name}</h2>
                        <p className="text-indigo-100 mt-1">{selectedApplication.applicant?.email}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                            {statusConfig[selectedApplication.status]?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Job Details */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                        Applied Position
                      </h3>
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900">{selectedApplication.job?.title}</h4>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{selectedApplication.job?.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Briefcase className="w-4 h-4" />
                            <span className="text-sm capitalize">{selectedApplication.job?.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Info */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        Candidate Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedApplication.applicant?.phone && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <Phone className="w-5 h-5 text-indigo-600" />
                            <div>
                              <div className="text-xs text-gray-500">Phone</div>
                              <div className="font-medium">{selectedApplication.applicant.phone}</div>
                            </div>
                          </div>
                        )}
                        {selectedApplication.applicant?.location && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <MapPin className="w-5 h-5 text-indigo-600" />
                            <div>
                              <div className="text-xs text-gray-500">Location</div>
                              <div className="font-medium">{selectedApplication.applicant.location}</div>
                            </div>
                          </div>
                        )}
                        {selectedApplication.applicant?.experience && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <Award className="w-5 h-5 text-indigo-600" />
                            <div>
                              <div className="text-xs text-gray-500">Experience</div>
                              <div className="font-medium">{selectedApplication.applicant.experience}</div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                          <div>
                            <div className="text-xs text-gray-500">Applied On</div>
                            <div className="font-medium">
                              {new Date(selectedApplication.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    {selectedApplication.applicant?.skills?.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.applicant.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cover Letter */}
                    {selectedApplication.coverLetter && (
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-6 h-6 text-indigo-600" />
                          Cover Letter
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                        </div>
                      </div>
                    )}

                    {/* Resume */}
                    {selectedApplication.resume && (
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Resume</h3>
                        <a
                          href={selectedApplication.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:shadow-md transition-all"
                        >
                          <Download className="w-5 h-5 text-indigo-600" />
                          <span className="font-medium text-indigo-600">Download Resume</span>
                        </a>
                      </div>
                    )}

                    {/* Status Actions */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Update Status</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <motion.button
                            key={status}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusUpdate(selectedApplication._id, status)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium transition-all ${
                              selectedApplication.status === status
                                ? `${config.color} text-white shadow-lg`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <config.icon className="w-5 h-5" />
                            <span className="text-sm">{config.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-16 text-center shadow-md h-full flex items-center justify-center"
                >
                  <div>
                    <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Select an application to view details</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
};

export default ApplicationsPage;