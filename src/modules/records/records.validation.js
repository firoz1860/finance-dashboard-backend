import { z } from 'zod';

const twoDecimalRule = /^\d+(\.\d{1,2})?$/;

const recordFieldsSchema = z.object({
  amount: z
    .number()
    .positive()
    .refine((value) => twoDecimalRule.test(value.toString()), 'Amount supports max 2 decimals'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1).max(50),
  date: z.coerce.date(),
  notes: z.string().max(1000).optional().nullable()
});

export const createRecordSchema = recordFieldsSchema.refine(
  (payload) => payload.date <= new Date(),
  'Date cannot be in the future'
);

export const updateRecordSchema = recordFieldsSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, 'At least one field is required');