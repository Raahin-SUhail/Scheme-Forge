import React from 'react';
import { QUICK_ACTIONS_LIST } from '../data/schemesData';
import { FiAward, FiSun, FiHome, FiHeart, FiZap, FiUserCheck, FiArrowRight } from 'react-icons/fi';

const iconMap = {
  FiAward,
  FiSun,
  FiHome,
  FiHeart,
  FiZap,
  FiUserCheck
};

const QuickActions = ({ onSelectCategory, onSelectSearch }) => {
  return (
    <section className="py-20 bg-[#F7F3ED] text-[#4C3D19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#889063] block mb-1">
              Explore Categories
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#4C3D19]">
              Quick Action Tiles
            </h3>
          </div>
          <p className="hidden sm:block text-xs text-[#4C3D19]/70 font-normal">
            Select a key area to filter matching government schemes instantly.
          </p>
        </div>

        {/* Compact Action Tiles Grid (No Paragraph Clutter!) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {QUICK_ACTIONS_LIST.map((action) => {
            const IconComponent = iconMap[action.icon] || FiAward;
            return (
              <button
                key={action.id}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(action.category);
                  if (onSelectSearch) onSelectSearch(action.title);
                }}
                className="card-compact p-5 flex items-center space-x-3.5 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E5D7C4] flex items-center justify-center flex-shrink-0 group-hover:bg-[#4C3D19] transition-colors">
                  <IconComponent className="w-5 h-5 text-[#889063] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#4C3D19] group-hover:text-[#354024] transition-colors truncate">
                    {action.title}
                  </h4>
                  <div className="flex items-center text-[10px] font-semibold text-[#889063] mt-0.5">
                    <span>Browse</span>
                    <FiArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;
