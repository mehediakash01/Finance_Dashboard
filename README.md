# Finance Dashboard (Frontend Assignment)

An interactive finance dashboard built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

The project demonstrates:

- Dashboard overview cards for balance, income, and expenses
- Time-based chart (monthly balance trend)
- Categorical chart (spending breakdown)
- Transactions table with search, filter, and sorting
- Frontend-simulated role-based UI (`viewer` and `admin`)
- Insights panel with highest spending category and monthly comparison
- Centralized state management via React Context
- Responsive layout and empty-state handling
- Local storage persistence for transactions and selected role

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Recharts

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

## Project Structure

```text
src/
	app/
		layout.tsx
		page.tsx
		providers.tsx
	components/
		finance/
			dashboard-shell.tsx
		ui/
			...shadcn components
	context/
		finance-context.tsx
	data/
		mock-transactions.ts
	lib/
		finance-utils.ts
	types/
		finance.ts
```

## How This Meets The Requirements

1. Dashboard Overview
- Summary cards: Total Balance, Income, Expenses
- Time visualization: monthly net trend line chart
- Category visualization: spending breakdown pie chart

2. Transactions Section
- Columns: Date, Description, Category, Type, Amount
- Features: search, category/type filters, sorting, empty state

3. Basic Role-Based UI
- Role switcher in header
- Viewer: read-only mode
- Admin: can add transactions through modal form

4. Insights Section
- Highest spending category
- Month-over-month comparison
- Average expense + recommendation note

5. State Management
- Context provider manages:
	- transactions
	- role
	- filters
	- derived filtered/sorted data

6. UI/UX Expectations
- Clean card-based layout
- Responsive grid for mobile and desktop
- Gradient atmosphere, clear typography, and subtle entry animation
- Empty states in charts and table

## Notes

- Data is mocked and persisted to local storage for demo purposes.
- No backend or authentication is required for this assignment.
