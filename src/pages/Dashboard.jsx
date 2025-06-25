import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useFetchItems from '../hooks/useFetchItems';

import '../styles/dashboard.scss'

const Dashboard = ({ initialBorrowRecords }) => {
    const inventory = useSelector(state => state.inventory);

    return (
        <>
            <title>CDIIS OIS - Dashboard</title>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3 className="card-title">Total Items</h3>
                    <p className="card-value text-blue">{inventory.length}</p>
                </div>
                <div className="dashboard-card">
                    <h3 className="card-title">Items Borrowed</h3>
                    <p className="card-value text-yellow">{initialBorrowRecords.length}</p>
                </div>
                <div className="dashboard-card">
                    <h3 className="card-title">Overdue Items</h3>
                    <p className="card-value text-red">0</p>
                </div>
                <div className="dashboard-card">
                    <h3 className="card-title">Categories</h3>
                    <p className="card-value text-green">
                    {[...new Set(inventory.map(i => i.category))].length}
                    </p>
                </div>
            </div>
        </>
    )
}

export default Dashboard