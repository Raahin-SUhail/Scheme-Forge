import React from 'react';
import { STATES_LIST } from '../data/schemesData';
import { FiMapPin, FiArrowRight, FiCheck } from 'react-icons/fi';

const BrowseByState = ({ selectedState = 'All', onSelectState = () => {} }) => {
  return (
    <section id="states" className="py-28 bg-[#F7F3ED] text-[#4C3D19] relative border-t border-[#CFBB99]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E5D7C4] border border-[#CFBB99] text-[#4C3D19] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <FiMapPin className="w-3.5 h-3.5 text-[#889063]" />
            <span>Pan-India Coverage</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#4C3D19] mb-4">
            Browse Schemes by State
          </h2>
          <p className="text-lg text-[#4C3D19]/80 leading-relaxed">
            Select your domicile state or explore Central Government schemes applicable across all 36 States & Union Territories.
          </p>
        </div>

        {/* State Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {STATES_LIST.map((state) => {
            const isSelected = selectedState === state.name;
            return (
              <button
                key={state.code}
                onClick={() => {
                  onSelectState(state.name);
                  const searchElem = document.getElementById('search');
                  if (searchElem) searchElem.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-[#4C3D19] text-[#E5D7C4] border-[#4C3D19] shadow-lg font-bold scale-105'
                    : 'card-white text-[#4C3D19] border-[#CFBB99] hover:border-[#889063] hover:-translate-y-1'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#E5D7C4] text-[#4C3D19]'
                        : 'bg-[#F7F3ED] text-[#4C3D19]/80 border border-[#CFBB99]'
                    }`}>
                      {state.code}
                    </span>
                    {isSelected && <FiCheck className="w-4 h-4 text-[#889063]" />}
                  </div>

                  <h3 className={`text-xs font-bold leading-snug line-clamp-2 mb-1 ${
                    isSelected ? 'text-[#E5D7C4]' : 'text-[#4C3D19] group-hover:text-[#354024]'
                  }`}>
                    {state.name}
                  </h3>
                </div>

                <div className={`mt-3 pt-2 text-[10px] font-semibold border-t flex items-center justify-between ${
                  isSelected ? 'border-[#CFBB99]/30 text-[#E5D7C4]' : 'border-[#CFBB99]/60 text-[#4C3D19]/70'
                }`}>
                  <span>{state.count} Schemes</span>
                  <FiArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-[#889063]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrowseByState;
