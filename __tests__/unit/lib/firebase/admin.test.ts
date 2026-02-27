describe('Firebase Admin', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      FIREBASE_ADMIN_PROJECT_ID: 'test-project',
      FIREBASE_ADMIN_CLIENT_EMAIL: 'test@test.iam.gserviceaccount.com',
      FIREBASE_ADMIN_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----\\n',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('initializes admin app with credentials', async () => {
    const admin = (await import('firebase-admin')).default;
    admin.apps = [];
    await import('@/lib/firebase/admin');
    expect(admin.initializeApp).toHaveBeenCalled();
  });

  it('returns admin firestore instance', async () => {
    const admin = (await import('firebase-admin')).default;
    admin.apps = [];
    await import('@/lib/firebase/admin');
    expect(admin.firestore).toHaveBeenCalled();
  });

  it('reuses existing admin app', async () => {
    const admin = (await import('firebase-admin')).default;
    admin.apps = [{}] as unknown[];
    await import('@/lib/firebase/admin');
    expect(admin.initializeApp).not.toHaveBeenCalled();
  });

  it('throws when credentials are missing', async () => {
    delete process.env.FIREBASE_ADMIN_PROJECT_ID;
    const admin = (await import('firebase-admin')).default;
    admin.apps = [];
    await expect(import('@/lib/firebase/admin')).rejects.toThrow(
      'Missing Firebase Admin credentials'
    );
  });
});
