import axios from 'axios';
import { Lead, LeadStatus } from '../types';
import { API_URLS } from '../constants';
import { dummyLeads } from '../data/dummyLeads';

// Simulation delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class WebsiteLeadService {
  /**
   * Fetches website leads from backend or returns dummy website leads in dev
   */
  static async fetchWebsiteLeads(): Promise<Lead[]> {
    await delay(800); // Simulate API latency
    
    // In production, we would use:
    // const response = await axios.get(`${API_URLS.BASE_URL}${API_URLS.WEBSITE_LEADS}`);
    // return response.data;

    return dummyLeads.filter(lead => lead.leadSource === 'Website');
  }

  /**
   * Sync website leads (webhook trigger or polling)
   */
  static async syncLeads(): Promise<{ syncedCount: number; newLeads: Lead[] }> {
    await delay(1200);
    // Mimic API response
    return {
      syncedCount: 3,
      newLeads: dummyLeads.slice(0, 3)
    };
  }

  /**
   * Post a new website lead
   */
  static async submitLeadForm(leadData: Omit<Lead, 'id' | 'createdDate' | 'activityHistory' | 'notes' | 'followUpHistory'>): Promise<Lead> {
    // In production:
    // const response = await axios.post(`${API_URLS.BASE_URL}${API_URLS.WEBSITE_LEADS}`, leadData);
    // return response.data;

    await delay(1000);
    const newLead: Lead = {
      ...leadData,
      id: `LMS-${Math.floor(10000 + Math.random() * 90000)}`,
      createdDate: new Date().toISOString().split('T')[0],
      notes: [],
      activityHistory: [
        {
          id: `act-${Date.now()}-1`,
          text: `Lead created from Website Contact Form.`,
          date: new Date().toISOString().split('T')[0],
          type: 'status_change'
        }
      ],
      followUpHistory: []
    };
    return newLead;
  }
}
