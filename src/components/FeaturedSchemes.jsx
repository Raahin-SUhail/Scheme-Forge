import React, { useEffect, useState } from 'react';
import { getSchemes } from '../services/api';
import { FiArrowRight, FiCheckCircle, FiShield, FiExternalLink, FiRefreshCw } from 'react-icons/fi';

const FeaturedSchemes = ({ onSelectScheme = () => {} }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeatured = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSchemes({ featured: true, limit: 3 });
      if (res.success && Array.isArray(res.data)) {
        setSchemes(res.data);
      } else {
        setSchemes([]);
      }
    } catch (err) {
      setError("Unable to load featured schemes right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const primaryFeatured = schemes[0];
  const secondaryFeatured = schemes.slice(1);

  return (
    <section className="py-24 bg-white text-[#4C3D19] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#CFBB99]/40 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F7F3ED] border border-[#CFBB99]/60 text-[#4C3D19] text-xs font-semibold uppercase tracking-wider mb-3">
              <FiShield className="w-3.5 h-3.5 text-[#889063]" />
              <span>Priority Government Directives</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#4C3D19]">
              Featured National Welfare Grants
            </h2>
          </div>
          <p className="text-sm text-[#4C3D19]/70 max-w-md mt-2 md:mt-0 leading-relaxed">
            High-impact financial assistance programs open for direct online application across all 36 States & UTs.
          </p>
        </div>

        {/* Loading Skeleton State */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-7 h-96 bg-[#F7F3ED] rounded-3xl border border-[#CFBB99]/40" />
            <div className="lg:col-span-5 space-y-6">
              <div className="h-44 bg-[#F7F3ED] rounded-2xl border border-[#CFBB99]/40" />
              <div className="h-44 bg-[#F7F3ED] rounded-2xl border border-[#CFBB99]/40" />
            </div>
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && !loading && (
          <div className="card-white p-8 rounded-3xl text-center border border-[#CFBB99] max-w-xl mx-auto space-y-4">
            <p className="text-sm text-[#4C3D19]/80">{error}</p>
            <button
              onClick={fetchFeatured}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full btn-cafe text-xs font-semibold"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 2-Column Editorial Composition */}
        {!loading && !error && schemes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Primary Featured Card (Col 7) */}
            {primaryFeatured && (
              <div className="lg:col-span-7 flex">
                <div className="card-feature p-8 sm:p-10 rounded-3xl border border-[#CFBB99] bg-[#F7F3ED] flex flex-col justify-between w-full shadow-lg relative overflow-hidden group">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="px-3.5 py-1 rounded-full bg-[#4C3D19] text-white text-xs font-bold tracking-wide">
                        {primaryFeatured.type || 'Central'} Sector
                      </span>
                      <span className="text-xs font-bold text-[#889063] bg-white px-3 py-1 rounded-full border border-[#CFBB99]">
                        ★ {primaryFeatured.rating || '4.9'} Priority Rating
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#4C3D19] leading-tight mb-2">
                        {primaryFeatured.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#4C3D19]/70 uppercase tracking-wider">
                        {primaryFeatured.department}
                      </p>
                    </div>

                    <p className="text-sm text-[#4C3D19]/80 leading-relaxed">
                      {primaryFeatured.shortDescription || primaryFeatured.fullDescription}
                    </p>

                    {/* Financial Callout Pill */}
                    <div className="p-4 rounded-2xl bg-white border border-[#CFBB99]/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[#4C3D19]/60 uppercase block">Financial Aid / Benefit</span>
                        <span className="text-lg font-black text-[#4C3D19]">{primaryFeatured.subsidyAmount}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#889063] px-3 py-1 bg-[#F7F3ED] rounded-full">
                        {primaryFeatured.beneficiary}
                      </span>
                    </div>

                    {/* Key Benefits List */}
                    {Array.isArray(primaryFeatured.benefits) && primaryFeatured.benefits.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-[#4C3D19] uppercase tracking-wider block">Key Grant Highlights:</span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4C3D19]/80">
                          {primaryFeatured.benefits.slice(0, 4).map((b, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <FiCheckCircle className="w-3.5 h-3.5 text-[#889063] shrink-0" />
                              <span className="truncate">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-8 flex items-center space-x-4 border-t border-[#CFBB99]/40 mt-8">
                    <button
                      onClick={() => onSelectScheme(primaryFeatured)}
                      className="px-6 py-3 rounded-full btn-cafe text-xs font-semibold flex items-center space-x-2 cursor-pointer"
                    >
                      <span>View Full Guidelines</span>
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                    {primaryFeatured.officialLink && (
                      <a
                        href={primaryFeatured.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 rounded-full btn-cafe-outline text-xs font-semibold flex items-center space-x-1.5"
                      >
                        <span>Apply Online</span>
                        <FiExternalLink className="w-3.5 h-3.5 text-[#889063]" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stacked Secondary Cards (Col 5) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              {secondaryFeatured.map((secScheme) => (
                <div
                  key={secScheme.id}
                  className="card-feature p-6 rounded-2xl border border-[#CFBB99] bg-white flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E5D7C4] font-semibold text-[#4C3D19]">
                        {secScheme.category}
                      </span>
                      <span className="font-bold text-[#4C3D19]/70">{secScheme.state}</span>
                    </div>

                    <h4 className="text-lg font-bold text-[#4C3D19] leading-snug">
                      {secScheme.name}
                    </h4>

                    <p className="text-xs text-[#4C3D19]/75 line-clamp-2 leading-relaxed">
                      {secScheme.shortDescription}
                    </p>

                    <div className="text-xs font-extrabold text-[#4C3D19] pt-1">
                      Benefit: <span className="text-[#889063]">{secScheme.subsidyAmount}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#CFBB99]/30 flex items-center justify-between">
                    <button
                      onClick={() => onSelectScheme(secScheme)}
                      className="text-xs font-bold text-[#4C3D19] hover:text-[#889063] flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {secScheme.officialLink && (
                      <a
                        href={secScheme.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#4C3D19]/70 hover:text-[#4C3D19] flex items-center space-x-1"
                      >
                        <span>Portal</span>
                        <FiExternalLink className="w-3 h-3 text-[#889063]" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSchemes;
