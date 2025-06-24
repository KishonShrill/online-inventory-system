import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft, Home, Package, Users, Settings } from "lucide-react";
import '../styles/sidebar.scss'
import { current } from "@reduxjs/toolkit";

// Sidebar Component
const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {

    const currentPage = useLocation().pathname
    console.log(currentPage)

    const navItems = [
        { name: 'Dashboard', link: '/dashboard' , icon: Home },
        { name: 'Inventory', link: '/inventory' , icon: Package },
        { name: 'Borrow Records', link: '/records' , icon: Users },
        { name: 'Settings', link: '/settings' , icon: Settings },
    ];

    return (
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'close'}`}>
            <div className="sidebar-header-container">
                 <h1 className={`sidebar-header-title ${!isSidebarOpen && 'hidden'}`}>Inventory</h1>
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="sidebar-button">
                    {isSidebarOpen ? <ChevronLeft size={24}/> : <ChevronRight size={24} />}
                </button>
            </div>
            <nav>
                <ul style={{listStyle: "none"}}>
                    {navItems.map(item => (
                        <li key={item.name}>
                            <Link
                                className={`sidebar-link-button ${currentPage === item.link ? 'active' : 'hoverable'}`}
                                to={item.link}
                            >
                                <item.icon size={24} className="sidebar-icon" />
                                <span
                                    className={`sidebar-link-span ${!isSidebarOpen && 'appear'}`}
                                >
                                {item.name}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar