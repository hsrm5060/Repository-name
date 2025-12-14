import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { driversAPI } from '../../services/api';

// Async actions
export const fetchDrivers = createAsyncThunk('drivers/fetchAll', async () => {
  const response = await driversAPI.getAll();
  // دعم كلا الصيغتين: array مباشر أو object مع pagination
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
});

export const createDriver = createAsyncThunk('drivers/create', async (driverData) => {
  const response = await driversAPI.create(driverData);
  return response.data;
});

export const modifyDriver = createAsyncThunk('drivers/update', async ({ id, data }) => {
  await driversAPI.update(id, data);
  return { id, data };
});

export const removeDriver = createAsyncThunk('drivers/delete', async (id) => {
  await driversAPI.delete(id);
  return id;
});

const initialState = {
  drivers: [],
  searchQuery: '',
  filterStatus: 'all',
  loading: false,
  error: null,
};

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch drivers
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create driver
      .addCase(createDriver.fulfilled, (state, action) => {
        // سيتم جلب البيانات مرة أخرى من السيرفر
      })
      // Update driver
      .addCase(modifyDriver.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.drivers[index] = { ...state.drivers[index], ...action.payload.data };
        }
      })
      // Delete driver
      .addCase(removeDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.filter(d => d.id !== action.payload);
      });
  },
});

export const { setSearchQuery, setFilterStatus } = driversSlice.actions;
export default driversSlice.reducer;
