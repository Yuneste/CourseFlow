# CourseFlow 📚

> Transform your academic chaos into organized success with AI-powered file management.

CourseFlow is a web-based academic file organization platform that uses AI to automatically organize, categorize, and enhance study materials. Built for students across North America and Europe, it transforms the way you manage your academic documents.

![Next.js](https://img.shields.io/badge/Next.js-14.1+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.0+-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Features

### Core Functionality
- **🤖 AI-Powered Organization** - Automatically categorize and rename files using OpenAI
- **📁 Smart File Management** - Upload, organize, and search files effortlessly
- **🔐 Secure Authentication** - Email/password, Google OAuth, and Microsoft OAuth
- **🌍 Multi-Regional Support** - Localized for US, Canada, UK, and EU academic systems
- **💰 Multi-Currency Billing** - Subscription tiers with regional pricing

### Study Tools
- **📝 AI Summaries** - Generate concise summaries of your documents
- **🎯 Flashcard Generation** - Create study flashcards automatically
- **📊 Progress Tracking** - Monitor your study sessions and performance
- **🏆 Gamification** - Streaks, achievements, and study goals

### Collaboration
- **👥 Study Groups** - Create and join collaborative workspaces
- **💬 Real-time Chat** - Communicate with study partners
- **📤 File Sharing** - Share materials within your groups
- **🎨 Shared Whiteboards** - Collaborate on visual content

## 🚀 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Frontend | Next.js 14 + TypeScript | Full-stack React framework |
| Styling | Tailwind CSS + Shadcn/ui | Rapid UI development |
| Backend | Next.js API Routes | Serverless endpoints |
| Database | PostgreSQL (Supabase) | Data persistence |
| Auth | Supabase Auth | Authentication & authorization |
| Storage | Supabase Storage | File storage |
| AI | OpenAI API | File categorization & summaries |
| Payments | Stripe | Subscription management |
| i18n | next-intl | Internationalization |
| Hosting | Vercel | Edge deployment |

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)
- Google Cloud Console account (for Google OAuth)
- Azure AD account (for Microsoft OAuth)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/courseflow.git
   cd courseflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your `.env.local` file:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   
   # OAuth (configured in Supabase dashboard)
   # Google and Microsoft OAuth are configured directly in Supabase
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run database migrations (see `/supabase/migrations`)
   - Enable Google and Microsoft auth providers
   - Configure OAuth redirect URLs

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗️ Project Structure

```
CourseFlow/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected app pages
│   ├── api/               # API routes
│   └── [locale]/          # Internationalized routes
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── features/         # Feature-specific components
├── lib/                   # Utilities and services
│   ├── supabase/         # Supabase clients
│   ├── services/         # Business logic
│   └── utils/            # Helper functions
├── docs/                  # Documentation
│   ├── architecture/     # Technical architecture
│   ├── prd/             # Product requirements
│   └── stories/         # User stories
└── types/                # TypeScript definitions
```

## 💳 Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Explorer** (Free) | $0 | 10 files/month, 50MB storage, Basic AI |
| **Scholar** | $4.99/mo | Unlimited files, 5GB storage, Full AI features |
| **Master** | $9.99/mo | 50GB storage, Advanced AI, Unlimited groups |

*Prices shown in USD. Regional pricing available.*

## 🌍 Supported Regions

- **North America**: United States, Canada
- **Europe**: EU countries, United Kingdom
- **Languages**: English, French, German, Spanish
- **Academic Systems**: GPA, ECTS, UK Honours, Percentage

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

The app is configured for deployment on Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Database and Auth by [Supabase](https://supabase.com/)
- AI powered by [OpenAI](https://openai.com/)
- Payments by [Stripe](https://stripe.com/)

## 📞 Support

- 📧 Email: support@courseflow.app
- 💬 Discord: [Join our community](https://discord.gg/courseflow)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/courseflow/issues)

---

<p align="center">Made with ❤️ by students, for students</p>