/**
 * @jest-environment node
 */

describe('Vapi client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws if VAPI_API_KEY is missing', () => {
    delete process.env.VAPI_API_KEY;
    expect(() => require('@/lib/vapi')).toThrow('Missing VAPI_API_KEY');
  });

  it('creates client when VAPI_API_KEY is set', () => {
    process.env.VAPI_API_KEY = 'test-key';
    const { vapi } = require('@/lib/vapi');
    expect(vapi).toBeDefined();
  });

  it('exports vapi with getCall method', () => {
    process.env.VAPI_API_KEY = 'test-key';
    const { vapi } = require('@/lib/vapi');
    expect(typeof vapi.getCall).toBe('function');
  });

  it('exports vapi with listCalls method', () => {
    process.env.VAPI_API_KEY = 'test-key';
    const { vapi } = require('@/lib/vapi');
    expect(typeof vapi.listCalls).toBe('function');
  });

  it('getCall calls correct endpoint', async () => {
    process.env.VAPI_API_KEY = 'test-key';
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'call-123' }),
    });
    global.fetch = mockFetch;

    const { vapi } = require('@/lib/vapi');
    await vapi.getCall('call-123');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.vapi.ai/call/call-123',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      })
    );
  });
});
