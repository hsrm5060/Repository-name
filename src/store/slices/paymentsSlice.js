import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentsAPI } from '../../services/api';

// Async actions
export const fetchPayments = createAsyncThunk('payments/fetchAll', async () => {
  const response = await paymentsAPI.getAll();
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
});

export const fetchPaymentStats = createAsyncThunk('payments/fetchStats', async () => {
  const response = await paymentsAPI.getStats();
  return response.data;
});

export const fetchPaymentById = createAsyncThunk('payments/fetchById', async (id) => {
  const response = await paymentsAPI.getById(id);
  return response.data;
});

export const createPayment = createAsyncThunk('payments/create', async (paymentData) => {
  const response = await paymentsAPI.create(paymentData);
  return response.data;
});

export const modifyPayment = createAsyncThunk('payments/update', async ({ id, data }) => {
  await paymentsAPI.update(id, data);
  return { id, data };
});

export const removePayment = createAsyncThunk('payments/delete', async (id) => {
  await paymentsAPI.delete(id);
  return id;
});

export const markPaymentAsPaid = createAsyncThunk('payments/markAsPaid', async ({ id, data }) => {
  const response = await paymentsAPI.markAsPaid(id, data);
  return { id, ...data, ...response.data };
});

export const bulkMarkAsPaid = createAsyncThunk('payments/bulkMarkAsPaid', async (data) => {
  const response = await paymentsAPI.bulkMarkAsPaid(data);
  return response.data;
});

export const undoPayment = createAsyncThunk('payments/undoPayment', async (id) => {
  await paymentsAPI.undoPayment(id);
  return id;
});

export const generatePayments = createAsyncThunk('payments/generate', async (data) => {
  const response = await paymentsAPI.generate(data);
  return response.data;
});

const initialState = {
  payments: [],
  currentPayment: null,
  stats: null,
  filterStatus: 'all',
  filterPlan: 'all',
  loading: false,
  statsLoading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPaymentFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setPaymentFilterPlan: (state, action) => {
      state.filterPlan = action.payload;
    },
    markAsPaid: (state, action) => {
      const { id, paid_date, payment_method } = action.payload;
      const payment = state.payments.find(p => p.id === id);
      if (payment) {
        payment.status = 'paid';
        payment.paid_date = paid_date;
        payment.payment_method = payment_method;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch stats
      .addCase(fetchPaymentStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.statsLoading = false;
      })
      // Fetch by ID
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.currentPayment = action.payload;
      })
      // Create payment
      .addCase(createPayment.fulfilled, (state, action) => {
        // سيتم جلب البيانات مرة أخرى من السيرفر
      })
      // Update payment
      .addCase(modifyPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = { ...state.payments[index], ...action.payload.data };
        }
      })
      // Delete payment
      .addCase(removePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(p => p.id !== action.payload);
      })
      // Mark as paid
      .addCase(markPaymentAsPaid.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index].status = 'paid';
          state.payments[index].paid_date = action.payload.paid_date;
          state.payments[index].payment_method = action.payload.payment_method;
        }
      })
      // Undo payment
      .addCase(undoPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload);
        if (index !== -1) {
          state.payments[index].status = 'pending';
          state.payments[index].paid_date = null;
          state.payments[index].payment_method = null;
        }
      });
  },
});

export const { 
  setPaymentFilterStatus,
  setPaymentFilterPlan,
  markAsPaid
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
