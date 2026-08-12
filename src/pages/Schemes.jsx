import React, { useState, useEffect, useRef } from 'react';
import { getSchemes, getCategories } from '../services/api';
import { STATES_LIST } from '../data/schemesData';
import { FiSearch, FiSliders, FiX, FiCheck, FiArrowRight, FiExternalLink, FiRefreshCw, FiChevronLeft, FiChevronRight, FiGrid } from 'react-icons/fi';

const Schemes = ({
  onSelectScheme = () => {},
  initialSearch = '',
  initialCategory = 'All',
  selectedCompareList = [],
  onToggleCompare = () => {},
  onOpenCompareModal = () => {}
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 9;

  // Data & Async States
  const [schemes, setSchemes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 1 });
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  // Sync initial props if updated externally
  useEffect(() => {
    if (initialSearch) setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Fetch Categories for Filter Dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res && res.success && Array.isArray(res.data)) {
          // Normalize string array from either string or { name: string } objects
          const names = res.data.map(c => (typeof c === 'string' ? c : (c?.name || ''))).filter(Boolean);
          setCategoriesList(names);
        }
      } catch (err) {
        // Soft fail fallback
      }
    };
    fetchCats();
  }, []);

  // Fetch Schemes from Flask API with backend query params & pagination
  const loadSchemes = async () => {
    setLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await getSchemes({
        search: searchTerm,
        state: selectedState,
        category: selectedCategory,
        type: selectedType,
        sort: sortBy,
        page: page,
        limit: limit
      }, { signal: abortControllerRef.current.signal });

      if (res && res.success && Array.isArray(res.data)) {
        setSchemes(res.data);
        if (res.pagination) {
          setPagination({
            page: Number(res.pagination.page) || 1,
            limit: Number(res.pagination.limit) || 9,
            total: Number(res.pagination.total) || 0,
            pages: Number(res.pagination.pages) || 1
          });
        }
      } else {
        setSchemes([]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError("Unable to load government schemes. Please check your backend connection and retry.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Trigger query whenever filter controls change (debounced for text search)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSchemes();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedState, selectedCategory, selectedType, sortBy, page]);

  // Reset page to 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedState('All');
    setSelectedCategory('All');
    setSelectedType('All');
    setSortBy('popular');
    setPage(1);
  };

  const safeCompareList = Array.isArray(selectedCompareList) ? selectedCompareList : [];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#4C3D19] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left border-b border-[#CFBB99]/40 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#4C3D19] tracking-tight">
              Government Schemes Directory
            </h1>
            <p className="text-sm sm:text-base text-[#4C3D19]/80 mt-2 max-w-2xl">
              Search and filter Central and State government welfare programs backed by live database verification.
            </p>
          </div>

          {/* Compare Counter Floating Bar Trigger */}
          {safeCompareList.length > 0 && (
            <button
              onClick={onOpenCompareModal}
              className="px-5 py-2.5 rounded-full bg-[#4C3D19] text-white text-xs font-bold shadow-md hover:bg-[#354024] transition-colors flex items-center space-x-2 self-center sm:self-auto cursor-pointer"
            >
              <span>Compare Selected ({safeCompareList.length}/3)</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Directory Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Filter Panel (Col 3) */}
          <aside className="lg:col-span-3 space-y-6 card-white p-6 rounded-3xl border border-[#CFBB99] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#CFBB99]/40 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-[#4C3D19] flex items-center space-x-1.5">
                <FiSliders className="w-4 h-4 text-[#889063]" />
                <span>Filters</span>
              </span>
              {(searchTerm || selectedState !== 'All' || selectedCategory !== 'All' || selectedType !== 'All') && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-[#889063] hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Filter: Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4C3D19] block">Keyword Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                  placeholder="Search scheme name..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F7F3ED] border border-[#CFBB99] text-xs text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleFilterChange(setSearchTerm, '')}
                    className="absolute right-2.5 top-2 text-[#4C3D19]/60 hover:text-[#4C3D19]"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter: State */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4C3D19] block">State / Jurisdiction</label>
              <select
                value={selectedState}
                onChange={(e) => handleFilterChange(setSelectedState, e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F3ED] border border-[#CFBB99] text-xs text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
              >
                <option value="All">All States & Union Territories</option>
                {STATES_LIST.map(s => {
                  const name = typeof s === 'string' ? s : (s?.name || '');
                  if (!name || name === 'All India' || name === 'Central Schemes') return null;
                  return <option key={name} value={name}>{name}</option>;
                })}
              </select>
            </div>

            {/* Filter: Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4C3D19] block">Welfare Sector</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F3ED] border border-[#CFBB99] text-xs text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
              >
                <option value="All">All Sectors & Categories</option>
                {categoriesList.map(cat => {
                  const catName = typeof cat === 'string' ? cat : (cat?.name || '');
                  if (!catName) return null;
                  return <option key={catName} value={catName}>{catName}</option>;
                })}
              </select>
            </div>

            {/* Filter: Type (Central vs State) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4C3D19] block">Governance Type</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F7F3ED] rounded-xl border border-[#CFBB99]/60">
                {['All', 'Central', 'State'].map(t => (
                  <button
                    key={t}
                    onClick={() => handleFilterChange(setSelectedType, t)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      selectedType === t ? 'bg-[#4C3D19] text-white shadow-xs' : 'text-[#4C3D19]/70 hover:text-[#4C3D19]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Control */}
            <div className="space-y-2 pt-2 border-t border-[#CFBB99]/40">
              <label className="text-xs font-bold text-[#4C3D19] block">Sort Order</label>
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F3ED] border border-[#CFBB99] text-xs text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
              >
                <option value="popular">Popularity & Priority</option>
                <option value="name">Alphabetical (A-Z)</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="state">State / Region</option>
              </select>
            </div>
          </aside>

          {/* Main Results Container (Col 9) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Active Filter Chips Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99]/60">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[#4C3D19]">Found {pagination.total || 0} Schemes</span>
                {selectedState !== 'All' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#CFBB99] text-[#4C3D19] font-medium flex items-center space-x-1">
                    <span>State: {selectedState}</span>
                    <FiX className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange(setSelectedState, 'All')} />
                  </span>
                )}
                {selectedCategory !== 'All' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#CFBB99] text-[#4C3D19] font-medium flex items-center space-x-1">
                    <span>Sector: {selectedCategory}</span>
                    <FiX className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange(setSelectedCategory, 'All')} />
                  </span>
                )}
                {selectedType !== 'All' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#CFBB99] text-[#4C3D19] font-medium flex items-center space-x-1">
                    <span>Type: {selectedType}</span>
                    <FiX className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange(setSelectedType, 'All')} />
                  </span>
                )}
              </div>

              {/* View Status */}
              <span className="text-xs font-medium text-[#4C3D19]/70">
                Page {pagination.page || 1} of {pagination.pages || 1}
              </span>
            </div>

            {/* Loading Skeleton Grid */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="h-64 bg-[#F7F3ED] rounded-2xl border border-[#CFBB99]/40" />
                ))}
              </div>
            )}

            {/* Error Retry Card */}
            {error && !loading && (
              <div className="card-white p-10 rounded-3xl text-center border border-[#CFBB99] space-y-4 max-w-lg mx-auto">
                <p className="text-sm text-[#4C3D19]/80 leading-relaxed">{error}</p>
                <button
                  onClick={loadSchemes}
                  className="px-6 py-2.5 rounded-full btn-cafe text-xs font-semibold inline-flex items-center space-x-2"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Database Query</span>
                </button>
              </div>
            )}

            {/* Scheme Cards Grid */}
            {!loading && !error && schemes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schemes.map((scheme, idx) => {
                  if (!scheme) return null;
                  const isCompared = safeCompareList.some(s => s && s.id === scheme.id);
                  return (
                    <div
                      key={scheme.id || idx}
                      className="card-feature p-6 rounded-2xl bg-white border border-[#CFBB99] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F7F3ED] border border-[#CFBB99] font-bold text-[#4C3D19]">
                            {scheme.category || 'General'}
                          </span>
                          <span className="font-semibold text-[#889063]">{scheme.state || 'All India'}</span>
                        </div>

                        <h3 className="text-lg font-bold text-[#4C3D19] leading-snug line-clamp-2">
                          {scheme.name || 'Government Scheme'}
                        </h3>

                        <p className="text-xs text-[#4C3D19]/75 line-clamp-2 leading-relaxed">
                          {scheme.shortDescription || ''}
                        </p>

                        <div className="pt-2 text-xs font-bold text-[#4C3D19]">
                          Financial Aid: <span className="text-[#889063]">{scheme.subsidyAmount || 'Financial Support'}</span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-4 mt-4 border-t border-[#CFBB99]/30 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <button
                            onClick={() => onSelectScheme(scheme)}
                            className="font-bold text-[#4C3D19] hover:text-[#889063] flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Guidelines</span>
                            <FiArrowRight className="w-3.5 h-3.5" />
                          </button>
                          {scheme.officialLink && (
                            <a
                              href={scheme.officialLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#4C3D19]/70 hover:text-[#4C3D19] flex items-center space-x-1"
                            >
                              <span>Apply</span>
                              <FiExternalLink className="w-3 h-3 text-[#889063]" />
                            </a>
                          )}
                        </div>

                        {/* Compare Toggle Button */}
                        <button
                          onClick={() => onToggleCompare(scheme)}
                          className={`w-full py-1.5 rounded-lg text-[11px] font-bold border transition-colors flex items-center justify-center space-x-1 cursor-pointer ${
                            isCompared
                              ? 'bg-[#889063] text-white border-[#889063]'
                              : 'bg-[#F7F3ED] text-[#4C3D19] border-[#CFBB99]/60 hover:bg-[#E5D7C4]'
                          }`}
                        >
                          {isCompared ? (
                            <>
                              <FiCheck className="w-3 h-3" />
                              <span>Added to Compare</span>
                            </>
                          ) : (
                            <span>+ Compare Scheme</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && schemes.length === 0 && (
              <div className="card-white p-12 rounded-3xl text-center border border-[#CFBB99] space-y-4">
                <FiGrid className="w-10 h-10 text-[#889063] mx-auto opacity-60" />
                <h3 className="text-xl font-bold text-[#4C3D19]">No matching schemes found</h3>
                <p className="text-xs text-[#4C3D19]/70 max-w-md mx-auto">
                  We couldn't find any scheme matching your current search parameters. Try clearing some filters or searching for broader terms.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-full btn-cafe text-xs font-semibold inline-block cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Real Backend Pagination Controls */}
            {!loading && !error && pagination.pages > 1 && (
              <div className="pt-6 border-t border-[#CFBB99]/40 flex items-center justify-between text-xs">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-full border border-[#CFBB99] text-[#4C3D19] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F3ED] flex items-center space-x-1 cursor-pointer"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="font-semibold text-[#4C3D19]">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  className="px-4 py-2 rounded-full border border-[#CFBB99] text-[#4C3D19] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F3ED] flex items-center space-x-1 cursor-pointer"
                >
                  <span>Next</span>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Schemes;
