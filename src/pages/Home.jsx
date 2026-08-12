import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import SearchSection from '../components/SearchSection';
import QuickActions from '../components/QuickActions';
import FeaturedSchemes from '../components/FeaturedSchemes';
import Highlights from '../components/Highlights';
import Stats from '../components/Stats';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';

export default function Home({
  initialSearch = '',
  initialCategory = 'All',
  onSelectScheme = () => {},
  onOpenAi,
  setActiveTab = () => {}
}) {
  const scrollToSearch = () => {
    const el = document.getElementById('search');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenEligibility = () => {
    setActiveTab('eligibility');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDirectory = () => {
    setActiveTab('schemes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-white">
      {/* 1. Floating Glass Navbar */}
      <Navbar activeTab="home" setActiveTab={setActiveTab} onOpenAi={onOpenAi} />

      {/* 2. Architectural Hero Centerpiece */}
      <Hero onExplore={scrollToSearch} onEligibility={handleOpenEligibility} />

      {/* 3. Search */}
      <div id="search">
        <SearchSection
          onSelectScheme={onSelectScheme}
          onOpenSchemesDirectory={handleOpenDirectory}
        />
      </div>

      {/* 4. Quick Actions */}
      <QuickActions
        onSelectCategory={() => handleOpenDirectory()}
        onSelectSearch={() => handleOpenDirectory()}
      />

      {/* 5. Featured Schemes */}
      <FeaturedSchemes onSelectScheme={onSelectScheme} />

      {/* 6. Platform Highlights */}
      <Highlights />

      {/* 7. Statistics */}
      <Stats />

      {/* 8. Call To Action */}
      <CtaBanner onExplore={scrollToSearch} onEligibility={handleOpenEligibility} />

      {/* 9. Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
