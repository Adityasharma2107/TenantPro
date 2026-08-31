// Keeps every browser-to-server request in one place and always includes the secure login cookie.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.message ?? 'Something went wrong. Please try again.', response.status);
  return data as T;
}
