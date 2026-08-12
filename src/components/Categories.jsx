import React, { useEffect, useState } from 'react';
import { getCategories } from '../services/api';
import { FiGrid, FiArrowRight, FiShield } from 'react-icons/fi';

const Categories = ({ onSelectCategory = () => {} }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <section className="py-24 bg-white text-[#4C3D19] border-b border-[#CFBB99]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#F7F3ED] border border-[#CFBB99]/60 text-[#4C3D19] text-xs font-bold uppercase tracking-wider mb-3">
            <FiGrid className="w-3.5 h-3.5 text-[#889063]" />
            <span>Welfare Sectors</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#4C3D19]">
            Browse Schemes by Sector
          </h2>
          <p className="text-sm text-[#4C3D19]/80 mt-2">
            Targeted welfare programs categorized across key economic and social development domains.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="h-32 bg-[#F7F3ED] rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className="card-feature p-6 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] hover:border-[#4C3D19] cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <h3 className="text-base font-bold text-[#4C3D19] group-hover:text-[#889063] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-[#4C3D19]/60 block mt-1">
                    {cat.count} Active {cat.count === 1 ? 'Scheme' : 'Schemes'}
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-bold text-[#4C3D19] group-hover:translate-x-1 transition-transform">
                  <span>Explore Sector</span>
                  <FiArrowRight className="w-3.5 h-3.5 text-[#889063]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
