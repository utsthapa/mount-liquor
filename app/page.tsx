'use client';

import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import EmailCapture from '@/components/EmailCapture';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const offerings = [
    {
      title: 'Premium Wines',
      description: 'Carefully curated vintages from renowned vineyards worldwide. From bold Cabernets to crisp Sauvignon Blancs.',
      delay: '0.6s',
    },
    {
      title: 'Craft Spirits',
      description: 'Small-batch whiskeys, artisanal gins, and rare bourbons. Each bottle tells a story of craftsmanship.',
      delay: '0.8s',
    },
    {
      title: 'Champagne & Prosecco',
      description: 'Celebrate life\'s moments with our selection of fine sparkling wines and champagnes.',
      delay: '1s',
    },
    {
      title: 'Craft Beer',
      description: 'Local Texas breweries and international favorites. IPAs, stouts, lagers, and seasonal specialties.',
      delay: '1.2s',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Elegant Background */}
      <div className="fixed inset-0 z-0">
        {/* Rich gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-deep-navy to-black"></div>

        {/* Subtle ambient glow - top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-refined-gold/10 rounded-full blur-3xl"></div>

        {/* Subtle ambient glow - bottom right */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-deep-navy/40 rounded-full blur-3xl"></div>

        {/* Grain texture overlay */}
        <div className="absolute inset-0 grain-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 pb-4 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Logo className="w-12 h-12 md:w-16 md:h-16" />
            <a
              href="tel:469-276-7525"
              className="text-refined-gold hover:text-refined-gold/80 transition-colors text-sm md:text-base tracking-wide hover:scale-105 transform duration-300"
            >
              469-276-7525
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <main className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 -mt-20">
          <div className="max-w-6xl mx-auto text-center space-y-8 md:space-y-12">
            {/* Animated Logo */}
            <div className="flex justify-center animate-fade-in">
              <Logo className="w-24 h-24 md:w-32 md:h-32 hover:scale-110 transition-transform duration-500" animated={true} />
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
              className="font-display text-mist/80 text-xl md:text-2xl lg:text-3xl font-normal tracking-wide max-w-3xl mx-auto text-balance leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              Irving's premier destination for exceptional wines, rare spirits, and craft beverages.
              Where every bottle is handpicked for the discerning enthusiast.
            </p>

            {/* Featured Offerings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 pb-8">
              {offerings.map((offering, index) => (
                <div
                  key={index}
                  className="relative glass-effect p-8 hover:border-refined-gold/40 border border-refined-gold/10 transition-all duration-500 group animate-slide-up overflow-hidden"
                  style={{ animationDelay: offering.delay }}
                >
                  {/* Geometric accent line */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-refined-gold to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

                  <h3 className="font-display text-2xl text-refined-gold mb-4 group-hover:text-refined-gold transition-colors">
                    {offering.title}
                  </h3>
                  <p className="text-mist/70 text-sm leading-relaxed">
                    {offering.description}
                  </p>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-refined-gold/20 group-hover:border-refined-gold/40 transition-colors"></div>
                </div>
              ))}
            </div>

            {/* Email Capture */}
            <div className="pt-8">
              <EmailCapture />
            </div>

            {/* Animated Divider */}
            <div className="flex items-center justify-center gap-4 py-8 animate-fade-in" style={{ animationDelay: '1.6s' }}>
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-refined-gold/30 animate-pulse"></div>
              <div className="w-1 h-1 bg-refined-gold/50 rotate-45 animate-pulse"></div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-refined-gold/30 animate-pulse"></div>
            </div>

            {/* Store Details */}
            <div
              className="glass-effect p-8 md:p-12 max-w-3xl mx-auto animate-slide-up hover:scale-105 transition-transform duration-500"
              style={{ animationDelay: '1.8s' }}
            >
              <h2 className="font-display text-3xl md:text-4xl text-refined-gold mb-6">
                Your Neighborhood Bottle Shop
              </h2>

              <div className="space-y-6 text-mist/80 text-left md:text-center">
                <p className="text-base md:text-lg leading-relaxed">
                  <span className="text-refined-gold font-medium">Mount Liquor</span> is more than just a liquor store—we're
                  your gateway to exceptional taste. Our knowledgeable staff will guide you through our carefully selected
                  inventory, whether you're searching for a special occasion bottle or your new everyday favorite.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="text-center p-6 border border-refined-gold/20 hover:border-refined-gold/40 transition-all group">
                    <div className="w-12 h-12 mx-auto mb-4 border-2 border-refined-gold/40 rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
                    <p className="font-display text-lg text-refined-gold">Expert Curation</p>
                  </div>
                  <div className="text-center p-6 border border-refined-gold/20 hover:border-refined-gold/40 transition-all group">
                    <div className="w-12 h-12 mx-auto mb-4 border-2 border-refined-gold/40 group-hover:scale-110 transition-transform duration-500"></div>
                    <p className="font-display text-lg text-refined-gold">Personal Service</p>
                  </div>
                  <div className="text-center p-6 border border-refined-gold/20 hover:border-refined-gold/40 transition-all group">
                    <div className="w-12 h-12 mx-auto mb-4 relative">
                      <div className="absolute inset-0 border-2 border-refined-gold/40"></div>
                      <div className="absolute inset-2 border-2 border-refined-gold/40 group-hover:inset-0 transition-all duration-500"></div>
                    </div>
                    <p className="font-display text-lg text-refined-gold">Rare Finds</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-refined-gold/20 space-y-4">
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
                  <div className="text-center md:text-left">
                    <a
                      href="https://maps.google.com/?q=535+W+Airport+Fwy,+Irving+TX+75062"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-refined-gold transition-colors hover:scale-105 transform duration-300 block"
                    >
                      535 W Airport Fwy, Irving TX 75062
                    </a>
                    <p className="text-sm text-refined-gold/70 mt-1">
                      📍 Right off Highway 183 • Near India Bazaar
                    </p>
                  </div>
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
                    className="hover:text-refined-gold transition-colors font-medium tracking-wider hover:scale-105 transform duration-300"
                  >
                    469-276-7525
                  </a>
                </div>

                <div className="bg-refined-gold/10 border border-refined-gold/20 rounded p-4 mt-6">
                  <p className="text-sm text-mist/70 leading-relaxed">
                    <span className="text-refined-gold font-medium">Easy to Find:</span> Located on West Airport Freeway (183),
                    just minutes from India Bazaar and the heart of Irving. Perfect for your wine and spirits needs
                    whether you're coming from Las Colinas, DFW Airport, or anywhere in the Metroplex.
                  </p>
                </div>

                <p className="text-sm text-mist/50 pt-4 italic">
                  Serving the Irving, Las Colinas, and DFW communities with passion for exceptional beverages.
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
