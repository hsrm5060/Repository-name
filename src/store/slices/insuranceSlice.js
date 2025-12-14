import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async actions
export const fetchInsurances = createAsyncThunk('insurance/fetchAll', async () => {
  const response = await api.get('/insurance');
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
});

export const fetchInsuranceById = createAsyncThunk('insurance/fetchById', async (id) => {
  const response = await api.get(`/insurance/${id}`);
  return response.data;
});

export const fetchInsurancesByVehicle = createAsyncThunk('insurance/fetchByVehicle', async (vehicleId) => {
  const response = await api.get(`/insurance/vehicle/${vehicleId}`);
  return response.data;
});

export const createInsurance = createAsyncThunk('insurance/create', async (insuranceData) => {
  const response = await api.post('/insurance', insuranceData);
  return response.data;
});

export const updateInsurance = createAsyncThunk('insurance/update', async ({ id, data }) => {
  const response = await api.put(`/insurance/${id}`, data);
  return response.data;
});

export const deleteInsurance = createAsyncThunk('insurance/delete', async (id) => {
  await api.delete(`/insurance/${id}`);
  return id;
});

export const renewInsurance = createAsyncThunk('insurance/renew', async ({ id, data }) => {
  const response = await api.post(`/insurance/${id}/renew`, data);
  return response.data;
});

export const fetchExpiringInsurances = createAsyncThunk('insurance/fetchExpiring', async (days = 30) => {
  const response = await api.get(`/insurance/alerts/expiring?days=${days}`);
  return response.data;
});

export const fetchInsuranceStats = createAsyncThunk('insurance/fetchStats', async () => {
  const response = await api.get('/insurance/stats/summary');
  return response.data;
});

const initialState = {
  insurances: [],
  currentInsurance: null,
  stats: {
    total: 0,
    active: 0,
    warning: 0,
    urgent: 0,
    expired: 0,
    byType: [],
    byCompany: [],
    totalCost: 0,
    avgCost: 0,
    expiringNext30: 0
  },
  filters: {
    search: '',
    type: 'all',
    status: 'all',
    company: 'all'
  },
  loading: false,
  error: null,
};

const insuranceSlice = createSlice({
  name: 'insurance',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        type: 'all',
        status: 'all',
        company: 'all'
      };
    },
    setCurrentInsurance: (state, action) => {
      state.currentInsurance = action.payload;
    },
    clearCurrentInsurance: (state) => {
      state.currentInsurance = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all insurances
      .addCase(fetchInsurances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInsurances.fulfilled, (state, action) => {
        state.loading = false;
        state.insurances = action.payload;
      })
      .addCase(fetchInsurances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch insurance by ID
      .addCase(fetchInsuranceById.fulfilled, (state, action) => {
        state.currentInsurance = action.payload;
      })
      // Fetch insurances by vehicle
      .addCase(fetchInsurancesByVehicle.fulfilled, (state, action) => {
        state.insurances = action.payload;
      })
      // Create insurance
      .addCase(createInsurance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInsurance.fulfilled, (state, action) => {
        state.loading = false;
        state.insurances.unshift(action.payload);
      })
      .addCase(createInsurance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update insurance
      .addCase(updateInsurance.fulfilled, (state, action) => {
        const index = state.insurances.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.insurances[index] = action.payload;
        }
        if (state.currentInsurance?.id === action.payload.id) {
          state.currentInsurance = action.payload;
        }
      })
      // Delete insurance
      .addCase(deleteInsurance.fulfilled, (state, action) => {
        state.insurances = state.insurances.filter(i => i.id !== action.payload);
        if (state.currentInsurance?.id === action.payload) {
          state.currentInsurance = null;
        }
      })
      // Renew insurance
      .addCase(renewInsurance.fulfilled, (state, action) => {
        const index = state.insurances.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.insurances[index] = action.payload;
        }
        if (state.currentInsurance?.id === action.payload.id) {
          state.currentInsurance = action.payload;
        }
      })
      // Fetch expiring insurances
      .addCase(fetchExpiringInsurances.fulfilled, (state, action) => {
        state.insurances = action.payload;
      })
      // Fetch stats
      .addCase(fetchInsuranceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearFilters,
  setCurrentInsurance,
  clearCurrentInsurance
} = insuranceSlice.actions;

export default insuranceSlice.reducer;
