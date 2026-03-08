# ProposalCV - Consulting Proposal CV Generator

> AI-powered CV tailoring for RFP responses

## Problem

Small and mid-sized consulting firms spend **12+ hours per proposal** manually creating customized consultant CVs for RFP responses. ProposalCV solves this by:

- Storing consultant profiles centrally
- AI-tailoring project descriptions to match RFP keywords
- Generating clean, client-ready CVs in seconds

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres + Auth)
- **AI:** OpenAI GPT-4o for description tailoring
- **PDF:** Puppeteer for server-side rendering
- **Deployment:** Vercel (frontend) + Supabase (database)

## Features

1. **Consultant Profile Database**
   - Add/edit consultants with skills, certifications
   - Manage project history with multiple description variants

2. **AI CV Generator**
   - Select consultant and paste RFP keywords
   - AI tailors project descriptions to match requirements
   - Preview before downloading

3. **Export & Tracking**
   - Download as PDF (clean format)
   - Track which CVs were sent for which RFP

## Setup

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/aparajithn/proposal-cv-gen.git
   cd proposal-cv-gen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Copy your project URL and anon key

4. Create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

5. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   OPENAI_API_KEY=your-openai-api-key
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Database Schema

- `consultants` - Consultant profiles (name, title, skills, certifications)
- `projects` - Project history with multiple description variants
- `cv_exports` - Tracking log of generated CVs

## Roadmap

- [ ] Word document generation (2-column table, bullet points)
- [ ] Custom branding/templates
- [ ] Team collaboration features
- [ ] CRM integrations
- [ ] Version control and approval workflows

## License

MIT

## Author

Built for consulting firms by [aparajithn](https://github.com/aparajithn)
