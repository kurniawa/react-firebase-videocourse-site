import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TestGetAllUser from './pages/TestGetAllUser.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard type='PROFILE' />} />
          <Route path="/my-class" element={<Dashboard type='MY-CLASS' />} />
          <Route path="/my-order" element={<Dashboard type='MY-ORDER' />} />
          <Route path="/test-get-all-users" element={<TestGetAllUser />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
