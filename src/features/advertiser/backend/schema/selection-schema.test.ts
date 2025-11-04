import { describe, it, expect } from 'vitest';
import { SelectApplicantsRequestSchema } from './selection-schema';

describe('Selection Schemas', () => {
  describe('SelectApplicantsRequestSchema', () => {
    it('should validate valid select applicants request', () => {
      const validRequest = {
        campaignId: '550e8400-e29b-41d4-a716-446655440000',
        selectedApplicationIds: [
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
        ],
      };

      const result = SelectApplicantsRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject empty selectedApplicationIds', () => {
      const invalidRequest = {
        campaignId: '550e8400-e29b-41d4-a716-446655440000',
        selectedApplicationIds: [],
      };

      const result = SelectApplicantsRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID for campaignId', () => {
      const invalidRequest = {
        campaignId: 'invalid-id',
        selectedApplicationIds: ['550e8400-e29b-41d4-a716-446655440001'],
      };

      const result = SelectApplicantsRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID in selectedApplicationIds', () => {
      const invalidRequest = {
        campaignId: '550e8400-e29b-41d4-a716-446655440000',
        selectedApplicationIds: ['invalid-id'],
      };

      const result = SelectApplicantsRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should accept single selected application', () => {
      const validRequest = {
        campaignId: '550e8400-e29b-41d4-a716-446655440000',
        selectedApplicationIds: ['550e8400-e29b-41d4-a716-446655440001'],
      };

      const result = SelectApplicantsRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });
});
