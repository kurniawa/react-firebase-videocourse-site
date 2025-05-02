// src/store/reducers/index.js
import { combineReducers } from 'redux';
import authReducer from '../slices/authSlice';     // Import authReducer

const rootReducer = combineReducers({
  auth: authReducer, // Tambahkan authReducer di sini dengan key 'auth'
  // tambahkan reducer lain dari slice atau reducer manual di sini
});

export default rootReducer;