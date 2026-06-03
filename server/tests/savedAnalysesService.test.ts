import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import test from 'node:test';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

test('createSavedAnalysis returns NOT_FOUND and does not insert when pet belongs to another user', async () => {
  const requests: Array<{ method: string; url: string; body: string }> = [];

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const body = await readBody(req);
    requests.push({ method: req.method ?? '', url: req.url ?? '', body });

    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && req.url?.startsWith('/rest/v1/pets')) {
      res.statusCode = 200;
      res.end('[]');
      return;
    }

    if (req.method === 'POST' && req.url?.startsWith('/rest/v1/saved_analyses')) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'saved_analyses insert should not be called' }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'unexpected request' }));
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const address = server.address();
    assert(address && typeof address === 'object');
    process.env.SUPABASE_URL = `http://127.0.0.1:${address.port}`;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    (globalThis as typeof globalThis & { WebSocket?: unknown }).WebSocket = class TestWebSocket {};

    const { createSavedAnalysis } = await import('../src/services/savedAnalysesService');

    await assert.rejects(
      () =>
        createSavedAnalysis('owner-user-id', {
          petProfileId: 'foreign-pet-id',
          result: {
            score: 90,
            pros: [],
            cons: [],
            recommendation: { suitableFor: [], notRecommendedFor: [] },
            ingredients: [],
            summary: 'Test result',
            allergenWarnings: [],
            healthWarnings: [],
          },
        }),
      (err: unknown) => {
        assert.equal((err as { status?: number }).status, 404);
        assert.equal((err as { code?: string }).code, 'NOT_FOUND');
        assert.equal((err as { message?: string }).message, 'Zviera sa nenašlo.');
        return true;
      }
    );

    assert.equal(requests.length, 1);
    assert.equal(requests[0].method, 'GET');
    assert.match(requests[0].url, /^\/rest\/v1\/pets\?/);
    assert.match(requests[0].url, /user_id=eq\.owner-user-id/);
    assert.match(requests[0].url, /id=eq\.foreign-pet-id/);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});
