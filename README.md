# Mount Liquor - Coming Soon Landing Page

A luxury "Coming Soon" landing page for Mount Liquor, a boutique wine and spirits shop in Irving, TX. Built with **Next.js 15** and **Tailwind CSS v3** for production stability and optimal performance.

## ✨ Features

- **🏔️ Mountain-Inspired Luxury Design** - Custom geometric logo with SVG mountain peaks and spirit glass integration
- **🔒 TABC Age Verification** - Mandatory 21+ birthdate verification modal with session persistence
- **📧 Email Capture** - High-converting sign-up form with social proof (500+ subscribers)
- **🎨 Refined Aesthetics** - Editorial luxury minimalism with Playfair Display typography
- **📱 Mobile-First** - Fully responsive with "one-thumb" friendly interactions
- **⚡ Performance Optimized** - 106 kB First Load JS with Next.js optimizations
- **✨ Sophisticated Animations** - Parallax scrolling, fade-ins, and glassmorphism effects
- **🔍 SEO Ready** - Server-side rendering and meta tags optimized for search engines
- **📝 TypeScript** - Full type safety for better developer experience

## 🎨 Brand Identity

**Color Palette:**
- Deep Navy: `#082434`
- Charcoal Black: `#0C0C0C`
- Refined Gold: `#BEA98E`
- Mist Gray: `#E8E8E8`

**Typography:**
- Display: Playfair Display (high-contrast serif)
- Body: Montserrat (geometric sans-serif)

**Tagline:** *Elevated Spirits*

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The site will be available at `http://localhost:3000/`

## 📂 Project Structure

```
mount-liquor/
├── app/
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main landing page
│   └── globals.css              # Global styles + Tailwind
├── components/
│   ├── Logo.tsx                 # Geometric mountain logo
│   ├── AgeVerification.tsx      # 21+ age gate modal
│   └── EmailCapture.tsx         # Email sign-up form
├── public/
│   └── favicon.svg              # Custom favicon
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind theme
├── tsconfig.json                # TypeScript config
└── package.json
```

## 🎯 Key Components

### Age Verification
- TABC-compliant age verification
- Session storage persistence
- Custom dropdowns for month/day/year
- Decorative corner accents
- TypeScript interfaces for type safety

### Email Capture
- Email validation
- Loading/success/error states
- Social proof display
- Privacy notice
- Ready for backend integration

### Logo
- Custom SVG with mountain peak "M"
- Spirit glass in negative space
- Gold gradient fills
- Optional float animation

## 🎨 Design Philosophy

**Editorial Luxury Minimalism** - Inspired by high-end magazines and alpine luxury lodges. The design uses:

- Generous negative space
- Razor-sharp typography hierarchy
- Atmospheric depth through layered transparencies
- Subtle parallax motion
- Grain texture overlay for tactile quality
- Glassmorphism for modern depth

## 📱 Mobile Optimization

- Touch-friendly 48px minimum target sizes
- Responsive typography scaling
- Optimized form layout for mobile keyboards
- CSS-only animations for performance
- Mobile-tested on iOS and Android

## 🔧 Customization

### Update Store Information

Edit `app/page.tsx` to update:
- Address: Line 182
- Phone: Lines 82, 206
- Opening year: Line 115

### Customize Colors

Edit `tailwind.config.js` theme colors:
```javascript
colors: {
  'deep-navy': '#082434',
  'charcoal': '#0C0C0C',
  'refined-gold': '#BEA98E',
  'mist': '#E8E8E8',
}
```

### Email Integration

Replace the TODO in `components/EmailCapture.tsx` (line 23) with your email service API:

```typescript
const response = await fetch('/api/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});
```

Recommended services:
- **Mailchimp** - Best for beginners
- **ConvertKit** - Creator-focused
- **Klaviyo** - Retail/e-commerce
- **SendGrid** - Developer-friendly

Or create a Next.js API route in `app/api/subscribe/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();

  // Add your email service integration here

  return NextResponse.json({ success: true });
}
```

## 🚀 Deployment

### Vercel (One-Click - Recommended)

1. Push to GitHub (already done!)
2. Visit [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your `mount-liquor` repo
5. Click "Deploy"

That's it! Vercel automatically detects Next.js and configures everything.

**Or use CLI:**
```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Deploy the .next folder
```

## 📊 Performance

**Production Build Stats:**
- ⚡ First Load JS: 106 kB
- 📦 Main page: 4.25 kB
- 🎨 Fonts: Google Fonts CDN (cached)
- 🖼️ Images: SVG-only (zero weight)

**Next.js Optimizations:**
- Automatic code splitting
- Font optimization
- Image optimization ready
- Static page generation
- Compression and minification

## 🛡️ Compliance

- ✅ TABC 21+ age verification required
- ✅ "Drink Responsibly" messaging
- ✅ Privacy notice on email form
- ✅ Accessible form labels and ARIA attributes
- ✅ Session-based age gate (no cookies)

## 🔧 Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **Fonts:** Google Fonts (Playfair Display, Montserrat)
- **Deployment:** Vercel (recommended)

## 📞 Contact Information

**Mount Liquor**
535 W Airport Fwy
Irving, TX 75062
Phone: 469-276-7525

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
