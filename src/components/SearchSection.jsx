import React, { useState, useEffect, useRef } from 'react';
import { getSchemes } from '../services/api';
import { FiSearch, FiArrowRight, FiShield, FiSliders, FiX, FiRefreshCw } from 'react-icons/fi';

const SearchSection = ({ onSelectScheme = () => {}, onOpenSchemesDirectory = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChip, setActiveChip] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const popularChips = [
    'PM Kisan',
    'Scholarships',
    'Housing',
    'Startup India',
    'Women Welfare'
  ];

  // Debounced Search Effect (350ms)
  useEffect(() => {
    const handleSearch = async () => {
      const query = searchTerm || activeChip;
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Cancel preceding pending request if user is still typing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const res = await getSchemes(
          { search: query, limit: 6 },
          { signal: abortControllerRef.current.signal }
        );
        if (res.success && Array.isArray(res.data)) {
          setResults(res.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError("Failed to search schemes. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      handleSearch();
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, activeChip]);

  const handleChipClick = (chip) => {
    if (activeChip === chip) {
      setActiveChip('');
      setSearchTerm('');
    } else {
      setActiveChip(chip);
      setSearchTerm(chip);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveChip('');
    setResults([]);
  };

  return (
    <section className="py-20 bg-white text-[#4C3D19] border-b border-[#CFBB99]/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#4C3D19]">
            Search Government Schemes
          </h2>
          <p className="text-sm text-[#4C3D19]/75 mt-2">
            Enter scheme names, sector keywords, or financial aid terms to query active central & state benefits.
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="relative max-w-3xl mx-auto mb-6">
          <div className="relative flex items-center">
            <FiSearch className="w-5 h-5 text-[#889063] absolute left-5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (activeChip) setActiveChip('');
              }}
              placeholder="Search by scheme name, keywords (e.g. Kisan, Scholarship, Housing)..."
              className="w-full pl-13 pr-12 py-4 rounded-full bg-[#F7F3ED] border border-[#CFBB99] text-[#4C3D19] placeholder-[#4C3D19]/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#889063] transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 text-[#4C3D19]/60 hover:text-[#4C3D19] p-1 cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Popular Search Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <span className="text-xs font-bold text-[#4C3D19]/60 mr-1 uppercase tracking-wider">Popular Queries:</span>
          {popularChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activeChip === chip || searchTerm === chip
                  ? 'bg-[#4C3D19] text-white border-[#4C3D19] shadow-sm'
                  : 'bg-[#F7F3ED] text-[#4C3D19] border-[#CFBB99]/60 hover:border-[#CFBB99]'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-6 text-xs text-[#4C3D19]/70 flex items-center justify-center space-x-2">
            <FiRefreshCw className="w-4 h-4 animate-spin text-[#889063]" />
            <span>Querying Flask Database...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Search Results Grid */}
        {!loading && !error && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#4C3D19]/70 pb-2 border-b border-[#CFBB99]/30">
              <span>Matching Schemes ({results.length})</span>
              <button
                onClick={() => onOpenSchemesDirectory(searchTerm || activeChip)}
                className="text-[#889063] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Explore all results in Directory</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((scheme) => (
                <div
                  key={scheme.id}
                  onClick={() => onSelectScheme(scheme)}
                  className="card-feature p-5 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] hover:border-[#889063] cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-white font-bold text-[#4C3D19] border border-[#CFBB99]/60">
                        {scheme.category}
                      </span>
                      <span className="text-[#889063] font-semibold">{scheme.state}</span>
                    </div>

                    <h4 className="text-base font-bold text-[#4C3D19] leading-snug">
                      {scheme.name}
                    </h4>

                    <p className="text-xs text-[#4C3D19]/80 line-clamp-2">
                      {scheme.shortDescription}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#CFBB99]/30 flex items-center justify-between text-xs font-semibold text-[#4C3D19]">
                    <span>Aid: <strong className="text-[#889063]">{scheme.subsidyAmount}</strong></span>
                    <span className="text-[#889063] flex items-center space-x-1">
                      <span>View</span>
                      <FiArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State when search returned 0 results */}
        {!loading && !error && (searchTerm || activeChip) && results.length === 0 && (
          <div className="text-center py-8 text-sm text-[#4C3D19]/70 bg-[#F7F3ED] rounded-2xl border border-[#CFBB99]/60">
            No schemes matched your query "<strong className="text-[#4C3D19]">{searchTerm || activeChip}</strong>".
            <br />
            <span className="text-xs opacity-75 mt-1 block">Try keywords such as Kisan, Housing, Scholarship, or Health.</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchSection;
