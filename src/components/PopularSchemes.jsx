import React, { useEffect, useState } from 'react';
import { getSchemes } from '../services/api';
import { FiArrowRight, FiExternalLink, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';

const PopularSchemes = ({ onSelectScheme = () => {} }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPopular = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSchemes({ popular: true, limit: 6 });
      if (res.success && Array.isArray(res.data)) {
        setSchemes(res.data);
      } else {
        setSchemes([]);
      }
    } catch (err) {
      setError("Unable to load popular schemes right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopular();
  }, []);

  return (
    <section className="py-20 bg-[#F7F3ED] text-[#4C3D19] border-t border-[#CFBB99]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E5D7C4] text-[#4C3D19] text-xs font-bold uppercase tracking-wider mb-3">
            <FiTrendingUp className="w-3.5 h-3.5 text-[#889063]" />
            <span>High Citizen Demand</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#4C3D19]">
            Most Popular Government Schemes
          </h2>
          <p className="text-sm text-[#4C3D19]/80 mt-2">
            Top searched and accessed financial aid initiatives across India.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-56 bg-white rounded-2xl border border-[#CFBB99]/50 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-[#4C3D19]/80 mb-3">{error}</p>
            <button
              onClick={fetchPopular}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full btn-cafe text-xs font-semibold"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Popular Grid */}
        {!loading && !error && schemes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map(scheme => (
              <div
                key={scheme.id}
                className="card-feature p-6 rounded-2xl bg-white border border-[#CFBB99] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F7F3ED] border border-[#CFBB99] font-bold text-[#4C3D19]">
                      {scheme.category}
                    </span>
                    <span className="text-[#889063] font-semibold">{scheme.state}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#4C3D19] leading-snug line-clamp-2">
                    {scheme.name}
                  </h3>

                  <p className="text-xs text-[#4C3D19]/75 line-clamp-2 leading-relaxed">
                    {scheme.shortDescription}
                  </p>

                  <div className="pt-2 text-xs font-bold text-[#4C3D19]">
                    Financial Aid: <span className="text-[#889063]">{scheme.subsidyAmount}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#CFBB99]/30 flex items-center justify-between">
                  <button
                    onClick={() => onSelectScheme(scheme)}
                    className="text-xs font-bold text-[#4C3D19] hover:text-[#889063] flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Guidelines</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {scheme.officialLink && (
                    <a
                      href={scheme.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#4C3D19]/70 hover:text-[#4C3D19] flex items-center space-x-1"
                    >
                      <span>Apply</span>
                      <FiExternalLink className="w-3 h-3 text-[#889063]" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularSchemes;
