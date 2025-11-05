// "use client";
// import { motion, AnimatePresence } from 'framer-motion';
// import { Filter, X } from 'lucide-react';
// import { useState, useEffect, use } from 'react';
// import Navbar from '@/components/layout/Navbar';
// import Footer from '@/components/layout/Footer';
// import JobCard from '@/components/jobs/JobCard';
// import JobFilters from '@/components/jobs/JobFilters';
// import Loading from '@/components/ui/Loading';
// import Button from '@/components/ui/Button';
// import { useSearchParams, useRouter } from 'next/navigation';

// export default function JobsPage() {
//   const [jobs, setJobs] = useState([]);
//   const [filteredJobs, setFilteredJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showFilters, setShowFilters] = useState(false);
//   const [savedJobs, setSavedJobs] = useState([]);
//   const [activeFilters, setActiveFilters] = useState({
//     search: '',
//     location: '',
//     type: [],
//     category: [],
//     experience: [],
//     salaryRange: { min: 0, max: 500000 },
//     status: 'active'
//   });
//   let params = useSearchParams();

//   // console.log('params : ', params.get("search"), params.get("locdfation"))


  

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [jobs, activeFilters]);

//   const fetchJobs = async () => {
//     try {
//       const res = await fetch('/api/jobs');
//       const data = await res.json();
//       setJobs(data.jobs || []);
//     } catch (error) {
//       console.error('Failed to fetch jobs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applyFilters = () => {
//     let filtered = [...jobs];

//     // Filter by search (title, description, company)
//     if(params.get("search"))
//     {
//       activeFilters.search = params.get("search")
//     }
//     if (activeFilters.search) {
//       const searchLower = activeFilters.search.toLowerCase();
//       filtered = filtered.filter(job =>
//         job.title?.toLowerCase().includes(searchLower) ||
//         job.description?.toLowerCase().includes(searchLower) ||
//         job.company?.name?.toLowerCase().includes(searchLower) ||
//         job.skills?.some(skill => skill.toLowerCase().includes(searchLower))
//       );
//     }

//     // Filter by location
//     if(params.get("location"))
//     {
//       activeFilters.location = params.get("location")
//     }
//     if (activeFilters.location) {
//       const locationLower = activeFilters.location.toLowerCase();
//       filtered = filtered.filter(job =>
//         job.location?.toLowerCase().includes(locationLower)
//       );
//     }

//     // Filter by job type
//     if (activeFilters.type?.length > 0) {
//       filtered = filtered.filter(job =>
//         activeFilters.type.includes(job.type)
//       );
//     }

//     // Filter by category
//     if (activeFilters.category?.length > 0) {
//       filtered = filtered.filter(job =>
//         activeFilters.category.includes(job.category)
//       );
//     }

//     // Filter by experience
//     if (activeFilters.experience?.length > 0) {
//       filtered = filtered.filter(job =>
//         activeFilters.experience.includes(job.experience)
//       );
//     }

//     // Filter by salary range
//     if (activeFilters.salaryRange) {
//       filtered = filtered.filter(job => {
//         const jobMaxSalary = job.salary?.max || 0;
//         const jobMinSalary = job.salary?.min || 0;
//         return (
//           jobMaxSalary >= activeFilters.salaryRange.min &&
//           jobMinSalary <= activeFilters.salaryRange.max
//         );
//       });
//     }

//     // Filter by status
//     if (activeFilters.status) {
//       filtered = filtered.filter(job =>
//         job.status === activeFilters.status
//       );
//     }

//     setFilteredJobs(filtered);
//   };

//   const handleFilterChange = (filters) => {
//     setActiveFilters(filters);
//   };

//   const handleClearFilters = () => {
//     setActiveFilters({
//       search: '',
//       location: '',
//       type: [],
//       category: [],
//       experience: [],
//       salaryRange: { min: 0, max: 500000 },
//       status: 'active'
//     });
//   };

//   const handleSaveJob = (jobId) => {
//     setSavedJobs(prev => 
//       prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
//     );
//   };

//   const displayedJobs = filteredJobs.length > 0 || Object.values(activeFilters).some(v => 
//     Array.isArray(v) ? v.length > 0 : v !== '' && v !== 'active' && !(v?.min === 0 && v?.max === 500000)
//   ) ? filteredJobs : jobs;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex justify-between items-center mb-8"
//         >
//           <div>
//             <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Job</h1>
//             <p className="text-gray-600">
//               {loading ? 'Loading...' : `${displayedJobs.length} jobs available`}
//             </p>
//           </div>
//           <div className="flex gap-2">
//             {(filteredJobs.length !== jobs.length) && !loading && (
//               <Button
//                 variant="ghost"
//                 onClick={handleClearFilters}
//                 className="text-sm"
//               >
//                 Clear Filters
//               </Button>
//             )}
//             <Button
//               variant="outline"
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center"
//             >
//               {showFilters ? <X className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
//               Filters
//             </Button>
//           </div>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Filters Sidebar */}
//           <AnimatePresence>
//             {showFilters && (
//               <motion.div
//                 initial={{ opacity: 0, x: -100 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -100 }}
//                 className="lg:col-span-1"
//               >
//                 <div className="sticky top-24">
//                   <JobFilters
//                     onFilterChange={handleFilterChange}
//                     onClose={() => setShowFilters(false)}
//                     activeFilters={activeFilters}
//                   />
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Jobs Grid */}
//           <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
//             {loading ? (
//               <Loading />
//             ) : displayedJobs.length === 0 ? (
//               <div className="text-center py-12">
//                 <p className="text-gray-500 text-lg">No jobs found matching your criteria</p>
//                 <Button
//                   onClick={handleClearFilters}
//                   className="mt-4"
//                   variant="outline"
//                 >
//                   Clear Filters
//                 </Button>
//               </div>
//             ) : (
//               <motion.div
//                 layout
//                 className="grid grid-cols-1 md:grid-cols-2 gap-6"
//               >
//                 {displayedJobs.map((job, idx) => (
//                   <motion.div
//                     key={job._id}
//                     layout
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: idx * 0.05 }}
//                   >
//                     <JobCard
//                       job={job}
//                       onSave={handleSaveJob}
//                       isSaved={savedJobs.includes(job._id)}
//                     />
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

export default function JobsPage() {
  return <div>Jobs Page</div>;
}