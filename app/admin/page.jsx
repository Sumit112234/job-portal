"use client";
import { motion } from 'framer-motion';
import { Users, Briefcase, Building2, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatsCard from '@/components/dashboard/StatsCard';
import ApprovalCard from '@/components/admin/ApprovalCard';
import Loading from '@/components/ui/Loading';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, jobsRes, companiesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/jobs/pending'),
        fetch('/api/admin/companies/pending'),
      ]);

      const statsData = await statsRes.json();
      const jobsData = await jobsRes.json();
      const companiesData = await companiesRes.json();

      setStats(statsData.stats);
      setPendingJobs(jobsData.jobs || []);
      setPendingCompanies(companiesData.companies || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      await fetch('/api/admin/jobs/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'approve' }),
      });
      fetchAdminData();
    } catch (error) {
      console.error('Failed to approve job:', error);
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      await fetch('/api/admin/jobs/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'reject' }),
      });
      fetchAdminData();
    } catch (error) {
      console.error('Failed to reject job:', error);
    }
  };
  const handleApproveCompany = async (cid) => {
    try {
      await fetch('/api/admin/companies/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId : cid, action: 'verify' }),
      });
      fetchAdminData();
    } catch (error) {
      console.error('Failed to approve job:', error);
    }
  };

  const handleRejectCompany = async (cid) => {
    try {
      await fetch('/api/admin/companies/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId : cid, action: 'reject' }),
      });
      fetchAdminData();
    } catch (error) {
      console.error('Failed to reject job:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage platform operations</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Users}
            title="Total Users"
            value={stats?.totalUsers || 0}
            color="blue"
          />
          <StatsCard
            icon={Building2}
            title="Companies"
            value={stats?.totalCompanies || 0}
            color="purple"
          />
          <StatsCard
            icon={Briefcase}
            title="Active Jobs"
            value={stats?.activeJobs || 0}
            color="green"
          />
          <StatsCard
            icon={TrendingUp}
            title="Applications"
            value={stats?.totalApplications || 0}
            color="orange"
          />
        </div>

        {/* Pending Approvals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pending Job Approvals ({pendingJobs.length})
            </h2>
            <div className="space-y-4">
              {pendingJobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ApprovalCard
                    item={job}
                    type="job"
                    onApprove={handleApproveJob}
                    onReject={handleRejectJob}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pending Company Verifications ({pendingCompanies.length})
            </h2>
            <div className="space-y-4">
              {pendingCompanies.map((company, idx) => (
                <motion.div
                  key={company._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ApprovalCard
                    item={company}
                    type="company"
                    onApprove={(id) => handleApproveCompany(id)}
                    onReject={(id) => handleRejectCompany(id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
