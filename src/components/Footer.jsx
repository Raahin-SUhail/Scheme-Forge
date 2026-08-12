import React from 'react';
import { FiGlobe, FiShield, FiGithub, FiLinkedin, FiExternalLink } from 'react-icons/fi';

const Footer = ({ setActiveTab = () => {} }) => {
  return (
    <footer className="bg-[#4C3D19] text-[#CFBB99] text-xs pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#E5D7C4] flex items-center justify-center">
                <span className="text-base font-extrabold text-[#4C3D19]">S</span>
                <span className="text-base font-extrabold text-[#889063]">F</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">
                  Scheme<span className="text-[#889063]">Forge</span>
                </span>
                <span className="text-[11px] text-[#CFBB99]/80 font-medium">Government Scheme Discovery</span>
              </div>
            </div>

            <p className="text-xs text-[#E5D7C4]/80 leading-relaxed max-w-sm font-normal">
              SchemeForge is an independent discovery platform designed to help citizens discover, understand, and access Central and State Government welfare programs with clear eligibility guidance.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <span className="px-3 py-1 rounded-full bg-[#354024] text-[#E5D7C4] text-[11px] font-semibold flex items-center space-x-1.5">
                <FiShield className="w-3.5 h-3.5 text-[#889063]" />
                <span>SSL Encrypted</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#354024] text-[#E5D7C4] text-[11px] font-semibold flex items-center space-x-1.5">
                <FiGlobe className="w-3.5 h-3.5 text-[#CFBB99]" />
                <span>Verified Gov Links</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors cursor-pointer">
                  Discover Home
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('schemes')} className="hover:text-white transition-colors cursor-pointer">
                  All Schemes Directory
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('categories')} className="hover:text-white transition-colors cursor-pointer">
                  Categories Explorer
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('eligibility')} className="hover:text-white transition-colors cursor-pointer">
                  Eligibility Checker
                </button>
              </li>
            </ul>
          </div>

          {/* Official Gov Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Official Portals</h4>
            <ul className="space-y-2.5 font-medium">
              <li><a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center space-x-1"><span>PM Kisan Portal</span><FiExternalLink className="w-3 h-3 text-[#889063]" /></a></li>
              <li><a href="https://pmaymis.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center space-x-1"><span>PMAY Housing Portal</span><FiExternalLink className="w-3 h-3 text-[#889063]" /></a></li>
              <li><a href="https://pmjay.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center space-x-1"><span>Ayushman PM-JAY</span><FiExternalLink className="w-3 h-3 text-[#889063]" /></a></li>
              <li><a href="https://seedfund.startupindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center space-x-1"><span>Startup India</span><FiExternalLink className="w-3 h-3 text-[#889063]" /></a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 font-medium">
              <li><button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors cursor-pointer">About Platform</button></li>
              <li><button onClick={() => setActiveTab('contact')} className="hover:text-white transition-colors cursor-pointer">Support Desk</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#CFBB99]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#E5D7C4] font-medium text-center sm:text-left">
            © {new Date().getFullYear()} SchemeForge. Independent Government Scheme Discovery Platform.
          </p>

          <div className="flex items-center space-x-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#E5D7C4] text-[#4C3D19] hover:bg-white transition-colors"
              aria-label="GitHub Repository"
            >
              <FiGithub className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#E5D7C4] text-[#4C3D19] hover:bg-white transition-colors"
              aria-label="LinkedIn Profile"
            >
              <FiLinkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
