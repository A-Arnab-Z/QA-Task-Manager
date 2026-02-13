import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import taskRoutes from './modules/tasks/tasks.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: ['https://qa.example.internal'], credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.use(
  '/api/v1',
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use('/api/v1/tasks', taskRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

export default app;
