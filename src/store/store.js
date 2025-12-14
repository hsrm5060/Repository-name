import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import driversReducer from './slices/driversSlice';
import vehiclesReducer from './slices/vehiclesSlice';
import notificationsReducer from './slices/notificationsSlice';
import paymentsReducer from './slices/paymentsSlice';
import debtsReducer from './slices/debtsSlice';
import ownershipVehiclesReducer from './slices/ownershipVehiclesSlice';
import expensesReducer from './slices/expensesSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import insuranceReducer from './slices/insuranceSlice';
import licensesReducer from './slices/licensesSlice';
import tripsReducer from './slices/tripsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    drivers: driversReducer,
    vehicles: vehiclesReducer,
    notifications: notificationsReducer,
    payments: paymentsReducer,
    debts: debtsReducer,
    ownershipVehicles: ownershipVehiclesReducer,
    expenses: expensesReducer,
    maintenance: maintenanceReducer,
    insurance: insuranceReducer,
    licenses: licensesReducer,
    trips: tripsReducer,
  },
});
