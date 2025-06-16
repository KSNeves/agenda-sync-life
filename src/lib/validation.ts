
import { z } from 'zod';

// Validation schemas for user inputs
export const createRevisionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
});

export const createFlashcardSchema = z.object({
  front: z.string().min(1, 'Front text is required').max(500, 'Front text too long'),
  back: z.string().min(1, 'Back text is required').max(500, 'Back text too long'),
  deck_id: z.string().min(1, 'Deck ID is required'),
});

export const createDeckSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  start_time: z.number().min(0, 'Invalid start time'),
  end_time: z.number().min(0, 'Invalid end time'),
  type: z.enum(['study', 'revision', 'break', 'other']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

// Sanitization helpers
export const sanitizeHtml = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateAndSanitize = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const validated = schema.parse(data);
  
  // Sanitize string fields
  if (typeof validated === 'object' && validated !== null) {
    const sanitized = { ...validated };
    Object.keys(sanitized).forEach(key => {
      const value = (sanitized as any)[key];
      if (typeof value === 'string') {
        (sanitized as any)[key] = sanitizeHtml(value);
      }
    });
    return sanitized;
  }
  
  return validated;
};
