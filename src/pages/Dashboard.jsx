import '../styles/dashboard.scss'

const Dashboard = ({ initialInventory, initialBorrowRecords }) => {
    return (
        <>
            <title>CDIIS OIS - Dashboard</title>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3 className="card-title">Total Items</h3>
                    <p className="card-value text-blue">{initialInventory.length}</p>
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
                    {[...new Set(initialInventory.map(i => i.category))].length}
                    </p>
                </div>
            </div>
        </>
    )
}

export default Dashboard