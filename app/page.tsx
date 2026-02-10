'use client';

import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import AgeVerification from '@/components/AgeVerification';
import EmailCapture from '@/components/EmailCapture';

export default function Home() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Check if user has already verified age in this session
    const verified = sessionStorage.getItem('ageVerified') === 'true';
    setAgeVerified(verified);

    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!ageVerified) {
    return <AgeVerification onVerified={() => setAgeVerified(true)} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Parallax Background with Mountain Imagery */}
      <div
        className="fixed inset-0 z-0"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        {/* Mountain gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-deep-navy via-charcoal to-black opacity-90"></div>

        {/* Animated mountain silhouette */}
        <svg
          className="absolute bottom-0 left-0 w-full h-2/3 opacity-20"
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 600 L200 400 L350 450 L500 200 L650 350 L800 150 L950 300 L1100 100 L1250 250 L1440 150 L1440 600 Z"
            fill="url(#mountainGradient)"
            className="animate-float"
          />
          <defs>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BEA98E" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#082434" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Grain texture overlay */}
        <div className="absolute inset-0 grain-overlay"></div>

        {/* Ambient light spots */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-refined-gold/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-deep-navy/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 pb-4 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Logo className="w-12 h-12 md:w-16 md:h-16" />
            <a
              href="tel:469-276-7525"
              className="text-refined-gold hover:text-refined-gold/80 transition-colors text-sm md:text-base tracking-wide"
            >
              469-276-7525
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <main className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 -mt-20">
          <div className="max-w-5xl mx-auto text-center space-y-8 md:space-y-12">
            {/* Animated Logo */}
            <div className="flex justify-center animate-fade-in">
              <Logo className="w-24 h-24 md:w-32 md:h-32" animated={true} />
            </div>

            {/* Main Headline */}
            <h1
              className="font-display text-4xl md:text-6xl lg:text-7xl text-refined-gold leading-tight md:leading-tight lg:leading-tight text-balance animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              The Peak of Curation.
              <br />
              <span className="text-mist/90">Coming 2026.</span>
            </h1>

            {/* Subheading */}
            <p
              className="text-mist/70 text-lg md:text-xl lg:text-2xl font-light tracking-wide max-w-3xl mx-auto text-balance leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              An elevated spirits experience in the heart of Irving.
              Where discerning taste meets mountain-inspired luxury.
            </p>

            {/* Email Capture */}
            <div className="pt-8">
              <EmailCapture />
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 py-8 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-refined-gold/30"></div>
              <div className="w-1 h-1 bg-refined-gold/50 rotate-45"></div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-refined-gold/30"></div>
            </div>

            {/* Store Info */}
            <div
              className="glass-effect p-8 md:p-12 max-w-2xl mx-auto animate-slide-up"
              style={{ animationDelay: '1.4s' }}
            >
              <h2 className="font-display text-2xl md:text-3xl text-refined-gold mb-6">
                Visit Us Soon
              </h2>

              <div className="space-y-4 text-mist/80">
                <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-4">
                  <svg
                    className="w-5 h-5 text-refined-gold mx-auto md:mx-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <a
                    href="https://maps.google.com/?q=535+W+Airport+Fwy,+Irving+TX+75062"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-refined-gold transition-colors text-center md:text-left"
                  >
                    535 W Airport Fwy, Irving TX 75062
                  </a>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-4">
                  <svg
                    className="w-5 h-5 text-refined-gold mx-auto md:mx-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a
                    href="tel:469-276-7525"
                    className="hover:text-refined-gold transition-colors font-medium tracking-wider"
                  >
                    469-276-7525
                  </a>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-refined-gold/20">
                <p className="text-sm text-mist/60 tracking-wide">
                  <span className="text-refined-gold font-medium">Elevated Spirits.</span> A curated selection of fine wines,
                  premium spirits, and craft beverages.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-12 px-4 md:px-8 mt-20">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <p className="text-mist/40 text-sm tracking-wide">
              © 2026 Mount Liquor. All rights reserved.
            </p>
            <p className="text-mist/30 text-xs">
              Please drink responsibly. Must be 21+ to purchase alcohol.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
