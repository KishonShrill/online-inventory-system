import '../styles/dashboard.scss'

const Dashboard = () => {

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
    )
}

export default Dashboard