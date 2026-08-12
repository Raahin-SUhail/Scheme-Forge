import React, { useState } from 'react';
import { STATES_LIST } from '../data/schemesData';
import { findEligibleSchemes } from '../services/api';
import { FiShield, FiChevronRight, FiChevronLeft, FiRotateCcw, FiExternalLink, FiCheckCircle, FiXCircle, FiHelpCircle, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const EligibilityChecker = ({ onSelectScheme = () => {} }) => {
  const [step, setStep] = useState(1);
  
  // Rich Citizen Profile State
  const [state, setState] = useState('Maharashtra');
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState('Male');
  const [annualIncome, setAnnualIncome] = useState(250000);
  const [isBPL, setIsBPL] = useState(false);
  const [occupation, setOccupation] = useState('Salaried / Self-Employed');
  const [socialCategory, setSocialCategory] = useState('General');
  const [isFarmer, setIsFarmer] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [hasDisability, setHasDisability] = useState(false);

  // Results State
  const [isCalculating, setIsCalculating] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [error, setError] = useState(null);
  const [showIneligible, setShowIneligible] = useState(false);

  const occupationsList = [
    'Salaried / Self-Employed',
    'Farmers',
    'Students',
    'Women / Homemaker',
    'Entrepreneurs',
    'Rural Worker',
    'Senior Citizen'
  ];

  const socialCategoriesList = ['General', 'OBC', 'SC', 'ST'];

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      runEligibilityEngine();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(1);
    setResultsData(null);
    setError(null);
  };

  const runEligibilityEngine = async () => {
    setIsCalculating(true);
    setError(null);
    setStep(6);

    const profile = {
      state,
      age: Number(age),
      annualIncome: Number(annualIncome),
      gender,
      occupation,
      socialCategory,
      isBPL,
      isStudent: isStudent || occupation === 'Students',
      isFarmer: isFarmer || occupation === 'Farmers',
      hasDisability
    };

    try {
      const res = await findEligibleSchemes(profile, { includeIneligible: true });
      if (res && res.success && Array.isArray(res.data)) {
        setResultsData(res);
      } else {
        setError("Failed to process eligibility. Please check parameters.");
      }
    } catch (err) {
      setError(err.message || "Failed to reach eligibility server.");
    } finally {
      setIsCalculating(false);
    }
  };

  const resultsList = resultsData && Array.isArray(resultsData.data) ? resultsData.data : [];

  return (
    <section id="eligibility" className="py-24 bg-[#F7F3ED] text-[#4C3D19] relative border-t border-[#CFBB99]/40 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E5D7C4] border border-[#CFBB99] text-[#4C3D19] text-xs font-bold uppercase tracking-wider mb-3">
            <FiShield className="w-3.5 h-3.5 text-[#889063]" />
            <span>Deterministic Rule Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#4C3D19]">
            Check Scheme Eligibility
          </h2>
          <p className="text-sm sm:text-base text-[#4C3D19]/80 mt-2">
            Answer 5 quick profile questions to calculate your exact eligible Central and State welfare grants.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="card-white p-7 sm:p-10 rounded-3xl border border-[#CFBB99] shadow-xl relative overflow-hidden bg-white">
          
          {/* Progress Bar */}
          {step <= 5 && (
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-bold text-[#4C3D19]/70 mb-2">
                <span>Step {step} of 5</span>
                <span>{step * 20}% Completed</span>
              </div>
              <div className="w-full bg-[#F7F3ED] h-2 rounded-full overflow-hidden border border-[#CFBB99]/40">
                <div
                  className="bg-[#4C3D19] h-full transition-all duration-300"
                  style={{ width: `${step * 20}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 1: State */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#4C3D19]">Select Your Domicile State</h3>
                <p className="text-xs text-[#4C3D19]/70 mt-1">State residency determines eligibility for regional state welfare grants.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4C3D19] block">State / Union Territory</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] text-sm font-semibold text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
                >
                  {STATES_LIST.map(s => {
                    const name = typeof s === 'string' ? s : (s?.name || '');
                    if (!name || name === 'All India' || name === 'Central Schemes') return null;
                    return <option key={name} value={name}>{name}</option>;
                  })}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Age & Gender */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#4C3D19]">Age & Gender Information</h3>
                <p className="text-xs text-[#4C3D19]/70 mt-1">Used to evaluate age limits and gender-specific welfare programs.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4C3D19] block">Applicant Age (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="110"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] text-sm font-bold text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4C3D19] block">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`p-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          gender === g ? 'bg-[#4C3D19] text-white border-[#4C3D19]' : 'bg-[#F7F3ED] text-[#4C3D19] border-[#CFBB99]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Income & BPL */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#4C3D19]">Annual Household Income & BPL Status</h3>
                <p className="text-xs text-[#4C3D19]/70 mt-1">Ensures assistance reaches low-income and Below Poverty Line families.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Annual Income</span>
                    <span className="text-[#889063]">₹{Number(annualIncome).toLocaleString()} / year</span>
                  </div>
                  <input
                    type="range"
                    min="20000"
                    max="1000000"
                    step="10000"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full accent-[#4C3D19]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#4C3D19] block">BPL Ration Card Holder</span>
                    <span className="text-[11px] text-[#4C3D19]/70">Do you possess a Below Poverty Line (BPL) card?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBPL(!isBPL)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isBPL ? 'bg-[#889063] text-white border-[#889063]' : 'bg-white text-[#4C3D19] border-[#CFBB99]'
                    }`}
                  >
                    {isBPL ? 'Yes (BPL)' : 'No (Non-BPL)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Occupation & Social Category */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#4C3D19]">Occupation & Social Category</h3>
                <p className="text-xs text-[#4C3D19]/70 mt-1">Matches sector specific programs and social welfare reserves.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4C3D19] block">Primary Occupation</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] text-sm font-semibold text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
                  >
                    {occupationsList.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4C3D19] block">Social Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {socialCategoriesList.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSocialCategory(cat)}
                        className={`p-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          socialCategory === cat ? 'bg-[#4C3D19] text-white border-[#4C3D19]' : 'bg-[#F7F3ED] text-[#4C3D19] border-[#CFBB99]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Special Status Flags */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#4C3D19]">Special Eligibility Attributes</h3>
                <p className="text-xs text-[#4C3D19]/70 mt-1">Select any attributes that apply to your profile.</p>
              </div>

              <div className="space-y-3">
                <label className="p-4 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#4C3D19]">Practicing Farmer / Landholder</span>
                  <input
                    type="checkbox"
                    checked={isFarmer}
                    onChange={(e) => setIsFarmer(e.target.checked)}
                    className="w-5 h-5 accent-[#4C3D19]"
                  />
                </label>

                <label className="p-4 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#4C3D19]">Currently Enrolled Student</span>
                  <input
                    type="checkbox"
                    checked={isStudent}
                    onChange={(e) => setIsStudent(e.target.checked)}
                    className="w-5 h-5 accent-[#4C3D19]"
                  />
                </label>

                <label className="p-4 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#4C3D19]">Person with Disability (Divyangjan)</span>
                  <input
                    type="checkbox"
                    checked={hasDisability}
                    onChange={(e) => setHasDisability(e.target.checked)}
                    className="w-5 h-5 accent-[#4C3D19]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: Results Calculation & Rendering */}
          {step === 6 && (
            <div className="space-y-6">
              {isCalculating && (
                <div className="text-center py-12 space-y-3">
                  <FiRefreshCw className="w-8 h-8 text-[#889063] animate-spin mx-auto" />
                  <h3 className="text-lg font-bold text-[#4C3D19]">Running Rule Evaluation...</h3>
                  <p className="text-xs text-[#4C3D19]/70">Checking parameters against SQLite database models.</p>
                </div>
              )}

              {error && !isCalculating && (
                <div className="text-center py-8 space-y-4">
                  <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs max-w-md mx-auto">
                    {error}
                  </div>
                  <button onClick={handleReset} className="px-6 py-2.5 rounded-full btn-cafe text-xs font-bold">
                    Start Over
                  </button>
                </div>
              )}

              {!isCalculating && !error && resultsData && (
                <div className="space-y-6">
                  {/* Results Summary Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#4C3D19]">Eligibility Results</h3>
                      <p className="text-xs text-[#4C3D19]/70">
                        Evaluated for {state} domicile, Age {age}, Income ₹{Number(annualIncome).toLocaleString()}.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-3 py-1 bg-white border border-[#CFBB99] rounded-full font-bold text-[#4C3D19]">
                        {resultsData.summary?.eligible || 0} Eligible
                      </span>
                      <span className="px-3 py-1 bg-white border border-[#CFBB99] rounded-full font-bold text-[#4C3D19]">
                        {resultsData.summary?.potentiallyEligible || 0} Potential
                      </span>
                      <button
                        onClick={handleReset}
                        className="px-3 py-1 bg-[#4C3D19] text-white rounded-full font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <FiRotateCcw className="w-3 h-3" />
                        <span>Recalculate</span>
                      </button>
                    </div>
                  </div>

                  {/* Eligible & Potentially Eligible Cards List */}
                  <div className="space-y-4">
                    {resultsList
                      .filter(item => item?.eligibility?.status !== 'NOT_ELIGIBLE' || showIneligible)
                      .map((item, idx) => {
                        const scheme = item?.scheme || {};
                        const eligibility = item?.eligibility || {};
                        const status = eligibility.status;

                        // Citizen friendly labels
                        let statusLabel = "Eligible based on provided information";
                        let statusBadgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-300";

                        if (status === 'POTENTIALLY_ELIGIBLE') {
                          statusLabel = "Potentially eligible";
                          statusBadgeStyle = "bg-[#F7F3ED] text-[#4C3D19] border-[#CFBB99]";
                        } else if (status === 'NOT_ELIGIBLE') {
                          statusLabel = "Does not currently match";
                          statusBadgeStyle = "bg-neutral-100 text-neutral-700 border-neutral-300";
                        }

                        return (
                          <div
                            key={scheme.id || idx}
                            className="p-6 rounded-2xl border border-[#CFBB99] bg-white shadow-xs space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CFBB99]/30 pb-3">
                              <div>
                                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${statusBadgeStyle}`}>
                                  {statusLabel}
                                </span>
                                <h4 className="text-lg font-bold text-[#4C3D19] mt-1">{scheme.name || 'Government Scheme'}</h4>
                              </div>
                              <div className="text-left sm:text-right">
                                <span className="text-xs font-black text-[#889063]">Match {eligibility.matchScore || 0}%</span>
                                <span className="text-[11px] block text-[#4C3D19]/60">{scheme.category || 'General'} • {scheme.state || 'All India'}</span>
                              </div>
                            </div>

                            {/* Rule Explanations Checklist */}
                            <div className="space-y-1.5 text-xs">
                              {(eligibility.passedRules || []).map((r, i) => (
                                <div key={i} className="flex items-center space-x-2 text-emerald-800">
                                  <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{r.message}</span>
                                </div>
                              ))}
                              {(eligibility.failedRules || []).map((r, i) => (
                                <div key={i} className="flex items-center space-x-2 text-red-800">
                                  <FiXCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{r.message}</span>
                                </div>
                              ))}
                              {(eligibility.unknownRules || []).map((r, i) => (
                                <div key={i} className="flex items-center space-x-2 text-[#4C3D19]/80">
                                  <FiHelpCircle className="w-3.5 h-3.5 text-[#889063] shrink-0" />
                                  <span>{r.message}</span>
                                </div>
                              ))}
                            </div>

                            {/* Action Links */}
                            <div className="pt-3 border-t border-[#CFBB99]/30 flex items-center justify-between text-xs">
                              <button
                                onClick={() => onSelectScheme(scheme)}
                                className="font-bold text-[#4C3D19] hover:underline cursor-pointer"
                              >
                                View Guidelines
                              </button>
                              {scheme.officialLink && (
                                <a
                                  href={scheme.officialLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#4C3D19]/70 hover:text-[#4C3D19] flex items-center space-x-1"
                                >
                                  <span>Official Portal</span>
                                  <FiExternalLink className="w-3 h-3 text-[#889063]" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Toggle Collapsed Ineligible Schemes Section */}
                  {resultsData.summary?.notEligible > 0 && (
                    <div className="pt-4 border-t border-[#CFBB99]/40 text-center">
                      <button
                        onClick={() => setShowIneligible(!showIneligible)}
                        className="text-xs font-bold text-[#4C3D19]/70 hover:text-[#4C3D19] inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>{showIneligible ? 'Hide' : 'Show'} {resultsData.summary.notEligible} Non-Matching Schemes</span>
                        {showIneligible ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          {step <= 5 && (
            <div className="pt-8 border-t border-[#CFBB99]/40 flex items-center justify-between mt-8">
              <button
                type="button"
                disabled={step === 1}
                onClick={handleBack}
                className="px-5 py-2.5 rounded-full border border-[#CFBB99] text-xs font-bold text-[#4C3D19] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F7F3ED] flex items-center space-x-1 cursor-pointer"
              >
                <FiChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full btn-cafe text-xs font-bold flex items-center space-x-2 cursor-pointer"
              >
                <span>{step === 5 ? 'Calculate Eligibility' : 'Next Step'}</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EligibilityChecker;
