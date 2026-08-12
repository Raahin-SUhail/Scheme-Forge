import React from 'react';
import { FiSearch, FiSliders, FiShieldCheck, FiCheckCircle } from 'react-icons/fi';

const HowItWorks = ({ onOpenEligibility }) => {
  const steps = [
    {
      number: '01',
      title: 'Enter Parameters',
      desc: 'Specify your state, age, annual family income, occupation, and beneficiary category.',
      icon: FiSliders
    },
    {
      number: '02',
      title: 'Rule Engine Evaluation',
      desc: 'Our engine evaluates your profile against 600+ Central and State welfare regulations.',
      icon: FiSearch
    },
    {
      number: '03',
      title: 'Direct Application',
      desc: 'Access verified document checklists and direct links to official Ministry (.gov.in) portals.',
      icon: FiCheckCircle
    }
  ];

  return (
    <section className="py-28 bg-[#F7F3ED] text-[#4C3D19] relative border-t border-[#CFBB99]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#889063] block mb-3">
            Three-Step Process
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#4C3D19] mb-4">
            How SchemeForge Works
          </h2>
          <p className="text-lg text-[#4C3D19]/80 leading-relaxed font-medium">
            Engineered to guide Indian citizens from discovery to application in under 2 minutes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div
                key={idx}
                className="card-white p-8 rounded-3xl border border-[#CFBB99] hover:border-[#889063] transition-all duration-300 relative group flex flex-col justify-between shadow-lg hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#E5D7C4] border border-[#CFBB99] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <IconComp className="w-6 h-6 text-[#889063]" />
                    </div>
                    <span className="text-2xl font-black text-[#CFBB99]">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#4C3D19] mb-3 group-hover:text-[#354024] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#4C3D19]/70 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#CFBB99]/60 text-[11px] font-bold text-[#354024] flex items-center justify-between">
                  <span>Instant Match</span>
                  <FiCheckCircle className="w-4 h-4 text-[#889063]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
