"use client";
import { motion } from 'framer-motion';
import { Briefcase, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const footerLinks = {
    'For Job Seekers': [
      { name: 'Browse Jobs', href: '/jobs' },
      { name: 'Create Profile', href: '/register' },
      { name: 'Career Resources', href: '/resources' },
      { name: 'Salary Calculator', href: '/salary' },
    ],
    'For Employers': [
      { name: 'Post a Job', href: '/employer/post-job' },
      { name: 'Browse Candidates', href: '/employer/candidates' },
      { name: 'Pricing Plans', href: '/pricing' },
      { name: 'Success Stories', href: '/stories' },
    ],
    'Company': [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialIcons = [
    { Icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { Icon: Twitter, href: '#', color: 'hover:text-sky-500' },
    { Icon: Linkedin, href: '#', color: 'hover:text-blue-700' },
    { Icon: Instagram, href: '#', color: 'hover:text-pink-600' },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 mb-4"
            >
              <Briefcase className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">JobPortal</span>
            </motion.div>
            <p className="text-gray-400 mb-4">
              Connecting talented professionals with amazing opportunities worldwide.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>contact@jobportal.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links], idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href}>
                      <motion.span
                        whileHover={{ x: 5 }}
                        className="text-sm text-gray-400 hover:text-white transition cursor-pointer inline-block"
                      >
                        {link.name}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            &copy; 2024 JobPortal. All rights reserved.
          </p>
          <div className="flex space-x-4">
            {socialIcons.map(({ Icon, href, color }, idx) => (
              <motion.a
                key={idx}
                href={href}
                whileHover={{ scale: 1.2, y: -3 }}
                className={`text-gray-400 ${color} transition`}
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
