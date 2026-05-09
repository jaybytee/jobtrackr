# ⚡ JobTrackr

A full-featured job application tracker built with **Angular 17** + **Supabase**.

---

## 🚀 Getting Started

### 1. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to **SQL Editor**
3. Paste and run the contents of `supabase-schema.sql`
4. Go to **Authentication → Providers** and ensure Email is enabled
5. Go to **Project Settings → API** and copy:
   - **Project URL** → your `supabaseUrl`
   - **anon public key** → your `supabaseKey`

### 2. Configure the app

Edit `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  supabaseUrl: 'https://YOURPROJECT.supabase.co',
  supabaseKey: 'your-anon-key-here'
};
```

### 3. Install & run

```bash
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200)

---

## ✨ Features

| Feature | Status |
|---|---|
| Sign up / Login / Password Reset | ✅ |
| Kanban Board (Applied → Interview → Offer → Rejected) | ✅ |
| Drag & Drop to move applications | ✅ |
| Add / Edit / Delete applications | ✅ |
| Interview date tracking | ✅ |
| Analytics (Response rate, charts, timeline) | ✅ |
| Row-Level Security (users see only their data) | ✅ |

---

## 📁 Project Structure

```
src/app/
├── core/
│   ├── guards/         # Auth guards
│   ├── models/         # Job interface & types
│   └── services/       # SupabaseService, JobService
└── features/
    ├── auth/           # Login, Signup, Forgot Password
    ├── dashboard/      # Kanban board
    └── analytics/      # Charts & stats
```

## 🛠 Tech Stack

- **Angular 17** (standalone components, signals)
- **Supabase** (auth + PostgreSQL database with RLS)
- **Chart.js** (analytics charts)
- **SCSS** (custom design system)


Made By RJ
