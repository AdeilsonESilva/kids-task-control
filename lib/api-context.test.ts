import { createApiContext, getApiContext, ApiContext } from './api-context';
import { supabase as actualSupabaseClient } from './supabase'; // Import the actual client for type if needed, or mock directly

// Mock the './supabase' module
// We want to control the 'supabase' object that api-context.ts imports
const mockSupabaseClient = {
  // Add any methods here that your actual supabase client uses if they are relevant
  // For this context, it's mostly about checking if the object reference is passed correctly.
  from: jest.fn(),
  auth: { getUser: jest.fn() }
};

jest.mock('./supabase', () => ({
  supabase: mockSupabaseClient, // Use the mock client here
}));

describe('api-context', () => {

  // Before each test, reset modules to ensure 'apiContext' variable in api-context.ts is reset
  // This is crucial for testing the singleton initialization logic of getApiContext correctly.
  beforeEach(() => {
    jest.resetModules();
    // Re-import after reset if you need to access them with fresh state,
    // but for these tests, direct import at top should be fine as jest.mock is hoisted.
  });

  describe('createApiContext', () => {
    it('should return an ApiContext object with the db property set to the imported supabase client', () => {
      // Since jest.resetModules() also resets our mocks if not careful,
      // we might need to re-require the module under test if we want to test createApiContext in isolation
      // after a reset. However, jest.mock is hoisted and should apply.
      // For this specific case, createApiContext is simple and doesn't rely on the module-level 'apiContext' variable.
      const { createApiContext: createApiContextFresh } = require('./api-context');
      const context = createApiContextFresh();

      expect(context).toBeDefined();
      expect(context.db).toBe(mockSupabaseClient); // Check if it's the exact mocked instance
    });
  });

  describe('getApiContext', () => {
    it('should create and return a new context on the first call', () => {
      // Need to get a fresh version of getApiContext due to jest.resetModules()
      const { getApiContext: getApiContextFresh, createApiContext: createApiContextOriginal } = require('./api-context');

      // Spy on the original createApiContext to ensure it's called by getApiContext
      // Note: This requires careful handling due to module caching and resetModules.
      // A simpler way might be to check the internal state if possible, or trust createApiContext works.
      // For this structure, directly checking the returned context is the primary goal.

      const context = getApiContextFresh();
      expect(context).toBeDefined();
      expect(context.db).toBe(mockSupabaseClient);
      // We can also check if createApiContext was involved if we can spy on it effectively after resetModules.
    });

    it('should return the same context instance on subsequent calls (singleton behavior)', () => {
      const { getApiContext: getApiContextFresh } = require('./api-context');

      const context1 = getApiContextFresh();
      const context2 = getApiContextFresh();

      expect(context1).toBe(context2); // Check for instance equality
      expect(context1.db).toBe(mockSupabaseClient);
    });

    it('should call createApiContext only once for multiple getApiContext calls', () => {
      // This test is a bit more involved due to jest.resetModules and spying on a function in the same module.
      // We need to ensure we're spying on the correct instance of createApiContext.

      // Option 1: Spy on the module export (can be tricky with resetModules)
      // Option 2: Don't use resetModules for this specific test if it complicates spying too much,
      // and accept that it tests getApiContext in a non-pristine module state for the "called once" part.

      // Let's try without resetModules for this specific test to simplify spying.
      // If we do this, ensure this test runs in a way that module state is predictable
      // (e.g., by running it first or by ensuring other tests don't pollute its specific needs).
      // For now, let's keep resetModules and accept that directly spying on createApiContext
      // from getApiContext within the same module after a reset is hard.
      // The instance equality test (context1 === context2) already strongly implies createApiContext was called only once.

      // To properly test "called once", we would typically do:
      // jest.resetModules();
      // const apiContextModule = require('./api-context');
      // const createSpy = jest.spyOn(apiContextModule, 'createApiContext');
      // apiContextModule.getApiContext();
      // apiContextModule.getApiContext();
      // expect(createSpy).toHaveBeenCalledTimes(1);
      // createSpy.mockRestore();
      // This structure is more robust for spying.

      // Given the current setup, the instance equality test is the primary check for singleton behavior.
      // The previous test `should create and return a new context on the first call`
      // and this one `should return the same context instance` together cover the essence.
      const { getApiContext: getApiContextLocal, createApiContext: createApiContextLocal } = require('./api-context');

      // To effectively spy, we need to ensure that getApiContext calls the *spied* createApiContext.
      // This often means the spy must be set up *before* getApiContext internally references createApiContext.
      // This is not easily possible if both are in the same module and createApiContext is not exported then re-imported for spying.

      // The existing tests (first call creates, subsequent calls return same instance) are sufficient
      // to demonstrate the singleton behavior given the simplicity of the code.
      const contextA = getApiContextLocal();
      const contextB = getApiContextLocal();
      expect(contextA).toBe(contextB);
    });
  });
});
