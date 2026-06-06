import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import type { Request, Response } from 'express';
import { errorHandler } from '../src/middleware/errorHandler';

type CapturedResponse = {
  status: number;
  body: unknown;
};

function mockRes(): { res: Response; captured: CapturedResponse } {
  const captured: CapturedResponse = { status: 0, body: null };
  const res = {
    status(code: number) {
      captured.status = code;
      return this;
    },
    json(body: unknown) {
      captured.body = body;
      return this;
    },
  } as unknown as Response;
  return { res, captured };
}

const mockReq = { method: 'POST', originalUrl: '/api/test' } as Request;

test('errorHandler: default 500 + message', () => {
  const { res, captured } = mockRes();
  errorHandler(new Error('boom'), mockReq, res, () => {});
  assert.equal(captured.status, 500);
  assert.deepEqual(captured.body, {
    error: { message: 'boom' },
    status: 500,
  });
});

test('errorHandler: rešpektuje vlastný status z err.status', () => {
  const err = new Error('not found') as Error & { status: number };
  err.status = 404;
  const { res, captured } = mockRes();
  errorHandler(err, mockReq, res, () => {});
  assert.equal(captured.status, 404);
});

test('errorHandler: pridá code keď je nastavený', () => {
  const err = new Error('limit exceeded') as Error & { status: number; code: string };
  err.status = 429;
  err.code = 'DAILY_AI_LIMIT';
  const { res, captured } = mockRes();
  errorHandler(err, mockReq, res, () => {});
  const body = captured.body as { error: { message: string; code: string } };
  assert.equal(body.error.code, 'DAILY_AI_LIMIT');
});

test('errorHandler: prázdny message → fallback string', () => {
  const err = new Error('');
  const { res, captured } = mockRes();
  errorHandler(err, mockReq, res, () => {});
  const body = captured.body as { error: { message: string } };
  assert.ok(body.error.message.length > 0, 'message má mať fallback');
});
