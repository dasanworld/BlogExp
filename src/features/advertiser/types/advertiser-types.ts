export interface Campaign {
  id: string;
  advertiserId: string;
  title: string;
  description: string;
  benefits: string;
  mission: string;
  location: string;
  imgLink?: string;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
  experienceStartDate: string;
  experienceEndDate: string;
  totalSlots: number;
  selectedCount: number;
  status: 'recruiting' | 'closed' | 'selection_completed';
  applicantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatusCounts {
  recruiting: number;
  closed: number;
  selection_completed: number;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  statusCounts: StatusCounts;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateCampaignRequest {
  title: string;
  description: string;
  benefits: string;
  mission: string;
  location: string;
  imgLink?: string;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
  experienceStartDate: string;
  experienceEndDate: string;
  totalSlots: number;
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  benefits?: string;
  mission?: string;
  location?: string;
  imgLink?: string;
  recruitmentStartDate?: string;
  recruitmentEndDate?: string;
  experienceStartDate?: string;
  experienceEndDate?: string;
  totalSlots?: number;
}

export interface CampaignDetailForAdvertiser {
  id: string;
  advertiserId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantChannel {
  id: string;
  channelType: string;
  channelName: string;
  channelUrl: string;
}

export interface ApplicantItem {
  applicationId: string;
  applicantId: string;
  applicantName: string;
  applicationMessage: string;
  visitDate: string;
  appliedAt: string;
  status: 'pending' | 'selected' | 'rejected';
  channels: ApplicantChannel[];
}

export interface ApplicantsResponse {
  applicants: ApplicantItem[];
  total: number;
}
