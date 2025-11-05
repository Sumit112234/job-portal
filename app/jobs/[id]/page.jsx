"use client";
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock, Briefcase, Building2, Share2, Bookmark, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJob();
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${params.id}`);
      const data = await res.json();
      setJob(data.job);
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job._id,
          coverLetter,
          resume: 'resume-url', // Get from user profile
        }),
      });

      if (res.ok) {
        alert('Application submitted successfully!');
        setShowApplyModal(false);
      }
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loading fullScreen />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-700 mb-6 flex items-center"
          >
            ← Back to Jobs
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start space-x-6">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-3xl text-white font-bold flex-shrink-0"
                >
                  {job.company?.logo || job.company?.name?.[0]}
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {job.company?.name}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <DollarSign className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-sm text-gray-600">Salary</p>
                <p className="text-lg font-bold text-gray-900">
                  ${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <Clock className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-sm text-gray-600">Job Type</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{job.type}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <Briefcase className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-sm text-gray-600">Experience</p>
                <p className="text-lg font-bold text-gray-900">{job.experience}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <div
                  className="text-gray-700 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </div>

              {job.benefits && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
                  <div
                    className="text-gray-700 leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.benefits }}
                  />
                </div>
              )}
            </div>

            {/* Apply Button */}
            <div className="border-t pt-6">
              <Button
                className="w-full md:w-auto"
                size="lg"
                onClick={() => setShowApplyModal(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                Apply for this Position
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply for this Job"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Letter
            </label>
            <textarea
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tell us why you're a great fit for this role..."
            />
          </div>
          <div className="flex space-x-3">
            <Button className="flex-1" onClick={handleApply}>
              Submit Application
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowApplyModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
