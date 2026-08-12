import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FiSearch, FiShield, FiChevronDown, FiGlobe } from 'react-icons/fi';

const Hero = ({ onExplore, onEligibility }) => {
  const heroRef = useRef(null);
  const imageRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const buttonsRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const heroEl = heroRef.current;
    const imageEl = imageRef.current;

    if (!heroEl || !imageEl) return;

    if (prefersReducedMotion) {
      gsap.set(imageEl, { scale: 1.02, y: -3 });
      if (badgeRef.current) gsap.set(badgeRef.current, { opacity: 1, y: 0 });
      if (titleRef.current) gsap.set(titleRef.current, { opacity: 1, y: 0, filter: 'blur(0px)' });
      if (buttonsRef.current) gsap.set(buttonsRef.current.children, { opacity: 1, y: 0 });
      if (scrollIndicatorRef.current) gsap.set(scrollIndicatorRef.current, { opacity: 1, y: 0 });
      return;
    }

    // 1. Extremely subtle motion: Scale 1.00 -> 1.02 over 12s that PLAYS ONCE and SETTLES PERMANENTLY
    gsap.fromTo(
      imageEl,
      { scale: 1.0, y: 0 },
      {
        scale: 1.02,
        y: -4,
        duration: 12,
        ease: 'power1.out',
        overwrite: 'auto'
      }
    );

    // 2. Overlapping Text Sequence Timeline (Navbar 150ms -> Heading 300ms -> Buttons 450ms)
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // Badge
    if (badgeRef.current) {
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.15 }
      );
    }

    // Main Heading (opacity 0 -> 1, translateY 16px -> 0)
    if (titleRef.current) {
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 16, filter: 'blur(2px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 },
        '-=0.3'
      );
    }

    // CTA Buttons (opacity 0 -> 1, translateY 8px -> 0)
    if (buttonsRef.current) {
      tl.fromTo(
        buttonsRef.current.children,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        '-=0.45'
      );
    }

    // Scroll Indicator
    if (scrollIndicatorRef.current) {
      tl.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: -5 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.2'
      );
    }
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-[92vh] sm:h-screen overflow-hidden bg-white text-[#4C3D19] z-10 flex flex-col justify-between"
    >
      {/* 
        FINAL APPROVED SYMMETRICAL ARCHITECTURAL HERO IMAGE
        - Source: /images/ChatGPT Image Aug 5, 2026, 09_10_31 PM.png (2.23 MB high-res PNG)
        - Loaded eagerly (fetchPriority="high") for above-the-fold instant rendering
        - Symmetrical center alignment (object-position: center center) preserving dome & entrance
        - Scale 1.00 -> 1.02 over 12s, settling permanently (no loop, no reset)
        - Zero dark overlay, zero color tinting
        - 100% byte-level original image quality preserved
      */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-white">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F7F3ED] text-[#4C3D19] p-8 text-center">
            <div className="max-w-md space-y-2">
              <FiShield className="w-10 h-10 text-[#889063] mx-auto" />
              <h3 className="text-xl font-bold">Hero Image Unavailable</h3>
              <p className="text-xs opacity-75">Please ensure the primary image file is available in /images/.</p>
            </div>
          </div>
        ) : (
          <img
            ref={imageRef}
            src="/images/ChatGPT Image Aug 5, 2026, 09_10_31 PM.png"
            alt="SchemeForge Symmetrical Architectural Hero Centerpiece"
            loading="eager"
            fetchPriority="high"
            onError={() => {
              if (imageRef.current && imageRef.current.src !== '/images/hero-clean.png') {
                imageRef.current.src = '/images/hero-clean.png';
              } else if (imageRef.current && imageRef.current.src !== '/hero-clean.png') {
                imageRef.current.src = '/hero-clean.png';
              } else {
                setImageError(true);
              }
            }}
            className="w-full h-full object-cover object-center transform-gpu will-change-transform image-rendering-crisp"
          />
        )}

        {/* Minimal Legibility Gradient ONLY at text base (10-15% opacity) */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#4C3D19]/40 via-[#4C3D19]/10 to-transparent pointer-events-none" />
      </div>

      {/* 
        CLEAN & MINIMAL HERO TEXT OVERLAY
      */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-between h-full pt-32 pb-16">
        
        {/* Descriptor Badge */}
        <div
          ref={badgeRef}
          style={{ opacity: 0 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/95 border border-[#CFBB99]/60 backdrop-blur-md shadow-sm"
        >
          <FiGlobe className="w-3.5 h-3.5 text-[#889063]" />
          <span className="text-xs font-semibold text-[#4C3D19]">
            Government Scheme Discovery Platform
          </span>
        </div>

        {/* Main Heading */}
        <div className="my-auto py-10">
          <h1
            ref={titleRef}
            style={{ opacity: 0 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-5xl leading-[1.1] drop-shadow-lg"
          >
            Find government schemes that <span className="text-[#FFB366]">match your needs</span>
          </h1>
        </div>

        {/* Bottom CTAs & Scroll Indicator */}
        <div className="flex flex-col items-center space-y-8 w-full">
          
          <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {/* Primary CTA (Cafe Noir) */}
            <button
              onClick={onExplore}
              style={{ opacity: 0 }}
              className="w-full sm:w-auto px-8 py-4 rounded-full btn-cafe text-sm flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <FiSearch className="w-4.5 h-4.5 text-white" />
              <span>Explore Schemes</span>
            </button>

            {/* Secondary CTA (White / Cafe Noir Border) */}
            <button
              onClick={onEligibility}
              style={{ opacity: 0 }}
              className="w-full sm:w-auto px-8 py-4 rounded-full btn-cafe-outline text-sm flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <FiShield className="w-4.5 h-4.5 text-[#889063]" />
              <span>Check Eligibility</span>
            </button>
          </div>

          <div
            ref={scrollIndicatorRef}
            style={{ opacity: 0 }}
            className="flex flex-col items-center space-y-1.5 text-white/90 cursor-pointer group"
            onClick={onExplore}
          >
            <span className="text-[11px] uppercase tracking-widest font-semibold drop-shadow">
              Scroll to Explore
            </span>
            <FiChevronDown className="w-4 h-4 text-[#CFBB99] group-hover:translate-y-1 transition-transform animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
