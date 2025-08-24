# Clarity Coach AI

Master structured and concise communication through daily AI-powered practice sessions.

## 🚀 Features

- **AI-Powered Feedback**: Get instant, structured feedback on your communication using Anthropic Claude or Google Gemini
- **Daily Practice Sessions**: Structured workflow to improve communication skills
- **Progress Tracking**: Track your improvement over time with visual charts and statistics
- **Streak System**: Stay motivated with streak tracking and achievements
- **Practice History**: Review past sessions and feedback to see your growth
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui
- **Authentication**: NextAuth.js v5
- **Database**: Prisma ORM (SQLite for development, PostgreSQL for production)
- **AI Integration**: Anthropic Claude & Google Gemini
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- API keys for either Anthropic Claude or Google Gemini

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/clarity-coach.git
cd clarity-coach
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite for development

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# AI Provider (choose one: 'anthropic' or 'gemini')
AI_PROVIDER="anthropic"

# API Keys (provide the one you're using)
ANTHROPIC_API_KEY="sk-ant-..."
GEMINI_API_KEY="AIza..."
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev

# Or with API keys from command line (prioritizes Gemini if provided):
GEMINI_API_KEY=your-key npm run dev
ANTHROPIC_API_KEY=your-key npm run dev

# Or with both (Gemini will be primary, Anthropic as fallback):
GEMINI_API_KEY=your-gemini-key ANTHROPIC_API_KEY=your-anthropic-key npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
clarity-coach/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # User dashboard
│   │   ├── practice/     # Practice session
│   │   └── history/      # Practice history
│   ├── components/       # React components
│   │   ├── ui/          # Shadcn/ui base components
│   │   ├── practice/    # Practice session components
│   │   ├── feedback/    # Feedback display components
│   │   ├── dashboard/   # Dashboard components
│   │   └── layout/      # Layout components
│   ├── lib/             # Utilities and services
│   │   ├── ai/          # AI integration layer
│   │   ├── auth/        # Authentication config
│   │   └── prisma.ts    # Database client
│   └── types/           # TypeScript definitions
├── prisma/              # Database schema
└── public/              # Static assets
```

## 🎯 Core Features

### Practice Session Workflow
1. **Set Topic**: Choose or generate a communication scenario
2. **Define Goal**: State your communication objective
3. **Structure Points**: List three main points
4. **Create Pitch**: Write a concise one-breath pitch
5. **Get Feedback**: Receive AI-powered analysis and suggestions

### Dashboard Features
- Practice streak tracking
- Average score monitoring
- Progress charts over time
- Recent session summaries
- Achievement badges

### AI Integration
- **Dual Provider Support**: Seamlessly switch between Anthropic and Gemini
- **Structured Feedback**: Score (1-10), strengths, improvements, enhanced versions
- **Automatic Failover**: Falls back to secondary provider on errors
- **Smart Prompting**: Optimized prompts for communication coaching

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."  # Your PostgreSQL connection string
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret"
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="your-key"
GEMINI_API_KEY="your-key"
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Practice Endpoints
- `POST /api/practice/submit` - Submit practice for feedback
- `GET /api/practice/topic` - Generate practice topic

### User Data Endpoints
- `GET /api/user/progress` - Get user progress data
- `GET /api/user/history` - Get practice history

## 🧪 Testing

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build
```

## 📊 Database Schema

### User
- Stores user authentication and profile data

### PracticeSession
- Records each practice session with feedback

### UserProgress
- Tracks user statistics and achievements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/) and [Google Gemini](https://ai.google.dev/)

---

Made with ❤️ for better communication