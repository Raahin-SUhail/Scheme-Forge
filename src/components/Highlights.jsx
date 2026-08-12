import React from 'react';
import { FiCheckCircle, FiCpu, FiShield, FiGlobe, FiFileText } from 'react-icons/fi';

const citizenValues = [
  {
    title: "Official Government Sources",
    desc: "Direct links to verified ministry portals (.gov.in) with zero third-party agent fees or hidden charges.",
    icon: FiShield
  },
  {
    title: "Clear Eligibility Rules",
    desc: "Instant matching calculated strictly against your age, family income, category, and state parameters.",
    icon: FiCpu
  },
  {
    title: "Central & State Coverage",
    desc: "A unified directory indexing welfare programs across all 36 Indian States and Union Territories.",
    icon: FiGlobe
  },
  {
    title: "Direct Application Info",
    desc: "Comprehensive document checklists and step-by-step application guidance before you apply.",
    icon: FiFileText
  }
];

const Highlights = () => {
  return (
    <section className="py-24 sm:py-32 bg-[#F7F3ED] text-[#4C3D19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#889063] block mb-2">
            Why SchemeForge
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#4C3D19] mb-4">
            Designed for clear & transparent discovery
          </h2>
          <p className="text-base sm:text-lg text-[#4C3D19]/75 font-normal leading-relaxed">
            Helping Indian citizens find and understand government welfare programs with confidence.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {citizenValues.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="card-standard p-7 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#E5D7C4] flex items-center justify-center mb-6 group-hover:bg-[#4C3D19] transition-colors">
                    <IconComp className="w-6 h-6 text-[#889063] group-hover:text-white transition-colors" />
                  </div>

                  <h3 className="text-lg font-bold text-[#4C3D19] mb-2 group-hover:text-[#354024] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#4C3D19]/75 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#CFBB99]/40 text-[11px] font-semibold text-[#354024] flex items-center space-x-1.5">
                  <FiCheckCircle className="w-3.5 h-3.5 text-[#889063]" />
                  <span>Verified Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
