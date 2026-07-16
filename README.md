# Dream Go India - Premium Travel Booking Platform

A modern full-stack travel booking website built with React, Vite, TypeScript, Tailwind CSS, and Supabase.

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4
- **UI:** Shadcn-style components, Framer Motion, Lucide Icons, Swiper.js
- **State:** React Query, React Hook Form, Zod
- **Backend:** Supabase (Auth, Database, Storage)
- **Charts:** Chart.js (Admin Analytics)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WHATSAPP_NUMBER=919876543210
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### 3. Set up Supabase database

Run numbered migrations in order via Supabase Dashboard SQL Editor or CLI:

```bash
supabase db push
```

- `supabase/migrations/` — schema & seeds (`001`–`015`)
- `supabase/scripts/` — optional one-time ops (CMS unlock, trips sync); run in SQL Editor if needed
- Payments setup: see [`docs/razorpay-setup.md`](docs/razorpay-setup.md)

### 4. Start development server

```bash
npm run dev
```

Visit `http://localhost:5173`

**Demo mode:** Works without Supabase using mock data. Admin panel at `/admin` auto-logs in as demo admin.

## Project Structure

```
/
├── docs/                 # Setup notes (e.g. Razorpay)
├── scripts/              # Build helpers
├── src/
│   ├── components/       # UI, layout, home, admin, highlights
│   ├── contexts/         # Auth, Settings, Theme providers
│   ├── data/             # Mock data for demo mode
│   ├── hooks/            # React Query hooks (CMS, Admin, Dashboard)
│   ├── lib/              # Supabase client, utils, settings map
│   ├── pages/            # Route pages (public, auth, dashboard, admin)
│   ├── services/         # API services
│   └── types/            # TypeScript types
└── supabase/
    ├── migrations/       # Numbered schema migrations only
    ├── scripts/          # Optional SQL Editor ops scripts
    └── functions/        # Edge functions
```
## Features

### Website
- Home page matching premium UI design
- Trip listing with filters and search
- Package detail pages with booking
- Destination pages with weather widget
- Blog with categories and comments
- Photo gallery with infinite scroll
- Contact form, FAQ, About, Services

### Authentication
- Email/password login & signup
- Google OAuth
- Forgot/reset password
- Email verification
- Role-based redirects (Admin → `/admin`, Customer → `/dashboard`)

### Customer Dashboard
- Bookings history & invoice download
- Wishlist & trip comparison
- Profile management
- Notifications & reviews

### Admin CMS
- Full content management (no hardcoded content)
- Hero slider, trips, destinations, categories
- Blog editor (TipTap rich text)
- Gallery, testimonials, FAQs
- Bookings approval, coupons, newsletter
- Website settings & SEO

### Bonus Features
- AI trip recommendations
- Travel cost calculator
- WhatsApp floating chat
- Dark mode & English/Hindi language switcher
- PWA support

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run linter |

## Payments (Razorpay)

See [`docs/razorpay-setup.md`](docs/razorpay-setup.md) for Key ID, edge functions, and verification.

## Deployment

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host. Set environment variables in your hosting dashboard.

## License

Private - Dream Go India
