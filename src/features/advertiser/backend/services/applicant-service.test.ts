import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getApplicants } from './applicant-service';

describe('getApplicants', () => {
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

    const result = await getApplicants(mockSupabase, 'advertiser-1', 'campaign-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });

  it('should return 403 when user is not the advertiser', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { advertiser_id: 'advertiser-2' },
            error: null,
          }),
        }),
      }),
    });

    const result = await getApplicants(mockSupabase, 'advertiser-1', 'campaign-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.error.code).toBe('FORBIDDEN');
    }
  });
});
