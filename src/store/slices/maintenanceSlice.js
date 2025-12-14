import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { maintenanceAPI } from '../../services/api';

// Async actions
export const fetchMaintenance = createAsyncThunk('maintenance/fetchAll', async () => {
  const response = await maintenanceAPI.getAll();
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
});

export const fetchMaintenanceByVehicle = createAsyncThunk('maintenance/fetchByVehicle', async (vehicleId) => {
  const response = await maintenanceAPI.getByVehicle(vehicleId);
  return response.data;
});

export const createMaintenance = createAsyncThunk('maintenance/create', async (maintenanceData) => {
  const response = await maintenanceAPI.create(maintenanceData);
  return response.data;
});

export const modifyMaintenance = createAsyncThunk('maintenance/update', async ({ id, data }) => {
  const response = await maintenanceAPI.update(id, data);
  return response.data;
});

export const removeMaintenance = createAsyncThunk('maintenance/delete', async (id) => {
  await maintenanceAPI.delete(id);
  return id;
});

export const fetchUpcomingMaintenance = createAsyncThunk('maintenance/upcoming', async (days = 30) => {
  const response = await maintenanceAPI.getUpcoming(days);
  return response.data;
});

export const fetchOverdueMaintenance = createAsyncThunk('maintenance/overdue', async () => {
  const response = await maintenanceAPI.getOverdue();
  return response.data;
});

export const fetchMaintenanceStats = createAsyncThunk('maintenance/stats', async (params) => {
  const response = await maintenanceAPI.getStats(params);
  return response.data;
});

const initialState = {
  maintenance: [],
  upcoming: [],
  overdue: [],
  stats: null,
  searchQuery: '',
  filterType: 'all',
  filterStatus: 'all',
  filterVehicle: null,
  loading: false,
  error: null,
};

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setFilterVehicle: (state, action) => {
      state.filterVehicle = action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.filterType = 'all';
      state.filterStatus = 'all';
      state.filterVehicle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch maintenance
      .addCase(fetchMaintenance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaintenance.fulfilled, (state, action) => {
        state.loading = false;
        state.maintenance = action.payload;
      })
      .addCase(fetchMaintenance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch by vehicle
      .addCase(fetchMaintenanceByVehicle.fulfilled, (state, action) => {
        state.maintenance = action.payload;
      })
      // Create maintenance
      .addCase(createMaintenance.fulfilled, (state, action) => {
        state.maintenance.unshift(action.payload);
      })
      // Update maintenance
      .addCase(modifyMaintenance.fulfilled, (state, action) => {
        const index = state.maintenance.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.maintenance[index] = action.payload;
        }
      })
      // Delete maintenance
      .addCase(removeMaintenance.fulfilled, (state, action) => {
        state.maintenance = state.maintenance.filter(m => m.id !== action.payload);
      })
      // Fetch upcoming
      .addCase(fetchUpcomingMaintenance.fulfilled, (state, action) => {
        state.upcoming = action.payload;
      })
      // Fetch overdue
      .addCase(fetchOverdueMaintenance.fulfilled, (state, action) => {
        state.overdue = action.payload;
      })
      // Fetch stats
      .addCase(fetchMaintenanceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { 
  setSearchQuery, 
  setFilterType, 
  setFilterStatus,
  setFilterVehicle,
  clearFilters 
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;
