import type { RequestHandler } from 'express';

/**
 * Sanitizes input against NoSQL injection and XSS by:
 * 1. Recursively removing any keys starting with '$' or containing '.' (MongoDB operators).
 * 2. Neutralizing dangerous HTML/script injection from string fields.
 * 3. Guarding against prototype pollution (__proto__, constructor, prototype).
 */
const sanitizeValue = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    // Neutralize dangerous script injection patterns while preserving valid user characters
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object') {
    const cleanObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      // Reject prototype pollution keys and keys starting with '$' or containing '.'
      if (
        key === '__proto__' ||
        key === 'constructor' ||
        key === 'prototype' ||
        key.startsWith('$') ||
        key.includes('.')
      ) {
        continue;
      }
      cleanObj[key] = sanitizeValue(val);
    }
    return cleanObj;
  }

  return value;
};

const sanitizeObjectInPlace = (obj: any): void => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (
      key === '__proto__' ||
      key === 'constructor' ||
      key === 'prototype' ||
      key.startsWith('$') ||
      key.includes('.')
    ) {
      try {
        delete obj[key];
      } catch {
        // ignore if non-configurable
      }
      continue;
    }

    const val = obj[key];
    if (typeof val === 'string') {
      try {
        obj[key] = val
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } catch {
        // ignore if read-only
      }
    } else if (Array.isArray(val)) {
      try {
        obj[key] = val.map(sanitizeValue);
      } catch {
        // ignore if read-only
      }
    } else if (val && typeof val === 'object') {
      sanitizeObjectInPlace(val);
    }
  }
};

export const sanitizeInput: RequestHandler = (req, _res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      sanitizeObjectInPlace(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      sanitizeObjectInPlace(req.query);
    }

    if (req.params && typeof req.params === 'object') {
      sanitizeObjectInPlace(req.params);
    }
  } catch {
    // Ensure request lifecycle never crashes from sanitization edge cases
  }

  next();
};
