import React, { useState } from 'react';
import Home from './pages/Home';
import Schemes from './pages/Schemes';
import CategoriesPage from './pages/Categories';
import Eligibility from './pages/Eligibility';
import About from './pages/About';
import Contact from './pages/Contact';
import SchemeDetailModal from './components/SchemeDetailModal';
import CompareModal from './components/CompareModal';
import AiAssistantDrawer from './components/AiAssistantDrawer';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals & Assistant state
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState(null);
  const [selectedCompareList, setSelectedCompareList] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const handleToggleCompare = (scheme) => {
    if (!scheme || !scheme.id) return;
    setSelectedCompareList((prev) => {
      const exists = prev.some((s) => s.id === scheme.id);
      if (exists) {
        return prev.filter((s) => s.id !== scheme.id);
      } else {
        if (prev.length >= 3) return prev;
        return [...prev, scheme];
      }
    });
  };

  const handleRemoveCompare = (schemeId) => {
    setSelectedCompareList((prev) => prev.filter((s) => s.id !== schemeId));
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-[#4C3D19] flex flex-col justify-between selection:bg-[#CFBB99] selection:text-[#4C3D19]">
        {/* Dynamic Page Views */}
        {activeTab === 'home' && (
          <Home
            initialSearch={searchQuery}
            initialCategory={selectedCategory}
            onSelectScheme={(scheme) => setSelectedSchemeDetail(scheme)}
            onOpenAi={() => setIsAiOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'schemes' && (
          <>
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />
            <Schemes
              initialSearch={searchQuery}
              initialCategory={selectedCategory}
              onSelectScheme={(scheme) => setSelectedSchemeDetail(scheme)}
              selectedCompareList={selectedCompareList}
              onToggleCompare={handleToggleCompare}
              onOpenCompareModal={() => setIsCompareOpen(true)}
            />
            <Footer setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />
            <CategoriesPage
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveTab('schemes');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <Footer setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'eligibility' && (
          <>
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />
            <Eligibility onSelectScheme={(scheme) => setSelectedSchemeDetail(scheme)} />
            <Footer setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'states' && (
          <>
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />
            <Schemes
              initialSearch={searchQuery}
              initialCategory={selectedCategory}
              onSelectScheme={(scheme) => setSelectedSchemeDetail(scheme)}
              selectedCompareList={selectedCompareList}
              onToggleCompare={handleToggleCompare}
              onOpenCompareModal={() => setIsCompareOpen(true)}
            />
            <Footer setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'about' && (
          <>
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />
            <About />
            <Footer setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'contact' && (
          <>
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />
            <Contact />
            <Footer setActiveTab={setActiveTab} />
          </>
        )}

        {/* Global Modals & AI Assistant Drawer */}
        <SchemeDetailModal
          scheme={selectedSchemeDetail}
          onClose={() => setSelectedSchemeDetail(null)}
        />

        {isCompareOpen && (
          <CompareModal
            compareList={selectedCompareList}
            onClose={() => setIsCompareOpen(false)}
            onRemove={handleRemoveCompare}
          />
        )}

        <AiAssistantDrawer
          isOpen={isAiOpen}
          onClose={() => setIsAiOpen(false)}
          onSelectScheme={(scheme) => setSelectedSchemeDetail(scheme)}
        />
      </div>
    </ErrorBoundary>
  );
}
