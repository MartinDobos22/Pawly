import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import analyzeRouter from './routes/analyze';
import episodesRouter from './routes/episodes';
import extractTextRouter from './routes/extractText';
import foodSafetyRouter from './routes/foodSafety';
import interpretPassportRouter from './routes/interpretPassport';
import petsRouter from './routes/pets';
import healthRouter from './routes/health';
import accountRouter from './routes/account';
import { errorHandler } from './middleware/errorHandler';
import { firebaseAuth } from './middleware/firebaseAuth';
import { ensureUser } from './middleware/ensureUser';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// Za reverzným proxy (Render) — správne klientské IP pre rate-limiter.
app.set('trust proxy', 1);

// Middleware

const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // povol aj requests bez Origin (curl, health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// explicitne obslúž preflight pre všetky route
app.options('*', cors()); // Base64 attachments inflate payload size by roughly 33%, so keep a safer limit
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
app.use('/api/pets', ensureUser, petsRouter);
app.use('/api/health', ensureUser, healthRouter);
app.use('/api/account', ensureUser, accountRouter);
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
