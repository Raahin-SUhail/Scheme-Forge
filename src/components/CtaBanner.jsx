import React from 'react';
import { FiSearch, FiShield } from 'react-icons/fi';

const CtaBanner = ({ onExplore, onEligibility }) => {
  return (
    <section className="py-24 sm:py-32 bg-[#F7F3ED] text-[#4C3D19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-white p-10 sm:p-16 rounded-3xl border border-[#CFBB99]/50 shadow-lg text-center relative overflow-hidden flex flex-col items-center">
          
          <span className="text-xs font-semibold uppercase tracking-wider text-[#889063] mb-3 block">
            Start Your Discovery
          </span>

          <h2 className="text-3xl sm:text-5xl font-bold text-[#4C3D19] max-w-3xl leading-tight mb-5">
            Discover Government Schemes Available to You
          </h2>

          <p className="text-base sm:text-lg text-[#4C3D19]/75 max-w-2xl mb-9 leading-relaxed font-normal">
            Check your eligibility in 2 minutes and access direct links to official government application portals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-8 py-4 rounded-full btn-cafe text-sm flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <FiSearch className="w-4.5 h-4.5 text-white" />
              <span>Explore All Schemes</span>
            </button>

            <button
              onClick={onEligibility}
              className="w-full sm:w-auto px-8 py-4 rounded-full btn-cafe-outline text-sm flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <FiShield className="w-4.5 h-4.5 text-[#889063]" />
              <span>Calculate Eligibility</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
