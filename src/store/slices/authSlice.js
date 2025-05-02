// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loginUser: null, // Awalnya tidak ada user yang login
  isAuthenticated: false, // Status autentikasi awal
  // Anda bisa menambahkan state lain terkait autentikasi di sini
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.loginUser = action.payload;
      state.isAuthenticated = !!action.payload; // Set isAuthenticated berdasarkan keberadaan payload
    },
    clearUser: (state) => {
      state.loginUser = null;
      state.isAuthenticated = false;
    },
    // Anda bisa menambahkan reducer lain seperti untuk menyimpan token, error login, dll.
  },
});

// Export actions yang dihasilkan oleh createSlice
export const { setUser, clearUser } = authSlice.actions;

// Export reducer-nya
export default authSlice.reducer;