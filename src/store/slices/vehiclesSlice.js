import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehiclesAPI } from '../../services/api';

// Async actions
export const fetchVehicles = createAsyncThunk('vehicles/fetchAll', async () => {
  const response = await vehiclesAPI.getAll();
  // دعم كلا الصيغتين: array مباشر أو object مع data
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
});

export const createVehicle = createAsyncThunk('vehicles/create', async (vehicleData) => {
  const response = await vehiclesAPI.create(vehicleData);
  return response.data;
});

export const modifyVehicle = createAsyncThunk('vehicles/update', async ({ id, data }) => {
  await vehiclesAPI.update(id, data);
  return { id, data };
});

export const removeVehicle = createAsyncThunk('vehicles/delete', async (id) => {
  await vehiclesAPI.delete(id);
  return id;
});

const initialState = {
  vehicles: [],
  searchQuery: '',
  filterStatus: 'all',
  loading: false,
  error: null,
};

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setVehicleSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setVehicleFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    assignVehicle: (state, action) => {
      const { vehicleId, driverId, driverName } = action.payload;
      const vehicle = state.vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        vehicle.assigned_driver = driverId;
        vehicle.assigned_driver_name = driverName;
        vehicle.status = 'assigned';
      }
    },
    unassignVehicle: (state, action) => {
      const vehicle = state.vehicles.find(v => v.id === action.payload);
      if (vehicle) {
        vehicle.assigned_driver = null;
        vehicle.assigned_driver_name = null;
        vehicle.status = 'available';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create vehicle
      .addCase(createVehicle.fulfilled, (state, action) => {
        // سيتم جلب البيانات مرة أخرى من السيرفر
      })
      // Update vehicle
      .addCase(modifyVehicle.fulfilled, (state, action) => {
        const index = state.vehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = { ...state.vehicles[index], ...action.payload.data };
        }
      })
      // Delete vehicle
      .addCase(removeVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
      });
  },
});

export const { 
  setVehicleSearchQuery, 
  setVehicleFilterStatus,
  assignVehicle,
  unassignVehicle
} = vehiclesSlice.actions;

export default vehiclesSlice.reducer;
