import { useState, useEffect } from "react";
import { CheckCircle, XCircle, LoaderPinwheel, Archive } from "lucide-react";
import { useSelector } from 'react-redux';

import '../styles/dashboard.scss'

const Dashboard = () => {
    const inventory = useSelector(state => state.inventory);
    // const records = useSelector(state => state.record)

    const currentlyBorrowed = inventory.filter((item) => item.status === "borrow")

    return (
        <>
            <title>CDIIS OIS - Dashboard</title>
            <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <p className="dashboard-subtitle">Welcome back! Here is your inventory system overview.</p>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3 className="card-title">Total Items</h3>
                    <p className="card-value text-blue">{inventory.length}</p>
                </div>
                <div className="dashboard-card">
                    <h3 className="card-title">Borrowed</h3>
                    <p className="card-value text-yellow">{currentlyBorrowed.length}</p>
                </div>
                <div className="dashboard-card">
                    <h3 className="card-title">Overdue</h3>
                    <p className="card-value text-red">0</p>
                </div>
                <div className="dashboard-card">
                    <h3 className="card-title">Categories</h3>
                    <p className="card-value text-green">
                        {[...new Set(inventory.map(i => i.category))].length}
                    </p>
                </div>
            </div>
            {/* <h1 className='dashboard-title'>Viewable Items</h1> */}
            <ItemDashboard />
        </>
    )
}

const ItemDashboard = () => {
    const inventory = useSelector(state => state.inventory);
    const attendances = useSelector(state => state.attendance);

    const [categorized, setCategorized] = useState({});
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("");
    const [selectedCheck, setSelectedCheck] = useState(null); // Holds attendance_check to show
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Categorize and set activeCategory when inventory updates
    useEffect(() => {
        if (inventory.length > 0) {
            const grouped = inventory.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
            }, {});

            const categoryList = Object.keys(grouped);
            setCategorized(grouped);
            setCategories(categoryList);
            setActiveCategory(prev => categoryList.includes(prev) ? prev : categoryList[0]);
        }
    }, [inventory]);

    if (!activeCategory || categories.length === 0) return <p>Loading items...</p>;

    return (
        <div className="dashboard-container">
            <div className="container-header">
                <Archive className="container-icon" />
                <h2>Inventory Status</h2>
            </div>
            
            {/* Topbar */}
            <aside className="dashboard-sidebar">
                <div className="dashboard-sidebar-btn-container">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`dashboard-sidebar-button ${activeCategory === category ? "active" : ""}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main content area */}
            <main className="dashboard-content">
                {/* <h2 className="category-header">{activeCategory}</h2> */}
                <div className="table-wrapper">
                    <table className="item-table">
                        <thead>
                            <tr>
                                <th className="dash-col-1" >ID</th>
                                <th className="dash-col-2" >Name</th>
                                <th className="dash-col-3" >Attendance</th>
                                <th className="dash-col-4" >Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorized[activeCategory].map(item => {
                                const today = new Date().toLocaleDateString('en-CA');
                                const attendanceToday = attendances.find(a =>
                                    a.id === item.id &&
                                    new Date(a.date).toLocaleDateString('en-CA') === today
                                );

                                const hasMorning = attendanceToday?.attendance_checks?.some(check => check.period === "Morning");
                                const hasAfternoon = attendanceToday?.attendance_checks?.some(check => check.period === "Afternoon");

                                return (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td title={`Morning: ${hasMorning ? "Yes" : "No"} | Afternoon: ${hasAfternoon ? "Yes" : "No"}`}>
                                            {hasMorning && (
                                                <button
                                                    className="emoji-btn"
                                                    onClick={() => {
                                                        const check = attendanceToday.attendance_checks.find(c => c.period === "Morning");
                                                        setSelectedCheck(check);
                                                        setIsModalOpen(true);
                                                    }}
                                                >🌞</button>
                                            )}
                                            {hasAfternoon && (
                                                <button
                                                    className="emoji-btn"
                                                    onClick={() => {
                                                        const check = attendanceToday.attendance_checks.find(c => c.period === "Afternoon");
                                                        setSelectedCheck(check);
                                                        setIsModalOpen(true);
                                                    }}
                                                >🌙</button>
                                            )}
                                            {!hasMorning && !hasAfternoon && "---"}
                                        </td>
                                        <td title={item?.status}>
                                            <span style={{
                                                height: "100%",
                                                display: "flex",
                                                alignItems: "center"
                                            }}>
                                                {item.status === "Available"
                                                    ? (<CheckCircle color="green" size={18} />)
                                                    : item.status === "Borrowed"
                                                        ? (<XCircle color="red" size={18} />)
                                                        : (<LoaderPinwheel color="orange" size={18} />)
                                                }
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {isModalOpen && selectedCheck && (
                    <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                            <h2 className="modal-header">{selectedCheck.period} Attendance</h2>
                            <label className="form-label" htmlFor="returnFeedback">Components:</label>
                            <ul className="attendance-list">
                                {selectedCheck.items_checked.map((item, index) => (
                                    <li key={index}>
                                        {item.is_present ? "✅" : "❌"} {item.component_name} ({item.quantity})
                                    </li>
                                ))}
                            </ul>
                            <div className="form-group form-ending">
                                <label className="form-label" htmlFor="returnFeedback">Feedback:</label>
                                <textarea 
                                    id="returnFeedback"
                                    className="form-textarea"
                                    defaultValue={selectedCheck.notes === '' ? "No problems..." : selectedCheck.notes}
                                    readOnly
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};


export default Dashboard