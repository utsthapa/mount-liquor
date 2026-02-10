import { useState } from 'react';

const EmailCapture = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    // Simulate API call (replace with actual endpoint)
    try {
      setStatus('loading');

      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // Simulate success after delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus('success');
      setMessage('Welcome to the Mount Liquor family! Check your inbox for exclusive updates.');
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Social Proof */}
      <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-refined-gold/30 to-deep-navy border-2 border-charcoal"
            ></div>
          ))}
        </div>
        <p className="text-mist/60 text-sm font-light tracking-wide">
          Join <span className="text-refined-gold font-medium">500+</span> Irving spirit enthusiasts
        </p>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for early access"
            disabled={status === 'loading'}
            className="flex-1 bg-deep-navy/30 border border-refined-gold/20 px-6 py-4 text-mist placeholder:text-mist/40 focus:outline-none focus:border-refined-gold/60 transition-all duration-300 backdrop-blur-sm disabled:opacity-50"
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-refined-gold text-charcoal px-8 py-4 font-medium tracking-wider uppercase text-sm hover:bg-refined-gold/90 transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <span className="relative z-10">
              {status === 'loading' ? 'Joining...' : 'Get Early Access'}
            </span>
            <div className="absolute inset-0 gold-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        {/* Status Messages */}
        {message && (
          <div
            className={`mt-4 px-6 py-3 text-sm text-center border ${
              status === 'success'
                ? 'border-refined-gold/30 bg-refined-gold/5 text-refined-gold'
                : 'border-red-400/30 bg-red-400/5 text-red-400'
            } animate-slide-up`}
          >
            {message}
          </div>
        )}
      </form>

      {/* Privacy Notice */}
      <p className="text-xs text-mist/40 text-center mt-4 tracking-wide animate-fade-in" style={{ animationDelay: '1s' }}>
        We respect your privacy. Unsubscribe anytime.
      </p>
    </div>
  );
};

export default EmailCapture;
