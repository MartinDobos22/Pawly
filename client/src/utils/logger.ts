type LogLevel = 'INFO' | 'WARN' | 'ERROR';

function formatMetadata(metadata?: Record<string, unknown>): string {
  if (!metadata || Object.keys(metadata).length === 0) {
    return '';
  }

  return ` ${JSON.stringify(metadata)}`;
}

// V PROD potlačíme INFO šum, WARN/ERROR ostávajú (zachytí ich neskôr Sentry
// alebo podobný hook). DEV chceme plný INFO výpis pre debug.
const SILENCE_INFO_IN_PROD = import.meta.env.PROD;

function log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
  if (level === 'INFO' && SILENCE_INFO_IN_PROD) return;

  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [FE] [${level}] ${message}${formatMetadata(metadata)}`;

  if (level === 'ERROR') {
    console.error(entry);
    return;
  }

  if (level === 'WARN') {
    console.warn(entry);
    return;
  }

  console.log(entry);
}

export const logger = {
  info: (message: string, metadata?: Record<string, unknown>) => log('INFO', message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) => log('WARN', message, metadata),
  error: (message: string, metadata?: Record<string, unknown>) => log('ERROR', message, metadata),
};
