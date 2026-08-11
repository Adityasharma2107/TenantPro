import type { ErrorRequestHandler, RequestHandler } from 'express';

// Gives unknown API URLs a predictable JSON response instead of an HTML error page.
export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({ message: `Route ${request.method} ${request.originalUrl} was not found.` });
};

// Converts unexpected errors into a safe response and keeps implementation details on the server.
export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error('Unhandled API error:', error);

  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    return response.status(409).json({ message: 'A record with that value already exists.' });
  }

  return response.status(500).json({ message: 'Something went wrong on the server.' });
};
