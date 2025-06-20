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
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient()
const DEVELOPEMENT = import.meta.env.VITE_DEVELOPMENT === 'true'


function App() {
  const initialInventory = [
    { id: 'EQP-001', name: 'Laptop', description: '15-inch Pro Laptop', dateAdded: '2023-10-26', color: 'Silver', category: 'Electronics' },
    { id: 'EQP-002', name: 'Keyboard', description: 'Mechanical Keyboard', dateAdded: '2023-10-25', color: 'Black', category: 'Accessories' },
    { id: 'EQP-003', name: 'Mouse', description: 'Wireless Mouse', dateAdded: '2023-10-25', color: 'Black', category: 'Accessories' },
    { id: 'EQP-004', name: 'Monitor', description: '27-inch 4K Monitor', dateAdded: '2023-10-24', color: 'Black', category: 'Electronics' },
  ];

  const initialBorrowRecords = [
    { id: 1, itemName: 'Laptop (EQP-001)', borrower: 'John Doe', borrowDate: '2023-11-01', expiryDate: '2023-11-15' },
    { id: 2, itemName: 'Projector (EQP-005)', borrower: 'Jane Smith', borrowDate: '2023-11-05', expiryDate: '2023-11-10' },
  ];

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<LoginPage />} />
            <Route element={<InventoryLayout />} >
              <Route path='/dashboard' element={<Dashboard initialInventory={initialInventory} initialBorrowRecords={initialBorrowRecords} />} />
              <Route path='/inventory' element={<Inventory initialInventory={initialInventory} />} />
              <Route path='/records' element={<Records initialBorrowRecords={initialBorrowRecords} />} />
              <Route path='/settings' element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  )
}

export default App
