import { withApiContext } from './api-handler';
import { NextResponse } from 'next/server';
import { getApiContext, ApiContext } from './api-context';

// Mock getApiContext
jest.mock('./api-context', () => ({
  getApiContext: jest.fn(),
}));

// Spy on NextResponse.json
const jsonSpy = jest.spyOn(NextResponse, 'json');

describe('withApiContext', () => {
  const mockApiContext: ApiContext = {
    db: {}, // Mock Prisma client or other context properties as needed
    user: null,
  };
  const mockRequest = new Request('http://localhost/api/test');

  beforeEach(() => {
    // Reset mocks before each test
    (getApiContext as jest.Mock).mockClear();
    jsonSpy.mockClear();
  });

  it('should call the handler with ApiContext, Request, and params, and return its result', async () => {
    const mockHandlerResult = { data: 'success' };
    const mockParams = { id: '123' };
    const mockHandler = jest.fn(async (context, request, params) => {
      expect(context).toBe(mockApiContext);
      expect(request).toBe(mockRequest);
      expect(params).toBe(mockParams);
      return mockHandlerResult;
    });

    (getApiContext as jest.Mock).mockReturnValue(mockApiContext);

    const wrappedHandler = withApiContext(mockHandler);
    await wrappedHandler(mockRequest, mockParams);

    expect(getApiContext).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(jsonSpy).toHaveBeenCalledWith(mockHandlerResult);
    // NextResponse.json defaults to status 200 if not specified
    // We can check the arguments if we want to be very specific
    // For example, if NextResponse.json was called with new NextResponse(JSON.stringify(mockHandlerResult), { status: 200, headers: { 'Content-Type': 'application/json' } })
    // But simply checking the first argument (the body) is often sufficient.
  });

  it('should return a 500 error response if the handler throws an error', async () => {
    const errorMessage = 'Handler error';
    const mockHandler = jest.fn(async () => {
      throw new Error(errorMessage);
    });

    (getApiContext as jest.Mock).mockReturnValue(mockApiContext);
    // Mock console.error to prevent actual logging during tests
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const wrappedHandler = withApiContext(mockHandler);
    await wrappedHandler(mockRequest);

    expect(getApiContext).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Internal server error' },
      { status: 500 }
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith('API error:', expect.any(Error));

    consoleErrorSpy.mockRestore(); // Restore console.error
  });

  it('should correctly pass request and params to the handler', async () => {
    const specificRequest = new Request('http://localhost/api/specific', { method: 'POST', body: JSON.stringify({ key: 'value' }) });
    const specificParams = { query: 'test' };
    const mockHandler = jest.fn(async (context, request, params) => {
      expect(request.method).toBe('POST');
      const body = await request.json();
      expect(body.key).toBe('value');
      expect(params.query).toBe('test');
      return { received: true };
    });

    (getApiContext as jest.Mock).mockReturnValue(mockApiContext);
    const wrappedHandler = withApiContext(mockHandler);
    await wrappedHandler(specificRequest, specificParams);

    expect(mockHandler).toHaveBeenCalledWith(mockApiContext, specificRequest, specificParams);
    expect(jsonSpy).toHaveBeenCalledWith({ received: true });
  });
});
