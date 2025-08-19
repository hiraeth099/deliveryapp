import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, ApiResponse } from '../../types';
import { secureStorage } from '../../storage/secureStorage';
import { authAPI } from '../../utils/api';

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    // TODO: integrate backend call here
    const response = await authAPI.login(credentials);
    
    if (response.success && response.data) {
      await secureStorage.storeAuthTokens(
        response.data.token,
        response.data.refreshToken
      );
      await secureStorage.storeUserData(JSON.stringify(response.data.user));
    }
    
    return response;
  }
);

export const loginWithOTP = createAsyncThunk(
  'auth/loginWithOTP',
  async (data: { phone: string; otp: string }) => {
    // TODO: integrate backend call here
    const response = await authAPI.verifyOTP(data);
    
    if (response.success && response.data) {
      await secureStorage.storeAuthTokens(
        response.data.token,
        response.data.refreshToken
      );
      await secureStorage.storeUserData(JSON.stringify(response.data.user));
    }
    
    return response;
  }
);

export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async () => {
    const refreshToken = await secureStorage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    
    // TODO: integrate backend call here
    const response = await authAPI.refreshToken(refreshToken);
    
    if (response.success && response.data) {
      await secureStorage.storeAuthTokens(
        response.data.token,
        response.data.refreshToken
      );
    }
    
    return response;
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async () => {
    const [token, refreshToken, userData] = await Promise.all([
      secureStorage.getAuthToken(),
      secureStorage.getRefreshToken(),
      secureStorage.getUserData(),
    ]);

    if (token && userData) {
      return {
        token,
        refreshToken,
        user: JSON.parse(userData),
      };
    }
    
    return null;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    // TODO: integrate backend call here
    await authAPI.logout();
    await secureStorage.clearAuthTokens();
    await secureStorage.removeItem('user_data');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.isLoading = false;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update stored user data
        secureStorage.storeUserData(JSON.stringify(state.user));
      }
    },
    setAuthenticated: (state, action: PayloadAction<{ isAuthenticated: boolean; user?: any }>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.data) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.refreshToken = action.payload.data.refreshToken;
          state.isAuthenticated = true;
        }
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      // Login with OTP
      .addCase(loginWithOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginWithOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.data) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.refreshToken = action.payload.data.refreshToken;
          state.isAuthenticated = true;
        }
      })
      .addCase(loginWithOTP.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      // Load stored auth
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        }
      })
      // Refresh token
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          state.token = action.payload.data.token;
          state.refreshToken = action.payload.data.refreshToken;
        }
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { clearAuthError, updateUserProfile, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;