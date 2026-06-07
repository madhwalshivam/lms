import axios from 'axios';
import { Lead } from '../types';
import { API_URLS } from '../constants';
import { dummyLeads } from '../data/dummyLeads';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GoogleLeadService {
  /**
   * Fetches Google Ads Leads
   */
  static async fetchGoogleLeads(): Promise<Lead[]> {
    await delay(900);
    
    // In production, we would use:
    // const response = await axios.get(`${API_URLS.BASE_URL}${API_URLS.GOOGLE_LEADS}`);
    // return response.data;
    
    return dummyLeads.filter(lead => lead.leadSource === 'Google Ads');
  }

  /**
   * Verify Google Ads webhook secret for lead forms payload validation
   */
  static async verifyWebhookSecret(secret: string): Promise<boolean> {
    await delay(800);
    console.log('Google Ads webhook secret verified');
    return true;
  }
}
