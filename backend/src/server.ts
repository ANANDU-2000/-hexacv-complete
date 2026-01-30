import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { globalLimiter } from './middleware/security.js';
import templatesRouter from './routes/templates.js';
import ordersRouter from './routes/orders.js';
import analyticsRouter from './routes/analytics.js';
import analyticsV2Router from './routes/analytics-v2.js';
import categorizationRouter from './routes/categorization.js';
import intelligenceRouter from './routes/intelligence.js';
import adminRouter from './routes/admin.js';
import feedbackRouter from './routes/feedback.js';
import llmRouter from './routes/llm.js';
import aiRewriteRouter from './routes/ai-rewrite.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security: helmet with CSP and other headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
// Firewall-style: global rate limit
app.use(globalLimiter);
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://www.hexacv.online',
    'https://hexacv.online',
    'https://hexacv-admin-web.vercel.app',
    /.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/templates', templatesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/analytics-v2', analyticsV2Router);
app.use('/api/categorization', categorizationRouter);
app.use('/api/intelligence', intelligenceRouter);
app.use('/api/admin', adminRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/llm', llmRouter); // New LLM proxy routes
app.use('/api/ai-rewrite', aiRewriteRouter); // AI rewrite with rate limiting

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Run seed script in development (with error handling)
if (process.env.NODE_ENV !== 'production') {
  // Skip seeding in development to avoid database errors
  console.log('⚠️ Skipping enterprise data seeding in development mode');
  // Uncomment the following to run seeding with proper error handling:
  // import('./seed-enterprise-data.js').catch(err => {
  //   console.log('Seed script not available or failed to run:', err.message);
  // });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});