"use client";
import { motion } from 'framer-motion';
import { Briefcase, FileText, Eye, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatsCard from '@/components/dashboard/StatsCard';
import ApplicationCard from '@/components/dashboard/ApplicationCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ProfileCompletion from '@/components/profile/ProfileCompletion';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    underReview: 0,
    shortlisted: 0,
    profileViews: 0,
  });

  const recentActivities = [
    {
      type: 'applied',
      title: 'Application Submitted',
      description: 'Your application for Senior React Developer has been received',
      time: '2 hours ago',
    },
    {
      type: 'viewed',
      title: 'Profile Viewed',
      description: 'TechCorp Inc. viewed your profile',
      time: '5 hours ago',
    },
    {
      type: 'shortlisted',
      title: 'You\'re Shortlisted!',
      description: 'Congratulations! You\'ve been shortlisted for Product Manager role',
      time: '1 day ago',
    },
  ];

  const profileSteps = [
    { label: 'Personal Information', completed: true },
    { label: 'Upload Resume', completed: true },
    { label: 'Add Skills', completed: true },
    { label: 'Work Experience', completed: false },
    { label: 'Education', completed: false },
  ];

  useEffect(() => {
    if (session?.user) {
      fetchApplications();
    }
  }, [session]);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApplications(data.applications || []);
      
      // Calculate stats
      const total = data.applications?.length || 0;
      const reviewing = data.applications?.filter(a => a.status === 'reviewing').length || 0;
      const shortlisted = data.applications?.filter(a => a.status === 'shortlisted').length || 0;
      
      setStats({
        totalApplications: total,
        underReview: reviewing,
        shortlisted,
        profileViews: 123, // Mock data
      });
    } catch (error) {
      console.error('Failed to fetch applications:', error);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your job search</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard
              icon={Briefcase}
              title="Total Applications"
              value={stats.totalApplications}
              trend={12}
              color="blue"
            />
            <StatsCard
              icon={FileText}
              title="Under Review"
              value={stats.underReview}
              color="orange"
            />
            <StatsCard
              icon={Eye}
              title="Shortlisted"
              value={stats.shortlisted}
              trend={25}
              color="green"
            />
            <StatsCard
              icon={Clock}
              title="Profile Views"
              value={stats.profileViews}
              trend={8}
              color="purple"
            />
          </div>

          {/* Profile Completion */}
          <div className="lg:col-span-1">
            <ProfileCompletion
              percentage={60}
              steps={profileSteps}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-6">Recent Applications</h2>
              <div className="space-y-4">
                {applications.slice(0, 3).map((app, idx) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ApplicationCard application={app} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecentActivity activities={recentActivities} />
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
