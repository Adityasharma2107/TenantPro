// Keeps every browser-to-server request in one place and always includes the secure login cookie.
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://tenantpro-c06g.onrender.com';
  }
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

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

export async function uploadImagesRequest(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.message ?? 'Image upload failed.', response.status);
  return (data.urls as string[]) ?? [];
}

