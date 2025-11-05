"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Button from '../ui/Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-md sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Briefcase className="text-blue-600 w-8 h-8" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              JobPortal
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/jobs">Find Jobs</NavLink>
            <NavLink href="/companies">Companies</NavLink>
            
            {session ? (
              <>
                {session.user.role === 'seeker' && (
                  <>
                    <NavLink href="/dashboard">Dashboard</NavLink>
                    <NavLink href="/applications">Applications</NavLink>
                  </>
                )}
                {session.user.role === 'employer' && (
                  <>
                    <NavLink href="/employer/jobs">My Jobs</NavLink>
                    <NavLink href="/employer/post-job">Post Job</NavLink>
                    <NavLink href="/applications/emp">Application list</NavLink>
                  </>
                )}
                {session.user.role === 'admin' && (
                  <NavLink href="/admin">Admin Panel</NavLink>
                )}
                
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 text-gray-600 hover:text-blue-600"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </motion.button>
                </div>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {session.user.name?.[0] || 'U'}
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border py-2"
                      >
                        <Link href="/profile" className="flex items-center px-4 py-2 hover:bg-gray-50">
                          <User className="w-4 h-4 mr-2" /> Profile
                        </Link>
                        {/* <Link href="/settings" className="flex items-center px-4 py-2 hover:bg-gray-50">
                          <Settings className="w-4 h-4 mr-2" /> Settings
                        </Link> */}
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-red-600"
                        >
                          <LogOut className="w-4 h-4 mr-2" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4"
            >
              <div className="flex flex-col space-y-2">
                <MobileNavLink href="/">Home</MobileNavLink>
                <MobileNavLink href="/jobs">Find Jobs</MobileNavLink>
                <MobileNavLink href="/companies">Companies</MobileNavLink>
                {session ? (
                  <>
                    <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
                    <button
                      onClick={() => signOut()}
                      className="text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <MobileNavLink href="/login">Login</MobileNavLink>
                    <MobileNavLink href="/register">Sign Up</MobileNavLink>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, children }) {
  return (
    <Link href={href}>
      <motion.span
        whileHover={{ scale: 1.05 }}
        className="text-gray-700 hover:text-blue-600 transition cursor-pointer font-medium"
      >
        {children}
      </motion.span>
    </Link>
  );
}

function MobileNavLink({ href, children }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 5 }}
        className="px-4 py-2 hover:bg-gray-100 rounded"
      >
        {children}
      </motion.div>
    </Link>
  );
}
