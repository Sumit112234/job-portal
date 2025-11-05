'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Briefcase, MapPin, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, jobId: null });
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employer/jobs');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }

      setJobs(data.jobs);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete job');
      }

      // Remove job from state
      setJobs(jobs.filter(job => job._id !== jobId));
      setDeleteModal({ show: false, jobId: null });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = (jobId) => {
    router.push(`/employer/jobs/edit/${jobId}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return `Up to ${currency} ${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <Navbar/>
        {/* Header */}
                
        <div className="mb-8">

            <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
          <h1 className="text-3xl font-bold text-gray-900">Your Job Postings</h1>
          <p className="mt-2 text-gray-600">Manage all your company's job listings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new job posting.</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/employer/post-job')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Post a Job
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Job Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  
                  {/* Company */}
                  {job.company && (
                    <p className="text-sm text-gray-600 mb-4">{job.company.name}</p>
                  )}

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{job.type}</span>
                    </div>

                    {(job.salaryMin || job.salaryMax) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Posted {formatDate(job.createdAt)}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : job.status === 'closed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleUpdate(job._id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, jobId: job._id })}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl p-8 m-4 max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Job Posting</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this job posting? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModal({ show: false, jobId: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.jobId)}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer/>
      </div>
    </div>
  );
}

// "use client";
// import { motion } from 'framer-motion';
// import { Briefcase, DollarSign, MapPin, Clock } from 'lucide-react';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Navbar from '@/components/layout/Navbar';
// import Footer from '@/components/layout/Footer';
// import Input from '@/components/ui/Input';
// import Button from '@/components/ui/Button';
// import { useSession } from 'next-auth/react';


// export default function PostJobPage() {
//   const router = useRouter();
//   const { data: user } = useSession();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     requirements: '',
//     benefits: '',
//     location: '',
//     type: 'full-time',
//     experience: '',
//     category: '',
//     salaryMin: '',
//     salaryMax: '',
//     skills: '',
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // setLoading(true);
//     console.log('user : ', user) 
    

//     try {
//       const res = await fetch('/api/jobs', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...formData,
//           salary: {
//             min: parseInt(formData.salaryMin),
//             max: parseInt(formData.salaryMax),
//             currency: 'USD',
//           },
//           skills: formData.skills.split(',').map(s => s.trim()),
//           company: user.company, // Get from user session
//         }),
//       });

//       if (res.ok) {
//         alert('Job posted successfully! Awaiting admin approval.');
//         router.push('/employer/jobs');
//       }
//     } catch (error) {
//       console.error('Failed to post job:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">Post a New Job</h1>
//           <p className="text-gray-600">Find the perfect candidate for your team</p>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="bg-white rounded-2xl shadow-xl p-8"
//         >
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <Input
//               label="Job Title"
//               icon={Briefcase}
//               value={formData.title}
//               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               placeholder="e.g. Senior React Developer"
//               required
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Job Type
//                 </label>
//                 <select
//                   value={formData.type}
//                   onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                   required
//                 >
//                   <option value="full-time">Full-time</option>
//                   <option value="part-time">Part-time</option>
//                   <option value="contract">Contract</option>
//                   <option value="internship">Internship</option>
//                 </select>
//               </div>

//               <Input
//                 label="Experience Level"
//                 icon={Clock}
//                 value={formData.experience}
//                 onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
//                 placeholder="e.g. 5+ years"
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <Input
//                 label="Location"
//                 icon={MapPin}
//                 value={formData.location}
//                 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                 placeholder="e.g. San Francisco, CA"
//                 required
//               />

//               <Input
//                 label="Category"
//                 value={formData.category}
//                 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                 placeholder="e.g. Software Development"
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <Input
//                 label="Min Salary ($)"
//                 icon={DollarSign}
//                 type="number"
//                 value={formData.salaryMin}
//                 onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
//                 placeholder="120000"
//                 required
//               />

//               <Input
//                 label="Max Salary ($)"
//                 icon={DollarSign}
//                 type="number"
//                 value={formData.salaryMax}
//                 onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
//                 placeholder="150000"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Job Description
//               </label>
//               <textarea
//                 rows={6}
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="Describe the role, responsibilities..."
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Requirements
//               </label>
//               <textarea
//                 rows={4}
//                 value={formData.requirements}
//                 onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="List the key requirements..."
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Benefits
//               </label>
//               <textarea
//                 rows={4}
//                 value={formData.benefits}
//                 onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="List the benefits and perks..."
//               />
//             </div>

//             <Input
//               label="Skills (comma-separated)"
//               value={formData.skills}
//               onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
//               placeholder="React, Node.js, MongoDB"
//               required
//             />

//             <div className="flex space-x-4">
//               <Button type="submit" className="flex-1" disabled={loading}>
//                 {loading ? 'Posting...' : 'Post Job'}
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="flex-1"
//                 onClick={() => router.back()}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         </motion.div>
//       </div>

//       <Footer />
//     </div>
//   );
// }
