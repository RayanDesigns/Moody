# Moody — Mental Wellness Journaling App

AI-powered journaling app that combines mood tracking, emotional analysis, and evidence-based wellness tools.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 + shadcn/ui-style components
- **Auth & Database**: Firebase (Auth + Firestore)
- **AI**: OpenAI GPT-4o-mini (sentiment analysis, companion chat, weekly insights)
- **Charts**: Recharts
- **Editor**: Tiptap (rich text)
- **Animations**: Framer Motion

## Features

- **Daily Mood Check-in** — 5-emoji scale with streak tracking
- **AI Journaling** — Rich text editor with guided prompts and sentiment analysis
- **Emotional Analysis** — Detects emotions, triggers, and patterns via OpenAI
- **AI Companion Chat** — Empathetic, non-judgmental conversational support
- **Insights Dashboard** — Mood trends, Year in Pixels, trigger patterns, weekly AI summary
- **Wellness Toolkit** — Box breathing exercise, CBT worksheets, gratitude prompts

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project (Auth + Firestore enabled)
- OpenAI API key

### Setup

1. Clone and install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
OPENAI_API_KEY=your_openai_key
```

3. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (auth)/          — Login & signup pages
    (app)/           — Authenticated dashboard (home, journal, insights, chat, toolkit)
    api/             — Server routes (analyze, chat, insights)
  components/        — Reusable UI and feature components
  lib/               — Firebase, OpenAI, hooks, utilities
  types/             — TypeScript interfaces
```
