import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types';
import { dummyUser } from '../../data/dummyLeads';
import axios from 'axios';
import { USE_REAL_BACKEND, API_BASE_URL } from '../../config/apiConfig';
import { storage } from '../../utils/storage';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  rememberMe: boolean;
  darkMode: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  rememberMe: false,
  darkMode: false,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; rememberMe: boolean }, { rejectWithValue }) => {
    try {
      const emailFormatted = credentials.email.toLowerCase().trim();
      
      if (USE_REAL_BACKEND) {
        // Hit real Node.js Express + MongoDB backend
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: emailFormatted,
          password: credentials.password,
        });
        
        const userObj = {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          phone: '+91 9876543210',
          profilePicture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
          token: response.data.token
        };
        await storage.setObject('user_session', userObj);
        
        return {
          user: userObj,
          rememberMe: credentials.rememberMe
        };
      } else {
        // Simulated Mock Mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let userObj = null;
        
        // Match Vikram Aditya's demo account details
        if (emailFormatted === 'agent@urbancruise.com' && credentials.password === 'Password123') {
          userObj = {
            ...dummyUser,
            email: emailFormatted,
            token: 'mock-jwt-token-agent-12345'
          };
        } else if (emailFormatted === 'admin@urbancruise.com' && credentials.password === 'AdminPassword123') {
          userObj = {
            name: 'Sonia Sharma',
            role: 'Admin',
            email: emailFormatted,
            phone: '+91 99999 88888',
            profilePicture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
            token: 'mock-jwt-token-admin-12345'
          };
        }

        if (userObj) {
          await storage.setObject('user_session', userObj);
          return {
            user: userObj,
            rememberMe: credentials.rememberMe
          };
        } else {
          return rejectWithValue('Invalid email or password. Hint: Use agent@urbancruise.com / Password123');
        }
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('Connection error. Make sure your local Backend server is running.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      storage.removeItem('user_session'); // Async clear session storage
    },
    restoreSession: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.rememberMe = action.payload.rememberMe;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { logout, restoreSession, updateProfile, toggleDarkMode, clearError } = authSlice.actions;
export default authSlice.reducer;

