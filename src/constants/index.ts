import { LeadSource, LeadStatus, SalesExecutive, TravelDestination } from '../types';

export const LEAD_SOURCES: LeadSource[] = ['Website', 'Facebook Ads', 'Instagram Ads', 'Google Ads'];

export const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Follow-Up', 'Converted', 'Rejected'];

export const DESTINATIONS: TravelDestination[] = [
  'Dubai',
  'Bali',
  'Thailand',
  'Singapore',
  'Maldives',
  'Kashmir',
  'Goa',
  'Europe Tour'
];

export const SALES_EXECUTIVES: SalesExecutive[] = [
  'Rahul Sharma',
  'Priya Verma',
  'Amit Singh',
  'Neha Gupta'
];

export const TRAVEL_PACKAGES: Record<TravelDestination, string[]> = {
  'Dubai': ['Dubai Deluxe (5D/4N)', 'Dubai Adventure & Desert Safari (6D/5N)', 'Luxury Dubai Marina Stay (7D/6N)'],
  'Bali': ['Bali Romantic Getaway (6D/5N)', 'Bali Culture & Ubud Tour (7D/6N)', 'Bali Beach Paradise (5D/4N)'],
  'Thailand': ['Bangkok & Pattaya Explorer (5D/4N)', 'Phuket & Krabi Beach Tour (6D/5N)', 'Thailand Scenic Highlights (7D/6N)'],
  'Singapore': ['Singapore Fun Family Trip (4D/3N)', 'Singapore & Sentosa Adventure (5D/4N)', 'Singapore Luxury Cruise (6D/5N)'],
  'Maldives': ['Maldives Water Villa Luxury (5D/4N)', 'Maldives Honeymoon Package (6D/5N)', 'Budget Maldives Explorer (4D/3N)'],
  'Kashmir': ['Gulmarg & Srinagar Paradise (6D/5N)', 'Kashmir Valley Scenic Tour (5D/4N)', 'Complete Kashmir Experience (7D/6N)'],
  'Goa': ['Goa Beach Retreat (4D/3N)', 'North & South Goa Heritage (5D/4N)', 'Goa Luxury Resort Escape (6D/5N)'],
  'Europe Tour': ['Europe Highlights: Paris & Swiss (10D/9N)', 'Mediterranean Cruise Tour (8D/7N)', 'Eastern Europe Wonder (9D/8N)']
};

export const API_URLS = {
  BASE_URL: 'https://api.urbancruisetravel.com/v1',
  WEBSITE_LEADS: '/leads/website',
  META_LEADS: '/leads/meta',
  GOOGLE_LEADS: '/leads/google',
  NOTIFICATIONS: '/notifications',
  REPORTS: '/reports',
};
