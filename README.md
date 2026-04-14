# Chronicae - Symptom Tracking Web App

A mobile-first React web application for tracking symptoms and pain levels for people with chronic illnesses.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase
- **Routing**: React Router v6

## Project Structure

```
src/
├── components/       # Reusable React components
├── pages/           # Page components for routes
│   ├── Welcome.tsx
│   ├── Login.tsx
│   └── Signup.tsx
├── services/        # API services (Supabase, etc.)
│   ├── supabaseClient.ts
│   └── authService.ts
├── hooks/           # Custom React hooks
│   └── useAuth.ts
├── types/           # TypeScript type definitions
│   └── auth.ts
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (use `.env.example` as a template):

```bash
cp .env.example .env
```

Then fill in your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings.

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Features (Implemented)

- ✅ Responsive welcome screen
- ✅ Login page with form validation
- ✅ Sign up page with country selection and optional disease name
- ✅ Mobile-first design
- ✅ Material Design Icons
- ✅ Custom color scheme (Chronicae branding)

## Features (To Implement)

- 🔄 Supabase authentication integration
- 🔄 Protected routes for authenticated users
- 🔄 User profile management
- 🔄 Symptom tracking functionality
- 🔄 Pain level tracking
- 🔄 Data visualization and analytics

## Security Best Practices

- Environment variables for sensitive credentials
- No sensitive data in client-side code
- Input validation on forms
- OAUTH support for social login (ready to implement)
- Encrypted health data storage

## Design System

The app uses Material Design 3 color tokens with Chronicae branding:

- **Primary**: #ac2d00 (Burnt Orange)
- **Primary Container**: #d63c05
- **Tertiary**: #9c3f20
- **Error**: #ba1a1a

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

See the DESIGN.md file for design guidelines and component specifications.

## License

© 2024 Chronicae. All rights reserved.
