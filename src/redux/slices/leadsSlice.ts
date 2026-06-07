import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Lead, LeadStatus, LeadFilters, Note, ActivityLog, SalesExecutive, FollowUp } from '../../types';
import { dummyLeads } from '../../data/dummyLeads';
import axios from 'axios';
import { USE_REAL_BACKEND, API_BASE_URL } from '../../config/apiConfig';

interface LeadsState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  filters: LeadFilters;
  searchQuery: string;
}

const defaultFilters: LeadFilters = {
  source: 'All',
  status: 'All',
  assignedExecutive: 'All',
  dateRange: 'All',
};

const initialState: LeadsState = {
  leads: [], // Start empty, will load from DB/mock on fetch
  loading: false,
  error: null,
  filters: defaultFilters,
  searchQuery: '',
};

// Async Thunk to fetch leads
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_REAL_BACKEND) {
        const response = await axios.get(`${API_BASE_URL}/leads`);
        return response.data;
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        return dummyLeads;
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch leads');
    }
  }
);

// Async Thunk to create lead
export const createLeadAsync = createAsyncThunk(
  'leads/createLeadAsync',
  async (leadData: Omit<Lead, 'id' | 'createdDate' | 'activityHistory' | 'notes' | 'followUpHistory'> & { notes?: string }, { rejectWithValue }) => {
    try {
      if (USE_REAL_BACKEND) {
        const response = await axios.post(`${API_BASE_URL}/leads`, leadData);
        return response.data;
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
          ...leadData,
          id: `LMS-${10000 + Math.floor(Math.random() * 1000)}`,
          createdDate: new Date().toISOString().split('T')[0],
          notes: leadData.notes ? [{
            id: `note-${Date.now()}`,
            text: leadData.notes.trim(),
            date: new Date().toISOString().split('T')[0],
            author: 'System Admin'
          }] : [],
          activityHistory: [{
            id: `act-${Date.now()}`,
            text: `Lead created manually (Mock).`,
            date: new Date().toISOString().split('T')[0],
            type: 'status_change'
          }],
          followUpHistory: []
        };
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create lead');
    }
  }
);

// Async Thunk to update status
export const updateLeadStatusAsync = createAsyncThunk(
  'leads/updateLeadStatusAsync',
  async (payload: { leadId: string; status: LeadStatus; noteText?: string }, { rejectWithValue }) => {
    try {
      if (USE_REAL_BACKEND) {
        const response = await axios.put(`${API_BASE_URL}/leads/${payload.leadId}/status`, {
          status: payload.status,
          noteText: payload.noteText
        });
        return response.data;
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        return payload;
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update lead status');
    }
  }
);

// Async Thunk to add note
export const addLeadNoteAsync = createAsyncThunk(
  'leads/addLeadNoteAsync',
  async (payload: { leadId: string; noteText: string; author: string }, { rejectWithValue }) => {
    try {
      if (USE_REAL_BACKEND) {
        const response = await axios.post(`${API_BASE_URL}/leads/${payload.leadId}/notes`, {
          noteText: payload.noteText,
          author: payload.author
        });
        return response.data;
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        return payload;
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add note');
    }
  }
);

// Async Thunk to assign lead
export const assignLeadAsync = createAsyncThunk(
  'leads/assignLeadAsync',
  async (payload: { leadId: string; executive: SalesExecutive | 'Unassigned' }, { rejectWithValue }) => {
    try {
      if (USE_REAL_BACKEND) {
        const response = await axios.put(`${API_BASE_URL}/leads/${payload.leadId}/assign`, {
          executive: payload.executive
        });
        return response.data;
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        return payload;
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to assign lead');
    }
  }
);

// Async Thunk to log lead communication action
export const logLeadActionAsync = createAsyncThunk(
  'leads/logLeadActionAsync',
  async (payload: { leadId: string; actionType: 'call' | 'whatsapp' | 'email'; detail: string }, { rejectWithValue }) => {
    try {
      if (USE_REAL_BACKEND) {
        const response = await axios.post(`${API_BASE_URL}/leads/${payload.leadId}/action`, {
          actionType: payload.actionType,
          detail: payload.detail
        });
        return response.data;
      } else {
        await new Promise(resolve => setTimeout(resolve, 300));
        return payload;
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to log action');
    }
  }
);

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addLead: (
      state,
      action: PayloadAction<
        Omit<Lead, 'id' | 'createdDate' | 'activityHistory' | 'notes' | 'followUpHistory'> & { notes?: string }
      >
    ) => {
      const newId = `LMS-${10000 + state.leads.length + 1}`;
      const today = new Date().toISOString().split('T')[0];
      const { notes, ...leadData } = action.payload;
      
      const newLead: Lead = {
        ...leadData,
        id: newId,
        createdDate: today,
        notes: [],
        activityHistory: [
          {
            id: `act-${Date.now()}-1`,
            text: `Lead created manually from Add Lead Form. Source: ${leadData.leadSource}`,
            date: today,
            type: 'status_change',
          }
        ],
        followUpHistory: [],
      };

      if (notes && typeof notes === 'string') {
        const noteText = notes.trim();
        if (noteText) {
          newLead.notes.push({
            id: `note-${Date.now()}`,
            text: noteText,
            date: today,
            author: 'System Admin',
          });
          newLead.activityHistory.push({
            id: `act-${Date.now()}-note`,
            text: `Added initial note: "${noteText}"`,
            date: today,
            type: 'note_added',
          });
        }
      }

      if (leadData.assignedExecutive !== 'Unassigned') {
        newLead.activityHistory.push({
          id: `act-${Date.now()}-assign`,
          text: `Assigned to ${leadData.assignedExecutive} upon creation.`,
          date: today,
          type: 'assigned',
        });
      }

      state.leads.unshift(newLead); // Add to beginning
    },
    updateLeadStatus: (state, action: PayloadAction<{ leadId: string; status: LeadStatus; noteText?: string }>) => {
      const { leadId, status, noteText } = action.payload;
      const leadIndex = state.leads.findIndex(l => l.id === leadId);
      if (leadIndex !== -1) {
        const lead = state.leads[leadIndex];
        const oldStatus = lead.leadStatus;
        lead.leadStatus = status;
        
        const today = new Date().toISOString().split('T')[0];
        
        // Log activity
        lead.activityHistory.push({
          id: `act-${Date.now()}-${status}`,
          text: `Status changed from ${oldStatus} to ${status}.`,
          date: today,
          type: 'status_change'
        });

        // Add optional note
        if (noteText && noteText.trim()) {
          lead.notes.push({
            id: `note-${Date.now()}`,
            text: noteText,
            date: today,
            author: lead.assignedExecutive !== 'Unassigned' ? lead.assignedExecutive : 'System Admin'
          });
          lead.activityHistory.push({
            id: `act-${Date.now()}-status-note`,
            text: `Note added: "${noteText}"`,
            date: today,
            type: 'note_added'
          });
        }

        // If status is changed to Follow-Up, automatically schedule a follow-up action
        if (status === 'Follow-Up') {
          const followUpDate = new Date();
          followUpDate.setDate(followUpDate.getDate() + 2); // 2 days in the future
          
          lead.followUpHistory.push({
            id: `fu-${Date.now()}`,
            text: `Automatic follow-up scheduled for status transition.`,
            date: followUpDate.toISOString().split('T')[0],
            type: 'Call',
            completed: false
          });
        }
      }
    },
    addLeadNote: (state, action: PayloadAction<{ leadId: string; noteText: string; author: string }>) => {
      const { leadId, noteText, author } = action.payload;
      const leadIndex = state.leads.findIndex(l => l.id === leadId);
      if (leadIndex !== -1 && noteText.trim()) {
        const lead = state.leads[leadIndex];
        const today = new Date().toISOString().split('T')[0];
        
        lead.notes.unshift({
          id: `note-${Date.now()}`,
          text: noteText,
          date: today,
          author
        });

        lead.activityHistory.push({
          id: `act-${Date.now()}-note`,
          text: `Added note: "${noteText}"`,
          date: today,
          type: 'note_added'
        });
      }
    },
    assignLead: (state, action: PayloadAction<{ leadId: string; executive: SalesExecutive | 'Unassigned' }>) => {
      const { leadId, executive } = action.payload;
      const leadIndex = state.leads.findIndex(l => l.id === leadId);
      if (leadIndex !== -1) {
        const lead = state.leads[leadIndex];
        const oldOwner = lead.assignedExecutive;
        lead.assignedExecutive = executive;
        
        const today = new Date().toISOString().split('T')[0];
        lead.activityHistory.push({
          id: `act-${Date.now()}-assign`,
          text: `Owner changed from ${oldOwner} to ${executive}.`,
          date: today,
          type: 'assigned'
        });
      }
    },
    setFilters: (state, action: PayloadAction<Partial<LeadFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    resetFilters: (state) => {
      state.filters = defaultFilters;
      state.searchQuery = '';
    },
    // Trigger action history update like Call, WhatsApp, Email clicks
    logLeadAction: (state, action: PayloadAction<{ leadId: string; actionType: 'call' | 'whatsapp' | 'email'; detail: string }>) => {
      const { leadId, actionType, detail } = action.payload;
      const leadIndex = state.leads.findIndex(l => l.id === leadId);
      if (leadIndex !== -1) {
        const lead = state.leads[leadIndex];
        const today = new Date().toISOString().split('T')[0];
        
        lead.activityHistory.push({
          id: `act-${Date.now()}-${actionType}`,
          text: `Initiated ${actionType}: ${detail}`,
          date: today,
          type: actionType
        });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
        state.error = null;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Lead
      .addCase(createLeadAsync.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })
      
      // Update Status
      .addCase(updateLeadStatusAsync.fulfilled, (state, action) => {
        if (USE_REAL_BACKEND) {
          const updatedLead = action.payload;
          const idx = state.leads.findIndex(l => l.id === updatedLead.id);
          if (idx !== -1) {
            state.leads[idx] = updatedLead;
          }
        } else {
          const { leadId, status, noteText } = action.payload;
          const lead = state.leads.find(l => l.id === leadId);
          if (lead) {
            const oldStatus = lead.leadStatus;
            lead.leadStatus = status;
            const today = new Date().toISOString().split('T')[0];
            lead.activityHistory.push({
              id: `act-${Date.now()}`,
              text: `Status changed from ${oldStatus} to ${status}.`,
              date: today,
              type: 'status_change',
            });
            if (noteText) {
              lead.notes.push({
                id: `note-${Date.now()}`,
                text: noteText,
                date: today,
                author: 'System Admin'
              });
            }
          }
        }
      })
      
      // Add Note
      .addCase(addLeadNoteAsync.fulfilled, (state, action) => {
        if (USE_REAL_BACKEND) {
          const updatedLead = action.payload;
          const idx = state.leads.findIndex(l => l.id === updatedLead.id);
          if (idx !== -1) {
            state.leads[idx] = updatedLead;
          }
        } else {
          const { leadId, noteText, author } = action.payload;
          const lead = state.leads.find(l => l.id === leadId);
          if (lead) {
            lead.notes.unshift({
              id: `note-${Date.now()}`,
              text: noteText,
              date: new Date().toISOString().split('T')[0],
              author
            });
          }
        }
      })
      
      // Assign Lead
      .addCase(assignLeadAsync.fulfilled, (state, action) => {
        if (USE_REAL_BACKEND) {
          const updatedLead = action.payload;
          const idx = state.leads.findIndex(l => l.id === updatedLead.id);
          if (idx !== -1) {
            state.leads[idx] = updatedLead;
          }
        } else {
          const { leadId, executive } = action.payload;
          const lead = state.leads.find(l => l.id === leadId);
          if (lead) {
            lead.assignedExecutive = executive;
          }
        }
      })
      
      // Log Lead Action
      .addCase(logLeadActionAsync.fulfilled, (state, action) => {
        if (USE_REAL_BACKEND) {
          const updatedLead = action.payload;
          const idx = state.leads.findIndex(l => l.id === updatedLead.id);
          if (idx !== -1) {
            state.leads[idx] = updatedLead;
          }
        } else {
          const { leadId, actionType, detail } = action.payload;
          const lead = state.leads.find(l => l.id === leadId);
          if (lead) {
            const today = new Date().toISOString().split('T')[0];
            lead.activityHistory.push({
              id: `act-${Date.now()}-${actionType}`,
              text: `Initiated ${actionType}: ${detail}`,
              date: today,
              type: actionType
            });
          }
        }
      });
  }
});

export const {
  setLoading,
  addLead,
  updateLeadStatus,
  addLeadNote,
  assignLead,
  setFilters,
  setSearchQuery,
  resetFilters,
  logLeadAction
} = leadsSlice.actions;

export default leadsSlice.reducer;
