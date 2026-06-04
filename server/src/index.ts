import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import notificationsRouter from './routes/notifications';
import cronRouter from './routes/cron';
import authEmailsRouter from './routes/authEmails';
import { errorHandler } from './middleware/errorHandler';
import { firebaseAuth } from './middleware/firebaseAuth';
import { ensureUser } from './middleware/ensureUser';
import { requireAiQuota } from './middleware/aiQuota';
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

const corsMiddleware = cors({
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
});

app.use(corsMiddleware);
// Preflight pre všetky route používa rovnakú restrictive cors instanciu —
// bez tohto by `app.options('*', cors())` defaultne odpovedalo s wildcard origin.
app.options('*', corsMiddleware);

const frontendSources = allowedOrigins.length > 0 ? allowedOrigins : ["'self'"];
const isProduction = process.env.NODE_ENV === 'production';

app.use(
  helmet({
    // API beží na Renderi a frontend typicky na Netlify (CORS_ORIGIN).
    // Ak je frontend na rovnakom hoste, CORS_ORIGIN môže zostať prázdny a CSP
    // sa obmedzí na 'self'. Pri oddelenom fronte pridávame povolené origins,
    // aby prípadné same-server HTML/PWA odpovede mohli volať správny frontend/API host.
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: [
          "'self'",
          ...frontendSources,
          'https://identitytoolkit.googleapis.com',
          'https://securetoken.googleapis.com',
          'https://*.googleapis.com',
          'https://*.supabase.co',
        ],
        fontSrc: ["'self'", 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com'],
        manifestSrc: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        workerSrc: ["'self'", 'blob:'],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

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

// Cron endpoint — autentifikuje sa shared secretom (x-cron-secret), nie Firebase tokenom.
// Preto musí byť PRED firebaseAuth.
app.use('/api/cron', cronRouter);

// /api/auth/* — auth-related endpointy. Per-route middleware (verifikácia
// vyžaduje token+gate-skip, password reset je úplne unauth). Definované v
// samotnom routeri kvôli prehľadu a flexibilite per endpoint.
app.use('/api/auth', authEmailsRouter);

// Všetky ostatné /api/ endpointy vyžadujú platný Firebase ID token + email verified gate
app.use('/api/', firebaseAuth());

// Routes
app.use('/api/pets', ensureUser, petsRouter);
app.use('/api/health', ensureUser, healthRouter);
app.use('/api/account', ensureUser, accountRouter);
app.use('/api/notifications', ensureUser, notificationsRouter);
app.use('/api/analyze', aiHeavyLimiter, ensureUser, requireAiQuota(), analyzeRouter);
app.use('/api/episodes', ensureUser, episodesRouter);
app.use('/api/extract-text', aiHeavyLimiter, ensureUser, requireAiQuota(), extractTextRouter);
app.use('/api/food-safety', aiHeavyLimiter, ensureUser, requireAiQuota(), foodSafetyRouter);
app.use(
  '/api/interpret-passport',
  aiHeavyLimiter,
  ensureUser,
  requireAiQuota(),
  interpretPassportRouter
);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('Pawly server spustený', { port: PORT });
});
