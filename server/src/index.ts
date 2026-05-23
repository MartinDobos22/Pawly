import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import analyzeRouter from './routes/analyze';
import episodesRouter from './routes/episodes';
import extractTextRouter from './routes/extractText';
import foodSafetyRouter from './routes/foodSafety';
import interpretPassportRouter from './routes/interpretPassport';
import { errorHandler } from './middleware/errorHandler';
import { firebaseAuth } from './middleware/firebaseAuth';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
// Base64 attachments inflate payload size by roughly 33%, so keep a safer limit
// to avoid rejecting valid 5 MB uploads from the UI.
app.use(express.json({ limit: '15mb' }));

app.use((req, res, next) => {
  const startTime = Date.now();

  logger.info('Prichádzajúci request', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  res.on('finish', () => {
    logger.info('Request dokončený', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startTime,
    });
  });

  next();
});

// Rate limiting
const rateLimitedError = (message: string) => ({
  error: { message, code: 'RATE_LIMITED' },
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitedError('Príliš veľa požiadaviek, skús neskôr.'),
});

const aiHeavyLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitedError('Príliš veľa AI požiadaviek, skús o chvíľu.'),
});

app.use('/api/', globalLimiter);

// Health check (verejný — bez autentifikácie)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Všetky ostatné /api/ endpointy vyžadujú platný Firebase ID token
app.use('/api/', firebaseAuth);

// Routes
app.use('/api/analyze', aiHeavyLimiter, analyzeRouter);
app.use('/api/episodes', episodesRouter);
app.use('/api/extract-text', aiHeavyLimiter, extractTextRouter);
app.use('/api/food-safety', aiHeavyLimiter, foodSafetyRouter);
app.use('/api/interpret-passport', aiHeavyLimiter, interpretPassportRouter);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('GranuleCheck server spustený', { port: PORT });
});
