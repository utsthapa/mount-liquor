'use client';

import { useState } from 'react';
import Logo from './Logo';

interface AgeVerificationProps {
  onVerified: () => void;
}

const AgeVerification = ({ onVerified }: AgeVerificationProps) => {
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields are filled
    if (!birthMonth || !birthDay || !birthYear) {
      setError('Please enter your complete date of birth');
      return;
    }

    // Calculate age
    const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Check if 21 or older
    if (age >= 21) {
      // Store verification in sessionStorage (lasts for browser session)
      sessionStorage.setItem('ageVerified', 'true');
      onVerified();
    } else {
      setError('You must be 21 years or older to enter this site');
    }
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 bg-charcoal/95 backdrop-blur-md z-50 flex items-center justify-center p-4 grain-overlay">
      <div className="w-full max-w-md glass-effect rounded-none p-8 md:p-12 relative animate-fade-in">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-refined-gold/30"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-refined-gold/30"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-refined-gold/30"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-refined-gold/30"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <Logo className="w-20 h-20" animated={true} />
          </div>

          <h2 className="font-display text-3xl md:text-4xl text-refined-gold text-center mb-3">
            Welcome
          </h2>

          <p className="text-mist/70 text-center mb-8 font-light text-sm tracking-wide">
            You must be 21 years or older to enter
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Month */}
              <div>
                <label htmlFor="month" className="block text-xs text-refined-gold/80 mb-2 tracking-wider uppercase">
                  Month
                </label>
                <select
                  id="month"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="w-full bg-deep-navy/50 border border-refined-gold/20 rounded-none px-3 py-3 text-mist focus:outline-none focus:border-refined-gold/60 transition-colors"
                >
                  <option value="">MM</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day */}
              <div>
                <label htmlFor="day" className="block text-xs text-refined-gold/80 mb-2 tracking-wider uppercase">
                  Day
                </label>
                <select
                  id="day"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="w-full bg-deep-navy/50 border border-refined-gold/20 rounded-none px-3 py-3 text-mist focus:outline-none focus:border-refined-gold/60 transition-colors"
                >
                  <option value="">DD</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label htmlFor="year" className="block text-xs text-refined-gold/80 mb-2 tracking-wider uppercase">
                  Year
                </label>
                <select
                  id="year"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full bg-deep-navy/50 border border-refined-gold/20 rounded-none px-3 py-3 text-mist focus:outline-none focus:border-refined-gold/60 transition-colors"
                >
                  <option value="">YYYY</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center border border-red-400/30 bg-red-400/5 py-3 px-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-refined-gold text-charcoal py-4 px-6 font-medium tracking-wider uppercase text-sm hover:bg-refined-gold/90 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Enter</span>
              <div className="absolute inset-0 gold-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          <p className="text-xs text-mist/40 text-center mt-6 tracking-wide">
            By entering, you agree to our terms of service
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
