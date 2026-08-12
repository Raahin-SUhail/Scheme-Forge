import React from 'react';
import { FiX, FiCheck, FiExternalLink, FiTrash2 } from 'react-icons/fi';

const CompareModal = ({ compareList = [], onClose = () => {}, onRemove = () => {} }) => {
  if (!compareList || compareList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4C3D19]/70 backdrop-blur-md animate-fadeIn">
      <div className="card-white w-full max-w-5xl rounded-3xl border border-[#CFBB99] shadow-2xl p-6 sm:p-9 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#CFBB99] mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#4C3D19]">
              Side-by-Side Scheme Comparison
            </h3>
            <p className="text-xs text-[#4C3D19]/70 font-medium">
              Comparing {compareList.length} of max 3 selected schemes
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#E5D7C4] border border-[#CFBB99] text-[#4C3D19] hover:bg-[#CFBB99] cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {compareList.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-[#F7F3ED] p-5 rounded-2xl border border-[#CFBB99] flex flex-col justify-between relative"
            >
              <button
                onClick={() => onRemove(scheme.id)}
                className="absolute top-4 right-4 text-red-600 hover:text-red-700 p-1 cursor-pointer"
                title="Remove scheme"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#4C3D19] text-[#E5D7C4] inline-block">
                  {scheme.type} • {scheme.category}
                </span>

                <h4 className="text-base font-bold text-[#4C3D19] pr-6">{scheme.name}</h4>

                <div className="bg-white p-3.5 rounded-xl border border-[#CFBB99]">
                  <span className="text-[10px] text-[#4C3D19]/60 font-bold uppercase block mb-0.5">
                    Subsidy / Aid
                  </span>
                  <span className="text-sm font-extrabold text-[#354024]">
                    {scheme.subsidyAmount}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#4C3D19]">
                  <div>
                    <span className="text-[#4C3D19]/60 font-bold block">Age Bracket:</span>
                    <span>{scheme.minAge} to {scheme.maxAge} Years</span>
                  </div>

                  <div>
                    <span className="text-[#4C3D19]/60 font-bold block">Max Annual Income:</span>
                    <span>₹{Number(scheme.maxIncome).toLocaleString('en-IN')} / yr</span>
                  </div>

                  <div>
                    <span className="text-[#4C3D19]/60 font-bold block">Target Group:</span>
                    <span>{scheme.beneficiary}</span>
                  </div>

                  <div>
                    <span className="text-[#4C3D19]/60 font-bold block">State:</span>
                    <span>{scheme.state}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#CFBB99]">
                  <span className="text-[11px] font-bold text-[#4C3D19] block mb-2">Required Documents:</span>
                  <div className="space-y-1.5">
                    {scheme.documentsRequired.map((doc, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-[#4C3D19] font-medium">
                        <FiCheck className="w-3.5 h-3.5 text-[#889063] flex-shrink-0" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#CFBB99]">
                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#4C3D19] hover:bg-[#354024] text-[#E5D7C4] font-bold text-xs flex items-center justify-center space-x-1 shadow-md"
                >
                  <span>Apply Now</span>
                  <FiExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
