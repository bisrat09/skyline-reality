describe('Anthropic Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates Anthropic client with API key', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
    const mod = await import('@/lib/anthropic');
    expect(mod.anthropic).toBeDefined();
    expect(mod.anthropic.messages).toBeDefined();
  });

  it('throws when API key is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    await expect(import('@/lib/anthropic')).rejects.toThrow(
      'Missing ANTHROPIC_API_KEY'
    );
  });
});
