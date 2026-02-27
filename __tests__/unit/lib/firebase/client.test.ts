jest.mock('firebase/app', () => ({
  initializeApp: jest.fn().mockReturnValue({ name: '[DEFAULT]' }),
  getApps: jest.fn().mockReturnValue([]),
  getApp: jest.fn().mockReturnValue({ name: '[DEFAULT]' }),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn().mockReturnValue({}),
}));

describe('Firebase Client', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('initializes firebase app', async () => {
    const { getApps } = require('firebase/app');
    getApps.mockReturnValue([]);
    await import('@/lib/firebase/client');
    const { initializeApp } = require('firebase/app');
    expect(initializeApp).toHaveBeenCalled();
  });

  it('returns firestore instance', async () => {
    const { getApps } = require('firebase/app');
    getApps.mockReturnValue([]);
    await import('@/lib/firebase/client');
    const { getFirestore } = require('firebase/firestore');
    expect(getFirestore).toHaveBeenCalled();
  });

  it('reuses existing app on subsequent calls', async () => {
    const { getApps, initializeApp } = require('firebase/app');
    getApps.mockReturnValue([{ name: '[DEFAULT]' }]);
    await import('@/lib/firebase/client');
    expect(initializeApp).not.toHaveBeenCalled();
  });
});
