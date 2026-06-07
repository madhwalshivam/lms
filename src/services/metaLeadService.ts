import axios from 'axios';
import { Lead } from '../types';
import { API_URLS } from '../constants';
import { dummyLeads } from '../data/dummyLeads';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MetaLeadService {
  /**
   * Fetches Meta (Facebook/Instagram) Leads
   * Integrates with Meta Graph API (/v18.0/{lead-gen-id}/leads)
   */
  static async fetchMetaLeads(): Promise<Lead[]> {
    await delay(1000);
    
    // In production, we would use:
    // const response = await axios.get(`${API_URLS.BASE_URL}${API_URLS.META_LEADS}`);
    // return response.data;
    
    return dummyLeads.filter(lead => 
      lead.leadSource === 'Facebook Ads' || lead.leadSource === 'Instagram Ads'
    );
  }

  /**
   * Subscribes to Meta Webhook for real-time lead ingestion
   */
  static async subscribeWebhook(pageId: string, accessToken: string): Promise<boolean> {
    await delay(1500);
    // In production, register webhook subscription with Meta Graph API
    // const url = `https://graph.facebook.com/v18.0/${pageId}/subscribed_apps`;
    // await axios.post(url, { subscribed_fields: ['leadgen'] }, { headers: { Authorization: `Bearer ${accessToken}` } });
    console.log(`Subscribed Webhook for Meta Page ID: ${pageId}`);
    return true;
  }

  /**
   * Sync a specific form's leads
   */
  static async syncFormLeads(formId: string): Promise<{ count: number }> {
    await delay(1200);
    console.log(`Synced leads for Meta Lead Form ID: ${formId}`);
    return { count: 5 };
  }
}
