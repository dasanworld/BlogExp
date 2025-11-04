import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCampaignDetail } from './campaign-detail-service';

describe('getCampaignDetail', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
    };
  });

  it('should return 404 when campaign not found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      }),
    });

    const result = await getCampaignDetail(mockSupabase, 'advertiser-1', 'campaign-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });

  it('should return 403 when user is not the advertiser', async () => {
    const mockCampaign = {
      id: 'campaign-1',
      advertiser_id: 'advertiser-2',
      title: 'Test Campaign',
      description: 'Test Description',
      benefits: 'Test Benefits',
      mission: 'Test Mission',
      location: 'Test Location',
      recruitment_start_date: '2025-01-01T00:00:00Z',
      recruitment_end_date: '2025-01-31T00:00:00Z',
      experience_start_date: '2025-02-01',
      experience_end_date: '2025-02-28',
      total_slots: 10,
      selected_count: 0,
      applicant_count: [{ count: 5 }],
      status: 'recruiting',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockCampaign, error: null }),
        }),
      }),
    });

    const result = await getCampaignDetail(mockSupabase, 'advertiser-1', 'campaign-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.error.code).toBe('FORBIDDEN');
    }
  });
});
