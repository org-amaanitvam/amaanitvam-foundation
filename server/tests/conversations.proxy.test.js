import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

process.env.AI_SERVICE_URL = 'http://ai-service.test';
process.env.INTERNAL_SHARED_SECRET = 'test-shared-secret';

const axiosMock = jest.fn();
jest.unstable_mockModule('axios', () => ({ default: axiosMock }));

const proxyModule = await import('../src/modules/conversations/conversation.proxy.js');
const { proxyToAI } = proxyModule;

const authenticatedUser = { uid: 'verified-user-uid' };
let mockUser = authenticatedUser;

jest.unstable_mockModule('../src/middleware/authenticate.js', () => ({
  authenticate: (req, _res, next) => {
    if (!mockUser) {
      return next(new Error('Not authenticated'));
    }
    req.user = mockUser;
    next();
  },
}));

const proxyRouteMock = jest.fn(async () => ({ success: true, data: [] }));
jest.unstable_mockModule('../src/modules/conversations/conversation.proxy.js', () => ({
  proxyToAI: proxyRouteMock,
}));

const { default: conversationRoutes } = await import('../src/modules/conversations/conversation.routes.js');
const app = express();
app.use(express.json());
app.use('/api/conversations', conversationRoutes);
app.use((error, _req, res, _next) => res.status(500).json({ message: error.message }));

describe('AI conversation proxy', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    axiosMock.mockResolvedValue({ data: { success: true } });
  });

  it('sends the internal secret and verified Firebase UID headers', async () => {
    await proxyToAI('/api/conversations', 'GET', {}, 'verified-user-uid');

    expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({
      url: 'http://ai-service.test/api/conversations',
      headers: {
        'X-Internal-Secret': 'test-shared-secret',
        'X-Firebase-UID': 'verified-user-uid',
      },
    }));
  });

  it('rejects calls without an authenticated Firebase UID', async () => {
    await expect(proxyToAI('/api/conversations', 'GET')).rejects.toThrow(
      'Cannot call AI service without an authenticated Firebase UID',
    );
    expect(axiosMock).not.toHaveBeenCalled();
  });
});

describe('conversation route identity forwarding', () => {
  beforeEach(() => {
    mockUser = authenticatedUser;
    proxyRouteMock.mockClear();
  });

  it('creates a conversation using the authenticated UID', async () => {
    const response = await request(app)
      .post('/api/conversations')
      .send({ context_type: 'general' });

    expect(response.statusCode).toBe(201);
    expect(proxyRouteMock).toHaveBeenCalledWith(
      '/api/conversations',
      'POST',
      { context_type: 'general', context_id: null, context_label: null },
      'verified-user-uid',
    );
  });

  it('does not trust a firebase_uid query parameter from the client', async () => {
    await request(app).get('/api/conversations?firebase_uid=attacker-uid');

    expect(proxyRouteMock).toHaveBeenCalledWith(
      '/api/conversations?page=1&limit=20',
      'GET',
      {},
      'verified-user-uid',
    );
  });
});
