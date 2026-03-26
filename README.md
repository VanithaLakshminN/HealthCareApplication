# HealthCare Pro

Your Digital Health Partner — a Next.js web app for managing healthcare needs in one place.

Live: [https://healthcare601.netlify.app](https://healthcare601.netlify.app)

## Features

- AI Chatbot — chat with an AI assistant for health queries
- Appointment Booking — schedule and manage doctor appointments
- Pharmacy Section — browse and order medications
- Health Records — view and manage your digital health records
- Services Overview — explore available healthcare services

## Tech Stack

- [Next.js 14](https://nextjs.org/) — React framework
- [TypeScript](https://www.typescriptlang.org/) — type safety
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) — component library
- [OpenAI](https://platform.openai.com/) — AI chatbot integration
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Recharts](https://recharts.org/) — data visualization
- [Vercel Analytics](https://vercel.com/analytics) — usage analytics

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                  # Next.js app router pages
│   ├── ai/               # AI page
│   ├── aichat/           # AI chat page
│   ├── appointments/     # Appointments page
│   ├── pharmacy/         # Pharmacy page
│   ├── records/          # Health records page
│   └── api/              # API routes (session, voice)
├── components/           # Reusable React components
│   └── ui/               # shadcn/ui base components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Environment Variables

Create a `.env.local` file in the root and add your keys:

```env
OPENAI_API_KEY=your_openai_api_key
```

## Deployment

Hosted on [Netlify](https://www.netlify.com/) at [https://healthcare601.netlify.app](https://healthcare601.netlify.app).

## Author

**Vanitha Lakshmi N**

- 🎓 B.E. CSE (2022–2026)
- 📍 Bengaluru, India
- 💼 Data Analytics Intern @ Rooman Technologies
- 💼 Software Development Intern @ TAP Academy
- 💻 Interested in Machine Learning & Software Development
- 📧 [vanithalakshmin354@gmail.com](mailto:vanithalakshmin354@gmail.com)
- 🔗 [LinkedIn](https://www.linkedin.com/in/vanitha-lakshmi-n)
- 🐙 [GitHub](https://github.com/VanithaLakshmiN)
