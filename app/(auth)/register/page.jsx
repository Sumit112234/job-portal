'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'seeker',
    phone: '',
    location: ''
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Fetch verified companies when role changes to employer
  useEffect(() => {
    if (formData.role === 'employer') {
      fetchVerifiedCompanies();
    }
  }, [formData.role]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Employer-specific validation
    if (formData.role === 'employer') {
      if (!companyData.createNew && !companyData.selectedCompanyId) {
        newErrors.company = 'Please select a company or choose to create a new one';
      }
      
      if (companyData.createNew) {
        if (!companyData.name.trim()) newErrors.companyName = 'Company name is required';
        if (!companyData.description.trim()) newErrors.companyDescription = 'Company description is required';
        if (!companyData.location.trim()) newErrors.companyLocation = 'Company location is required';
        if (!companyData.size) newErrors.companySize = 'Company size is required';
        if (!companyData.industry.trim()) newErrors.companyIndustry = 'Industry is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log('Form data validated, submitting:', formData, companyData);
    
    setLoading(true);
    try {
      // Step 1: Create user account
      const signupPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        location: formData.location
      };

      // If employer selected existing company, add it to payload
      if (formData.role === 'employer' && !companyData.createNew) {
        signupPayload.companyId = companyData.selectedCompanyId;
      }

      console.log('Sending signup payload:', signupPayload);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupPayload)
      });
      
      const data = await response.json();

      console.log('Signup response:', data);
      
      if (!response.ok) {
        setErrors({ submit: data.error || 'Registration failed' });
        setLoading(false);
        return;
      }

      // Step 2: If employer creating new company, create it after signup
      if (formData.role === 'employer' && companyData.createNew) {
        // Sign in first to get authenticated session
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (!signInResult?.ok) {
          setErrors({ submit: 'Account created but sign-in failed. Please login manually.' });
          setLoading(false);
          return;
        }


        // Now create the company
        const companyResponse = await fetch('/api/companies', {
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

        if (!companyResponse.ok) {
          setErrors({ submit: 'Account created but company creation failed. Please add company from dashboard.' });
          setTimeout(() => router.push('/dashboard'), 2000);
          return;
        }

        // Success - redirect to dashboard with message
        router.push('/dashboard?companyPending=true');
        router.refresh();
      } else {
        // Auto sign in for job seekers or employers with existing company
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          router.push('/dashboard');
          router.refresh();
        } else {
          router.push('/login?registered=true');
        }
      }
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      setErrors({ submit: 'Google sign-up failed' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCompanyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCompanyData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear company-related errors
    if (errors.company || errors[`company${name.charAt(0).toUpperCase() + name.slice(1)}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.company;
        delete newErrors[`company${name.charAt(0).toUpperCase() + name.slice(1)}`];
        return newErrors;
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl"
      >
        <motion.div variants={itemVariants}>
          <h2 className="text-center text-4xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our job portal today
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                placeholder="John Doe"
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.name}
                </motion.p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <motion.select
                whileFocus={{ scale: 1.01 }}
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="seeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </motion.select>
            </div>

            {/* Company Selection for Employers */}
            <AnimatePresence>
              {formData.role === 'employer' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 bg-indigo-50 p-4 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                  <p className="text-sm text-gray-600">
                    Employers must be associated with a verified company to post jobs.
                  </p>

                  {/* Select Existing or Create New */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Association
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="companyOption"
                          checked={!companyData.createNew}
                          onChange={() => setCompanyData(prev => ({ ...prev, createNew: false, selectedCompanyId: '' }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Select from existing verified companies</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="companyOption"
                          checked={companyData.createNew}
                          onChange={() => setCompanyData(prev => ({ ...prev, createNew: true, selectedCompanyId: '' }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Create new company (requires admin approval)</span>
                      </label>
                    </div>
                  </div>

                  {/* Select Existing Company */}
                  {!companyData.createNew && (
                    <div>
                      <label htmlFor="selectedCompanyId" className="block text-sm font-medium text-gray-700">
                        Select Company
                      </label>
                      {loadingCompanies ? (
                        <div className="mt-1 p-3 text-sm text-gray-500">Loading companies...</div>
                      ) : (
                        <select
                          id="selectedCompanyId"
                          name="selectedCompanyId"
                          value={companyData.selectedCompanyId}
                          onChange={handleCompanyChange}
                          className={`mt-1 block w-full px-3 py-3 border ${
                            errors.company ? 'border-red-500' : 'border-gray-300'
                          } bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
                        >
                          <option value="">-- Select a company --</option>
                          {verifiedCompanies.map((company) => (
                            <option key={company._id} value={company._id}>
                              {company.name} - {company.location}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.company && (
                        <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                      )}
                    </div>
                  )}

                  {/* Create New Company Form */}
                  {companyData.createNew && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4 border-t border-indigo-200 pt-4"
                    >
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          ⚠️ Your company will require admin approval before you can post jobs.
                        </p>
                      </div>

                      {/* Company Name */}
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                          Company Name *
                        </label>
                        <input
                          id="companyName"
                          name="name"
                          type="text"
                          value={companyData.name}
                          onChange={handleCompanyChange}
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.companyName ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 transition`}
                          placeholder="Acme Corporation"
                        />
                        {errors.companyName && (
                          <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                        )}
                      </div>

                      {/* Company Description */}
                      <div>
                        <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700">
                          Description *
                        </label>
                        <textarea
                          id="companyDescription"
                          name="description"
                          value={companyData.description}
                          onChange={handleCompanyChange}
                          rows={3}
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.companyDescription ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 transition`}
                          placeholder="Brief description of your company..."
                        />
                        {errors.companyDescription && (
                          <p className="mt-1 text-sm text-red-600">{errors.companyDescription}</p>
                        )}
                      </div>

                      {/* Company Website */}
                      <div>
                        <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700">
                          Website
                        </label>
                        <input
                          id="companyWebsite"
                          name="website"
                          type="url"
                          value={companyData.website}
                          onChange={handleCompanyChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                          placeholder="https://www.company.com"
                        />
                      </div>

                      {/* Company Location */}
                      <div>
                        <label htmlFor="companyLocation" className="block text-sm font-medium text-gray-700">
                          Location *
                        </label>
                        <input
                          id="companyLocation"
                          name="location"
                          type="text"
                          value={companyData.location}
                          onChange={handleCompanyChange}
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.companyLocation ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 transition`}
                          placeholder="Mumbai, India"
                        />
                        {errors.companyLocation && (
                          <p className="mt-1 text-sm text-red-600">{errors.companyLocation}</p>
                        )}
                      </div>

                      {/* Company Size */}
                      <div>
                        <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                          Company Size *
                        </label>
                        <select
                          id="companySize"
                          name="size"
                          value={companyData.size}
                          onChange={handleCompanyChange}
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.companySize ? 'border-red-500' : 'border-gray-300'
                          } bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 transition`}
                        >
                          <option value="">-- Select size --</option>
                          {companySizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        {errors.companySize && (
                          <p className="mt-1 text-sm text-red-600">{errors.companySize}</p>
                        )}
                      </div>

                      {/* Industry */}
                      <div>
                        <label htmlFor="companyIndustry" className="block text-sm font-medium text-gray-700">
                          Industry *
                        </label>
                        <select
                          id="companyIndustry"
                          name="industry"
                          value={companyData.industry}
                          onChange={handleCompanyChange}
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.companyIndustry ? 'border-red-500' : 'border-gray-300'
                          } bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 transition`}
                        >
                          <option value="">-- Select industry --</option>
                          {industries.map((industry) => (
                            <option key={industry} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </select>
                        {errors.companyIndustry && (
                          <p className="mt-1 text-sm text-red-600">{errors.companyIndustry}</p>
                        )}
                      </div>

                      {/* Company Logo URL */}
                      <div>
                        <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700">
                          Logo URL
                        </label>
                        <input
                          id="companyLogo"
                          name="logo"
                          type="url"
                          value={companyData.logo}
                          onChange={handleCompanyChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location (Optional)
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Mumbai, India"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                placeholder="••••••••"
              />
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>
          </motion.div>

          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-md bg-red-50 p-4"
            >
              <p className="text-sm text-red-800">{errors.submit}</p>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
                Sign in
              </Link>
            </p>
          </motion.div>

          {/* Social Sign Up */}
          <motion.div variants={itemVariants} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full inline-flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </motion.button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import { signIn } from 'next-auth/react';
// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';

// export default function SignupPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: 'seeker',
//     phone: '',
//     location: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) newErrors.name = 'Name is required';
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 8) {
//       newErrors.password = 'Password must be at least 8 characters';
//     }
//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
    
//     setLoading(true);
//     try {
//       // Create user account
//       const response = await fetch('/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//           role: formData.role,
//           phone: formData.phone,
//           location: formData.location
//         })
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         // Auto sign in after successful registration
//         const signInResult = await signIn('credentials', {
//           email: formData.email,
//           password: formData.password,
//           redirect: false,
//         });

//         if (signInResult?.ok) {
//           router.push('/dashboard');
//           router.refresh();
//         } else {
//           // Registration succeeded but sign-in failed, redirect to login
//           router.push('/login?registered=true');
//         }
//       } else {
//         setErrors({ submit: data.error || 'Registration failed' });
//       }
//     } catch (error) {
//       setErrors({ submit: 'Something went wrong. Please try again.' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignUp = async () => {
//     try {
//       await signIn('google', { callbackUrl: '/dashboard' });
//     } catch (error) {
//       setErrors({ submit: 'Google sign-up failed' });
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const containerVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.6,
//         ease: 'easeOut',
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, x: -20 },
//     visible: {
//       opacity: 1,
//       x: 0,
//       transition: { duration: 0.4 }
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl"
//       >
//         <motion.div variants={itemVariants}>
//           <h2 className="text-center text-4xl font-extrabold text-gray-900">
//             Create Account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Join our job portal today
//           </p>
//         </motion.div>

//         <form onSubmit={handleSubmit} className="mt-8 space-y-6">
//           <motion.div variants={itemVariants} className="space-y-4">
//             {/* Name Field */}
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                 Full Name
//               </label>
//               <motion.input
//                 whileFocus={{ scale: 1.01 }}
//                 id="name"
//                 name="name"
//                 type="text"
//                 value={formData.name}
//                 onChange={handleChange}
//                 className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
//                   errors.name ? 'border-red-500' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
//                 placeholder="John Doe"
//               />
//               {errors.name && (
//                 <motion.p
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="mt-1 text-sm text-red-600"
//                 >
//                   {errors.name}
//                 </motion.p>
//               )}
//             </div>

//             {/* Email Field */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email Address
//               </label>
//               <motion.input
//                 whileFocus={{ scale: 1.01 }}
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
//                   errors.email ? 'border-red-500' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
//                 placeholder="you@example.com"
//               />
//               {errors.email && (
//                 <motion.p
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="mt-1 text-sm text-red-600"
//                 >
//                   {errors.email}
//                 </motion.p>
//               )}
//             </div>

//             {/* Role Selection */}
//             <div>
//               <label htmlFor="role" className="block text-sm font-medium text-gray-700">
//                 I am a
//               </label>
//               <motion.select
//                 whileFocus={{ scale: 1.01 }}
//                 id="role"
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 className="mt-1 block w-full px-3 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//               >
//                 <option value="seeker">Job Seeker</option>
//                 <option value="employer">Employer</option>
//               </motion.select>
//             </div>

//             {/* Phone Field */}
//             <div>
//               <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//                 Phone Number (Optional)
//               </label>
//               <motion.input
//                 whileFocus={{ scale: 1.01 }}
//                 id="phone"
//                 name="phone"
//                 type="tel"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                 placeholder="+91 98765 43210"
//               />
//             </div>

//             {/* Location Field */}
//             <div>
//               <label htmlFor="location" className="block text-sm font-medium text-gray-700">
//                 Location (Optional)
//               </label>
//               <motion.input
//                 whileFocus={{ scale: 1.01 }}
//                 id="location"
//                 name="location"
//                 type="text"
//                 value={formData.location}
//                 onChange={handleChange}
//                 className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                 placeholder="Mumbai, India"
//               />
//             </div>

//             {/* Password Field */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <motion.input
//                 whileFocus={{ scale: 1.01 }}
//                 id="password"
//                 name="password"
//                 type="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
//                   errors.password ? 'border-red-500' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
//                 placeholder="••••••••"
//               />
//               {errors.password && (
//                 <motion.p
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="mt-1 text-sm text-red-600"
//                 >
//                   {errors.password}
//                 </motion.p>
//               )}
//             </div>

//             {/* Confirm Password Field */}
//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
//                 Confirm Password
//               </label>
//               <motion.input
//                 whileFocus={{ scale: 1.01 }}
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 type="password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
//                   errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
//                 placeholder="••••••••"
//               />
//               {errors.confirmPassword && (
//                 <motion.p
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="mt-1 text-sm text-red-600"
//                 >
//                   {errors.confirmPassword}
//                 </motion.p>
//               )}
//             </div>
//           </motion.div>

//           {errors.submit && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="rounded-md bg-red-50 p-4"
//             >
//               <p className="text-sm text-red-800">{errors.submit}</p>
//             </motion.div>
//           )}

//           <motion.div variants={itemVariants}>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Creating Account...' : 'Sign Up'}
//             </motion.button>
//           </motion.div>

//           <motion.div variants={itemVariants} className="text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
//                 Sign in
//               </Link>
//             </p>
//           </motion.div>

//           {/* Social Sign Up */}
//           <motion.div variants={itemVariants} className="mt-6">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-white text-gray-500">Or continue with</span>
//               </div>
//             </div>

//             <div className="mt-6">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 type="button"
//                 onClick={handleGoogleSignUp}
//                 className="w-full inline-flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
//               >
//                 <svg className="w-5 h-5" viewBox="0 0 24 24">
//                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                 </svg>
//                 Continue with Google
//               </motion.button>
//             </div>
//           </motion.div>
//         </form>
//       </motion.div>
//     </div>
//   );
// }
