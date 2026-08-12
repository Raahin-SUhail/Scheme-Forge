import React, { useState, useEffect } from 'react';
import { FiMenu, FiX, FiShield, FiChevronRight } from 'react-icons/fi';
import { TbSparkles } from 'react-icons/tb';

const Navbar = ({ activeTab = 'home', setActiveTab = () => {}, onOpenEligibility, onOpenAi }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Discover' },
    { id: 'schemes', label: 'Schemes' },
    { id: 'categories', label: 'Categories' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Support' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 pointer-events-none">
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <div
          className={`px-6 py-3.5 rounded-full transition-all duration-300 flex items-center justify-between nav-floating ${
            isScrolled ? 'shadow-md border-[#CFBB99]/60' : 'shadow-sm border-[#CFBB99]/40'
          }`}
        >
          {/* Brand Lockup */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-[#4C3D19] flex items-center justify-center shadow-sm group-hover:bg-[#354024] transition-colors">
              <span className="text-sm font-extrabold text-white">S</span>
              <span className="text-sm font-extrabold text-[#CFBB99]">F</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-[#4C3D19]">
                Scheme<span className="text-[#889063]">Forge</span>
              </span>
              <span className="text-[10px] text-[#4C3D19]/60 font-semibold tracking-wide -mt-1 hidden sm:inline">
                Government Scheme Discovery
              </span>
            </div>
          </div>

          {/* Desktop Navigation Text Links */}
          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-sm font-semibold relative transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'text-[#4C3D19] font-bold'
                      : 'text-[#4C3D19]/75 hover:text-[#4C3D19]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#4C3D19] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden lg:flex items-center space-x-3">
            {onOpenAi && (
              <button
                onClick={onOpenAi}
                className="px-4 py-2 rounded-full border border-[#CFBB99] text-[#4C3D19] bg-white hover:bg-[#F7F3ED] text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <TbSparkles className="w-3.5 h-3.5 text-[#889063]" />
                <span>Ask AI</span>
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('eligibility');
                if (onOpenEligibility) onOpenEligibility();
              }}
              className="px-5 py-2.5 rounded-full btn-cafe text-xs flex items-center space-x-2 cursor-pointer"
            >
              <FiShield className="w-3.5 h-3.5 text-[#CFBB99]" />
              <span>Check Eligibility</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center space-x-2">
            {onOpenAi && (
              <button
                onClick={onOpenAi}
                className="p-2 rounded-full border border-[#CFBB99] bg-white text-[#4C3D19] focus:outline-none"
                aria-label="Ask AI Assistant"
              >
                <TbSparkles className="w-4 h-4 text-[#889063]" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-[#F7F3ED] text-[#4C3D19] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white mt-3 rounded-3xl p-5 border border-[#CFBB99]/50 shadow-xl animate-fadeIn pointer-events-auto">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
                    activeTab === link.id
                      ? 'bg-[#F7F3ED] text-[#4C3D19] font-bold'
                      : 'text-[#4C3D19]/80 hover:bg-[#F7F3ED]/60'
                  }`}
                >
                  <span>{link.label}</span>
                  <FiChevronRight className="w-4 h-4 opacity-50" />
                </button>
              ))}
              <div className="pt-3 border-t border-[#CFBB99]/40 space-y-2">
                {onOpenAi && (
                  <button
                    onClick={() => {
                      onOpenAi();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-full border border-[#CFBB99] text-[#4C3D19] bg-white text-xs font-bold text-center flex items-center justify-center space-x-2"
                  >
                    <TbSparkles className="w-4 h-4 text-[#889063]" />
                    <span>Ask SchemeForge AI</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setActiveTab('eligibility');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-full btn-cafe text-xs font-bold text-center flex items-center justify-center space-x-2"
                >
                  <FiShield className="w-4 h-4 text-[#CFBB99]" />
                  <span>Check Your Eligibility</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
