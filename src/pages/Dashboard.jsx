import { useState, useEffect } from "react";
import { CheckCircle, CheckCircle2, XCircle, LoaderPinwheel, Archive, Package, Clock, AlertCircle, Filter } from "lucide-react";
import { useSelector } from 'react-redux';

import '../styles/dashboard.scss';

const Dashboard = () => {
    const inventory = useSelector(state => state.inventory);
    // const records = useSelector(state => state.record)

    const currentlyBorrowed = inventory.filter((item) => item.status === "Borrowed")
    const categoryCount = [...new Set(inventory.map(i => i.category))].length

    const DASHBOARD_STATS = [
        { label: 'Total Items', value: inventory.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
        { label: 'Borrowed', value: currentlyBorrowed.length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        { label: 'Overdue', value: 0, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
        { label: 'Categories', value: categoryCount , icon: Filter, color: 'bg-emerald-50 text-emerald-600' },
    ];

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className="bg-white rounded-xl p-3 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="dashboard-card">
                <div>
                    <p className="card-title">{label}</p>
                    <h3 className="text-3xl leading-none font-bold text-slate-800 mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );


    return (
        <>
            <title>CDIIS OIS - Dashboard</title>
            <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <p className="dashboard-subtitle">Welcome back! Here is your inventory system overview.</p>
            </div>
            <div className="dashboard-grid">
                {DASHBOARD_STATS.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
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
                                            {item.status === "Available"
                                                ? ( <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                                                        <CheckCircle2 size={12} /> Available</div>)
                                                : item.status === "Borrowed"
                                                    ? ( <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
                                                        <XCircle size={12} /> Borrowed</div>)
                                                    : ( <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100">
                                                        <LoaderPinwheel size={12} /> Reserved</div>)
                                            }
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
