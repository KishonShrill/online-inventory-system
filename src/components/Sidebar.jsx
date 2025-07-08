import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft, Home, Package, Users, Settings, CheckSquare } from "lucide-react";
import { openSidebar, closeSidebar } from "../redux/actions/sidebarActions";
import { Role } from "../helpers/_variables";
import '../styles/sidebar.scss'

// Sidebar Component
const Sidebar = ({ decoded }) => {
    const isSidebarOpen = useSelector(state => state.sidebar.isOpen);
    const dispatch = useDispatch();

    const handleToggle = () => {
        if (isSidebarOpen) {
            dispatch(closeSidebar());
        } else {
            dispatch(openSidebar());
        }
    };

    const currentPage = useLocation().pathname

    const navItems = [
        { name: 'Dashboard', link: '/app/dashboard' , icon: Home },
        { name: 'Inventory', link: '/app/inventory' , icon: Package },
            ...(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER
        ? [{ name: 'Item Check', link: '/app/item-check', icon: CheckSquare }]
        : []),
        { name: 'Borrow Records', link: '/app/records' , icon: Users },
        { name: 'Settings', link: '/app/settings' , icon: Settings },
    ];

    return (
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'close'}`}>
            <div className="sidebar-header-container">
                 <h1 className={`sidebar-header-title ${!isSidebarOpen && 'hidden'}`}>Inventory</h1>
                 <button onClick={() => handleToggle()} className="sidebar-button">
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