import React, { useEffect, useState } from 'react';
import { getSchemeById } from '../services/api';
import { FiX, FiCheck, FiExternalLink, FiFileText, FiShield, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

const SchemeDetailModal = ({ scheme = null, onClose = () => {} }) => {
  const [schemeDetail, setSchemeDetail] = useState(scheme);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (scheme && scheme.id) {
      const fetchDetail = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await getSchemeById(scheme.id);
          if (res.success && res.data) {
            setSchemeDetail(res.data);
          } else {
            setSchemeDetail(scheme);
          }
        } catch (err) {
          // Fallback to passed prop if network fails
          setSchemeDetail(scheme);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [scheme]);

  if (!scheme) return null;

  const currentScheme = schemeDetail || scheme;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#4C3D19]/60 backdrop-blur-sm overflow-y-auto">
      <div className="card-white w-full max-w-4xl rounded-3xl border border-[#CFBB99] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col bg-white">
        
        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-[#F7F3ED] border-b border-[#CFBB99]/60 flex items-start justify-between relative">
          <div className="space-y-2 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#4C3D19] text-white text-xs font-bold">
                {currentScheme.type || 'Central'} Sector
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#CFBB99] text-[#4C3D19] text-xs font-bold">
                {currentScheme.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#E5D7C4] text-[#4C3D19] text-xs font-bold">
                {currentScheme.state}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4C3D19] leading-tight">
              {currentScheme.name}
            </h2>

            {currentScheme.department && (
              <p className="text-xs font-semibold text-[#4C3D19]/70 uppercase tracking-wider">
                {currentScheme.department}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white border border-[#CFBB99] text-[#4C3D19] hover:bg-[#E5D7C4] transition-colors cursor-pointer shrink-0"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          
          {loading && (
            <div className="text-center py-4 text-xs text-[#4C3D19]/60 flex items-center justify-center space-x-2">
              <FiRefreshCw className="w-4 h-4 animate-spin text-[#889063]" />
              <span>Fetching latest database guidelines...</span>
            </div>
          )}

          {/* Financial Aid Banner */}
          <div className="p-5 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#4C3D19]/60 uppercase tracking-wider block">Financial Grant / Benefit Amount</span>
              <span className="text-2xl font-black text-[#4C3D19]">{currentScheme.subsidyAmount}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-[#4C3D19]/60 uppercase tracking-wider block">Target Beneficiary</span>
              <span className="text-sm font-bold text-[#889063]">{currentScheme.beneficiary}</span>
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#4C3D19]">Scheme Overview</h3>
            <p className="text-sm text-[#4C3D19]/80 leading-relaxed">
              {currentScheme.fullDescription || currentScheme.shortDescription}
            </p>
          </div>

          {/* Eligibility Criteria Box */}
          <div className="p-5 rounded-2xl bg-white border border-[#CFBB99]/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4C3D19] flex items-center space-x-2">
              <FiShield className="w-4 h-4 text-[#889063]" />
              <span>Eligibility Boundaries</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F3ED]">
                <span className="text-[#4C3D19]/60 block font-semibold">Age Range</span>
                <span className="font-bold text-[#4C3D19]">{currentScheme.minAge} – {currentScheme.maxAge} Years</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F3ED]">
                <span className="text-[#4C3D19]/60 block font-semibold">Income Limit</span>
                <span className="font-bold text-[#4C3D19]">Up to ₹{Number(currentScheme.maxIncome || 0).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F3ED]">
                <span className="text-[#4C3D19]/60 block font-semibold">Target Group</span>
                <span className="font-bold text-[#4C3D19]">{currentScheme.beneficiary}</span>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          {Array.isArray(currentScheme.benefits) && currentScheme.benefits.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#4C3D19]">Key Benefits Checklist</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4C3D19]/85">
                {currentScheme.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-[#F7F3ED]">
                    <FiCheckCircle className="w-4 h-4 text-[#889063] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Documents */}
          {Array.isArray(currentScheme.documentsRequired) && currentScheme.documentsRequired.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#4C3D19]">Required Documents</h3>
              <div className="flex flex-wrap gap-2">
                {currentScheme.documentsRequired.map((doc, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-white border border-[#CFBB99] text-xs font-semibold text-[#4C3D19] flex items-center space-x-1.5">
                    <FiFileText className="w-3.5 h-3.5 text-[#889063]" />
                    <span>{doc}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Application Procedure */}
          {currentScheme.applicationProcedure && (
            <div className="space-y-2 p-5 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4C3D19]">Application Process</h3>
              <p className="text-xs text-[#4C3D19]/80 leading-relaxed">
                {currentScheme.applicationProcedure}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-[#F7F3ED] border-t border-[#CFBB99]/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-[#CFBB99] text-xs font-bold text-[#4C3D19] hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>

          {currentScheme.officialLink && (
            <a
              href={currentScheme.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full btn-cafe text-xs font-bold flex items-center space-x-2"
            >
              <span>Apply on Official Portal</span>
              <FiExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemeDetailModal;
