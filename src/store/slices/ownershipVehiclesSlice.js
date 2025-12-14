import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownershipAPI } from '../../services/api';

// Async actions
export const fetchOwnershipVehicles = createAsyncThunk('ownership/fetchAll', async () => {
  const response = await ownershipAPI.getAll();
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
});

export const createOwnershipVehicle = createAsyncThunk('ownership/create', async (vehicleData) => {
  const response = await ownershipAPI.create(vehicleData);
  return response.data;
});

export const modifyOwnershipVehicle = createAsyncThunk('ownership/update', async ({ id, data }) => {
  await ownershipAPI.update(id, data);
  return { id, data };
});

export const removeOwnershipVehicle = createAsyncThunk('ownership/delete', async (id) => {
  await ownershipAPI.delete(id);
  return id;
});

export const payOwnershipInstallmentAPI = createAsyncThunk('ownership/payInstallment', async ({ vehicleId, installmentId, paidDate }) => {
  await ownershipAPI.payInstallment(vehicleId, { installment_id: installmentId, paid_date: paidDate });
  return { vehicleId, installmentId, paidDate };
});

const initialState = {
  ownershipVehicles: [],
  searchQuery: '',
  filterStatus: 'all',
  loading: false,
  error: null,
};

const ownershipVehiclesSlice = createSlice({
  name: 'ownershipVehicles',
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
      // Fetch ownership vehicles
      .addCase(fetchOwnershipVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOwnershipVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.ownershipVehicles = action.payload;
      })
      .addCase(fetchOwnershipVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create ownership vehicle
      .addCase(createOwnershipVehicle.fulfilled, (state, action) => {
        // سيتم جلب البيانات مرة أخرى من السيرفر
      })
      // Update ownership vehicle
      .addCase(modifyOwnershipVehicle.fulfilled, (state, action) => {
        const index = state.ownershipVehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.ownershipVehicles[index] = { ...state.ownershipVehicles[index], ...action.payload.data };
        }
      })
      // Delete ownership vehicle
      .addCase(removeOwnershipVehicle.fulfilled, (state, action) => {
        state.ownershipVehicles = state.ownershipVehicles.filter(v => v.id !== action.payload);
      })
      // Pay installment
      .addCase(payOwnershipInstallmentAPI.fulfilled, (state, action) => {
        // سيتم جلب البيانات مرة أخرى من السيرفر
      });
  },
});

export const { 
  setSearchQuery, 
  setFilterStatus 
} = ownershipVehiclesSlice.actions;

// Export منفصل للأسماء البديلة
export const setOwnershipSearchQuery = ownershipVehiclesSlice.actions.setSearchQuery;
export const setOwnershipFilterStatus = ownershipVehiclesSlice.actions.setFilterStatus;

export default ownershipVehiclesSlice.reducer;
