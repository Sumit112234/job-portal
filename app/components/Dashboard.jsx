'use client'

import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Users, Building2, TrendingUp, MapPin, DollarSign, Clock, Filter, Bell, Upload, FileText, CheckCircle, XCircle, Eye, Send, Menu, X, ChevronDown, Star, ArrowRight, BarChart3, UserCheck, AlertCircle } from 'lucide-react';

// Mock Data
const mockJobs = [
  { id: 1, title: 'Senior React Developer', company: 'TechCorp Inc', location: 'San Francisco, CA', salary: '$120k-$150k', type: 'Full-time', experience: '5+ years', posted: '2 days ago', logo: '🚀', featured: true },
  { id: 2, title: 'Product Manager', company: 'InnovateLabs', location: 'New York, NY', salary: '$100k-$130k', type: 'Full-time', experience: '3-5 years', posted: '1 week ago', logo: '💡', featured: true },
  { id: 3, title: 'UX/UI Designer', company: 'DesignStudio', location: 'Remote', salary: '$80k-$100k', type: 'Full-time', experience: '2-4 years', posted: '3 days ago', logo: '🎨', featured: false },
  { id: 4, title: 'Data Scientist', company: 'DataViz Co', location: 'Austin, TX', salary: '$110k-$140k', type: 'Full-time', experience: '4+ years', posted: '5 days ago', logo: '📊', featured: false },
  { id: 5, title: 'DevOps Engineer', company: 'CloudTech', location: 'Seattle, WA', salary: '$115k-$145k', type: 'Contract', experience: '3+ years', posted: '1 day ago', logo: '☁️', featured: false },
];

const mockApplications = [
  { id: 1, jobTitle: 'Senior React Developer', company: 'TechCorp Inc', status: 'Under Review', appliedDate: '2024-10-28', lastUpdate: '2024-10-30' },
  { id: 2, jobTitle: 'Product Manager', company: 'InnovateLabs', status: 'Shortlisted', appliedDate: '2024-10-25', lastUpdate: '2024-10-29' },
  { id: 3, jobTitle: 'UX/UI Designer', company: 'DesignStudio', status: 'Rejected', appliedDate: '2024-10-20', lastUpdate: '2024-10-27' },
];

const JobPortal = () => {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState('seeker'); // seeker, employer, admin
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(65);

  // Simulated user data
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 234-567-8900',
    location: 'San Francisco, CA',
    resume: null,
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    experience: '5 years',
  });

  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  // Navigation Component
  const Navigation = () => (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Briefcase className="text-blue-600 w-8 h-8" />
            <span className="ml-2 text-2xl font-bold text-gray-900">JobPortal</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => setCurrentView('home')} className="text-gray-700 hover:text-blue-600 transition">Home</button>
            <button onClick={() => setCurrentView('jobs')} className="text-gray-700 hover:text-blue-600 transition">Find Jobs</button>
            <button onClick={() => setCurrentView('companies')} className="text-gray-700 hover:text-blue-600 transition">Companies</button>
            {userRole === 'seeker' && (
              <>
                <button onClick={() => setCurrentView('applications')} className="text-gray-700 hover:text-blue-600 transition">Applications</button>
                <button onClick={() => setCurrentView('profile')} className="text-gray-700 hover:text-blue-600 transition">Profile</button>
              </>
            )}
            {userRole === 'employer' && (
              <>
                <button onClick={() => setCurrentView('post-job')} className="text-gray-700 hover:text-blue-600 transition">Post Job</button>
                <button onClick={() => setCurrentView('manage-jobs')} className="text-gray-700 hover:text-blue-600 transition">Manage Jobs</button>
              </>
            )}
            {userRole === 'admin' && (
              <button onClick={() => setCurrentView('admin')} className="text-gray-700 hover:text-blue-600 transition">Admin Panel</button>
            )}
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-600" />
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                className="border rounded-lg px-3 py-1 text-sm"
              >
                <option value="seeker">Job Seeker</option>
                <option value="employer">Employer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <button onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Home</button>
            <button onClick={() => { setCurrentView('jobs'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Find Jobs</button>
            <button onClick={() => { setCurrentView('companies'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Companies</button>
          </div>
        )}
      </div>
    </nav>
  );

  // Home Page
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Dream Job Today
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with top companies and discover opportunities that match your skills
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Job title or keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button 
                onClick={() => setCurrentView('jobs')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Search Jobs
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Briefcase, label: 'Live Jobs', value: '10,234' },
            { icon: Building2, label: 'Companies', value: '2,156' },
            { icon: Users, label: 'Job Seekers', value: '45,678' },
            { icon: TrendingUp, label: 'Applications', value: '89,234' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <stat.icon className="w-10 h-10 text-blue-600 mb-3" />
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Featured Jobs */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
            <button 
              onClick={() => setCurrentView('jobs')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockJobs.filter(job => job.featured).map(job => (
              <JobCard key={job.id} job={job} onSelect={() => { setSelectedJob(job); setCurrentView('job-detail'); }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Job Card Component
  const JobCard = ({ job, onSelect }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 cursor-pointer border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="text-4xl mr-4">{job.logo}</div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
          className="text-gray-400 hover:text-blue-600"
        >
          <Star className={`w-5 h-5 ${savedJobs.includes(job.id) ? 'fill-blue-600 text-blue-600' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mr-2" />
          {job.location}
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <DollarSign className="w-4 h-4 mr-2" />
          {job.salary}
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          {job.type} • {job.experience}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{job.posted}</span>
        <button 
          onClick={onSelect}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
        >
          View Details
        </button>
      </div>
    </div>
  );

  // Jobs Listing Page
  const JobsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Jobs</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-white px-4 py-2 rounded-lg shadow border hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1 bg-white rounded-xl shadow p-6 h-fit">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Job Type</label>
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
                    <label key={type} className="flex items-center mb-2">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Experience Level</label>
                  {['Entry Level', '2-4 years', '5+ years', '10+ years'].map(exp => (
                    <label key={exp} className="flex items-center mb-2">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">{exp}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Salary Range</label>
                  <input type="range" className="w-full" min="0" max="200000" step="10000" />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>$0</span>
                    <span>$200k+</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Grid */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockJobs.map(job => (
                <JobCard key={job.id} job={job} onSelect={() => { setSelectedJob(job); setCurrentView('job-detail'); }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Job Detail Page
  const JobDetailPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => setCurrentView('jobs')}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center"
        >
          ← Back to Jobs
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start">
              <div className="text-6xl mr-6">{selectedJob?.logo}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedJob?.title}</h1>
                <p className="text-xl text-gray-600 mb-4">{selectedJob?.company}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {selectedJob?.location}</span>
                  <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> {selectedJob?.salary}</span>
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {selectedJob?.type}</span>
                </div>
              </div>
            </div>
            {userRole === 'seeker' && (
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                Apply Now
              </button>
            )}
          </div>

          <div className="border-t pt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3">Job Description</h2>
              <p className="text-gray-700 leading-relaxed">
                We are looking for an experienced developer to join our growing team. You will work on cutting-edge projects 
                using modern technologies and collaborate with talented professionals to build innovative solutions.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>5+ years of experience in software development</li>
                <li>Strong knowledge of React, Node.js, and MongoDB</li>
                <li>Experience with modern web technologies and frameworks</li>
                <li>Excellent problem-solving and communication skills</li>
                <li>Bachelor's degree in Computer Science or related field</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Benefits</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Competitive salary and equity options</li>
                <li>Comprehensive health insurance</li>
                <li>Flexible work hours and remote work options</li>
                <li>Professional development opportunities</li>
                <li>Modern office with great amenities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Applications Dashboard
  const ApplicationsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Applied</p>
                <p className="text-3xl font-bold text-gray-900">{mockApplications.length}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Under Review</p>
                <p className="text-3xl font-bold text-gray-900">1</p>
              </div>
              <Eye className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Shortlisted</p>
                <p className="text-3xl font-bold text-gray-900">1</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Applied Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockApplications.map(app => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{app.jobTitle}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.company}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.appliedDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                      app.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Profile Page
  const ProfilePage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Profile Completion */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Profile Completion</h3>
            <span className="text-blue-600 font-bold">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Complete your profile to increase visibility to employers
          </p>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input 
                type="text" 
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input 
                type="email" 
                value={userData.email}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <input 
                type="tel" 
                value={userData.phone}
                onChange={(e) => setUserData({...userData, phone: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Location</label>
              <input 
                type="text" 
                value={userData.location}
                onChange={(e) => setUserData({...userData, location: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Resume */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Resume / CV</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Upload your resume</p>
            <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX (Max 5MB)</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Choose File
            </button>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {userData.skills.map((skill, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                {skill}
              </span>
            ))}
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            + Add Skill
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  // Admin Dashboard
  const AdminPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <BarChart3 className="w-10 h-10 text-blue-600 mb-3" />
            <p className="text-3xl font-bold text-gray-900">1,234</p>
            <p className="text-gray-600">Total Users</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <Building2 className="w-10 h-10 text-green-600 mb-3" />
            <p className="text-3xl font-bold text-gray-900">456</p>
            <p className="text-gray-600">Companies</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <Briefcase className="w-10 h-10 text-purple-600 mb-3" />
            <p className="text-3xl font-bold text-gray-900">789</p>
            <p className="text-gray-600">Active Jobs</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <UserCheck className="w-10 h-10 text-orange-600 mb-3" />
            <p className="text-3xl font-bold text-gray-900">3,421</p>
            <p className="text-gray-600">Applications</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Pending Approvals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Job Posting', name: 'Senior Developer - TechCorp', date: '2024-11-01', status: 'Pending' },
                  { type: 'Company', name: 'StartupXYZ Inc.', date: '2024-10-31', status: 'Pending' },
                  { type: 'Job Posting', name: 'Product Manager - InnovateLabs', date: '2024-10-30', status: 'Pending' },
                ].map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.type === 'Job Posting' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded">
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { action: 'New job posted', detail: 'Senior React Developer by TechCorp', time: '5 minutes ago', icon: Briefcase, color: 'blue' },
              { action: 'Company verified', detail: 'InnovateLabs successfully verified', time: '1 hour ago', icon: Building2, color: 'green' },
              { action: 'User registered', detail: 'john.doe@email.com signed up', time: '2 hours ago', icon: Users, color: 'purple' },
              { action: 'Application submitted', detail: '15 new applications received', time: '3 hours ago', icon: FileText, color: 'orange' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition">
                <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                  <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Post Job Page (Employer)
  const PostJobPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a New Job</h1>

        <div className="bg-white rounded-xl shadow p-8">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Job Title *</label>
              <input 
                type="text" 
                placeholder="e.g. Senior React Developer"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Job Type *</label>
                <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Experience Level *</label>
                <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Entry Level</option>
                  <option>2-4 years</option>
                  <option>5+ years</option>
                  <option>10+ years</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Location *</label>
                <input 
                  type="text" 
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Salary Range *</label>
                <input 
                  type="text" 
                  placeholder="e.g. $120k-$150k"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Job Description *</label>
              <textarea 
                rows="6"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Requirements</label>
              <textarea 
                rows="4"
                placeholder="List the key requirements and qualifications..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Benefits</label>
              <textarea 
                rows="4"
                placeholder="List the benefits and perks..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Feature this job posting (Additional fee applies)</span>
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button 
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Save as Draft
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Manage Jobs Page (Employer)
  const ManageJobsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
          <button 
            onClick={() => setCurrentView('post-job')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            + Post New Job
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Active Jobs</p>
            <p className="text-3xl font-bold text-gray-900">8</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900">142</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Shortlisted</p>
            <p className="text-3xl font-bold text-gray-900">28</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Views</p>
            <p className="text-3xl font-bold text-gray-900">1,543</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Your Job Postings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Job Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Posted</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Applications</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { title: 'Senior React Developer', posted: '2024-10-28', applications: 45, status: 'Active' },
                  { title: 'Product Manager', posted: '2024-10-25', applications: 32, status: 'Active' },
                  { title: 'UX Designer', posted: '2024-10-20', applications: 28, status: 'Closed' },
                  { title: 'DevOps Engineer', posted: '2024-10-15', applications: 37, status: 'Active' },
                ].map((job, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{job.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{job.posted}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-blue-600 font-semibold">{job.applications} applicants</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-semibold">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-semibold">
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Companies Page
  const CompaniesPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Featured Companies</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'TechCorp Inc', logo: '🚀', jobs: 12, location: 'San Francisco, CA', employees: '1000+' },
            { name: 'InnovateLabs', logo: '💡', jobs: 8, location: 'New York, NY', employees: '500-1000' },
            { name: 'DesignStudio', logo: '🎨', jobs: 5, location: 'Remote', employees: '50-100' },
            { name: 'DataViz Co', logo: '📊', jobs: 10, location: 'Austin, TX', employees: '200-500' },
            { name: 'CloudTech', logo: '☁️', jobs: 15, location: 'Seattle, WA', employees: '1000+' },
            { name: 'StartupXYZ', logo: '⚡', jobs: 6, location: 'Boston, MA', employees: '10-50' },
          ].map((company, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow hover:shadow-xl transition p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-5xl mr-4">{company.logo}</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.employees} employees</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  {company.location}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {company.jobs} open positions
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                View Jobs
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {currentView === 'home' && <HomePage />}
      {currentView === 'jobs' && <JobsPage />}
      {currentView === 'job-detail' && <JobDetailPage />}
      {currentView === 'applications' && <ApplicationsPage />}
      {currentView === 'profile' && <ProfilePage />}
      {currentView === 'admin' && <AdminPage />}
      {currentView === 'post-job' && <PostJobPage />}
      {currentView === 'manage-jobs' && <ManageJobsPage />}
      {currentView === 'companies' && <CompaniesPage />}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Briefcase className="w-6 h-6 mr-2" />
                <span className="text-xl font-bold">JobPortal</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting talented professionals with amazing opportunities worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Browse Jobs</a></li>
                <li><a href="#" className="hover:text-white">Create Profile</a></li>
                <li><a href="#" className="hover:text-white">Career Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Post a Job</a></li>
                <li><a href="#" className="hover:text-white">Browse Candidates</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 JobPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobPortal;