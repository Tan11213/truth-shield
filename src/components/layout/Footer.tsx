import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiTwitter, FiFacebook, FiInstagram, FiGithub, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const columnData = [
    {
      title: 'Platform',
      links: [
        { name: 'Verify Claims', path: '/verify' },
        { name: 'Recent Fact-Checks', path: '/recent' },
        { name: 'Trending Topics', path: '/trending' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Media Literacy', path: '/media-literacy' },
        { name: 'Verification Toolkits', path: '/toolkits' },
        { name: 'Trusted Sources', path: '/sources' }
      ]
    },
    {
      title: 'About',
      links: [
        { name: 'Our Mission', path: '/about' },
        { name: 'Our Team', path: '/team' },
        { name: 'Contact Us', path: '/contact' }
      ]
    }
  ];

  const socialLinks = [
    { icon: <FiTwitter size={18} />, name: 'Twitter', url: 'https://twitter.com' },
    { icon: <FiFacebook size={18} />, name: 'Facebook', url: 'https://facebook.com' },
    { icon: <FiInstagram size={18} />, name: 'Instagram', url: 'https://instagram.com' },
    { icon: <FiGithub size={18} />, name: 'GitHub', url: 'https://github.com' }
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <motion.div variants={item} className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center group transition-all duration-300">
              <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center group-hover:bg-primary-700 transition-colors duration-300">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-primary-800 group-hover:text-primary-900 transition-colors duration-300">TruthShield</span>
            </Link>
            <p className="mt-4 text-gray-500 text-sm leading-relaxed">
              Reliable fact-checking during the India-Pakistan conflict, helping citizens navigate complex information.
            </p>
            <motion.div className="mt-6 flex space-x-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-600 transition-colors duration-300"
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                >
                  <span className="sr-only">{link.name}</span>
                  {link.icon}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
          
          {columnData.map((column, columnIndex) => (
            <motion.div variants={item} key={column.title} className="col-span-1">
              <h3 className="text-sm font-semibold text-gray-900">{column.title}</h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-gray-500 hover:text-primary-600 text-sm flex items-center group transition-colors duration-200"
                    >
                      <span>{link.name}</span>
                      <FiExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          variants={item} 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-gray-100"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} TruthShield. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              {['Privacy', 'Terms', 'Accessibility'].map((item) => (
                <Link key={item} to={`/${item.toLowerCase()}`} className="text-gray-400 hover:text-primary-600 text-sm transition-colors duration-200">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 