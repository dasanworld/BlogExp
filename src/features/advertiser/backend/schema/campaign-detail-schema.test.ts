import { describe, it, expect } from 'vitest';
import {
  CampaignDetailForAdvertiserSchema,
  ApplicantItemSchema,
  ApplicantsResponseSchema,
} from './campaign-detail-schema';

describe('Campaign Detail Schemas', () => {
  describe('CampaignDetailForAdvertiserSchema', () => {
    it('should validate valid campaign detail', () => {
      const validCampaign = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        advertiserId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Campaign',
        description: 'Test Description',
        benefits: 'Test Benefits',
        mission: 'Test Mission',
        location: 'Seoul, Korea',
        recruitmentStartDate: '2025-01-01T00:00:00Z',
        recruitmentEndDate: '2025-01-31T00:00:00Z',
        experienceStartDate: '2025-02-01',
        experienceEndDate: '2025-02-28',
        totalSlots: 10,
        selectedCount: 5,
        applicantCount: 8,
        status: 'recruiting',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = CampaignDetailForAdvertiserSchema.safeParse(validCampaign);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidCampaign = {
        id: 'invalid-id',
        advertiserId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Campaign',
        description: 'Test Description',
        benefits: 'Test Benefits',
        mission: 'Test Mission',
        location: 'Seoul, Korea',
        recruitmentStartDate: '2025-01-01T00:00:00Z',
        recruitmentEndDate: '2025-01-31T00:00:00Z',
        experienceStartDate: '2025-02-01',
        experienceEndDate: '2025-02-28',
        totalSlots: 10,
        selectedCount: 5,
        applicantCount: 8,
        status: 'recruiting',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = CampaignDetailForAdvertiserSchema.safeParse(invalidCampaign);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const invalidCampaign = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        advertiserId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Campaign',
        description: 'Test Description',
        benefits: 'Test Benefits',
        mission: 'Test Mission',
        location: 'Seoul, Korea',
        recruitmentStartDate: '2025-01-01T00:00:00Z',
        recruitmentEndDate: '2025-01-31T00:00:00Z',
        experienceStartDate: '2025-02-01',
        experienceEndDate: '2025-02-28',
        totalSlots: 10,
        selectedCount: 5,
        applicantCount: 8,
        status: 'invalid_status',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = CampaignDetailForAdvertiserSchema.safeParse(invalidCampaign);
      expect(result.success).toBe(false);
    });
  });

  describe('ApplicantItemSchema', () => {
    it('should validate valid applicant item', () => {
      const validApplicant = {
        applicationId: '550e8400-e29b-41d4-a716-446655440000',
        applicantId: '550e8400-e29b-41d4-a716-446655440001',
        applicantName: 'John Doe',
        applicationMessage: 'I want to participate',
        visitDate: '2025-02-01',
        appliedAt: '2025-01-15T10:00:00Z',
        status: 'pending',
        channels: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            channelType: 'instagram',
            channelName: 'john_doe',
            channelUrl: 'https://instagram.com/john_doe',
          },
        ],
      };

      const result = ApplicantItemSchema.safeParse(validApplicant);
      expect(result.success).toBe(true);
    });

    it('should reject invalid applicant status', () => {
      const invalidApplicant = {
        applicationId: '550e8400-e29b-41d4-a716-446655440000',
        applicantId: '550e8400-e29b-41d4-a716-446655440001',
        applicantName: 'John Doe',
        applicationMessage: 'I want to participate',
        visitDate: '2025-02-01',
        appliedAt: '2025-01-15T10:00:00Z',
        status: 'invalid_status',
        channels: [],
      };

      const result = ApplicantItemSchema.safeParse(invalidApplicant);
      expect(result.success).toBe(false);
    });
  });

  describe('ApplicantsResponseSchema', () => {
    it('should validate valid applicants response', () => {
      const validResponse = {
        applicants: [
          {
            applicationId: '550e8400-e29b-41d4-a716-446655440000',
            applicantId: '550e8400-e29b-41d4-a716-446655440001',
            applicantName: 'John Doe',
            applicationMessage: 'I want to participate',
            visitDate: '2025-02-01',
            appliedAt: '2025-01-15T10:00:00Z',
            status: 'pending',
            channels: [],
          },
        ],
        total: 1,
      };

      const result = ApplicantsResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate empty applicants response', () => {
      const validResponse = {
        applicants: [],
        total: 0,
      };

      const result = ApplicantsResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});
