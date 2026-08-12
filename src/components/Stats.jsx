import React, { useEffect, useState } from 'react';
import { getStats } from '../services/api';

const Stats = () => {
  const [statsData, setStatsData] = useState({
    totalSchemes: 12,
    centralSchemes: 7,
    stateSchemes: 5,
    categoriesCount: 8,
    statesCovered: 36
  });

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const res = await getStats();
        if (res.success && res.data) {
          setStatsData(res.data);
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchStatsData();
  }, []);

  const statsList = [
    { label: "Verified Schemes", value: `${statsData.totalSchemes}` },
    { label: "Central Schemes", value: `${statsData.centralSchemes}` },
    { label: "State Programs", value: `${statsData.stateSchemes}` },
    { label: "States & UTs Covered", value: `${statsData.statesCovered}` }
  ];

  return (
    <section className="py-16 bg-[#F7F3ED] border-y border-[#CFBB99]/40 text-[#4C3D19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {statsList.map((stat, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-[#CFBB99]/60 shadow-xs">
              <div className="text-3xl sm:text-4xl font-black text-[#4C3D19] mb-1">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-[#4C3D19]/70 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
