import { apiClient } from './api-client';
import { supabase } from './supabase';

// Mock supabase
jest.mock('./supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('apiClient', () => {
  const mockEndpoint = '/api/test';
  const mockUserData = { user: { id: '123' } };
  const mockError = new Error('Supabase error');

  beforeEach(() => {
    // Reset mocks before each test
    (supabase.auth.getUser as jest.Mock).mockReset();
    (fetch as jest.Mock).mockReset();
  });

  it('should make a successful GET request and return JSON data', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: mockUserData, error: null });
    const mockResponseData = { message: 'success' };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockResponseData,
    });

    const result = await apiClient(mockEndpoint);

    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      mockEndpoint,
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
    );
    expect(result).toEqual(mockResponseData);
  });

  it('should throw "Não autenticado" if supabase.auth.getUser returns an error', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null, error: mockError });

    await expect(apiClient(mockEndpoint)).rejects.toThrow('Não autenticado');
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should throw "Não autenticado" if supabase.auth.getUser returns no user data', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });

    await expect(apiClient(mockEndpoint)).rejects.toThrow('Não autenticado');
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should throw "Não autenticado" if fetch returns a 401 status', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: mockUserData, error: null });
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(apiClient(mockEndpoint)).rejects.toThrow('Não autenticado');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw "Erro na requisição: [statusText]" for non-2xx, non-401 responses', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: mockUserData, error: null });
    const statusText = 'Internal Server Error';
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: statusText,
    });

    await expect(apiClient(mockEndpoint)).rejects.toThrow(`Erro na requisição: ${statusText}`);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle network errors from fetch', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: mockUserData, error: null });
    const networkError = new Error('Network failed');
    (fetch as jest.Mock).mockRejectedValue(networkError);

    await expect(apiClient(mockEndpoint)).rejects.toThrow(networkError.message);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should use custom method, headers, and body from options', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: mockUserData, error: null });
    const mockResponseData = { id: 1, name: 'test' };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      json: async () => mockResponseData,
    });

    const postData = { name: 'test item' };
    const customOptions: RequestInit = {
      method: 'POST',
      headers: { 'X-Custom-Header': 'custom-value' },
      body: JSON.stringify(postData),
    };

    const result = await apiClient(mockEndpoint, customOptions);

    expect(fetch).toHaveBeenCalledWith(
      mockEndpoint,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value',
        },
        body: JSON.stringify(postData),
        credentials: 'include',
      })
    );
    expect(result).toEqual(mockResponseData);
  });

  it('should correctly merge and override Content-Type if provided in options', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: mockUserData, error: null });
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const customOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' }, // Override default
      body: '<xml></xml>',
    };

    await apiClient(mockEndpoint, customOptions);

    expect(fetch).toHaveBeenCalledWith(
      mockEndpoint,
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    );
  });
});
