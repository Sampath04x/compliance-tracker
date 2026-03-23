# LedgersCFO Compliance Tracker

A simple, beautiful web application to track compliance tasks for different clients, built as an assignment for the Full Stack Developer Intern role at LedgersCFO.

## Features

- **Client Management:** View a list of clients and select one to see their specific tasks.
- **Task Management:** View tasks, add new tasks, and mark them as Completed/Pending.
- **Filtering & Navigation:** Quickly filter tasks by Status and Category.
- **Premium UI:** Rich, modern glassmorphism aesthetic built with pure CSS.
- **Overdue Detection:** Easily identify overdue tasks that need immediate attention.
- **Responsive Design:** Works seamlessly across desktop and mobile devices.
- **Summary Statistics:** View total, pending, and overdue tasks at a glance.

## Assumptions & Tradeoffs

1. **Persistent Storage:** Per the instructions, "a simple DB or simple storage is fine". To ensure maximum compatibility out-of-the-box (without requiring you to run Docker or setup PostgreSQL/SQLite Native modules), I utilized a local JSON file (`data.json`) via File System APIs to persist data. This behaves like a NoSQL database for the purpose of this assignment.
2. **Framework Choice:** I used Next.js (App Router) to combine both frontend and backend APIs within a single repository cleanly. It allows serverless functions to act as our backend.
3. **Vanilla CSS vs Tailwind:** True to the prompt constraints, I built a bespoke CSS design system from scratch using vanilla CSS and CSS variables to deliver a high-quality "glassmorphism" aesthetic without relying on TailwindCSS or heavy UI libraries.

## How to Run

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)

### Local setup bounds

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd compliance-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **View the app:**
   Open http://localhost:3000 in your browser.

## Built With

- Next.js 15 (React 19)
- TypeScript
- Vanilla CSS
- Node.js `fs/promises` for JSON persistence 
