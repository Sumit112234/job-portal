"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ResumeUploader from '@/components/profile/ResumeUploader';
import ProfileCompletion from '@/components/profile/ProfileCompletion';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234-567-8900',
    location: 'San Francisco, CA',
    bio: '',
    skills: ['React', 'Node.js', 'MongoDB'],
    role: 'seeker',
    company: null,
    isCompanyVerified: false,
  });

  const [companyData, setCompanyData] = useState({
    selectedCompanyId: '',
    createNew: false,
    name: '',
    description: '',
    website: '',
    location: '',
    size: '',
    industry: '',
    logo: ''
  });

  const [verifiedCompanies, setVerifiedCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [showCompanySection, setShowCompanySection] = useState(false);
  const [companyErrors, setCompanyErrors] = useState({});
  const [savingCompany, setSavingCompany] = useState(false);

  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skill),
    });
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/users/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          
          // If user is employer and has a company, fetch company details
          if (data.profile.role === 'employer' && data.profile.company) {
            fetchCurrentCompany(data.profile.company);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    }
    fetchProfile();
  }, []);

  const fetchCurrentCompany = async (company) => {
    console.log('Fetching company with ID:', company);
    try {
      const res = await fetch(`/api/companies/${company?._id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentCompany(data.company);
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    }
  };

  const fetchVerifiedCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await fetch('/api/companies?limit=1000');
      const data = await response.json();
      if (response.ok) {
        setVerifiedCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const validateCompanyForm = () => {
    const errors = {};
    
    if (!companyData.createNew && !companyData.selectedCompanyId) {
      errors.company = 'Please select a company or choose to create a new one';
    }
    
    if (companyData.createNew) {
      if (!companyData.name.trim()) errors.companyName = 'Company name is required';
      if (!companyData.description.trim()) errors.companyDescription = 'Company description is required';
      if (!companyData.location.trim()) errors.companyLocation = 'Company location is required';
      if (!companyData.size) errors.companySize = 'Company size is required';
      if (!companyData.industry.trim()) errors.companyIndustry = 'Industry is required';
    }
    
    setCompanyErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompanySubmit = async () => {
    if (!validateCompanyForm()) return;
    
    setSavingCompany(true);
    try {
      if (companyData.createNew) {
        // Create new company
        const response = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: companyData.name,
            description: companyData.description,
            website: companyData.website,
            location: companyData.location,
            size: companyData.size,
            industry: companyData.industry,
            logo: companyData.logo
          })
        });

        if (response.ok) {
          const data = await response.json();
          alert('Company created successfully! Waiting for admin approval.');
          setCurrentCompany(data.company);
          setShowCompanySection(false);
          // Refresh profile
          const profileRes = await fetch('/api/users/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setProfile(profileData.profile);
          }
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to create company');
        }
      } else {
        // Associate with existing company
        const response = await fetch('/api/users/company', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: companyData.selectedCompanyId
          })
        });

        if (response.ok) {
          alert('Company associated successfully!');
          setShowCompanySection(false);
          // Refresh profile
          const profileRes = await fetch('/api/users/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setProfile(profileData.profile);
            if (profileData.profile.company) {
              fetchCurrentCompany(profileData.profile.company);
            }
          }
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to associate company');
        }
      }
    } catch (error) {
      console.error('Failed to save company:', error);
      alert('Something went wrong');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    if (companyErrors[name] || companyErrors[`company${name.charAt(0).toUpperCase() + name.slice(1)}`]) {
      setCompanyErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors[`company${name.charAt(0).toUpperCase() + name.slice(1)}`];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      
      if (res.ok) {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Media & Entertainment',
    'Real Estate',
    'Transportation',
    'Other'
  ];

  const profileSteps = [
    { label: 'Personal Information', completed: true },
    { label: 'Upload Resume', completed: false },
    { label: 'Add Skills', completed: true },
    { label: 'Work Experience', completed: false },
  ];

  const getVerificationBadge = () => {
    if (!currentCompany) return null;
    
    if (currentCompany.isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          Pending Approval
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and resume</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold mb-6">Personal Information</h2>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  icon={User}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <Input
                  label="Email"
                  icon={Mail}
                  type="email"
                  value={profile.email}
                  disabled
                />
                <Input
                  label="Phone"
                  icon={Phone}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
                <Input
                  label="Location"
                  icon={MapPin}
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Company Information - Only for Employers */}
            {profile.role === 'employer' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold">Company Information</h2>
                  </div>
                  {currentCompany && getVerificationBadge()}
                </div>
                {console.log('Current Company:', currentCompany)}
                {currentCompany ? (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="flex items-start gap-4">
                        {currentCompany.logo && (
                          <img 
                            src={currentCompany.logo} 
                            alt={currentCompany.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{currentCompany.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{currentCompany.description}</p>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-gray-500">Location</p>
                              <p className="text-sm font-medium">{currentCompany.location}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Industry</p>
                              <p className="text-sm font-medium">{currentCompany.industry}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Company Size</p>
                              <p className="text-sm font-medium">{currentCompany.size}</p>
                            </div>
                            {currentCompany.website && (
                              <div>
                                <p className="text-xs text-gray-500">Website</p>
                                <a 
                                  href={currentCompany.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-indigo-600 hover:underline"
                                >
                                  Visit Website
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!currentCompany.isVerified && (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Your company is pending admin approval. You won't be able to post jobs until it's verified.
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        setShowCompanySection(true);
                        setCompanyData({
                          selectedCompanyId: '',
                          createNew: false,
                          name: '',
                          description: '',
                          website: '',
                          location: '',
                          size: '',
                          industry: '',
                          logo: ''
                        });
                        fetchVerifiedCompanies();
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Change Company
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      You haven't associated with a company yet.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Employers must be associated with a verified company to post jobs.
                    </p>
                    <Button
                      onClick={() => {
                        setShowCompanySection(true);
                        fetchVerifiedCompanies();
                      }}
                    >
                      Add Company
                    </Button>
                  </div>
                )}

                {/* Company Form Modal */}
                <AnimatePresence>
                  {showCompanySection && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                      onClick={() => setShowCompanySection(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-6 border-b border-gray-200">
                          <h3 className="text-2xl font-bold">Add/Change Company</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Associate with a verified company or create a new one
                          </p>
                        </div>

                        <div className="p-6 space-y-6">
                          {/* Select Existing or Create New */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Company Association
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                  type="radio"
                                  name="companyOption"
                                  checked={!companyData.createNew}
                                  onChange={() => setCompanyData(prev => ({ ...prev, createNew: false, selectedCompanyId: '' }))}
                                  className="mr-3"
                                />
                                <span className="text-sm">Select from existing verified companies</span>
                              </label>
                              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                  type="radio"
                                  name="companyOption"
                                  checked={companyData.createNew}
                                  onChange={() => setCompanyData(prev => ({ ...prev, createNew: true, selectedCompanyId: '' }))}
                                  className="mr-3"
                                />
                                <span className="text-sm">Create new company (requires admin approval)</span>
                              </label>
                            </div>
                          </div>

                          {/* Select Existing Company */}
                          {!companyData.createNew && (
                            <div>
                              <label htmlFor="selectedCompanyId" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Company
                              </label>
                              {loadingCompanies ? (
                                <div className="p-3 text-sm text-gray-500">Loading companies...</div>
                              ) : (
                                <select
                                  id="selectedCompanyId"
                                  name="selectedCompanyId"
                                  value={companyData.selectedCompanyId}
                                  onChange={handleCompanyChange}
                                  className={`w-full px-4 py-3 border ${
                                    companyErrors.company ? 'border-red-500' : 'border-gray-300'
                                  } bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 transition`}
                                >
                                  <option value="">-- Select a company --</option>
                                  {verifiedCompanies.map((company) => (
                                    <option key={company._id} value={company._id}>
                                      {company.name} - {company.location}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {companyErrors.company && (
                                <p className="mt-1 text-sm text-red-600">{companyErrors.company}</p>
                              )}
                            </div>
                          )}

                          {/* Create New Company Form */}
                          {companyData.createNew && (
                            <div className="space-y-4">
                              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <p className="text-xs text-yellow-800">
                                  ⚠️ Your company will require admin approval before you can post jobs.
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Company Name *
                                </label>
                                <input
                                  name="name"
                                  type="text"
                                  value={companyData.name}
                                  onChange={handleCompanyChange}
                                  className={`w-full px-4 py-2 border ${
                                    companyErrors.companyName ? 'border-red-500' : 'border-gray-300'
                                  } rounded-lg focus:ring-2 focus:ring-indigo-500`}
                                  placeholder="Acme Corporation"
                                />
                                {companyErrors.companyName && (
                                  <p className="mt-1 text-sm text-red-600">{companyErrors.companyName}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description *
                                </label>
                                <textarea
                                  name="description"
                                  value={companyData.description}
                                  onChange={handleCompanyChange}
                                  rows={3}
                                  className={`w-full px-4 py-2 border ${
                                    companyErrors.companyDescription ? 'border-red-500' : 'border-gray-300'
                                  } rounded-lg focus:ring-2 focus:ring-indigo-500`}
                                  placeholder="Brief description of your company..."
                                />
                                {companyErrors.companyDescription && (
                                  <p className="mt-1 text-sm text-red-600">{companyErrors.companyDescription}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Website
                                </label>
                                <input
                                  name="website"
                                  type="url"
                                  value={companyData.website}
                                  onChange={handleCompanyChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                  placeholder="https://www.company.com"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Location *
                                </label>
                                <input
                                  name="location"
                                  type="text"
                                  value={companyData.location}
                                  onChange={handleCompanyChange}
                                  className={`w-full px-4 py-2 border ${
                                    companyErrors.companyLocation ? 'border-red-500' : 'border-gray-300'
                                  } rounded-lg focus:ring-2 focus:ring-indigo-500`}
                                  placeholder="Mumbai, India"
                                />
                                {companyErrors.companyLocation && (
                                  <p className="mt-1 text-sm text-red-600">{companyErrors.companyLocation}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Company Size *
                                </label>
                                <select
                                  name="size"
                                  value={companyData.size}
                                  onChange={handleCompanyChange}
                                  className={`w-full px-4 py-2 border ${
                                    companyErrors.companySize ? 'border-red-500' : 'border-gray-300'
                                  } bg-white rounded-lg focus:ring-2 focus:ring-indigo-500`}
                                >
                                  <option value="">-- Select size --</option>
                                  {companySizes.map((size) => (
                                    <option key={size} value={size}>
                                      {size}
                                    </option>
                                  ))}
                                </select>
                                {companyErrors.companySize && (
                                  <p className="mt-1 text-sm text-red-600">{companyErrors.companySize}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Industry *
                                </label>
                                <select
                                  name="industry"
                                  value={companyData.industry}
                                  onChange={handleCompanyChange}
                                  className={`w-full px-4 py-2 border ${
                                    companyErrors.companyIndustry ? 'border-red-500' : 'border-gray-300'
                                  } bg-white rounded-lg focus:ring-2 focus:ring-indigo-500`}
                                >
                                  <option value="">-- Select industry --</option>
                                  {industries.map((industry) => (
                                    <option key={industry} value={industry}>
                                      {industry}
                                    </option>
                                  ))}
                                </select>
                                {companyErrors.companyIndustry && (
                                  <p className="mt-1 text-sm text-red-600">{companyErrors.companyIndustry}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Logo URL
                                </label>
                                <input
                                  name="logo"
                                  type="url"
                                  value={companyData.logo}
                                  onChange={handleCompanyChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                  placeholder="https://example.com/logo.png"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3">
                          <Button
                            onClick={() => setShowCompanySection(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCompanySubmit}
                            disabled={savingCompany}
                            className="flex-1"
                          >
                            {savingCompany ? 'Saving...' : 'Save Company'}
                          </Button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold mb-6">Skills</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add a skill..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Button onClick={handleAddSkill}>Add</Button>
              </div>
            </motion.div>

            {/* Resume Uploader */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ResumeUploader />
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end"
            >
              <Button onClick={handleSave} className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ProfileCompletion percentage={65} steps={profileSteps} />
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// "use client";
// import { motion } from 'framer-motion';
// import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import Navbar from '@/components/layout/Navbar';
// import Footer from '@/components/layout/Footer';
// import Input from '@/components/ui/Input';
// import Button from '@/components/ui/Button';
// import ResumeUploader from '@/components/profile/ResumeUploader';
// import ProfileCompletion from '@/components/profile/ProfileCompletion';

// export default function ProfilePage() {
//   const [profile, setProfile] = useState({
//     name: 'John Doe',
//     email: 'john.doe@example.com',
//     phone: '+1 234-567-8900',
//     location: 'San Francisco, CA',
//     bio: '',
//     skills: ['React', 'Node.js', 'MongoDB'],
//   });

//   const [newSkill, setNewSkill] = useState('');

//   const handleAddSkill = () => {
//     if (newSkill && !profile.skills.includes(newSkill)) {
//       setProfile({ ...profile, skills: [...profile.skills, newSkill] });
//       setNewSkill('');
//     }
//   };

//   const handleRemoveSkill = (skill) => {
//     setProfile({
//       ...profile,
//       skills: profile.skills.filter(s => s !== skill),
//     });
//   };

//   useEffect(()=>{
//     async function fetchProfile(){
//       try {
//         const res = await fetch('/api/users/profile');
//         if(res.ok){
//           const data = await res.json();
//           setProfile(data.profile);
//         }
//       } catch (error) {
//         console.error('Failed to fetch profile:', error);
//       }
//     }
//     fetchProfile();

//     },[])

//   const handleSave = async () => {
//     try {
//       const res = await fetch('/api/users/profile', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(profile),
//       });
      
//       if (res.ok) {
//         alert('Profile updated successfully!');
//       }
//     } catch (error) {
//       console.error('Failed to update profile:', error);
//     }
//   };

//   const profileSteps = [
//     { label: 'Personal Information', completed: true },
//     { label: 'Upload Resume', completed: false },
//     { label: 'Add Skills', completed: true },
//     { label: 'Work Experience', completed: false },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
//           <p className="text-gray-600">Manage your personal information and resume</p>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Profile Form */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Personal Information */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-white rounded-xl shadow-lg p-6"
//             >
//               <h2 className="text-xl font-bold mb-6">Personal Information</h2>
//               <div className="space-y-4">
//                 <Input
//                   label="Full Name"
//                   icon={User}
//                   value={profile.name}
//                   onChange={(e) => setProfile({ ...profile, name: e.target.value })}
//                 />
//                 <Input
//                   label="Email"
//                   icon={Mail}
//                   type="email"
//                   value={profile.email}
//                   disabled
//                 />
//                 <Input
//                   label="Phone"
//                   icon={Phone}
//                   value={profile.phone}
//                   onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
//                 />
//                 <Input
//                   label="Location"
//                   icon={MapPin}
//                   value={profile.location}
//                   onChange={(e) => setProfile({ ...profile, location: e.target.value })}
//                 />
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Bio
//                   </label>
//                   <textarea
//                     rows={4}
//                     value={profile.bio}
//                     onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     placeholder="Tell us about yourself..."
//                   />
//                 </div>
//               </div>
//             </motion.div>

//             {/* Skills */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="bg-white rounded-xl shadow-lg p-6"
//             >
//               <h2 className="text-xl font-bold mb-6">Skills</h2>
//               <div className="flex flex-wrap gap-2 mb-4">
//                 {profile.skills.map((skill, idx) => (
//                   <motion.span
//                     key={idx}
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     transition={{ delay: idx * 0.05 }}
//                     className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center"
//                   >
//                     {skill}
//                     <button
//                       onClick={() => handleRemoveSkill(skill)}
//                       className="ml-2 text-blue-600 hover:text-blue-800"
//                     >
//                       ×
//                     </button>
//                   </motion.span>
//                 ))}
//               </div>
//               <div className="flex space-x-2">
//                 <input
//                   type="text"
//                   value={newSkill}
//                   onChange={(e) => setNewSkill(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
//                   placeholder="Add a skill..."
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                 />
//                 <Button onClick={handleAddSkill}>Add</Button>
//               </div>
//             </motion.div>

//             {/* Resume Uploader */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//             >
//               <ResumeUploader />
//             </motion.div>

//             {/* Save Button */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="flex justify-end"
//             >
//               <Button onClick={handleSave} className="flex items-center">
//                 <Save className="w-4 h-4 mr-2" />
//                 Save Changes
//               </Button>
//             </motion.div>
//           </div>

//           {/* Sidebar */}
//           <div className="lg:col-span-1">
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//             >
//               <ProfileCompletion percentage={65} steps={profileSteps} />
//             </motion.div>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }