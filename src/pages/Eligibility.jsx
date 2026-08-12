import React from 'react';
import EligibilityChecker from '../components/EligibilityChecker';

const Eligibility = ({ onSelectScheme }) => {
  return (
    <div className="pt-28 pb-24 bg-[#FBF8F3] text-[#4C3D19] min-h-screen">
      <EligibilityChecker onSelectScheme={onSelectScheme} />
    </div>
  );
};

export default Eligibility;
