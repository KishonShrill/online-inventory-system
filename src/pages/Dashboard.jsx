import { useSelector } from 'react-redux';

import '../styles/dashboard.scss'

const Dashboard = () => {
    const inventory = useSelector(state => state.inventory);
    const records = useSelector(state => state.record)

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
                    <p className="card-value text-yellow">{records.length}</p>
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