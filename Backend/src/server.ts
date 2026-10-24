import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import authRoutes from './routes/authRoutes.js';
import encounterRoutes from './routes/encounterRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import jeevanRoutes from './routes/jeevanRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Jeevan AI Emergency Response & Hospital Management Backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/jeevan', jeevanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/audit-logs', auditRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Invalid JSON payload in request' });
    return;
  }
  console.error('Unhandled server error:', err);
  res.status(err?.status || 500).json({ error: 'Internal server error', details: err?.message });
});

// Start listening
const server = app.listen(config.port, () => {
  console.log(`\n======================================================`);
  console.log(`🏥 MEDITRIAGE AI CLINICAL BACKEND RUNNING`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
  console.log(`📋 Encounters: http://localhost:${config.port}/api/encounters`);
  console.log(`======================================================\n`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => console.log('HTTP server closed'));
});

export default app;
