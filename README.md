# QC TaskMaster

Production-focused QA/QC task management app for engineering teams built with Next.js, TypeScript, Firebase, Tailwind, and Genkit.

## Features
- Firebase Auth with Email/Password and Google Sign-In.
- First registered user automatically receives `admin`; all others are `member`.
- Protected app routes (`/dashboard`, `/tasks`) with modern authenticated layout.
- Role-based dashboards (admin analytics + member personal task view).
- Tasks data table with filtering, colored priority/status badges, overdue highlighting.
- Task creation/editing in side sheet UX.
- Admin-only AI Priority modal using Genkit flow suggestions.

## Quick start
1. `npm install`
2. Fill `.env.local` based on `.env.example`
3. `npm run dev`
