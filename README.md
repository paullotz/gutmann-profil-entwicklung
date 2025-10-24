# Bank Gutmann - Financial Health Check

A comprehensive AI-powered financial health assessment tool built with Next.js 15, React, and TypeScript.

## Features

- Multi-step financial assessment questionnaire
- AI-powered analysis using Google Gemini
- Interactive radar chart visualization
- Responsive design with Tailwind CSS v4
- shadcn/ui components with custom accent color (#749381)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   - Add your Gemini API key in the **Vars** section of the v0 in-chat sidebar, or
   - Create a \`.env.local\` file based on \`.env.example\`:
     \`\`\`bash
     cp .env.example .env.local
     \`\`\`
   - Add your API key:
     \`\`\`
     GEMINI_API_KEY=your_actual_api_key
     \`\`\`

### Development

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

The app will be available at \`http://localhost:3000\`

### Build

Build for production:

\`\`\`bash
npm run build
\`\`\`

Start the production server:

\`\`\`bash
npm run start
\`\`\`

## Project Structure

\`\`\`
app/
├── actions/
│   └── analyze.ts          # Server action for AI analysis
├── layout.tsx              # Root layout
├── page.tsx                # Home page
└── globals.css             # Global styles with Tailwind v4
components/
├── ui/                     # shadcn/ui components
├── App.tsx                 # Main application component
├── RadarChartComponent.tsx # Chart visualization
└── icons.tsx               # Icon components
lib/
└── utils.ts                # Utility functions
services/
└── geminiService.ts        # (deprecated - moved to server action)
types.ts                    # TypeScript type definitions
\`\`\`

## Technologies

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Recharts
- Google Gemini AI
- Radix UI primitives

## Environment Variables

The app requires the following environment variable:

- \`GEMINI_API_KEY\`: Your Google Gemini API key (server-side only for security)

You can set this in the v0 **Vars** section or in a \`.env.local\` file.
