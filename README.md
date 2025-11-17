# Flux Banking Aggregator (React + Vite)

Front-end for the **BankCustomerAPI** backend (`/backend/ProjectFullStack/BankCustomerAPI/BankCustomerAPI`).  
Implements login/logout, JWT refresh + verify, role-based navigation, and sysadmin dashboards for users/banks.  
Regular users can view paginated accounts, run deposits/withdrawals/transfers, and browse transactions with filters.  
Marketing pages (Landing, About, Plans, FAQ, Contact) showcase image galleries, cards, forms, and newsletter signups.

## Tech stack

- React 19 + Vite 7 (dev server pinned to port `3000` to align with backend CORS)
- Tailwind CSS via PostCSS (semantic HTML5 sections, CSS Grid/Flexbox layouts)
- React Router 7 for routing & protected routes
- Axios-less fetch helper with refresh-aware `useApi` hook
- Contexts: `AuthContext` (JWT/session) + `BankingDataContext` (accounts, transactions, banks, branches, users)

## Getting started

```bash
npm install
npm run dev
```

Environment variables:

| Key             | Default                | Description                                      |
| --------------- | --------------------- | ------------------------------------------------ |
| `VITE_API_URL`  | `http://localhost:5230` | Base URL for the C# backend (`/api` is appended) |

When running locally:

1. Start **BankCustomerAPI** (Kestrel profile) -> `http://localhost:5230`.
2. Ensure seed data/roles exist (see backend repo).
3. Run `npm run dev` (Vite serves on `http://localhost:3000`, matching backend CORS allowlist).

## Pages & features

- **Landing** – API-driven marketing cards with responsive hero.
- **About** – Image gallery + leadership profiles.
- **Plans** – Pricing cards with feature bullets.
- **FAQ** – Accordion with semantic buttons.
- **Contact** – Contact form + newsletter signup.
- **Login** – Email/password auth backed by `/api/Auth/*` endpoints.
- **Home** – Stat cards, quick links, recent transactions.
- **Accounts** – Data grid with search/pagination + deposit/withdraw/transfer + create/close.
- **Transactions** – Filterable grid (type + date range).
- **Manage Users** – Sysadmin-only CRUD UI (list/create/delete).
- **Manage Banks** – Sysadmin-only bank + branch management.

All grids support:

- Column sorting (except action columns)
- Typeahead search (instant filtering)
- Page size selector (5/10/15)

## Testing/responsiveness

- Tailwind utilities + semantic layout tags enable quick device preview in browser dev tools.
- Data grids and forms were tested in Chrome responsive viewports (mobile/tablet/desktop).
- Newsletter/contact components reusable across pages and footer.

## Project structure (key paths)

```
src/
  api/http.js                 // Fetch wrapper + ApiError
  context/AuthContext.jsx     // Login/refresh/verify/logout
  context/BankingDataContext.jsx
  hooks/useApi.js             // Auto-refresh-aware API helper
  components/
    layout/MainLayout.jsx
    navigation/ProtectedRoute.jsx
    ui/DataGrid.jsx
    forms/{ContactForm,NewsletterForm}.jsx
  pages/
    {Landing,About,Plans,FAQ,Contact,Login,
     Home,Accounts,Transactions,ManageUsers,ManageBanks}.jsx
```

## Tailwind usage

- `src/index.css` loads Google fonts + Tailwind directives.
- Custom palette (`brand` scale) + font stacks in `tailwind.config.js`.
- Layouts rely on CSS Grid for cards/forms and Flexbox for nav/header/footer.
