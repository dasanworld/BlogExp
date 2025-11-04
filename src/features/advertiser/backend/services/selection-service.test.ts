import { describe, it, expect, vi, beforeEach } from 'vitest';
import { closeCampaign, selectApplicants } from './selection-service';

describe('closeCampaign', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
    };
  });

  it('should close campaign successfully', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { advertiser_id: 'advertiser-1', status: 'recruiting' },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

    const result = await closeCampaign(mockSupabase, 'advertiser-1', 'campaign-1');

    expect(result.ok).toBe(true);
  });

  it('should return 403 when user is not the advertiser', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { advertiser_id: 'advertiser-2', status: 'recruiting' },
            error: null,
          }),
        }),
      }),
    });

    const result = await closeCampaign(mockSupabase, 'advertiser-1', 'campaign-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.error.code).toBe('FORBIDDEN');
    }
  });

  it('should return 400 when campaign is not recruiting', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { advertiser_id: 'advertiser-1', status: 'closed' },
            error: null,
          }),
        }),
      }),
    });

    const result = await closeCampaign(mockSupabase, 'advertiser-1', 'campaign-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error.code).toBe('INVALID_STATUS');
    }
  });

  it('should return 404 when campaign not found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      }),
    });

    const result = await closeCampaign(mockSupabase, 'advertiser-1', 'campaign-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });
});

describe('selectApplicants', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
    };
  });

  it('should select applicants successfully', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { advertiser_id: 'advertiser-1', status: 'closed', total_slots: 10 },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              not: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

    const result = await selectApplicants(mockSupabase, 'advertiser-1', {
      campaignId: 'campaign-1',
      selectedApplicationIds: ['app-1', 'app-2'],
    });

    expect(result.ok).toBe(true);
  });

  it('should return 400 when selected count exceeds total slots', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { advertiser_id: 'advertiser-1', status: 'closed', total_slots: 5 },
            error: null,
          }),
        }),
      }),
    });

    const result = await selectApplicants(mockSupabase, 'advertiser-1', {
      campaignId: 'campaign-1',
      selectedApplicationIds: ['app-1', 'app-2', 'app-3', 'app-4', 'app-5', 'app-6'],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error.code).toBe('EXCEEDED_SLOTS');
    }
  });

  it('should return 400 when campaign already completed', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { advertiser_id: 'advertiser-1', status: 'selection_completed', total_slots: 10 },
            error: null,
          }),
        }),
      }),
    });

    const result = await selectApplicants(mockSupabase, 'advertiser-1', {
      campaignId: 'campaign-1',
      selectedApplicationIds: ['app-1'],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error.code).toBe('ALREADY_COMPLETED');
    }
  });

  it('should return 403 when user is not the advertiser', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { advertiser_id: 'advertiser-2', status: 'closed', total_slots: 10 },
            error: null,
          }),
        }),
      }),
    });

    const result = await selectApplicants(mockSupabase, 'advertiser-1', {
      campaignId: 'campaign-1',
      selectedApplicationIds: ['app-1'],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.error.code).toBe('FORBIDDEN');
    }
  });

  it('should return 404 when campaign not found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    });

    const result = await selectApplicants(mockSupabase, 'advertiser-1', {
      campaignId: 'campaign-1',
      selectedApplicationIds: ['app-1'],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });
});
