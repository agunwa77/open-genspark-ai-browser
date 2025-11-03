# Open Genspark AI Browser

A sophisticated web scraping and automation platform powered by local AI models. Browse, analyze, and extract data from websites with intelligent agent automation.

## Features

- **Local AI Processing**: Run Llama 3, Llama 2, and Mistral models locally
- **Web Scraping**: Automated web crawling with Playwright
- **DOM Inspection**: Analyze page structure and content
- **Data Extraction**: Extract text, links, images, and structured data
- **Real-time Logging**: Monitor agent execution with live logs
- **Multi-provider Support**: Switch between AI providers
- **Production Ready**: Docker, Kubernetes, and Vercel deployment support

## 🚀 Installation & Setup

This project requires a PostgreSQL database (e.g., [Neon](https://neon.tech/)) for user authentication, chat history, and AI memory.

### 1. Prerequisites

*   Node.js (v18+)
*   pnpm (recommended package manager)
*   A PostgreSQL database instance (e.g., Neon, Supabase, or local instance)

### 2. Clone the Repository

\`\`\`bash
git clone https://github.com/agunwa77/open-genspark-ai-browser.git
cd open-genspark-ai-browser
\`\`\`

### 3. Environment Configuration

Create a file named `.env.local` in the root directory and populate it with the required environment variables.

\`\`\`bash
cp .env.example .env.local
# Note: .env.example is not in the repo, so this step is for documentation only.
# Manually create .env.local
\`\`\`

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| **`NEON_DATABASE_URL`** | **REQUIRED.** Your connection string for the PostgreSQL database. | `postgres://user:password@host/database` |
| `ANTHROPIC_API_KEY` | Optional. Your API key for Anthropic Claude models. | `sk-ant-xxx` |
| `GOOGLE_API_KEY` | Optional. Your API key for Google Gemini models. | `AIzaSy-xxx` |
| `COHERE_API_KEY` | Optional. Your API key for Cohere models. | `xxx` |
| `MISTRAL_API_KEY` | Optional. Your API key for Mistral AI models. | `xxx` |
| `LITELLM_API_KEY` | Optional. Your API key for LiteLLM. | `xxx` |

### 4. Database Initialization

You must initialize the database schema before running the application.

1.  **Connect** to your PostgreSQL database using a client (e.g., `psql`, DBeaver).
2.  **Execute** the SQL commands from the `init.sql` file located in the root of this repository.

\`\`\`bash
# Example using psql (replace <YOUR_DB_URL> with your NEON_DATABASE_URL)
psql <YOUR_DB_URL> -f init.sql
\`\`\`

### 5. Run Locally

1.  Install dependencies:
    \`\`\`bash
    pnpm install
    \`\`\`
2.  Start the development server:
    \`\`\`bash
    pnpm run dev
    \`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
├── components/           # React components
├── lib/                  # Utilities and helpers (including db.ts)
├── public/               # Static assets
├── docker-compose.yml    # Docker Compose config
├── Dockerfile            # Production Docker image
├── kubernetes/           # Kubernetes manifests
└── init.sql              # Database schema initialization script
\`\`\`

## API Endpoints

- \`POST /api/browser/scrape\` - Scrape a URL
- \`POST /api/chat/stream\` - Stream AI responses
- \`GET /api/models/list\` - List available models
- \`GET /api/providers/list\` - List AI providers
- \`GET /api/health\` - Health check
- \`GET /api/status\` - System status

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Vercel
- Connect GitHub repository
- Configure environment variables
- Auto-deploy on push to main

### Docker

\`\`\`bash
docker-compose up -d
\`\`\`

### Kubernetes

\`\`\`bash
kubectl apply -f kubernetes/
\`\`\`

## Technologies

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Scraping**: Playwright
- **AI**: Vercel AI SDK, Local LLMs
- **Deployment**: Docker, Kubernetes, Vercel

## Performance

- Optimized for production deployments
- Horizontal scaling support
- Health checks and auto-recovery
- Memory-efficient processing
- Rate limiting and error handling

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share ideas
- Email: support@example.com

## Roadmap

- [ ] Advanced filtering and search
- [ ] Scheduled scraping jobs
- [ ] Data pipeline integration
- [ ] Custom agent behaviors
- [ ] Webhook support
- [ ] GraphQL API
- [ ] Analytics dashboard

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [Playwright](https://playwright.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
