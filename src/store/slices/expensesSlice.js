import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { expensesAPI } from '../../services/api';

// Async actions
export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async () => {
  const response = await expensesAPI.getAll();
  return response.data;
});

export const createExpense = createAsyncThunk('expenses/create', async (expenseData) => {
  const response = await expensesAPI.create(expenseData);
  return response.data;
});

export const modifyExpense = createAsyncThunk('expenses/update', async ({ id, data }) => {
  const response = await expensesAPI.update(id, data);
  return response.data;
});

export const removeExpense = createAsyncThunk('expenses/delete', async (id) => {
  await expensesAPI.delete(id);
  return id;
});

export const fetchExpenseStats = createAsyncThunk('expenses/stats', async (params) => {
  const response = await expensesAPI.getStats(params);
  return response.data;
});

const initialState = {
  expenses: [],
  stats: null,
  searchQuery: '',
  filterCategory: 'all',
  filterDateRange: { start: null, end: null },
  loading: false,
  error: null,
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    },
    setFilterDateRange: (state, action) => {
      state.filterDateRange = action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.filterCategory = 'all';
      state.filterDateRange = { start: null, end: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create expense
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })
      // Update expense
      .addCase(modifyExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      // Delete expense
      .addCase(removeExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e.id !== action.payload);
      })
      // Fetch stats
      .addCase(fetchExpenseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { 
  setSearchQuery, 
  setFilterCategory, 
  setFilterDateRange,
  clearFilters 
} = expensesSlice.actions;

export default expensesSlice.reducer;
