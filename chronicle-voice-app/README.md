# Chronicle Voice App

This is a [Next.js](https://nextjs.org) project for managing and processing call transcripts from VAPI, storing them in Supabase, and enhancing them with Anthropic's API.

## Getting Started

First, clone the repository and install dependencies:

```bash
git clone <repository-url>
cd chronicle-voice-app
npm install
```

Copy the environment variables example file and fill in your API keys:

```bash
cp .env.example .env.local
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Endpoints

The application includes several API endpoints to handle call data:

### `/api/vapi/calls` (GET)

Fetches all call information from VAPI and returns it to the frontend.

### `/api/vapi/check-calls` (POST)

Checks if calls exist in the Supabase database. Expects a JSON body with:

```json
{
  "callIds": ["id1", "id2", "id3"]
}
```

Returns existing and missing call IDs.

### `/api/vapi/transcripts` (POST)

Fetches transcripts for calls that don't exist in Supabase and stores them. Expects a JSON body with:

```json
{
  "callIds": ["id1", "id2", "id3"]
}
```

### `/api/anthropic/clean-transcript` (POST)

Sends transcript data to Anthropic's API for cleanup. Expects a JSON body with:

```json
{
  "transcript": "Raw transcript text"
}
```

Returns the cleaned transcript.

## Utility Functions

The `api-utils.ts` file provides utility functions to orchestrate these API calls:

- `fetchAndProcessCalls()`: Fetches call data, checks database existence, fetches missing transcripts, and processes them through Anthropic.
- `fetchAndProcessCall(callId)`: Similar but for a single call.

## Environment Variables

The following environment variables need to be set in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VAPI_API_KEY`: Your VAPI API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
