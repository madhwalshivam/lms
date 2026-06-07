export type LeadStatus = 'New' | 'Contacted' | 'Follow-Up' | 'Converted' | 'Rejected';

export type LeadSource = 'Website' | 'Facebook Ads' | 'Instagram Ads' | 'Google Ads';

export type TravelDestination = 
  | 'Dubai'
  | 'Bali'
  | 'Thailand'
  | 'Singapore'
  | 'Maldives'
  | 'Kashmir'
  | 'Goa'
  | 'Europe Tour';

export type SalesExecutive = 
  | 'Rahul Sharma'
  | 'Priya Verma'
  | 'Amit Singh'
  | 'Neha Gupta';

export interface Note {
  id: string;
  text: string;
  date: string;
  author: string;
}

export interface ActivityLog {
  id: string;
  text: string;
  date: string;
  type: 'status_change' | 'note_added' | 'call' | 'whatsapp' | 'email' | 'assigned';
}

export interface FollowUp {
  id: string;
  text: string;
  date: string;
  type: 'Call' | 'WhatsApp' | 'Email' | 'Meeting';
  completed: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  destination: TravelDestination;
  travelPackage: string;
  leadSource: LeadSource;
  assignedExecutive: SalesExecutive | 'Unassigned';
  leadStatus: LeadStatus;
  createdDate: string;
  budget: number;
  travelDate: string;
  campaignName?: string;
  notes: Note[];
  activityHistory: ActivityLog[];
  followUpHistory: FollowUp[];
}

export interface User {
  id?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  profilePicture: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  category: 'new_lead' | 'reminder' | 'converted' | 'summary' | 'general';
}

export interface LeadFilters {
  source: LeadSource | 'All';
  status: LeadStatus | 'All';
  assignedExecutive: SalesExecutive | 'All' | 'Unassigned';
  dateRange: 'All' | 'Today' | 'Yesterday' | 'This Week' | 'This Month';
}
