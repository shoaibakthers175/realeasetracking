export type UserRole = 'ADMIN' | 'QA_LEAD' | 'QA_ENGINEER' | 'VIEWER';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UniversityType = 'STANDALONE' | 'MULTI_TENANT';
export type UniversityStatus = 'ACTIVE' | 'INACTIVE';
export type Environment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

export interface University {
  _id: string;
  name: string;
  code: string;
  type: UniversityType;
  primaryEnvironment: Environment;
  productionUrl?: string;
  stagingUrl?: string;
  developmentUrl?: string;
  tenantId?: string;
  status: UniversityStatus;
  logoUrl?: string;
  location?: string;
  contactEmail?: string;
  notes?: string;
  featuresLiveCount?: number;
  latestRelease?: {
    id: string;
    title: string;
    date: string;
    time: string;
    featureName: string;
    releaseType: string;
    environment: Environment;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export type FeatureCategory =
  | 'ADMISSION'
  | 'PAYMENTS'
  | 'LEAD_MANAGEMENT'
  | 'COMMUNICATION'
  | 'ANALYTICS'
  | 'CORE'
  | 'INTEGRATION'
  | 'OTHER';

export interface Feature {
  _id: string;
  name: string;
  code: string;
  category: FeatureCategory;
  description?: string;
  isActive: boolean;
  liveUniversitiesCount?: number;
  liveUniversities?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ReleaseType =
  | 'FEATURE'
  | 'ENHANCEMENT'
  | 'BUG_FIX'
  | 'HOTFIX'
  | 'CONFIGURATION_CHANGE'
  | 'CONTENT_CHANGE'
  | 'MIGRATION'
  | 'OTHER';

export type ReleaseStatus = 'DRAFT' | 'IN_PROGRESS' | 'LIVE' | 'ROLLED_BACK' | 'CANCELLED';

export interface Release {
  _id: string;
  university: University | any;
  feature: Feature | any;
  title: string;
  description?: string;
  releaseType: ReleaseType;
  environment: Environment;
  releaseDate: string;
  releaseTime: string;
  status: ReleaseStatus;
  version?: string;
  deployedBy?: string;
  releasedBy?: any;
  bugTickets?: BugTicket[];
  sanityReports?: SanityReport[];
  leads?: Lead[];
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    mimeType?: string;
  }>;
  rolledBackAt?: string;
  rollbackReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type BugPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type BugStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';

export interface BugTicket {
  _id: string;
  ticketId: string;
  title: string;
  description?: string;
  jiraUrl?: string;
  priority: BugPriority;
  status: BugStatus;
  university?: University | any;
  release?: Release | any;
  createdDate: string;
  resolvedDate?: string;
  reportedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type SanityStatus = 'NOT_TESTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'PARTIAL';

export interface SanityReport {
  _id: string;
  title: string;
  release?: Release | any;
  university?: University | any;
  sanityStatus: SanityStatus;
  testedBy: string;
  testDate: string;
  testTime?: string;
  environment: Environment;
  totalTestCases: number;
  passed: number;
  failed: number;
  blocked: number;
  notes?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    mimeType?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type LeadSource = 'Website' | 'Campaign' | 'Portal' | 'API' | 'Social' | 'Direct' | 'Offline';
export type IntegrationStatus = 'CREATED' | 'NOT_CREATED' | 'PENDING' | 'ERROR';
export type VerificationStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface Lead {
  _id: string;
  leadId: string;
  university: University | any;
  release?: Release | any;
  program: string;
  form?: string;
  environment: Environment;
  generatedAt: string;
  source: LeadSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  lsqStatus: IntegrationStatus;
  opportunityStatus: IntegrationStatus;
  erpStatus: IntegrationStatus;
  verificationStatus: VerificationStatus;
  leadEmail?: string;
  leadPhone?: string;
  notes?: string;
  rawPayload?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  event: string;
  performedBy?: any;
  userName: string;
  userRole: string;
  entityType: string;
  entityId?: any;
  entityTitle?: string;
  details?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'RELEASE' | 'BUG' | 'SANITY' | 'SYSTEM' | 'ALERT';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  link?: string;
  readBy: string[];
  createdAt: string;
}

export interface FeatureMatrixData {
  universities: Array<{
    id: string;
    code: string;
    name: string;
    type: UniversityType;
  }>;
  features: Array<{
    featureId: string;
    featureName: string;
    featureCode: string;
    category: FeatureCategory;
    universities: Record<string, boolean>;
    totalLiveCount: number;
  }>;
  environment: Environment;
}

export interface DashboardData {
  kpi: {
    totalUniversities: { value: number; trend: string; subtext: string; isPositive: boolean };
    liveReleases: { value: number; trend: string; subtext: string; isPositive: boolean };
    featuresLive: { value: number; trend: string; subtext: string; isPositive: boolean };
    bugFixes: { value: number; trend: string; subtext: string; isPositive: boolean };
    sanityTests: { value: number; trend: string; subtext: string; isPositive: boolean };
    testLeads: { value: number; trend: string; subtext: string; isPositive: boolean };
  };
  period: {
    type: string;
    startDate: string;
    endDate: string;
  };
  recentActivities: Release[];
  universities: University[];
  matrix: FeatureMatrixData;
  recentLeads: Lead[];
}

export interface PasswordResetRequest {
  _id: string;
  user: User | string;
  email: string;
  userName: string;
  userRole: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  resetToken?: string;
  tokenExpire?: string;
  requestedAt: string;
  approvedBy?: User | string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
