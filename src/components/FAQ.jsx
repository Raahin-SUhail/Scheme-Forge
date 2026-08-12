import React, { useState } from 'react';
import { FAQ_LIST } from '../data/schemesData';
import { FiHelpCircle, FiChevronDown, FiMessageSquare } from 'react-icons/fi';

const FAQ = ({ onOpenContact = () => {} }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-28 bg-[#F7F3ED] text-[#4C3D19] relative border-t border-[#CFBB99]/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E5D7C4] border border-[#CFBB99] text-[#4C3D19] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <FiHelpCircle className="w-3.5 h-3.5 text-[#889063]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#4C3D19] mb-4">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-lg text-[#4C3D19]/80 leading-relaxed">
            Learn more about scheme eligibility, application guidelines, and official government procedures.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_LIST.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="card-white rounded-2xl border border-[#CFBB99] overflow-hidden transition-all duration-300 shadow-md"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-6 text-left flex items-center justify-between space-x-4 focus:outline-none cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-bold text-[#4C3D19] hover:text-[#354024] transition-colors">
                    {faq.question}
                  </span>
                  <div className={`p-2 rounded-xl bg-[#E5D7C4] border border-[#CFBB99] text-[#4C3D19] transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-[#4C3D19] text-[#E5D7C4]' : ''
                  }`}>
                    <FiChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-[#4C3D19]/80 leading-relaxed border-t border-[#CFBB99]/60 pt-4 font-medium animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="mt-14 text-center p-7 card-white rounded-3xl border border-[#CFBB99] flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
          <div className="text-left">
            <h4 className="text-base font-bold text-[#4C3D19]">Still have questions?</h4>
            <p className="text-xs text-[#4C3D19]/70 font-medium">Contact our citizen support team or report portal inquiries.</p>
          </div>
          <button
            onClick={onOpenContact}
            className="px-6 py-3 rounded-xl bg-[#4C3D19] hover:bg-[#354024] text-[#E5D7C4] text-xs font-bold flex items-center space-x-2 border border-[#CFBB99] transition-all cursor-pointer"
          >
            <FiMessageSquare className="w-4 h-4 text-[#CFBB99]" />
            <span>Contact Support Desk</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
