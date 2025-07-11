import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import './App.css'

import Authpage from './pages/Authpage';
import { useSelector } from 'react-redux'
const InventoryLayout = lazy(() => import('./pages/MasterLayout/InventoryLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const ItemCheck = lazy(() => import('./pages/ItemCheck'));
const Records = lazy(() => import('./pages/Records'));
const Settings = lazy(() => import('./pages/Settings'));
const Signup = lazy(() => import('./pages/Signup'));

const queryClient = new QueryClient()
const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === 'true'

function App() {

  const darkMode = useSelector(state => state.darkMode.enabled);
  useEffect(() => { document.body.classList.toggle('dark-mode',darkMode)}, [darkMode]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Authpage />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/app' element={<InventoryLayout />} >
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='inventory' element={<Inventory />} />
              <Route path='item-check' element={<ItemCheck />} />
              <Route path='records' element={<Records />} />
              <Route path='settings' element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
        {DEVELOPMENT && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </>
  )
}

export default App