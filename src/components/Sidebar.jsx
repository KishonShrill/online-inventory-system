import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { ChevronRight, ChevronLeft, Home, Package, Users, Settings, CheckSquare } from "lucide-react";
import { openSidebar, closeSidebar } from "../redux/actions/sidebarActions";
import { Role } from "../helpers/_variables";

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

    const navItems = [
        { name: 'Dashboard', link: '/app/dashboard', icon: Home },
        { name: 'Inventory', link: '/app/inventory', icon: Package },
        ...(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER
            ? [{ name: 'Item Check', link: '/app/item-check', icon: CheckSquare }]
            : []),
        { name: 'Borrow Records', link: '/app/records', icon: Users },
    ];

    const managementItems = [
        { name: 'Settings', link: '/app/settings', icon: Settings },
    ];

    return (
        <aside
            className={`flex flex-col bg-slate-950 text-slate-300 h-full border-r border-slate-900 transition-all duration-300 shrink-0 ${isSidebarOpen ? 'w-64' : 'w-[4.5rem]'}`}
        >
            {/* Sidebar Header & Toggle */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/50">
                <div className={`font-bold text-xl text-white tracking-wide overflow-hidden whitespace-nowrap transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                    Inventory
                </div>
                <button
                    onClick={handleToggle}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                    title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                </button>
            </div>

            {/* Navigation Menus */}
            <nav className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden py-4">

                {/* Main Menu Group */}
                <div className="mb-6">
                    <p className={`px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 whitespace-nowrap transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0'}`}>
                        Main Menu
                    </p>
                    <ul className="space-y-1 px-3 m-0 list-none">
                        {navItems.map(item => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.link}
                                    title={!isSidebarOpen ? item.name : ""}
                                    className={({ isActive }) => `flex items-center p-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                        : "hover:bg-slate-900 hover:text-white"}`}
                                >
                                    {/* The Fix: Wrap the children in a function to access isActive */}
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={22} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                                            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 translate-x-4 hidden' : 'opacity-100 translate-x-0'}`}>
                                                {item.name}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}                    </ul>
                </div>

                {/* Management Group */}
                <div>
                    <p className={`px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 whitespace-nowrap transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0'}`}>
                        Management
                    </p>
                    <ul className="space-y-1 px-3 m-0 list-none">
                        {managementItems.map(item => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.link}
                                    title={!isSidebarOpen ? item.name : ""}
                                    className={({ isActive }) => `flex items-center p-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "bg-slate-800 text-white shadow-md shadow-slate-900/20"
                                        : "hover:bg-slate-900 hover:text-white"
                                        }`}
                                >
                                    {/* The Fix: Wrap the children in a function to access isActive */}
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={22} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                                            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 translate-x-4 hidden' : 'opacity-100 translate-x-0'}`}>
                                                {item.name}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
