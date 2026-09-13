export type UserRole = 'manager' | 'tenant' | 'technician';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  propertyId: string;
}

export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'unassigned' | 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory =
  | 'plumbing'
  | 'electrical'
  | 'appliance'
  | 'internet'
  | 'security'
  | 'cleaning'
  | 'other';

export interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
  unitNumber?: string;
  specialization?: string;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  location: string;
  imageUrls: string[];
  property: string;
  tenant: PopulatedUser | string;
  assignedTechnician?: PopulatedUser | string;
  dueAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  _id: string;
  ticket: string;
  author: {
    _id: string;
    name: string;
    role: UserRole;
  };
  message: string;
  createdAt: string;
}

export type ActivityType =
  | 'ticket_created'
  | 'ticket_updated'
  | 'ticket_assigned'
  | 'status_changed'
  | 'comment_added'
  | 'ticket_resolved'
  | 'ticket_closed';

export interface ActivityLogItem {
  _id: string;
  ticket: string;
  actor: {
    _id: string;
    name: string;
    role: UserRole;
  };
  type: ActivityType;
  description: string;
  createdAt: string;
}

export interface TicketDetailsResponse {
  ticket: Ticket;
  comments: CommentItem[];
  activities: ActivityLogItem[];
}

export interface TicketListResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'tenant' | 'technician';
  unitNumber?: string;
  specialization?: string;
  isActive: boolean;
}

export interface AnalyticsData {
  summary: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    avgResolutionHours: number;
    healthScore: number;
  };
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  technicianLeaderboard: Array<{
    id: string;
    name: string;
    specialization?: string;
    activeCount: number;
    resolvedCount: number;
  }>;
}

