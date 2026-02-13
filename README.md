# QC TaskMaster

Enterprise-ready QA/QC task management platform for engineering organizations.

## What was added
This repository now includes a production-focused architecture blueprint and implementation scaffolding for:
- Role-based task lifecycle management
- Admin + Team analytics dashboards
- PostgreSQL normalized schema with indexing
- JWT + RBAC security middleware examples
- Notification-ready backend module layout
- Docker/VPS deployment guidance

## Key deliverables
- Architecture design: `docs/enterprise-architecture.md`
- Database schema: `docs/database/schema.sql`
- Dashboard SQL metrics: `docs/queries/dashboard-metrics.sql`
- Backend API scaffold: `backend/src/*`
- Sample enterprise React components: `src/components/enterprise/*`

## Existing app quick start
1. `npm install`
2. Fill `.env.local` based on `.env.example`
3. `npm run dev`
