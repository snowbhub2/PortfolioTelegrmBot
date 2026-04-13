# PortfolioTelegrmBot

A **Telegram Mini App** for trading stocks and metals — built as a portfolio demo project showcasing a full-stack architecture with a polished frontend and partial backend implementation.

> 🚧 This is a demo/portfolio project. The frontend is fully built; backend is partially implemented.

---

## 📱 About

PortfolioTelegrmBot is a Telegram Mini App that simulates a trading interface for **stocks and metals**. It runs directly inside Telegram using the TWA (Telegram Web App) SDK, providing a native-feeling mobile experience without leaving the messenger.

The app demonstrates:
- Real-time-style trading UI with charts and portfolio tracking
- Telegram Mini App integration via `@twa-dev/sdk`
- Full React + TypeScript frontend with modern component architecture
- Express.js backend with Netlify Functions support for serverless deployment

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Radix UI, shadcn/ui |
| State | TanStack React Query |
| Routing | React Router DOM v6 |
| Charts | Recharts |
| 3D / Animation | Three.js, Framer Motion |
| Telegram | @twa-dev/sdk (Telegram Web App SDK) |
| Backend | Express.js (Node.js) |
| Serverless | Netlify Functions |
| Deployment | Netlify |

---

## 🗂️ Project Structure

```
PortfolioTelegrmBot/
├── client/          # React frontend source
├── server/          # Express backend
├── public/          # Static assets
├── shared/          # Shared types and utilities
├── netlify/
│   └── functions/   # Serverless API functions
├── vite.config.ts          # Client build config
├── vite.config.server.ts   # Server build config
├── tailwind.config.ts
└── netlify.toml
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Type check

```bash
npm run typecheck
```

---

## 🌐 Deployment

The project is configured for **Netlify** deployment out of the box:

```bash
# Deploy via Netlify CLI
netlify deploy --prod
```

The `netlify.toml` handles routing and function configuration automatically.

---

## 📦 Key Dependencies

- [`@twa-dev/sdk`](https://github.com/twa-dev/SDK) — Telegram Web App SDK for Mini Apps integration
- [`recharts`](https://recharts.org) — Composable chart library for price data visualization
- [`@tanstack/react-query`](https://tanstack.com/query) — Server state management
- [`framer-motion`](https://www.framer.com/motion/) — Animations
- [`three`](https://threejs.org) + [`@react-three/fiber`](https://docs.pmnd.rs/react-three-fiber) — 3D elements

---

## 👤 Author

**Dmytro Shapovaliuk**
[LinkedIn →](https://www.linkedin.com/in/dmytro-shapovaliuk-4aab80394/)

---

## 📄 License

This project is open source and available for portfolio and demonstration purposes.
