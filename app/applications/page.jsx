"use client";
import { motion } from 'framer-motion';
import { FileText, Eye, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatsCard from '@/components/dashboard/StatsCard';
import ApplicationCard from '@/components/dashboard/ApplicationCard';
import Loading from '@/components/ui/Loading';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    reviewing: 0,
    shortlisted: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      const apps = data.applications || [];
      setApplications(apps);

      setStats({
        total: apps.length,
        reviewing: apps.filter(a => a.status === 'reviewing').length,
        shortlisted: apps.filter(a => a.status === 'shortlisted').length,
      });
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track all your job applications</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={FileText}
            title="Total Applied"
            value={stats.total}
            color="blue"
          />
          <StatsCard
            icon={Eye}
            title="Under Review"
            value={stats.reviewing}
            color="orange"
          />
          <StatsCard
            icon={CheckCircle}
            title="Shortlisted"
            value={stats.shortlisted}
            trend={25}
            color="green"
          />
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((app, idx) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ApplicationCard application={app} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
