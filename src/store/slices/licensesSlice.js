import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async actions
export const fetchLicenses = createAsyncThunk('licenses/fetchAll', async (type = 'all') => {
  const response = await api.get(`/licenses?type=${type}`);
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
});

export const fetchLicenseById = createAsyncThunk('licenses/fetchById', async ({ id, category }) => {
  const response = await api.get(`/licenses/${id}?category=${category}`);
  return response.data;
});

export const fetchLicensesByDriver = createAsyncThunk('licenses/fetchByDriver', async (driverId) => {
  const response = await api.get(`/licenses/driver/${driverId}`);
  return response.data;
});

export const fetchLicensesByVehicle = createAsyncThunk('licenses/fetchByVehicle', async (vehicleId) => {
  const response = await api.get(`/licenses/vehicle/${vehicleId}`);
  return response.data;
});

export const createLicense = createAsyncThunk('licenses/create', async (licenseData) => {
  const response = await api.post('/licenses', licenseData);
  return response.data;
});

export const updateLicense = createAsyncThunk('licenses/update', async ({ id, data }) => {
  const response = await api.put(`/licenses/${id}`, data);
  return response.data;
});

export const deleteLicense = createAsyncThunk('licenses/delete', async ({ id, category }) => {
  await api.delete(`/licenses/${id}?category=${category}`);
  return { id, category };
});

export const renewLicense = createAsyncThunk('licenses/renew', async ({ id, data }) => {
  const response = await api.post(`/licenses/${id}/renew`, data);
  return response.data;
});

export const fetchExpiringLicenses = createAsyncThunk('licenses/fetchExpiring', async ({ days = 30, type = 'all' }) => {
  const response = await api.get(`/licenses/alerts/expiring?days=${days}&type=${type}`);
  return response.data;
});

export const fetchLicenseStats = createAsyncThunk('licenses/fetchStats', async () => {
  const response = await api.get('/licenses/stats/summary');
  return response.data;
});

const initialState = {
  driverLicenses: [],
  vehicleLicenses: [],
  currentLicense: null,
  stats: {
    driver: {
      total: 0,
      active: 0,
      warning: 0,
      urgent: 0,
      expired: 0,
      byType: []
    },
    vehicle: {
      total: 0,
      active: 0,
      warning: 0,
      urgent: 0,
      expired: 0
    }
  },
  filters: {
    search: '',
    type: 'all',
    status: 'all',
    licenseType: 'all'
  },
  activeTab: 'driver', // 'driver' or 'vehicle'
  loading: false,
  error: null,
};

const licensesSlice = createSlice({
  name: 'licenses',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        type: 'all',
        status: 'all',
        licenseType: 'all'
      };
    },
    setCurrentLicense: (state, action) => {
      state.currentLicense = action.payload;
    },
    clearCurrentLicense: (state) => {
      state.currentLicense = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all licenses
      .addCase(fetchLicenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLicenses.fulfilled, (state, action) => {
        state.loading = false;
        state.driverLicenses = action.payload.driverLicenses || [];
        state.vehicleLicenses = action.payload.vehicleLicenses || [];
      })
      .addCase(fetchLicenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch license by ID
      .addCase(fetchLicenseById.fulfilled, (state, action) => {
        state.currentLicense = action.payload;
      })
      // Fetch licenses by driver
      .addCase(fetchLicensesByDriver.fulfilled, (state, action) => {
        state.driverLicenses = action.payload;
      })
      // Fetch licenses by vehicle
      .addCase(fetchLicensesByVehicle.fulfilled, (state, action) => {
        state.vehicleLicenses = action.payload;
      })
      // Create license
      .addCase(createLicense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLicense.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.license_category === 'driver') {
          state.driverLicenses.unshift(action.payload);
        } else {
          state.vehicleLicenses.unshift(action.payload);
        }
      })
      .addCase(createLicense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update license
      .addCase(updateLicense.fulfilled, (state, action) => {
        if (action.payload.license_category === 'driver') {
          const index = state.driverLicenses.findIndex(l => l.id === action.payload.id);
          if (index !== -1) {
            state.driverLicenses[index] = action.payload;
          }
        } else {
          const index = state.vehicleLicenses.findIndex(l => l.id === action.payload.id);
          if (index !== -1) {
            state.vehicleLicenses[index] = action.payload;
          }
        }
        if (state.currentLicense?.id === action.payload.id) {
          state.currentLicense = action.payload;
        }
      })
      // Delete license
      .addCase(deleteLicense.fulfilled, (state, action) => {
        if (action.payload.category === 'driver') {
          state.driverLicenses = state.driverLicenses.filter(l => l.id !== action.payload.id);
        } else {
          state.vehicleLicenses = state.vehicleLicenses.filter(l => l.id !== action.payload.id);
        }
        if (state.currentLicense?.id === action.payload.id) {
          state.currentLicense = null;
        }
      })
      // Renew license
      .addCase(renewLicense.fulfilled, (state, action) => {
        if (action.payload.license_category === 'driver') {
          const index = state.driverLicenses.findIndex(l => l.id === action.payload.id);
          if (index !== -1) {
            state.driverLicenses[index] = action.payload;
          }
        } else {
          const index = state.vehicleLicenses.findIndex(l => l.id === action.payload.id);
          if (index !== -1) {
            state.vehicleLicenses[index] = action.payload;
          }
        }
        if (state.currentLicense?.id === action.payload.id) {
          state.currentLicense = action.payload;
        }
      })
      // Fetch expiring licenses
      .addCase(fetchExpiringLicenses.fulfilled, (state, action) => {
        state.driverLicenses = action.payload.driverLicenses || [];
        state.vehicleLicenses = action.payload.vehicleLicenses || [];
      })
      // Fetch stats
      .addCase(fetchLicenseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { 
  setActiveTab,
  setFilters, 
  clearFilters,
  setCurrentLicense,
  clearCurrentLicense
} = licensesSlice.actions;

export default licensesSlice.reducer;
