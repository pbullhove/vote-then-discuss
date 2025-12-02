# Vote Then Discuss

A Next.js application that allows users to create voting sessions with questions. Users answer questions privately, and after submitting, they can see all responses from other participants.

## Features

- Create sessions with one or multiple questions
- Users answer questions without seeing others' responses
- After submission, view all answers from all participants
- Real-time updates when new answers are submitted
- Clean, simple design with light gray background and white rounded input boxes

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend database and real-time subscriptions
- **Vercel** - Deployment platform

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (note: it may take a few minutes to provision)
3. Once your project is ready, go to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `database/schema.sql` from this project
3. Copy the entire SQL script
4. Paste it into the Supabase SQL Editor
5. Click **Run** to execute the script

This will create the following tables:
- `sessions` - Stores voting sessions
- `questions` - Stores questions for each session
- `answers` - Stores user answers to questions
- `submissions` - Tracks when users submit their answers

The script also sets up:
- Indexes for better query performance
- Row Level Security (RLS) policies (currently allowing all operations)

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Sessions Table
- `id` (UUID) - Primary key
- `created_at` (Timestamp) - When the session was created
- `updated_at` (Timestamp) - Last update time

### Questions Table
- `id` (UUID) - Primary key
- `session_id` (UUID) - Foreign key to sessions
- `question_text` (Text) - The question content
- `question_order` (Integer) - Order of the question in the session
- `created_at` (Timestamp) - When the question was created

### Answers Table
- `id` (UUID) - Primary key
- `question_id` (UUID) - Foreign key to questions
- `session_id` (UUID) - Foreign key to sessions
- `answer_text` (Text) - The answer content
- `user_id` (Text) - Identifier for the user (generated client-side)
- `created_at` (Timestamp) - When the answer was submitted
- Unique constraint on `(question_id, user_id)` - One answer per user per question

### Submissions Table
- `id` (UUID) - Primary key
- `session_id` (UUID) - Foreign key to sessions
- `user_id` (Text) - Identifier for the user
- `submitted_at` (Timestamp) - When the user submitted all answers
- Unique constraint on `(session_id, user_id)` - One submission per user per session

## How to Use

1. **Create a Session**: Click "New Session" on the home page
2. **Add Questions**: In the session page, click "+ Add Question" to add questions
3. **Answer Questions**: Type your answers in the text boxes (answers are private until you submit)
4. **Submit**: Click "Submit Answers" when you're done (you must answer all questions)
5. **View Results**: After submitting, you'll see all answers from all participants, updated in real-time

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

The `vercel.json` file is already configured for optimal deployment.

## Security Notes

- The current RLS policies allow all operations. For production, you may want to restrict access
- User IDs are generated client-side. For production, consider implementing proper authentication
- The anon key is safe to expose in client-side code, but consider implementing additional security measures for production use

## Project Structure

```
vote-then-discuss/
├── app/
│   ├── page.tsx              # Home page with "New Session" button
│   ├── session/
│   │   └── [id]/
│   │       └── page.tsx      # Session page with questions and answers
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   └── supabase.ts           # Supabase client configuration
├── database/
│   └── schema.sql            # Database schema SQL script
├── vercel.json               # Vercel deployment configuration
└── README.md                 # This file
```

## Troubleshooting

- **"Missing Supabase environment variables"**: Make sure your `.env.local` file exists and has the correct values
- **Database errors**: Ensure you've run the SQL schema script in Supabase
- **Real-time not working**: Check that your Supabase project has real-time enabled (it's enabled by default)

## License

MIT
