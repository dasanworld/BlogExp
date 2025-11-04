export interface CampaignCard {
  id: string;
  title: string;
  businessName: string;
  category: string;
  location: string;
  recruitmentEndDate: string;
  totalSlots: number;
  applicantCount: number;
  daysLeft: number;
  thumbnailUrl: string | null;
}

export interface CampaignFilters {
  category?: string;
  location?: string;
}

export interface CampaignListResponse {
  campaigns: CampaignCard[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface CampaignDetailResponse {
  id: string;
  title: string;
  description: string;
  benefits: string;
  mission: string;
  location: string;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
  experienceStartDate: string;
  experienceEndDate: string;
  totalSlots: number;
  selectedCount: number;
  applicantCount: number;
  status: 'recruiting' | 'closed' | 'selection_completed';
  daysLeft: number;
  thumbnailUrl: string | null;
  advertiser: {
    businessName: string;
    category: string;
    location: string;
  };
  userApplicationStatus: 'not_applied' | 'pending' | 'selected' | 'rejected' | null;
}

export interface CreateApplicationRequest {
  applicationMessage: string;
  visitDate: string;
}

export interface CreateApplicationResponse {
  applicationId: string;
  campaignId: string;
  status: 'pending' | 'selected' | 'rejected';
  appliedAt: string;
  message: string;
}

export interface MyApplicationItem {
  applicationId: string;
  status: 'pending' | 'selected' | 'rejected';
  appliedAt: string;
  visitDate: string;
  applicationMessage: string;
  campaign: {
    id: string;
    title: string;
    businessName: string;
    category: string;
    location: string;
    recruitmentStartDate: string;
    recruitmentEndDate: string;
    experienceStartDate: string;
    experienceEndDate: string;
    status: 'recruiting' | 'closed' | 'selection_completed';
  };
}

export interface MyApplicationsStatusCount {
  pending: number;
  selected: number;
  rejected: number;
}

export interface MyApplicationsResponse {
  applications: MyApplicationItem[];
  statusCounts: MyApplicationsStatusCount;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
