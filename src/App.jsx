import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'react-redux';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import Homepage from './pages/Homepage';
import InventoryLayout from './pages/MasterLayout/InventoryLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Records from './pages/Records';
import Settings from './pages/Settings'

const queryClient = new QueryClient()
const DEVELOPEMENT = import.meta.env.VITE_DEVELOPMENT === 'true'


function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Homepage />} />
            <Route element={<InventoryLayout />} >
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/inventory' element={<Inventory />} />
              <Route path='/records' element={<Records />} />
              <Route path='/settings' element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  )
}

export default App
