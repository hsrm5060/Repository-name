import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { debtsAPI } from '../../services/api';

// Async actions
export const fetchDebts = createAsyncThunk('debts/fetchAll', async () => {
  const response = await debtsAPI.getAll();
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
});

export const createDebt = createAsyncThunk('debts/create', async (debtData) => {
  const response = await debtsAPI.create(debtData);
  return response.data;
});

export const modifyDebt = createAsyncThunk('debts/update', async ({ id, data }) => {
  await debtsAPI.update(id, data);
  return { id, data };
});

export const removeDebt = createAsyncThunk('debts/delete', async (id) => {
  await debtsAPI.delete(id);
  return id;
});

export const payDebtInstallment = createAsyncThunk(
  'debts/payInstallment', 
  async ({ debtId, installmentId, paidDate, paymentMethod, referenceNumber, notes, isPartial, partialAmount }) => {
    await debtsAPI.payInstallment(debtId, { 
      installment_id: installmentId, 
      paid_date: paidDate,
      payment_method: paymentMethod || 'cash',
      reference_number: referenceNumber || null,
      notes: notes || null,
      is_partial: isPartial || false,
      partial_amount: partialAmount || null
    });
    return { debtId, installmentId, paidDate, paymentMethod, isPartial, partialAmount };
  }
);

const initialState = {
  debts: [],
  searchQuery: '',
  filterStatus: 'all',
  loading: false,
  error: null,
};

const debtsSlice = createSlice({
  name: 'debts',
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
      // Fetch debts
      .addCase(fetchDebts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDebts.fulfilled, (state, action) => {
        state.loading = false;
        state.debts = action.payload;
      })
      .addCase(fetchDebts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create debt
      .addCase(createDebt.fulfilled, (state, action) => {
        // سيتم جلب البيانات مرة أخرى من السيرفر
      })
      // Update debt
      .addCase(modifyDebt.fulfilled, (state, action) => {
        const index = state.debts.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.debts[index] = { ...state.debts[index], ...action.payload.data };
        }
      })
      // Delete debt
      .addCase(removeDebt.fulfilled, (state, action) => {
        state.debts = state.debts.filter(d => d.id !== action.payload);
      })
      // Pay installment
      .addCase(payDebtInstallment.fulfilled, (state, action) => {
        // سيتم جلب البيانات مرة أخرى من السيرفر
      });
  },
});

export const { 
  setSearchQuery, 
  setFilterStatus 
} = debtsSlice.actions;

// Export منفصل للأسماء البديلة
export const setDebtSearchQuery = debtsSlice.actions.setSearchQuery;
export const setDebtFilterStatus = debtsSlice.actions.setFilterStatus;

export default debtsSlice.reducer;
