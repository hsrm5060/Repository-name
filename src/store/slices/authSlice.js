import { createSlice } from '@reduxjs/toolkit';

// قراءة البيانات من localStorage عند التحميل
const savedAuth = localStorage.getItem('auth');
const parsedAuth = savedAuth ? JSON.parse(savedAuth) : null;

const initialState = {
  isAuthenticated: parsedAuth?.isAuthenticated || false,
  user: parsedAuth?.user || null,
  role: parsedAuth?.role || null,
  token: parsedAuth?.token || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.token = action.payload.token;
      
      // حفظ في localStorage
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: action.payload.user,
        role: action.payload.role,
        token: action.payload.token,
      }));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.token = null;
      
      // حذف من localStorage
      localStorage.removeItem('auth');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
