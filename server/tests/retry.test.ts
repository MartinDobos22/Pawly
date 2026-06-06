import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { withRetry } from '../src/utils/retry';

test('withRetry: úspešné volanie na prvý pokus', async () => {
  let calls = 0;
  const result = await withRetry(async () => {
    calls += 1;
    return 'ok';
  });
  assert.equal(result, 'ok');
  assert.equal(calls, 1);
});

test('withRetry: tranzientná chyba sa retry-uje a uspeje', async () => {
  let calls = 0;
  const result = await withRetry(
    async () => {
      calls += 1;
      if (calls < 3) {
        const err = new Error('fetch failed') as Error & { code?: string };
        err.code = 'ECONNRESET';
        throw err;
      }
      return 'after-retry';
    },
    { baseDelayMs: 1, attempts: 3 }
  );
  assert.equal(result, 'after-retry');
  assert.equal(calls, 3);
});

test('withRetry: validačná chyba sa NEretryuje', async () => {
  let calls = 0;
  const err = new Error('validation failed') as Error & { status: number };
  err.status = 400;

  await assert.rejects(
    withRetry(
      async () => {
        calls += 1;
        throw err;
      },
      { baseDelayMs: 1, attempts: 3 }
    ),
    /validation failed/
  );
  assert.equal(calls, 1, 'non-transient sa nemá retry-ovať');
});

test('withRetry: po vyčerpaní pokusov hodí poslednú chybu', async () => {
  let calls = 0;
  const err = new Error('persistent timeout') as Error & { code?: string };
  err.code = 'ETIMEDOUT';

  await assert.rejects(
    withRetry(
      async () => {
        calls += 1;
        throw err;
      },
      { baseDelayMs: 1, attempts: 3 }
    ),
    /persistent timeout/
  );
  assert.equal(calls, 3);
});

test('withRetry: 5xx status sa retry-uje', async () => {
  let calls = 0;
  const result = await withRetry(
    async () => {
      calls += 1;
      if (calls === 1) {
        const err = new Error('upstream') as Error & { status: number };
        err.status = 503;
        throw err;
      }
      return 'ok';
    },
    { baseDelayMs: 1, attempts: 3 }
  );
  assert.equal(result, 'ok');
  assert.equal(calls, 2);
});
