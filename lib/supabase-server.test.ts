import { createServerClient as actualCreateServerClient } from '@supabase/ssr'; // For type if needed
import { cookies as actualCookies } from 'next/headers'; // For type if needed

// Mock @supabase/ssr
const mockSupabaseCreateServerClient = jest.fn();
jest.mock('@supabase/ssr', () => ({
  createServerClient: mockSupabaseCreateServerClient,
}));

// Mock next/headers
const mockCookieStoreGetAll = jest.fn();
const mockCookieStoreSet = jest.fn();
const mockCookies = jest.fn(() => ({
  getAll: mockCookieStoreGetAll,
  set: mockCookieStoreSet,
}));
jest.mock('next/headers', () => ({
  cookies: mockCookies,
}));

describe('Supabase Server Client (lib/supabase-server.ts)', () => {
  const OLD_ENV = process.env;
  const mockSupabaseURL = 'http://test-server-supabase-url.com';
  const mockSupabaseAnonKey = 'test-server-supabase-anon-key';
  let createClient: () => Promise<any>; // To store the re-required function

  beforeEach(() => {
    jest.resetModules(); // Reset modules to re-evaluate with new env vars or fresh mocks

    // Clear mocks
    mockSupabaseCreateServerClient.mockClear();
    mockCookies.mockClear();
    mockCookieStoreGetAll.mockClear();
    mockCookieStoreSet.mockClear();

    process.env = {
      ...OLD_ENV,
      NEXT_PUBLIC_SUPABASE_URL: mockSupabaseURL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: mockSupabaseAnonKey,
    };

    // Re-require the module under test to get the version with fresh mocks
    createClient = require('./supabase-server').createClient;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should call createServerClient with correct URL, key, and cookie handlers', async () => {
    const mockCookieData = [{ name: 'test-cookie', value: 'test-value' }];
    mockCookieStoreGetAll.mockReturnValue(mockCookieData);

    // We expect createServerClient to be called, and we can capture its options for cookies
    let capturedCookieHandlers: any;
    mockSupabaseCreateServerClient.mockImplementation((url, key, options) => {
      capturedCookieHandlers = options.cookies;
      return { /* mock client object */ };
    });

    await createClient();

    expect(mockCookies).toHaveBeenCalledTimes(1);
    expect(mockSupabaseCreateServerClient).toHaveBeenCalledTimes(1);
    expect(mockSupabaseCreateServerClient).toHaveBeenCalledWith(
      mockSupabaseURL,
      mockSupabaseAnonKey,
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );

    // Test the getAll handler
    expect(capturedCookieHandlers.getAll()).toEqual(mockCookieData);
    expect(mockCookieStoreGetAll).toHaveBeenCalledTimes(1); // Called by our captured handler

    // Test the setAll handler - successful case
    const cookiesToSet = [{ name: 'new-cookie', value: 'new-value', options: { path: '/' } }];
    capturedCookieHandlers.setAll(cookiesToSet);
    expect(mockCookieStoreSet).toHaveBeenCalledTimes(1);
    expect(mockCookieStoreSet).toHaveBeenCalledWith(cookiesToSet[0].name, cookiesToSet[0].value, cookiesToSet[0].options);
  });

  it('setAll cookie handler should catch and ignore errors from cookieStore.set', async () => {
    let capturedCookieHandlers: any;
    mockSupabaseCreateServerClient.mockImplementation((url, key, options) => {
      capturedCookieHandlers = options.cookies;
      return { /* mock client object */ };
    });

    mockCookieStoreSet.mockImplementation(() => {
      throw new Error('Failed to set cookie');
    });

    await createClient(); // Initialize and capture handlers

    const cookiesToSet = [{ name: 'error-cookie', value: 'error-value', options: {} }];

    // Expect no error to be thrown from setAll
    expect(() => capturedCookieHandlers.setAll(cookiesToSet)).not.toThrow();
    expect(mockCookieStoreSet).toHaveBeenCalledTimes(1); // Still called
  });

  it('should use undefined for URL and Key if environment variables are not set', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Ensure a complete module reset just before re-requiring for this specific test case
    jest.resetModules();
    // Re-require the module to pick up changed env *within this test's scope*
    // This ensures that the supabaseUrl and supabaseAnonKey constants inside supabase-server.ts
    // are evaluated with the modified process.env for this specific test.
    const { createClient: createClientLocal } = require('./supabase-server');
    await createClientLocal();

    expect(mockSupabaseCreateServerClient).toHaveBeenCalledWith(
      undefined,
      undefined,
      expect.anything()
    );
  });
});
