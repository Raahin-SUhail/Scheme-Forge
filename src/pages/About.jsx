import React from 'react';
import { FiShield, FiCpu, FiGlobe, FiAward } from 'react-icons/fi';

const About = () => {
  return (
    <div className="pt-32 pb-24 bg-[#FBF8F3] text-[#4C3D19] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E5D7C4] border border-[#CFBB99] text-[#4C3D19] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <FiAward className="w-3.5 h-3.5 text-[#889063]" />
            <span>Platform Vision</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#4C3D19] mb-6">
            Redefining Government Scheme Discovery for India
          </h1>
          <p className="text-lg text-[#4C3D19]/80 leading-relaxed font-medium">
            SchemeForge is a modern Government Scheme Discovery Platform built to bridge the gap between Indian citizens and Central/State welfare benefits through Apple-grade UI/UX.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-white p-8 rounded-3xl border border-[#CFBB99] space-y-4 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-[#E5D7C4] border border-[#CFBB99] flex items-center justify-center">
              <FiGlobe className="w-6 h-6 text-[#889063]" />
            </div>
            <h3 className="text-xl font-bold text-[#4C3D19]">Universal Access</h3>
            <p className="text-xs text-[#4C3D19]/70 leading-relaxed font-medium">
              Indexing 600+ welfare schemes across 36 States & Union Territories into one unified, searchable directory.
            </p>
          </div>

          <div className="card-white p-8 rounded-3xl border border-[#CFBB99] space-y-4 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-[#E5D7C4] border border-[#CFBB99] flex items-center justify-center">
              <FiCpu className="w-6 h-6 text-[#889063]" />
            </div>
            <h3 className="text-xl font-bold text-[#4C3D19]">Rule Engine Precision</h3>
            <p className="text-xs text-[#4C3D19]/70 leading-relaxed font-medium">
              Evaluates citizen parameters (age, income, category, domicile) against official Ministry rules with 0% guesswork.
            </p>
          </div>

          <div className="card-white p-8 rounded-3xl border border-[#CFBB99] space-y-4 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-[#E5D7C4] border border-[#CFBB99] flex items-center justify-center">
              <FiShield className="w-6 h-6 text-[#889063]" />
            </div>
            <h3 className="text-xl font-bold text-[#4C3D19]">100% Direct & Free</h3>
            <p className="text-xs text-[#4C3D19]/70 leading-relaxed font-medium">
              Redirects citizens directly to verified .gov.in portals with zero agent commissions or hidden registration fees.
            </p>
          </div>
        </div>

        {/* Tech Architecture Box */}
        <div className="card-white p-8 sm:p-10 rounded-3xl border border-[#CFBB99] space-y-6 shadow-xl">
          <h2 className="text-2xl font-extrabold text-[#4C3D19]">Production-Ready Architecture</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-[#4C3D19]">
            <div className="bg-[#F7F3ED] p-5 rounded-2xl border border-[#CFBB99]">
              <span className="font-bold text-[#4C3D19] block mb-1 text-sm">Frontend Engineering</span>
              <p className="text-[#4C3D19]/70 font-medium">React 18, Vite, Tailwind CSS, GSAP ScrollTrigger, and Framer Motion.</p>
            </div>
            <div className="bg-[#F7F3ED] p-5 rounded-2xl border border-[#CFBB99]">
              <span className="font-bold text-[#4C3D19] block mb-1 text-sm">Backend REST API</span>
              <p className="text-[#4C3D19]/70 font-medium">Flask Python microservice with SQLite scheme registry and client-side fallback engine.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
