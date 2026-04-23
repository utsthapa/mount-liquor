# Liquor Shop Storefront

Premium Next.js storefront for the liquor shop experience.

## Scope

- Editorial, premium home page
- Collection and product landing pages with SEO metadata
- Pickup and radius-based delivery messaging
- 21+ compliance banner and ID notices
- Structure ready to connect to Medusa store APIs

## Run

1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_MEDUSA_BACKEND_URL` if your backend is not on `http://localhost:9000`
3. Run `npm install --cache ../../.npm-cache`
4. Run `npm run dev`

## Notes

- The current product cards are seeded from local demo data in `lib/store.ts`.
- The app now tries to read catalog/store data from the Medusa backend first and falls back locally if the backend is unavailable.
- The delivery check endpoint is still a UI placeholder and should be replaced by address-level backend validation.
