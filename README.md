# Mount Liquor - Coming Soon Landing Page

A luxury "Coming Soon" landing page for Mount Liquor, a boutique wine and spirits shop in Irving, TX. Features mountain-inspired aesthetics, TABC-compliant age verification, and an email capture system.

## ✨ Features

- **🏔️ Mountain-Inspired Luxury Design** - Custom geometric logo with SVG mountain peaks and spirit glass integration
- **🔒 TABC Age Verification** - Mandatory 21+ birthdate verification modal with session persistence
- **📧 Email Capture** - High-converting sign-up form with social proof (500+ subscribers)
- **🎨 Refined Aesthetics** - Editorial luxury minimalism with Playfair Display typography
- **📱 Mobile-First** - Fully responsive with "one-thumb" friendly interactions
- **⚡ Performance Optimized** - Sub-3-second load times with lazy loading and SVG graphics
- **✨ Sophisticated Animations** - Parallax scrolling, fade-ins, and glassmorphism effects

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

# Preview production build
npm run preview
```

The site will be available at `http://localhost:5173/`

## 📂 Project Structure

```
mount-liquor/
├── public/
│   └── favicon.svg              # Custom mountain + glass favicon
├── src/
│   ├── components/
│   │   ├── Logo.jsx             # Geometric mountain logo with SVG
│   │   ├── AgeVerification.jsx  # 21+ age gate modal
│   │   └── EmailCapture.jsx     # Email sign-up with validation
│   ├── App.jsx                  # Main application with parallax
│   ├── index.css                # Tailwind + custom styles
│   └── main.jsx                 # React entry point
├── index.html                   # HTML with SEO meta tags
├── tailwind.config.js           # Custom theme configuration
└── package.json
```

## 🎯 Key Components

### Age Verification
- TABC-compliant age verification
- Session storage persistence
- Custom dropdowns for month/day/year
- Decorative corner accents

### Email Capture
- Email validation
- Success/error states
- Social proof display
- Privacy notice

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
- Sticky CTA for easy access
- Responsive typography scaling
- Optimized form layout for mobile keyboards
- Parallax effects disabled on mobile for performance

## 🔧 Customization

### Update Store Information

Edit `src/App.jsx` to update:
- Address: Line 154
- Phone: Lines 76, 178
- Opening year: Line 99

### Customize Colors

Edit `tailwind.config.js` theme colors:
- `deep-navy`
- `charcoal`
- `refined-gold`
- `mist`

### Email Integration

Replace the TODO in `src/components/EmailCapture.jsx` (line 18) with your email service API:

```javascript
const response = await fetch('/api/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});
```

Recommended services:
- Mailchimp
- ConvertKit
- SendGrid
- Klaviyo

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag ./dist folder to netlify.app/drop
```

### Build Output

Production files will be in `./dist` after running `npm run build`

## 📊 Performance Targets

- ⚡ First Contentful Paint: < 1.5s
- 📦 Total Bundle Size: < 100KB (gzipped)
- 🎨 Custom Fonts: Loaded via Google Fonts CDN
- 🖼️ Images: SVG-first approach for zero bitmap weight

## 🛡️ Compliance

- ✅ TABC 21+ age verification required
- ✅ "Drink Responsibly" messaging
- ✅ Privacy notice on email form
- ✅ Accessible form labels and ARIA attributes

## 📞 Contact Information

**Mount Liquor**
535 W Airport Fwy
Irving, TX 75062
Phone: 469-276-7525

---

Built with ❤️ using React, Vite, and Tailwind CSS
