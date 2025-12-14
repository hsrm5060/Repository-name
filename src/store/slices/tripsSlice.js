import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchTrips = createAsyncThunk('trips/fetchTrips', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/trips');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'حدث خطأ في جلب الرحلات');
  }
});

export const fetchTripById = createAsyncThunk('trips/fetchTripById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'حدث خطأ في جلب الرحلة');
  }
});

export const createTrip = createAsyncThunk('trips/createTrip', async (tripData, { rejectWithValue }) => {
  try {
    const response = await api.post('/trips', tripData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'حدث خطأ في إضافة الرحلة');
  }
});

export const modifyTrip = createAsyncThunk('trips/modifyTrip', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/trips/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'حدث خطأ في تحديث الرحلة');
  }
});

export const updateTripStatus = createAsyncThunk('trips/updateTripStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/trips/${id}/status`, { status });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'حدث خطأ في تحديث حالة الرحلة');
  }
});

export const removeTrip = createAsyncThunk('trips/removeTrip', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/trips/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'حدث خطأ في حذف الرحلة');
  }
});

export const fetchTripStats = createAsyncThunk('trips/fetchTripStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/trips/stats/summary');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'حدث خطأ في جلب الإحصائيات');
  }
});

export const fetchDriverTrips = createAsyncThunk('trips/fetchDriverTrips', async (driverId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/trips/driver/${driverId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'حدث خطأ في جلب رحلات السائق');
  }
});

const initialState = {
  trips: [],
  currentTrip: null,
  driverTrips: [],
  stats: null,
  loading: false,
  error: null,
  filterStatus: 'all',
  searchQuery: '',
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setTripFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setTripSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearCurrentTrip: (state) => {
      state.currentTrip = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Trips
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Trip By Id
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.currentTrip = action.payload;
      })
      // Create Trip
      .addCase(createTrip.fulfilled, (state) => {
        state.loading = false;
      })
      // Modify Trip
      .addCase(modifyTrip.fulfilled, (state) => {
        state.loading = false;
      })
      // Remove Trip
      .addCase(removeTrip.fulfilled, (state, action) => {
        state.trips = state.trips.filter(t => t.id !== action.payload);
      })
      // Fetch Stats
      .addCase(fetchTripStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Fetch Driver Trips
      .addCase(fetchDriverTrips.fulfilled, (state, action) => {
        state.driverTrips = action.payload;
      });
  },
});

export const { 
  setTripFilterStatus, 
  setTripSearchQuery, 
  clearCurrentTrip,
  clearError 
} = tripsSlice.actions;

export default tripsSlice.reducer;
